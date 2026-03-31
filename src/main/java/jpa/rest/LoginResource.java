package jpa.rest;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.ws.rs.core.MediaType;
import io.swagger.v3.oas.annotations.Parameter;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Response;

import jpa.dao.UsersDAO;
import jpa.dto.UsersDTO;
import jpa.model.Organizer;
import jpa.model.Users;

import java.util.List;

@Path("auth")
@Produces({"application/json", "application/xml"})
public class LoginResource {
    @POST
    @Path("/login")
    @Consumes(MediaType.APPLICATION_JSON)
    @Operation(summary = "Connexion d'un utilisateur", description = "Permet à un utilisateur de se connecter et retourne un objet de type 'Response'")
    @ApiResponse(responseCode = "200", description = "Connexion réussie")
    @ApiResponse(responseCode = "401",description = "Impossible d'établir une connexion pour cet utilisateur")
    public Response login(@Parameter(description = "Connexion d'un utilisateur (Fan/Organisateur)", required = true) Users dto) {

        if (dto == null || dto.getEmail() == null || dto.getMdp() == null) {
            return Response.status(Response.Status.BAD_REQUEST).build();
        }

        UsersDAO dao = new UsersDAO();
        List<Users> users = dao.getUsers();
        if(users == null || users.isEmpty()) {
            return Response.status(Response.Status.UNAUTHORIZED).build();
        }

        for (Users user : users) {
            if (user.getEmail().equals(dto.getEmail()) && user.getMdp().equals(dto.getMdp())) {
                UsersDTO userDTO = new UsersDTO();
                userDTO.setId(user.getId());
                userDTO.setNom(user.getNom());
                userDTO.setEmail(user.getEmail());
                userDTO.setMdp(user.getMdp());

                userDTO.setRole(user.getRole());
                return Response.ok(userDTO).build();
            }
        }
        return Response.status(Response.Status.UNAUTHORIZED).build();
    }

    @POST
    @Path("/register")
    @Consumes(MediaType.APPLICATION_JSON)
    @Operation(summary = "Inscription d'utilisateurs", description = "Permet à un utilisateur de s'inscrire")
    @ApiResponse(responseCode = "201", description = "Inscription réussie")
    @ApiResponse(responseCode = "400", description = "Données invalides")
    @ApiResponse(responseCode = "409", description = "Email déjà utilisé")
    public Response register(@Parameter(description = "Inscription d'un utilisateur", required = true) UsersDTO userDTO) {
        if (userDTO == null
                || userDTO.getNom() == null || userDTO.getNom().isBlank()
                || userDTO.getEmail() == null || userDTO.getEmail().isBlank()
                || userDTO.getMdp() == null || userDTO.getMdp().isBlank()
                || userDTO.getRole() == null) {
            return Response.status(Response.Status.BAD_REQUEST).entity("Champs requis manquants").build();
        }

        UsersDAO usersDAO = new UsersDAO();
        List<Users> users = usersDAO.getUsers();
        for (Users u : users) {
            if (u.getEmail().equalsIgnoreCase(userDTO.getEmail())) {
                return Response.status(Response.Status.CONFLICT).entity("Email déjà utilisé").build();
            }
        }

        Users newUser;
        if (userDTO.getRole() == Users.Role.Organizer) {
            if (userDTO.getNomOrganisation() == null || userDTO.getNomOrganisation().isBlank()) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity("Le nom de l'organisation est requis pour un organisateur")
                        .build();
            }
            Organizer organizer = new Organizer();
            organizer.setNomOrganisation(userDTO.getNomOrganisation());
            newUser = organizer;
        } else {
            newUser = new Users();
        }

        newUser.setNom(userDTO.getNom());
        newUser.setEmail(userDTO.getEmail());
        newUser.setMdp(userDTO.getMdp());
        newUser.setRole(userDTO.getRole());

        usersDAO.save(newUser);

        UsersDTO created = new UsersDTO();
        created.setId(newUser.getId());
        created.setNom(newUser.getNom());
        created.setEmail(newUser.getEmail());
        created.setMdp(newUser.getMdp());
        created.setRole(newUser.getRole());
        if (newUser instanceof Organizer) {
            Organizer organizer = (Organizer) newUser;
            created.setNomOrganisation(organizer.getNomOrganisation());
        }

        return Response.status(Response.Status.CREATED).entity(created).build();
    }

}
