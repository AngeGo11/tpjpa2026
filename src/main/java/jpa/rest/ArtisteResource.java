package jpa.rest;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.ws.rs.*;
import java.util.List;
import java.util.stream.Collectors;
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
    @Operation(summary = "Récupérer un artiste par son ID", description = "Retourne un artiste à partir de son ID")
    @ApiResponse(responseCode = "200", description = "Artiste trouvé")
    @ApiResponse(responseCode = "404",description = "Artiste non trouvé")
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
    @Operation(summary = "Supprimer un artiste à l'aide de son id", description = "Retourne l'artiste supprimé")
    @ApiResponse(responseCode = "200", description = "Artiste supprimé avec succès")
    @ApiResponse(responseCode = "404",description = "La suppression de l'artiste a échouée ")
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
    @Operation(summary = "Récupérer la liste des artistes", description = "Retourne la liste complètes de tous les artistes")
    @ApiResponse(responseCode = "200", description = "Artistes trouvé")
    @ApiResponse(responseCode = "404",description = "Artistes non trouvé")
    public List<ArtisteDTO> listArtiste() {
        return new ArtisteDAO().findAll().stream()
                .map(artiste -> {
                    ArtisteDTO dto = new ArtisteDTO(artiste.getNomArtiste(), artiste.getPhotoUrl());
                    dto.setId(artiste.getId());
                    return dto;
                })
                .collect(Collectors.toList());
    }


    
    @POST
    @Consumes("application/json")
    @Operation(summary = "Ajout d'artiste", description = "Permet d'ajouter un artiste et retourne un objet de type 'Response'")
    @ApiResponse(responseCode = "201", description = "Artiste ajouté")
    @ApiResponse(responseCode = "404",description = "Erreur lors de l'ajout de l'artiste")
    public Response addArtiste(
            @Parameter(description = "Objet artiste qui doit être ajouté à la base", required = true) ArtisteDTO artisteDTO) {
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
