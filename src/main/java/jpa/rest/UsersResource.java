package jpa.rest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.persistence.Table;
import jakarta.ws.rs.core.MediaType;
import io.swagger.v3.oas.annotations.Parameter;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.UriBuilder;
import jpa.dao.UsersDAO;
import jpa.dto.CommandeDTO;
import jpa.dto.UsersDTO;
import jpa.model.Commande;
import jpa.model.Users;

@Path("users")
@Produces({"application/json", "application/xml"})
@Tag(name="Utilisateurs", description= "Gestion des utilisateurs")
public class UsersResource {

    @GET
    @Path("/{userId}")
    @Operation(summary = "Récupérer un utilisateur par son ID", description = "Retourne un utilisateur à partir de son ID")
    @ApiResponse(responseCode = "200", description = "Artiste trouvé")
    @ApiResponse(responseCode = "404",description = "Utilisateur non trouvé")
    public UsersDTO getUsersById(@PathParam("userId") Long userId)  {
        UsersDAO dao = new UsersDAO();
        jpa.model.Users entity = dao.findOne(userId);
        if (entity == null) {
            throw new NotFoundException();
        }
        UsersDTO dto = new UsersDTO(entity.getNom(), entity.getEmail(), entity.getMdp());
        dto.setId(entity.getId());
        return dto;
    }

    @GET
    @Path("/users/{userId}/commandes")
    @Operation(summary = "Récupérer les commandes d'un utilisateur par son ID", description = "Retourne toutes les commandes de l'utilisateur dont l'id est passé en paramètre")
    @ApiResponse(responseCode = "200", description = "Commande trouvé")
    @ApiResponse(responseCode = "404",description = "Commande non trouvé")
    public CommandeDTO getCommandeByUserId(@PathParam("userId") Long userId)  {
        UsersDAO dao = new UsersDAO();
        jpa.model.Users entity = dao.findOne(userId);
        if (entity == null) {
            throw new NotFoundException();
        }

        Commande commande = (Commande) entity.getCommandes();
        CommandeDTO dto = new CommandeDTO();
        dto.setId(commande.getId());
        dto.setDate(commande.getDate());
        dto.setMontantTotal(commande.getMontantTotal());

        CommandeDTO.StatutCommande statut = CommandeDTO.StatutCommande.valueOf(commande.getStatut().name());
        dto.setStatut(statut);
        return dto;


    }

    @GET
    @Path("/")
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "Récupérer la liste des utilisateurs", description = "Retourne la liste complètes de tous les utilisateurs")
    @ApiResponse(responseCode = "200", description = "Utilisateurs trouvé")
    @ApiResponse(responseCode = "404",description = "Utilisateurs non trouvé")
    public UsersDTO getUsers()  {
        UsersDAO dao = new UsersDAO();
        return (UsersDTO) dao.findAll();
    }


    @POST
    @Consumes("application/json")
    @Operation(summary = "Ajout d'utilisateurs", description = "Permet d'ajouter un utilisateur et retourne un objet de type 'Response'")
    @ApiResponse(responseCode = "200", description = "Commande trouvé")
    @ApiResponse(responseCode = "404",description = "Commande non trouvé")
    public Response addUser(
            @Parameter(description = "Objet utilisateur qui doit être ajouté à la base", required = true) UsersDTO userDTO) {
        Users entity = new Users();
        entity.setNom(userDTO.getNom());
        entity.setEmail(userDTO.getEmail());
        entity.setMdp(userDTO.getMdp());

        UsersDAO usersDAO = new UsersDAO();
        usersDAO.save(entity);

        UsersDTO dto = new UsersDTO(entity.getNom(), entity.getEmail(), entity.getMdp());
        dto.setId(entity.getId());
        return Response.created(
                UriBuilder.fromResource(UsersResource.class)
                        .path(String.valueOf(entity.getId()))
                        .build()).entity(dto).build();
    }

}

