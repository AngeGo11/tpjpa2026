package jpa.rest;

import io.swagger.v3.oas.annotations.Parameter;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.core.UriBuilder;
import jpa.dao.ArtisteDAO;
import jpa.dto.ArtisteDTO;


@Path("artiste")
@Produces({"application/json", "application/xml"})
public class ArtisteResource {

    @GET
    @Path("/{artisteId}")
    public ArtisteDTO getArtisteById(@PathParam("artisteId") Long artisteId) {
        ArtisteDAO dao = new ArtisteDAO();
        jpa.model.Artiste entity = dao.findOne(artisteId);
        if (entity == null) {
            throw new NotFoundException();
        }
        ArtisteDTO dto = new ArtisteDTO(entity.getNomArtiste(), entity.getPhotoUrl());
        dto.setId(entity.getId());
        return dto;
    }

    @DELETE
    @Path("/{artisteId}")
    public Response deleteArtisteById(@PathParam("artisteId") Long artisteId) {
        ArtisteDAO dao = new ArtisteDAO();
        jpa.model.Artiste artiste = dao.findOne(artisteId);
        if (artiste == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        dao.deleteById(artisteId);
        return Response.noContent().build();
    }

    @GET
    @Path("/")
    @Produces(MediaType.APPLICATION_JSON)
    public ArtisteDTO getArtiste()  {
        ArtisteDAO dao = new ArtisteDAO();
        return (ArtisteDTO) dao.findAll();
    }


    @POST
    @Consumes("application/json")
    public Response addArtiste(
            @Parameter(description = "Artiste object that needs to be added to the store", required = true) ArtisteDTO artisteDTO) {
        jpa.model.Artiste entity = new jpa.model.Artiste(artisteDTO.getNom(), artisteDTO.getPhotoUrl());
        ArtisteDAO dao = new ArtisteDAO();
        dao.save(entity);
        ArtisteDTO dto = new ArtisteDTO(entity.getNomArtiste(), entity.getPhotoUrl());
        dto.setId(entity.getId());
        return Response.created(
                 UriBuilder.fromResource(ArtisteResource.class)
                .path(String.valueOf(entity.getId()))
                .build()).entity(dto).build();

    }
}
