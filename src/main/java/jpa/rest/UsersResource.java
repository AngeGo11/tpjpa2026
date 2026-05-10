package jpa.rest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.core.MediaType;
import io.swagger.v3.oas.annotations.Parameter;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.UriBuilder;
import jpa.dao.BilletsDAO;
import jpa.dao.CommandeDAO;
import jpa.dao.EventsDAO;
import jpa.dao.UsersDAO;
import jpa.dto.BilletsDTO;
import jpa.dto.CommandeDTO;
import jpa.dto.EventsDTO;
import jpa.dto.UsersDTO;
import jpa.model.Artiste;
import jpa.model.Billets;
import jpa.model.Commande;
import jpa.model.Events;
import jpa.model.Users;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Path("users")
@Produces({"application/json", "application/xml"})
@Tag(name="Utilisateurs", description= "Gestion des utilisateurs")
public class UsersResource {

    @GET
    @Path("/{userId}")
    @Operation(summary = "Récupérer un utilisateur par son ID", description = "Retourne un utilisateur à partir de son ID")
    @ApiResponse(responseCode = "200", description = "Utilisateur trouvé")
    @ApiResponse(responseCode = "404",description = "Utilisateur non trouvé")
    public UsersDTO getUsersById(@PathParam("userId") Long userId)  {
        UsersDAO dao = new UsersDAO();
        jpa.model.Users entity = dao.findOne(userId);
        if (entity == null) {
            throw new NotFoundException();
        }
        UsersDTO dto = new UsersDTO(entity.getNom(), entity.getEmail(), entity.getMdp(), entity.getRole());
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
    @Path("/{userId}/billets")
    @Operation(summary = "Récupérer tous les billets d'un utilisateur", description = "Retourne les billets liés aux commandes de l'utilisateur (requête JPQL via BilletsDAO).")
    @ApiResponse(responseCode = "200", description = "Liste des billets")
    @ApiResponse(responseCode = "404", description = "Utilisateur introuvable")
    public List<BilletsDTO> getBilletsByUserId(@PathParam("userId") Long userId) {
        UsersDAO dao = new UsersDAO();
        Users entity = dao.findOne(userId);
        if (entity == null) {
            throw new NotFoundException();
        }
        List<Billets> billets = new BilletsDAO().getBilletsByUser(userId);
        List<BilletsDTO> out = new ArrayList<>();
        for (Billets b : billets) {
            BilletsDTO dto = new BilletsDTO(
                    b.getCodeBarre(),
                    b.getCommande().getId(),
                    b.getTypeBillet().getId());
            dto.setId(b.getId());
            out.add(dto);
        }
        return out;
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
                        UsersDTO dto = new UsersDTO(user.getNom(), user.getEmail(), user.getMdp(), user.getRole());
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
        entity.setRole(userDTO.getRole());

        UsersDAO usersDAO = new UsersDAO();
        usersDAO.save(entity);

        UsersDTO dto = new UsersDTO(entity.getNom(), entity.getEmail(), entity.getMdp(), entity.getRole());
        dto.setId(entity.getId());
        return Response.created(
                UriBuilder.fromResource(UsersResource.class)
                        .path(String.valueOf(entity.getId()))
                        .build()).entity(dto).build();
    }

    @GET
    @Path("/{userId}/favorites/events")
    @Operation(summary = "Événements favoris d’un utilisateur", description = "Liste les événements mis en favori par cet utilisateur")
    @ApiResponse(responseCode = "200", description = "Liste renvoyée")
    @ApiResponse(responseCode = "404", description = "Utilisateur introuvable")
    public List<EventsDTO> listFavoriteEvents(@PathParam("userId") Long userId) {
        UsersDAO usersDAO = new UsersDAO();
        if (usersDAO.findOne(userId) == null) {
            throw new NotFoundException();
        }
        List<Events> favorites = usersDAO.findFavoriteEvents(userId);
        return favorites.stream()
                .map(
                        entity -> {
                            EventsDTO.GenreMusical genreMusical =
                                    EventsDTO.GenreMusical.valueOf(entity.getGenreMusical().name());
                            List<Artiste> invites = entity.getInvites();
                            List<Long> inviteIds =
                                    invites != null
                                            ? invites.stream()
                                                    .map(Artiste::getId)
                                                    .collect(Collectors.toList())
                                            : Collections.emptyList();
                            EventsDTO dto =
                                    new EventsDTO(
                                            entity.getNom(),
                                            entity.getImage(),
                                            entity.getLieu(),
                                            entity.getDate(),
                                            entity.getHeure(),
                                            entity.getDescription(),
                                            entity.getNbPlaces(),
                                            entity.getOrganizer().getId(),
                                            genreMusical,
                                            entity.getArtistePrincipal().getId(),
                                            inviteIds);
                            dto.setId(entity.getId());
                            return dto;
                        })
                .collect(Collectors.toList());
    }

    @GET
    @Path("/{userId}/favorites/events/{eventId}/status")
    @Operation(summary = "Statut favori pour un événement", description = "Indique si l’événement est dans les favoris de l’utilisateur")
    @ApiResponse(responseCode = "200", description = "Statut renvoyé")
    @ApiResponse(responseCode = "404", description = "Utilisateur ou événement introuvable")
    public Map<String, Boolean> getFavoriteStatus(
            @PathParam("userId") Long userId, @PathParam("eventId") Long eventId) {
        UsersDAO usersDAO = new UsersDAO();
        EventsDAO eventsDAO = new EventsDAO();
        if (usersDAO.findOne(userId) == null || eventsDAO.findOne(eventId) == null) {
            throw new NotFoundException();
        }
        Map<String, Boolean> body = new HashMap<>();
        body.put("favorited", usersDAO.hasFavoriteEvent(userId, eventId));
        return body;
    }

    @PUT
    @Path("/{userId}/favorites/events/{eventId}")
    @Operation(summary = "Ajouter un événement aux favoris", description = "Ajoute un lien favori (idempotent si déjà présent)")
    @ApiResponse(responseCode = "204", description = "Favori enregistré")
    @ApiResponse(responseCode = "404", description = "Utilisateur ou événement introuvable")
    public Response addFavoriteEvent(
            @PathParam("userId") Long userId, @PathParam("eventId") Long eventId) {
        UsersDAO usersDAO = new UsersDAO();
        EventsDAO eventsDAO = new EventsDAO();
        if (usersDAO.findOne(userId) == null || eventsDAO.findOne(eventId) == null) {
            throw new NotFoundException();
        }
        try {
            usersDAO.addFavoriteEvent(userId, eventId);
        } catch (IllegalStateException e) {
            throw new NotFoundException();
        }
        return Response.noContent().build();
    }

    @DELETE
    @Path("/{userId}/favorites/events/{eventId}")
    @Operation(summary = "Retirer un événement des favoris", description = "Supprime le lien favori (idempotent si absent)")
    @ApiResponse(responseCode = "204", description = "Favori retiré")
    @ApiResponse(responseCode = "404", description = "Utilisateur ou événement introuvable")
    public Response removeFavoriteEvent(
            @PathParam("userId") Long userId, @PathParam("eventId") Long eventId) {
        UsersDAO usersDAO = new UsersDAO();
        EventsDAO eventsDAO = new EventsDAO();
        if (usersDAO.findOne(userId) == null || eventsDAO.findOne(eventId) == null) {
            throw new NotFoundException();
        }
        try {
            usersDAO.removeFavoriteEvent(userId, eventId);
        } catch (IllegalStateException e) {
            throw new NotFoundException();
        }
        return Response.noContent().build();
    }

}

