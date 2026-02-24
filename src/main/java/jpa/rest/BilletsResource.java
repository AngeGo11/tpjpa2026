package jpa.rest;


import io.swagger.v3.oas.annotations.Parameter;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.UriBuilder;
import jpa.dao.ArtisteDAO;
import jpa.dao.BilletsDAO;
import jpa.dao.CommandeDAO;
import jpa.dao.TypeBilletDAO;
import jpa.dto.ArtisteDTO;
import jpa.dto.BilletsDTO;
import jpa.dto.TypeBilletDTO;
import jpa.model.Billets;
import jpa.model.Commande;
import jpa.model.TypeBillet;

@Path("billets")
@Produces({"application/json", "application/xml"})
public class BilletsResource {

    @GET
    @Path("/{billetId}")
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
    @Path("/billets/{billetId}/type_billet")
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

        return toTypeBilletDomain(type);
    }

    private TypeBilletDTO toTypeBilletDomain(TypeBillet entity) {
        TypeBilletDTO.Type typeDto = TypeBilletDTO.Type.valueOf(entity.getType().name());
        TypeBilletDTO dto = new TypeBilletDTO(
                entity.getEvent(), typeDto, entity.getPrix(), entity.getStock());
        dto.setId(entity.getId());
        return dto;
    }

    @GET
    @Path("/")
    @Produces(MediaType.APPLICATION_JSON)
    public BilletsDTO getBillets()  {
        BilletsDAO dao = new BilletsDAO();
        return (BilletsDTO) dao.findAll();


    }


    @POST
    @Consumes("application/json")
    public Response addBillets(
            @Parameter(description = "Billets object that needs to be added to the store", required = true) BilletsDTO billetDTO) {

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





