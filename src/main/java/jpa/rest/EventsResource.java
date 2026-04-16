package jpa.rest;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
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
import java.util.Map;
import java.util.stream.Collectors;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import jpa.service.LocalImageStorageService;
import org.jboss.resteasy.plugins.providers.multipart.InputPart;
import org.jboss.resteasy.plugins.providers.multipart.MultipartFormDataInput;


@Path("events")
@Produces({"application/json", "application/xml"})
public class EventsResource {
    private static final Pattern FILENAME_PATTERN = Pattern.compile("filename=\"([^\"]+)\"");
    private final LocalImageStorageService imageStorageService = new LocalImageStorageService();

    
    @GET
    @Path("/{eventId}")
    @Operation(summary = "Récupérer un évènement par son ID", description = "Retourne un évènement à partir de son ID")
    @ApiResponse(responseCode = "200", description = "Évènement trouvé pour cet ID")
    @ApiResponse(responseCode = "404",description = "Évènement non trouvé pour cet ID")
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
                entity.getImage(),
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
    @Operation(summary = "Récupérer l'organisateur d'un évènement", description = "Retourne l'organisateur d'un evènement par l'id de cet évènement")
    @ApiResponse(responseCode = "200", description = "Organisateur trouvé pour cet évènement")
    @ApiResponse(responseCode = "404",description = "Organisateur non trouvé pour cet évènement")
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
    @Path("/{eventId}/main-artist")
    @Operation(summary = "Obtenir l'artiste principal d'un évènement", description = "Retourne l'artiste principal d'un evènement")
    @ApiResponse(responseCode = "200", description = "Artiste principal obtenu avec succès")
    @ApiResponse(responseCode = "404",description = "Artiste principal introuvable pour cet évènement")
    public ArtisteDTO getMainArtistByEventId(@PathParam("eventId") Long eventId)  {
        EventsDAO dao = new EventsDAO();
        Events event= dao.findOne(eventId);
        if (event == null) {
            throw new NotFoundException();
        }

        Artiste artistEntity = event.getArtistePrincipal();
        if (artistEntity == null) {
            throw new NotFoundException();
        }
        ArtisteDTO dto = new ArtisteDTO(artistEntity.getNomArtiste(), artistEntity.getPhotoUrl());
        dto.setId(artistEntity.getId());
        dto.setNom(artistEntity.getNomArtiste());
        dto.setPhotoUrl(artistEntity.getPhotoUrl());

        return dto;
    }

    
    @GET
    @Path("/{eventId}/guest-artist")
    @Operation(summary = "Obtenir la liste des artistes invités à un évènement", description = "Retourne la liste des invités d'un evènement")
    @ApiResponse(responseCode = "200", description = "Liste d'invités obtenue avec succès")
    @ApiResponse(responseCode = "404",description = "Invités introuvable pour cet évènement ")
    public List<ArtisteDTO> getGuestsByEventId(@PathParam("eventId") Long eventId)  {
        EventsDAO dao = new EventsDAO();
        Events event = dao.findOne(eventId);
        if (event == null) {
            throw new NotFoundException();
        }

        List<ArtisteDTO> guests = new ArrayList<>();
        List<Artiste> artistsGuests = event.getInvites();

        for(Artiste artists: artistsGuests) {
            guests.add(new ArtisteDTO(artists.getNomArtiste(), artists.getPhotoUrl()));
        }

        return guests;
    }



