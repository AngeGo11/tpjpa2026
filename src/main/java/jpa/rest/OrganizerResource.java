package jpa.rest;

import jakarta.ws.rs.core.MediaType;
import io.swagger.v3.oas.annotations.Parameter;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.UriBuilder;
import jpa.dao.OrganizerDAO;
import jpa.dto.EventsDTO;
import jpa.dto.OrganizerDTO;
import jpa.model.Organizer;

import java.util.List;
import java.util.stream.Collectors;

@Path("organizer")
@Produces({"application/json", "application/xml"})
public class OrganizerResource {

    @GET
    @Path("/{organizerId}")
    public OrganizerDTO getOrganizerById(@PathParam("organizerId") Long organizerId)  {
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
    @Path("/organizer/{organizerId}/events")
    public EventsDTO getEventsByOrganizerId(@PathParam("organizerId") Long organizerId)  {
        OrganizerDAO dao = new OrganizerDAO();
        jpa.model.Organizer entity = dao.findOne(organizerId);
        if (entity != null) {
            // Récupérer l'event associé
            throw new NotFoundException();
        }
        Organizer dto = new Organizer(entity.getNomOrganisation());
        dto.setId(entity.getId());
        return new EventsDTO();
    }


    @DELETE
    @Path("/{organizerId}")
    public Response deleteOrganizerById(@PathParam("organizerId") Long organizerId) {
        OrganizerDAO dao = new OrganizerDAO();
        jpa.model.Organizer organizer = dao.findOne(organizerId);
        if (organizer == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        dao.deleteById(organizerId);
        return Response.noContent().build();
    }



    @GET
    @Path("/")
    @Produces(MediaType.APPLICATION_JSON)
    public List<OrganizerDTO> listOrganizer()  {
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
    public Response addOrganizer(
            @Parameter(description = "Organizer object that needs to be added to the store", required = true) OrganizerDTO organizer) {
        jpa.model.Organizer entity = new jpa.model.Organizer(organizer.getNomOrganisation());
        OrganizerDAO dao = new OrganizerDAO();
        entity.setNom(organizer.getNom());
        entity.setEmail(organizer.getEmail());
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
