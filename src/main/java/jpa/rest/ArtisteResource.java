package jpa.rest;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.ws.rs.*;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.core.UriBuilder;
import jpa.dao.ArtisteDAO;
import jpa.dto.ArtisteDTO;
import jpa.service.LocalImageStorageService;
import org.jboss.resteasy.plugins.providers.multipart.InputPart;
import org.jboss.resteasy.plugins.providers.multipart.MultipartFormDataInput;


@Path("artiste")
@Produces({"application/json", "application/xml"})
public class ArtisteResource {
    private static final Pattern FILENAME_PATTERN = Pattern.compile("filename=\"([^\"]+)\"");
    private final LocalImageStorageService imageStorageService = new LocalImageStorageService();

    
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

    @POST
    @Path("/{artisteId}/image")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "Uploader l'image d'un artiste", description = "Sauvegarde l'image dans frontend/images et enregistre le lien relatif")
    @ApiResponse(responseCode = "200", description = "Image sauvegardee")
    @ApiResponse(responseCode = "400", description = "Fichier invalide")
    @ApiResponse(responseCode = "404", description = "Artiste introuvable")
    public Response uploadArtisteImage(@PathParam("artisteId") Long artisteId, MultipartFormDataInput input) {
        ArtisteDAO dao = new ArtisteDAO();
        jpa.model.Artiste artiste = dao.findOne(artisteId);
        if (artiste == null) {
            return Response.status(Response.Status.NOT_FOUND).entity("Artiste introuvable").build();
        }

        try {
            InputPart imagePart = extractImagePart(input);
            String contentType = imagePart.getMediaType() != null ? imagePart.getMediaType().toString() : null;
            String fileName = extractFileName(imagePart);
            String relativeUrl = imageStorageService.storeImage(
                    imagePart.getBody(java.io.InputStream.class, null),
                    fileName,
                    contentType,
                    "artists"
            );
            artiste.setPhotoUrl(relativeUrl);
            dao.update(artiste);

            ArtisteDTO dto = new ArtisteDTO(artiste.getNomArtiste(), artiste.getPhotoUrl());
            dto.setId(artiste.getId());
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
