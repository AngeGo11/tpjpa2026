package jpa.rest;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.UriBuilder;
import jakarta.ws.rs.NotFoundException;
import jpa.dao.CommandeDAO;
import jpa.dao.UsersDAO;
import jpa.dto.BilletsDTO;
import jpa.dto.CommandeDTO;
import jpa.model.Commande;
import jpa.model.Users;

import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;


@Path("commandes")
@Produces({"application/json", "application/xml"})
public class CommandeResource {

    
    @GET
    @Path("/{commandeId}")
    @Operation(summary = "Récupérer une commande par son ID", description = "Retourne une commande à partir de son ID")
    @ApiResponse(responseCode = "200", description = "Commande trouvée pour cet ID")
    @ApiResponse(responseCode = "404",description = "Commande non trouvée pour cet ID")
    public CommandeDTO getCommandeById(@PathParam("commandeId") Long commandeId)  {
        CommandeDAO dao = new CommandeDAO();
        Commande entity = dao.findOne(commandeId);
        if (entity == null) {
            throw new NotFoundException();
        }

        CommandeDTO.StatutCommande statut =
                CommandeDTO.StatutCommande.valueOf(entity.getStatut().name());

        CommandeDTO dto = new CommandeDTO(
                entity.getDate(), entity.getMontantTotal(), entity.getAcheteur().getId(), statut);
        dto.setId(entity.getId());
        return dto;
    }

    
    @GET
    @Path("/{commandeId}/billets")
    @Operation(summary = "Obtenir les billets associés à une commande", description = "Retourne la liste de tous les billets associés à une commande")
    @ApiResponse(responseCode = "200", description = "Billets obtenus avec succès")
    @ApiResponse(responseCode = "404",description = "Billets introuvable pour cette commande")
    public List<BilletsDTO> getBilletsByCommandeId(@PathParam("commandeId") Long commandeId) {
        CommandeDAO dao = new CommandeDAO();
        Commande commande = dao.findOne(commandeId);
        if (commande == null) {
            throw new NotFoundException();
        }
        return commande.getBillets().stream()
                .map(b -> {
                    BilletsDTO dto = new BilletsDTO(
                            b.getCodeBarre(),
                            b.getCommande().getId(),
                            b.getTypeBillet().getId());
                    dto.setId(b.getId());
                    return dto;
                })
                .collect(Collectors.toList());
    }


    
    @DELETE
    @Path("/{commandeId}")
    @Operation(summary = "Supprimer une commande", description = "Retourne la commande supprimée")
    @ApiResponse(responseCode = "200", description = "Commande supprimée avec succès")
    @ApiResponse(responseCode = "404",description = "La suppression de la commande a échouée ")
    public Response deleteCommandeById(@PathParam("commandeId") Long commandeId) {
        CommandeDAO dao = new CommandeDAO();
        Commande commande = dao.findOne(commandeId);
        if (commande == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        dao.deleteById(commandeId);
        return Response.noContent().build();
    }


    
    @GET
    @Path("/")
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "Récupérer la liste de toutes les commandes", description = "Retourne la liste complètes de toutes les commandes")
    @ApiResponse(responseCode = "200", description = "Commandes trouvées")
    @ApiResponse(responseCode = "404",description = "Commandes non trouvées")
    public List<CommandeDTO> listCommandes() {
        return new CommandeDAO().findAll().stream()
                .map(commande -> {
                    CommandeDTO.StatutCommande statut =
                            CommandeDTO.StatutCommande.valueOf(commande.getStatut().name());
                    CommandeDTO dto = new CommandeDTO(
                            commande.getDate(),
                            commande.getMontantTotal(),
                            commande.getAcheteur().getId(),
                            statut);
                    dto.setId(commande.getId());
                    return dto;
                })
                .collect(Collectors.toList());
    }


    
    @POST
    @Consumes("application/json")
    @Operation(summary = "Ajout d'une nouvelle commande", description = "Permet d'ajouter une commande et retourne un objet de type 'Response'")
    @ApiResponse(responseCode = "201", description = "Commande ajoutée")
    @ApiResponse(responseCode = "404",description = "Erreur lors de l'ajout de la commande")
    public Response addCommande(
            @Parameter(description = "Objet commande qui doit être ajouté à la base", required = true) CommandeDTO commandeDTO) {
        UsersDAO usersDAO = new UsersDAO();
        Users acheteur = usersDAO.findOne(commandeDTO.getAcheteurId());
        if (acheteur == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("Acheteur (user) introuvable pour l'ID fourni")
                    .build();
        }
        Commande entity = new Commande();
        entity.setDate(new Date());
        entity.setMontantTotal(commandeDTO.getMontantTotal());
        entity.setAcheteur(acheteur);
        entity.setStatut(Commande.StatutCommande.valueOf(commandeDTO.getStatut().name()));
        CommandeDAO dao = new CommandeDAO();
        if (entity.getStatut() == Commande.StatutCommande.EN_ATTENTE) {
            Optional<Commande> existing = dao.findEnAttenteByAcheteurId(commandeDTO.getAcheteurId());
            if (existing.isPresent()) {
                return Response.status(Response.Status.CONFLICT)
                        .entity("Une commande en attente existe déjà pour cet utilisateur.")
                        .build();
            }
        }
        dao.save(entity);
        CommandeDTO dto = new CommandeDTO(entity.getDate(), entity.getMontantTotal(), entity.getAcheteur().getId(),
                CommandeDTO.StatutCommande.valueOf(entity.getStatut().name()));
        dto.setId(entity.getId());
        return Response.created(
                UriBuilder.fromResource(CommandeResource.class)
                        .path(String.valueOf(entity.getId()))
                        .build()).entity(dto).build();
    }

    @PUT
    @Path("/{commandeId}")
    @Consumes("application/json")
    @Operation(summary = "Mettre à jour une commande", description = "Met à jour le statut et/ou le montant total d'une commande existante")
    @ApiResponse(responseCode = "200", description = "Commande mise à jour")
    @ApiResponse(responseCode = "404", description = "Commande introuvable")
    public Response updateCommande(
            @PathParam("commandeId") Long commandeId,
            CommandeDTO commandeDTO) {
        CommandeDAO dao = new CommandeDAO();
        Commande entity = dao.findOne(commandeId);
        if (entity == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        if (commandeDTO.getStatut() != null) {
            entity.setStatut(Commande.StatutCommande.valueOf(commandeDTO.getStatut().name()));
        }
        if (commandeDTO.getMontantTotal() != null) {
            entity.setMontantTotal(commandeDTO.getMontantTotal());
        }
        dao.update(entity);
        CommandeDTO dto = new CommandeDTO(
                entity.getDate(),
                entity.getMontantTotal(),
                entity.getAcheteur().getId(),
                CommandeDTO.StatutCommande.valueOf(entity.getStatut().name()));
        dto.setId(entity.getId());
        return Response.ok(dto).build();
    }
}
