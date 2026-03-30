package jpa.dto;

import jakarta.xml.bind.annotation.XmlElement;
import jakarta.xml.bind.annotation.XmlRootElement;
import jpa.model.Users;

@XmlRootElement(name = "Users")
public class UsersDTO {
    private Long id;
    private String nom;
    private String nomOrganisation;
    private String email;
    private String mdp;
    private Users.Role role;

    public UsersDTO() {
    }

    public UsersDTO(String nom, String email, String mdp, Users.Role role) {
        this.nom = nom;
        this.email = email;
        this.mdp = mdp;
        this.role = role;
    }


    @XmlElement(name = "id")
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    @XmlElement(name = "nom")
    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    @XmlElement(name = "nomOrganisation")
    public String getNomOrganisation() {
        return nomOrganisation;
    }

    public void setNomOrganisation(String nomOrganisation) {
        this.nomOrganisation = nomOrganisation;
    }

    @XmlElement(name = "email")
    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getMdp() {
        return mdp;
    }

    public void setMdp(String mdp) {
        this.mdp = mdp;
    }

    @XmlElement(name = "role")
    public Users.Role getRole() {
        return role;
    }

    public void setRole(Users.Role role) {
        this.role = role;
    }


}
