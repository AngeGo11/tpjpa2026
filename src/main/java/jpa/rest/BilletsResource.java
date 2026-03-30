package jpa.rest;


import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.UriBuilder;
import jpa.dao.BilletsDAO;
import jpa.dao.CommandeDAO;
import jpa.dao.TypeBilletDAO;
import jpa.dto.BilletsDTO;
import jpa.dto.TypeBilletDTO;
import jpa.model.Billets;
import jpa.model.Commande;
import jpa.model.TypeBillet;

import java.util.List;
import java.util.stream.Collectors;

@Path("billets")
@Produces({"application/json", "application/xml"})
public class BilletsResource {

    
    @GET
    @Path("/{billetId}")
    @Operation(summary = "Récupérer un billet par son ID", description = "Retourne un billet à partir de son ID")
    @ApiResponse(responseCode = "200", description = "Billet trouvé")
    @ApiResponse(responseCode = "404",description = "Billet non trouvé")
    public BilletsDTO getBilletById(@PathParam("billetId") Long billetId)  {
        BilletsDAO dao = new BilletsDAO();
        jpa.model.Billets entity = dao.findOne(billetId);
        if (entity == null) {
            throw new NotFoundException();
        }
        BilletsDTO dto = new BilletsDTO(entity.getCodeBarre(), entity.getCommande().getId(), entity.getTypeBillet().getId());
        dto.setId(entity.getId());
        return dto;
    }

    
    @GET
    @Path("/{billetId}/type_billet")
    @Operation(summary = "Récupérer le type d'un billet par son ID", description = "Retourne le type d'un billet à partir de son ID")
    @ApiResponse(responseCode = "200", description = "Type pour billet trouvé avec succès")
    @ApiResponse(responseCode = "404",description = "Type introuvable pour ce billet")
    public TypeBilletDTO getTypeById(@PathParam("billetId") Long billetId)  {
        BilletsDAO dao = new BilletsDAO();
        Billets entity = dao.findOne(billetId);

        if (entity == null) {
            throw new NotFoundException();
        }

        TypeBillet type = entity.getTypeBillet();

        if (type == null) {
            throw new NotFoundException();
        }

        TypeBillet entityTypeBillet = new TypeBillet();
        TypeBilletDTO.Type typeDto = TypeBilletDTO.Type.valueOf(entityTypeBillet.getType().name());
        TypeBilletDTO dto = new TypeBilletDTO(
                null, typeDto, entityTypeBillet.getPrix(), entityTypeBillet.getStock());
        dto.setId(entity.getId());
        dto.setEventId(entityTypeBillet.getEvent().getId());
        return dto;
    }



    
    @GET
    @Path("/")
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "Récupérer la liste des billets", description = "Retourne la liste complètes de tous les billets")
    @ApiResponse(responseCode = "200", description = "Billets trouvé")
    @ApiResponse(responseCode = "404",description = "Billets non trouvé")
    public List<BilletsDTO> listBillets()  {
        return new BilletsDAO().findAll().stream()
                .map(billets -> {
                    BilletsDTO dto = new BilletsDTO(billets.getCodeBarre(), billets.getCommande().getId(), billets.getTypeBillet().getId());
                            dto.setId(billets.getId());
                    return dto;
                })
                .collect(Collectors.toList());
    }


    
    @POST
    @Consumes("application/json")
    @Operation(summary = "Ajout d'un billet pour un évènement", description = "Permet d'ajouter un billet et retourne un objet de type 'Response'")
    @ApiResponse(responseCode = "201", description = "Billet ajouté")
    @ApiResponse(responseCode = "404",description = "Erreur lors de l'ajout du billet")
    public Response addBillets(
            @Parameter(description = "Objet billets qui doit être ajouté à la base", required = true) BilletsDTO billetDTO) {

        // Charger les entités liées à partir des IDs (clés étrangères)
        CommandeDAO commandeDAO = new CommandeDAO();
        TypeBilletDAO typeBilletDAO = new TypeBilletDAO();
        Commande commande = commandeDAO.findOne(billetDTO.getCommandeId());
        TypeBillet typeBillet = typeBilletDAO.findOne(billetDTO.getTypeBilletId());

        if (commande == null || typeBillet == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("Commande ou TypeBillet introuvable pour les IDs fournis")
                    .build();
        }

        Billets entity = new Billets(billetDTO.getCodeBarre(), commande, typeBillet);
        BilletsDAO dao = new BilletsDAO();
        dao.save(entity);

        BilletsDTO dto = new BilletsDTO();
        dto.setId(entity.getId());
        dto.setCodeBarre(entity.getCodeBarre());
        dto.setCommandeId(entity.getCommande().getId());
        dto.setTypeBilletId(entity.getTypeBillet().getId());

        return Response.created(
                UriBuilder.fromResource(BilletsResource.class)
                        .path(String.valueOf(entity.getId()))
                        .build()).entity(dto).build();
    }






    }





