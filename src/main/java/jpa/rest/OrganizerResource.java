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
    public OrganizerDTO getOrganizer()  {
        OrganizerDAO dao = new OrganizerDAO();
        return (OrganizerDTO) dao.findAll();
    }


    @POST
    @Consumes("application/json")
    public Response addOrganizer(
            @Parameter(description = "Organizer object that needs to be added to the store", required = true) OrganizerDTO organizer) {
        jpa.model.Organizer entity = new jpa.model.Organizer(organizer.getNomOrganisation());
        OrganizerDAO dao = new OrganizerDAO();
        dao.save(entity);
        OrganizerDTO dto = new OrganizerDTO(entity.getNomOrganisation());
        dto.setId(entity.getId());
        return Response.created(
                UriBuilder.fromResource(ArtisteResource.class)
                        .path(String.valueOf(entity.getId()))
                        .build()).entity(dto).build();
    }
}
