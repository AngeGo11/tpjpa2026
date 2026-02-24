package jpa.rest;

import io.swagger.v3.oas.annotations.Parameter;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.UriBuilder;
import jakarta.ws.rs.NotFoundException;
import jpa.dao.ArtisteDAO;
import jpa.dao.EventsDAO;
import jpa.dao.OrganizerDAO;
import jpa.dto.ArtisteDTO;
import jpa.dto.EventsDTO;
import jpa.dto.OrganizerDTO;
import jpa.model.Artiste;
import jpa.model.Events;
import jpa.model.Organizer;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;


@Path("events")
@Produces({"application/json", "application/xml"})
public class EventsResource {

    @GET
    @Path("/{eventId}")
    public EventsDTO getEventsById(@PathParam("eventId") Long eventId)  {
        EventsDAO dao = new EventsDAO();
        jpa.model.Events entity = dao.findOne(eventId);

        if (entity == null) {
            throw new NotFoundException();
        }

        EventsDTO.GenreMusical genreMusical = EventsDTO.GenreMusical.valueOf(entity.getGenreMusical().name());
        List<Artiste> invites = entity.getInvites();
        List<Long> inviteIds;
        if (invites != null) {
            inviteIds = invites.stream().map(Artiste::getId).collect(Collectors.toList());
        } else {
            inviteIds = Collections.emptyList();
        }


        EventsDTO dto = new EventsDTO(
                entity.getNom(),
                entity.getLieu(),
                entity.getDate(),
                entity.getHeure(),
                entity.getDescription(),
                entity.getNbPlaces(),
                entity.getOrganizer().getId(),
                genreMusical,
                entity.getArtistePrincipal().getId(),
                inviteIds);
        dto.setId(entity.getId());
        return dto;
    }


    @GET
    @Path("{eventId}/organizer")
    public OrganizerDTO getOrganizerByEventId(@PathParam("eventId") Long eventId) {
        EventsDAO eventsDao = new EventsDAO();
        Events event = eventsDao.findOne(eventId);
        if (event == null) {
            throw new NotFoundException();
        }
        Organizer organizerEntity = event.getOrganizer();
        if (organizerEntity == null) {
            throw new NotFoundException();
        }
        OrganizerDTO dto = new OrganizerDTO(organizerEntity.getNomOrganisation());
        dto.setId(organizerEntity.getId());
        dto.setNom(organizerEntity.getNom());
        dto.setEmail(organizerEntity.getEmail());
        return dto;
    }


    @GET
    @Path("events/{eventId}/main-artist")
    public ArtisteDTO getMainArtistByEventId(@PathParam("eventId") Long eventId)  {
        return new ArtisteDTO();
    }


    @DELETE
    @Path("/{eventId}")
    public Response deleteEventById(@PathParam("eventId") Long eventId) {
        EventsDAO dao = new EventsDAO();
        jpa.model.Events event= dao.findOne(eventId);
        if (event == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        dao.deleteById(eventId);
        return Response.noContent().build();
    }


    @GET
    @Path("/")
    @Produces(MediaType.APPLICATION_JSON)
    public EventsDTO getEvents()  {
        EventsDAO dao = new EventsDAO();
        return (EventsDTO) dao.findAll();
    }


    @POST
    @Consumes("application/json")
    public Response addEvent(
            @Parameter(description = "Events object that needs to be added to the store", required = true) EventsDTO eventDto) {
        OrganizerDAO organizerDAO = new OrganizerDAO();
        ArtisteDAO artisteDAO = new ArtisteDAO();

        Organizer organizer = organizerDAO.findOne(eventDto.getOrganizerId());
        Artiste artistePrincipal = artisteDAO.findOne(eventDto.getArtistePrincipalId());
        if (organizer == null || artistePrincipal == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("Organizer ou artiste principal introuvable pour les IDs fournis")
                    .build();
        }

        List<Artiste> invites = new ArrayList<>();
        if (eventDto.getInviteIds() != null) {
            for (Long inviteId : eventDto.getInviteIds()) {
                Artiste a = artisteDAO.findOne(inviteId);
                if (a != null) {
                    invites.add(a);
                }
            }
        }

        Events entity = new Events();
        entity.setNom(eventDto.getNom());
        entity.setLieu(eventDto.getLieu());
        entity.setDate(eventDto.getDate());
        entity.setHeure(eventDto.getHeure());
        entity.setDescription(eventDto.getDescription());
        entity.setNbPlaces(eventDto.getNbPlaces());
        entity.setOrganizer(organizer);
        entity.setGenreMusical(Events.GenreMusical.valueOf(eventDto.getGenreMusical().name()));
        entity.setArtistePrincipal(artistePrincipal);
        entity.setInvites(invites);

        EventsDAO eventsDAO = new EventsDAO();
        eventsDAO.save(entity);

        List<Long> inviteIds = invites.stream().map(Artiste::getId).collect(Collectors.toList());
        EventsDTO dto = new EventsDTO(
                entity.getNom(),
                entity.getLieu(),
                entity.getDate(),
                entity.getHeure(),
                entity.getDescription(),
                entity.getNbPlaces(),
                entity.getOrganizer().getId(),
                EventsDTO.GenreMusical.valueOf(entity.getGenreMusical().name()),
                entity.getArtistePrincipal().getId(),
                inviteIds);
        dto.setId(entity.getId());

        return Response.created(
                UriBuilder.fromResource(EventsResource.class)
                        .path(String.valueOf(entity.getId()))
                        .build()).entity(dto).build();
    }
}
