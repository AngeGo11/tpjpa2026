package jpa.rest;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.UriBuilder;
import jakarta.ws.rs.NotFoundException;
import jpa.dao.EventsDAO;
import jpa.dao.TypeBilletDAO;
import jpa.dto.EventsDTO;
import jpa.dto.TypeBilletDTO;
import jpa.model.Artiste;
import jpa.model.Events;
import jpa.model.TypeBillet;

import java.sql.Time;
import java.util.List;
import java.util.stream.Collectors;


@Path("type_billet")
@Produces({"application/json", "application/xml"})
public class TypeBilletResource {


    
    @GET
    @Path("/{typeId}")
    @Operation(summary = "Récupérer un Type de billet par son ID", description = "Retourne un billet à partir de son ID")
    @ApiResponse(responseCode = "200", description = "Type de billet trouvé")
    @ApiResponse(responseCode = "404",description = "Type de billet non trouvé")
    public TypeBilletDTO getTypeById(@PathParam("typeId") Long typeId)  {
        TypeBilletDAO dao = new TypeBilletDAO();
        jpa.model.TypeBillet entity = dao.findOne(typeId);
        if(entity == null){
            throw new NotFoundException();
        }
        TypeBilletDTO.Type typeDto = TypeBilletDTO.Type.valueOf(entity.getType().name());
        TypeBilletDTO dto = new TypeBilletDTO(null, typeDto, entity.getPrix(), entity.getStock());
        dto.setId(typeId);
        dto.setEventId(entity.getEvent().getId());
        return dto;
    }


    
    @GET
    @Path("/{typeId}/events")
    @Operation(summary = "Récupérer un évènement par son l'id du type de billet", description = "Retourne un évenement à partir de l'id de son type de billet")
    @ApiResponse(responseCode = "200", description = "Évènement trouvé")
    @ApiResponse(responseCode = "404",description = "Évènement non trouvé")
    public EventsDTO getEventByTypeId(@PathParam("typeId") Long typeId)  {

        TypeBilletDAO dao = new TypeBilletDAO();
        TypeBillet entity = dao.findOne(typeId);

        if (entity == null) {
            throw new NotFoundException();
        }

        Events event = entity.getEvent();
        if (event == null) {
            throw new NotFoundException();
        }

        EventsDTO dto = new EventsDTO();
        dto.setId(event.getId());
        dto.setNom(event.getNom());
        dto.setLieu(event.getLieu());
        dto.setDate(event.getDate());
        dto.setHeure(event.getHeure() != null ? Time.valueOf(event.getHeure().toString()) : null);
        dto.setDescription(event.getDescription());
        dto.setNbPlaces(event.getNbPlaces());
        dto.setOrganizerId(event.getOrganizer() != null ? event.getOrganizer().getId() : null);
        dto.setGenreMusical(event.getGenreMusical() != null
                ? EventsDTO.GenreMusical.valueOf(event.getGenreMusical().name()) : null);
        dto.setArtistePrincipalId(event.getArtistePrincipal() != null ? event.getArtistePrincipal().getId() : null);
        if (event.getInvites() != null) {
            dto.setInviteIds(event.getInvites().stream()
                    .map(Artiste::getId)
                    .collect(Collectors.toList()));
        }
        return dto;
    }



    
    @GET
    @Path("/")
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "Récupérer la liste des type de billet disponible", description = "Retourne une liste des types de billet")
    @ApiResponse(responseCode = "200", description = "Types de billets trouvé")
    @ApiResponse(responseCode = "404",description = "Types de billets non trouvé")

    public List<TypeBilletDTO> listTypeBillet()  {
        TypeBilletDAO dao = new TypeBilletDAO();
        return dao.findAll().stream()
                .map(typeBillet -> {
                    TypeBilletDTO.Type type = TypeBilletDTO.Type.valueOf(typeBillet.getType().name());
                    TypeBilletDTO dto = new TypeBilletDTO(null, type, typeBillet.getPrix(), typeBillet.getStock());
                    dto.setId(typeBillet.getId());
                    dto.setEventId(typeBillet.getEvent().getId());
                    return dto;
                })
                .collect(Collectors.toList());
    }


    
    @POST
    @Consumes("application/json")
    @Operation(summary = "Ajout d'un nouveau type de billet", description = "Permet d'ajouter un type de billet et retourne un objet de type 'Response'")
    @ApiResponse(responseCode = "201", description = "Type de billet ajouté")
    @ApiResponse(responseCode = "404",description = "Erreur lors de l'ajout du type de billet")
    public Response addTypeBillet(
            @Parameter(description = "TypeBillet object that needs to be added to the store", required = true) TypeBilletDTO typeDto) {
        EventsDAO eventsDAO = new EventsDAO();
        Events event = eventsDAO.findOne(typeDto.getEventId());
        if (event == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("Événement introuvable pour l'ID fourni")
                    .build();
        }
        TypeBillet.Type type= TypeBillet.Type.valueOf(typeDto.getType().name());
        TypeBillet entity = new TypeBillet(event, type, typeDto.getPrix(), typeDto.getStock());
        TypeBilletDAO dao = new TypeBilletDAO();
        dao.save(entity);
        TypeBilletDTO dto = new TypeBilletDTO(null, typeDto.getType(), entity.getPrix(), entity.getStock());
        dto.setId(entity.getId());
        dto.setEventId(entity.getEvent().getId());
        return Response.created(
                UriBuilder.fromResource(TypeBilletResource.class)
                        .path(String.valueOf(entity.getId()))
                        .build()).entity(dto).build();
    }
}
