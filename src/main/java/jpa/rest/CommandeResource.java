package jpa.rest;

import io.swagger.v3.oas.annotations.Parameter;
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


@Path("commandes")
@Produces({"application/json", "application/xml"})
public class CommandeResource {

    @GET
    @Path("/{commandeId}")
    public CommandeDTO getCommandeById(@PathParam("commandeId") Long commandeId)  {
        CommandeDAO dao = new CommandeDAO();
        Commande entity = dao.findOne(commandeId);
        if (entity == null) {
            throw new NotFoundException();
        }

       CommandeDTO.StatutCommande statut = CommandeDTO.StatutCommande.valueOf(entity.getStatut().name());

        CommandeDTO dto = new CommandeDTO(entity.getDate(), entity.getMontantTotal(), entity.getAcheteur().getId(), statut );
        dto.setId(entity.getId());
        return dto;
    }

    @GET
    @Path("/commandes/{commandeId}/billets")
    public BilletsDTO getBilletByCommandeId(@PathParam("commandeId") Long CommandeId)  {
        return new BilletsDTO();
    }


    @DELETE
    @Path("/{commandeId}")
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
    public CommandeDTO getCommandes()  {
        CommandeDAO dao = new CommandeDAO();
        return (CommandeDTO) dao.findAll();
    }


    @POST
    @Consumes("application/json")
    public Response addCommande(
            @Parameter(description = "Commande object that needs to be added to the store", required = true) CommandeDTO commandeDTO) {
        UsersDAO usersDAO = new UsersDAO();
        Users acheteur = usersDAO.findOne(commandeDTO.getAcheteurId());
        if (acheteur == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("Acheteur (user) introuvable pour l'ID fourni")
                    .build();
        }
        Commande entity = new Commande();
        entity.setDate(commandeDTO.getDate());
        entity.setMontantTotal(commandeDTO.getMontantTotal());
        entity.setAcheteur(acheteur);
        entity.setStatut(Commande.StatutCommande.valueOf(commandeDTO.getStatut().name()));
        CommandeDAO dao = new CommandeDAO();
        dao.save(entity);
        CommandeDTO dto = new CommandeDTO(entity.getDate(), entity.getMontantTotal(), entity.getAcheteur().getId(),
                CommandeDTO.StatutCommande.valueOf(entity.getStatut().name()));
        dto.setId(entity.getId());
        return Response.created(
                UriBuilder.fromResource(CommandeResource.class)
                        .path(String.valueOf(entity.getId()))
                        .build()).entity(dto).build();
    }
}
