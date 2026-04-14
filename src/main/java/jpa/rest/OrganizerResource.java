package jpa.rest;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.ws.rs.core.MediaType;
import io.swagger.v3.oas.annotations.Parameter;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.UriBuilder;
import jpa.dao.EventsDAO;
import jpa.dao.OrganizerDAO;
import jpa.dto.EventsDTO;
import jpa.dto.OrganizerDTO;
import jpa.model.Artiste;
import jpa.model.Events;
import jpa.model.Organizer;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Path("organizer")
@Produces({"application/json", "application/xml"})
public class OrganizerResource {

    
    @GET
    @Path("/{organizerId}")
    @Operation(summary = "Récupérer un organisateur par son ID", description = "Retourne un organisateur à partir de son ID")
    @ApiResponse(responseCode = "200", description = "Organisateur trouvé")
    @ApiResponse(responseCode = "404",description = "Organisateur non trouvé")
    public OrganizerDTO getOrganizerById(@PathParam("organizerId") Long organizerId) {
        OrganizerDAO dao = new OrganizerDAO();
        jpa.model.Organizer entity = dao.findOne(organizerId);
        if (entity == null) {
            throw new NotFoundException();
        }
        OrganizerDTO dto = new OrganizerDTO(entity.getNomOrganisation());
        dto.setId(entity.getId());
        dto.setNom(entity.getNom());
        dto.setEmail(entity.getEmail());
        return dto;
    }


    
    @GET
    @Path("/{organizerId}/events")
    @Operation(summary = "Récupérer la liste des évènements organisés par un organisateur", description = "Retourne la liste de tous les évènements organisés par un organisateur")
    @ApiResponse(responseCode = "200", description = "Évènements trouvés pour cet organisateur")
    @ApiResponse(responseCode = "404",description = "Impossible de trouver des évènements pour cet organisateur")
    public List<EventsDTO> getEventsByOrganizerId(@PathParam("organizerId") Long organizerId) {
        OrganizerDAO dao = new OrganizerDAO();
        Organizer organizerEntity = dao.findOne(organizerId);
        if (organizerEntity == null) {
            throw new NotFoundException();
        }


        EventsDAO eventsDAO = new EventsDAO();
        List<Events> allEvents = eventsDAO.getEvents();
        List<Events> eventsByOrganizer = new ArrayList<>();

        for (Events event : allEvents) {
            if (event.getOrganizer().getId().equals(organizerEntity.getId())) {
                eventsByOrganizer.add(event);
            }
        }

        List<EventsDTO> dtos = new ArrayList<>();

        for (Events eventsEntity : eventsByOrganizer) {

            EventsDTO.GenreMusical genreMusical = null;

            if (eventsEntity.getGenreMusical() != null) {
                genreMusical = EventsDTO.GenreMusical.valueOf(eventsEntity.getGenreMusical().name());
            }

            List<Artiste> invites = eventsEntity.getInvites();
            List<Long> inviteIds;
            if (invites != null) {
                inviteIds = invites.stream().map(Artiste::getId).collect(Collectors.toList());
            } else {
                inviteIds = Collections.emptyList();
            }


            EventsDTO dto = new EventsDTO(
                    eventsEntity.getNom(),
                    eventsEntity.getImage(),
                    eventsEntity.getLieu(),
                    eventsEntity.getDate(),
                    eventsEntity.getHeure(),
                    eventsEntity.getDescription(),
                    eventsEntity.getNbPlaces(),
                    eventsEntity.getOrganizer().getId(),
                    genreMusical,
                    eventsEntity.getArtistePrincipal().getId(),
                    inviteIds);
            dto.setId(eventsEntity.getId());
            dtos.add(dto);
        }
        return dtos;
    }


    
    @DELETE
    @Path("/{organizerId}")
    @Operation(summary = "Supprimer un organisateur à l'aide de son id", description = "Retourne l'organisateur supprimé")
    @ApiResponse(responseCode = "200", description = "Organisateur supprimé avec succès")
    @ApiResponse(responseCode = "404",description = "La suppression de l'organisateur a échouée ")
    public Response deleteOrganizerById(@PathParam("organizerId") Long organizerId) {
        OrganizerDAO dao = new OrganizerDAO();
        Organizer organizer = dao.findOne(organizerId);
        if (organizer == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        dao.deleteById(organizerId);
        return Response.noContent().build();
    }


    
    @GET
    @Path("/")
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "Récupérer la liste des organisateurs", description = "Retourne la liste complètes de tous les organisateurs")
    @ApiResponse(responseCode = "200", description = "Organisateurs trouvé")
    @ApiResponse(responseCode = "404",description = "Organisateurs non trouvé")
    public List<OrganizerDTO> listOrganizer() {
        return new OrganizerDAO().findAll().stream()
                .map(organizer -> {
                    OrganizerDTO dto = new OrganizerDTO(organizer.getNomOrganisation());
                    dto.setId(organizer.getId());
                    dto.setNom(organizer.getNom());
                    dto.setEmail(organizer.getEmail());
                    return dto;
                })
                .collect(Collectors.toList());
    }


    
    @POST
    @Consumes("application/json")
    @Operation(summary = "Ajout d'organisateur", description = "Permet d'ajouter un organisateur et retourne un objet de type 'Response'")
    @ApiResponse(responseCode = "201", description = "Organisateur ajouté")
    @ApiResponse(responseCode = "404",description = "Erreur lors de l'ajout de l'organisateur")
    public Response addOrganizer(
            @Parameter(description = "Objet organisateur qui doit être ajouté à la base", required = true) OrganizerDTO organizerDTO) {
        Organizer entity = new Organizer(organizerDTO.getNomOrganisation());
        entity.setNom(organizerDTO.getNom());
        entity.setEmail(organizerDTO.getEmail());
        entity.setMdp(organizerDTO.getMdp());
        entity.setRole(jpa.model.Users.Role.Organizer);

        OrganizerDAO dao = new OrganizerDAO();
        dao.save(entity);

        OrganizerDTO dto = new OrganizerDTO(entity.getNomOrganisation());
        dto.setId(entity.getId());
        dto.setNom(entity.getNom());
        dto.setEmail(entity.getEmail());
        return Response.created(
                UriBuilder.fromResource(OrganizerResource.class)
                        .path(String.valueOf(entity.getId()))
                        .build()).entity(dto).build();
    }
}