    @DELETE
    @Path("/{eventId}")
    @Operation(summary = "Supprimer un évènement", description = "Retourne l'évènement' supprimée")
    @ApiResponse(responseCode = "200", description = "Évènement supprimée avec succès")
    @ApiResponse(responseCode = "404",description = "La suppression de l'évènement a échouée ")
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
    @Operation(summary = "Récupérer la liste de tous les évènements", description = "Retourne la liste complètes de tousles évènements")
    @ApiResponse(responseCode = "200", description = "Évènements trouvées")
    @ApiResponse(responseCode = "404",description = "Évènements non trouvées")
    public List<EventsDTO> listEvents() {
        return new EventsDAO().findAll().stream()
                .map(event -> {
                    EventsDTO.GenreMusical genreMusical =
                            EventsDTO.GenreMusical.valueOf(event.getGenreMusical().name());

                    List<Long> inviteIds = event.getInvites() != null
                            ? event.getInvites().stream().map(Artiste::getId).collect(Collectors.toList())
                            : Collections.emptyList();

                    EventsDTO dto = new EventsDTO(
                            event.getNom(),
                            event.getImage(),
                            event.getLieu(),
                            event.getDate(),
                            event.getHeure(),
                            event.getDescription(),
                            event.getNbPlaces(),
                            event.getOrganizer().getId(),
                            genreMusical,
                            event.getArtistePrincipal().getId(),
                            inviteIds
                    );
                    dto.setId(event.getId());
                    return dto;
                })
                .collect(Collectors.toList());
    }



    
    @POST
    @Consumes("application/json")
    @Operation(summary = "Ajout d'un nouvel évènement", description = "Permet d'ajouter un évènement et retourne un objet de type 'Response'")
    @ApiResponse(responseCode = "201", description = "Évènement ajouté avec succès")
    @ApiResponse(responseCode = "404",description = "Erreur lors de l'ajout de l'évènement'")
    public Response addEvent(
            @Parameter(description = "Objet events qui doit être ajouté à la base", required = true) EventsDTO eventDto) {
        OrganizerDAO organizerDAO = new OrganizerDAO();
        ArtisteDAO artisteDAO = new ArtisteDAO();

        Organizer organizer = organizerDAO.findOne(eventDto.getOrganizerId());
        Artiste artistePrincipal = artisteDAO.findOne(eventDto.getArtistePrincipalId());
        if (organizer == null || artistePrincipal == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("Organisateur ou artiste principal introuvable pour les IDs fournis")
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
        entity.setImage(eventDto.getImage());
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
                entity.getImage(),
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

    @POST
    @Path("/{eventId}/image")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "Uploader l'image d'un evenement", description = "Sauvegarde l'image dans frontend/images et enregistre le lien relatif")
    @ApiResponse(responseCode = "200", description = "Image sauvegardee")
    @ApiResponse(responseCode = "400", description = "Fichier invalide")
    @ApiResponse(responseCode = "404", description = "Evenement introuvable")
    public Response uploadEventImage(@PathParam("eventId") Long eventId, MultipartFormDataInput input) {
        EventsDAO dao = new EventsDAO();
        Events event = dao.findOne(eventId);
        if (event == null) {
            return Response.status(Response.Status.NOT_FOUND).entity("Evenement introuvable").build();
        }

        try {
            InputPart imagePart = extractImagePart(input);
            String contentType = imagePart.getMediaType() != null ? imagePart.getMediaType().toString() : null;
            String fileName = extractFileName(imagePart);
            String relativeUrl = imageStorageService.storeImage(
                    imagePart.getBody(java.io.InputStream.class, null),
                    fileName,
                    contentType,
                    "events"
            );
            event.setImage(relativeUrl);
            dao.update(event);

            List<Long> inviteIds = event.getInvites() != null
                    ? event.getInvites().stream().map(Artiste::getId).collect(Collectors.toList())
                    : Collections.emptyList();
            EventsDTO dto = new EventsDTO(
                    event.getNom(),
                    event.getImage(),
                    event.getLieu(),
                    event.getDate(),
                    event.getHeure(),
                    event.getDescription(),
                    event.getNbPlaces(),
                    event.getOrganizer().getId(),
                    EventsDTO.GenreMusical.valueOf(event.getGenreMusical().name()),
                    event.getArtistePrincipal().getId(),
                    inviteIds
            );
            dto.setId(event.getId());
            return Response.ok(dto).build();
        } catch (IllegalArgumentException e) {
            return Response.status(Response.Status.BAD_REQUEST).entity(e.getMessage()).build();
        } catch (Exception e) {
            return Response.serverError().entity("Erreur lors de l'upload de l'image").build();
        }
    }

    private InputPart extractImagePart(MultipartFormDataInput input) {
        if (input == null) {
            throw new IllegalArgumentException("Formulaire multipart manquant.");
        }
        Map<String, List<InputPart>> uploadForm = input.getFormDataMap();
        if (uploadForm == null || uploadForm.get("file") == null || uploadForm.get("file").isEmpty()) {
            throw new IllegalArgumentException("Le champ multipart 'file' est requis.");
        }
        return uploadForm.get("file").get(0);
    }

    private String extractFileName(InputPart part) {
        String disposition = part.getHeaders() != null ? part.getHeaders().getFirst("Content-Disposition") : null;
        if (disposition == null || disposition.isBlank()) {
            return null;
        }
        String[] contentDispositionHeader = disposition.split(";");
        for (String segment : contentDispositionHeader) {
            Matcher matcher = FILENAME_PATTERN.matcher(segment.trim());
            if (matcher.find()) {
                return matcher.group(1);
            }
        }
        return null;
    }
}
