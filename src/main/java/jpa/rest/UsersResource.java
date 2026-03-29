package jpa.rest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.ws.rs.core.MediaType;
import io.swagger.v3.oas.annotations.Parameter;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.UriBuilder;
import jpa.dao.CommandeDAO;
import jpa.dao.UsersDAO;
import jpa.dto.CommandeDTO;
import jpa.dto.UsersDTO;
import jpa.model.Commande;
import jpa.model.Users;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

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
    @Path("/{userId}/commandes")
    @Operation(summary = "Récupérer les commandes d'un utilisateur par son ID", description = "Retourne toutes les commandes de l'utilisateur dont l'id est passé en paramètre")
    @ApiResponse(responseCode = "200", description = "Commande trouvée pour cet utilisateur")
    @ApiResponse(responseCode = "404",description = "Commande non trouvée pour cet utilisateur")
    public List<CommandeDTO> getCommandesByUserId(@PathParam("userId") Long userId)  {
        UsersDAO dao = new UsersDAO();
        jpa.model.Users entity = dao.findOne(userId);
        if (entity == null) {
            throw new NotFoundException();
        }

        CommandeDAO daoCommande = new CommandeDAO();
        List<Commande> allCommande = daoCommande.getCommandesByUser(userId);

        if  (allCommande == null) {
            throw new NotFoundException();
        }

        List<CommandeDTO> allCommandeForUser = new ArrayList<>();
        for (Commande commande : allCommande) {
            CommandeDTO dto = new CommandeDTO();
            dto.setId(commande.getId());
            dto.setDate(commande.getDate());
            dto.setMontantTotal(commande.getMontantTotal());
            dto.setAcheteurId(commande.getAcheteur().getId());
            if(commande.getStatut() != null){
                dto.setStatut(CommandeDTO.StatutCommande.valueOf(commande.getStatut().name()));
            }
            allCommandeForUser.add(dto);
        }

        return allCommandeForUser;


    }

    
    @GET
    @Path("/")
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "Récupérer la liste des utilisateurs", description = "Retourne la liste complètes de tous les utilisateurs")
    @ApiResponse(responseCode = "200", description = "Utilisateurs trouvé")
    @ApiResponse(responseCode = "404",description = "Utilisateurs non trouvé")
    public List<UsersDTO> listUsers()  {

        return new UsersDAO().findAll().stream()
                    .map(user -> {
                        UsersDTO dto = new UsersDTO(user.getNom(), user.getEmail(), user.getMdp());
                        dto.setId(user.getId());
                        return dto;
                    })
                    .collect(Collectors.toList());

    }


    
    @POST
    @Consumes("application/json")
    @Operation(summary = "Ajout d'utilisateurs", description = "Permet d'ajouter un utilisateur et retourne un objet de type 'Response'")
    @ApiResponse(responseCode = "201", description = "Utilisateur ajouté")
    @ApiResponse(responseCode = "404",description = "Erreur lors de l'ajout de l'utilisateur")
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

