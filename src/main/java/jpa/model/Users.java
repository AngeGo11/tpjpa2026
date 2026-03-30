package jpa.model;

import jakarta.persistence.*;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

@Entity
@Inheritance(strategy = InheritanceType.JOINED)
@Table(name = "users")
public class Users implements Serializable {
    protected Long id;
    private String nom;
    private String email;
    private String mdp;
    private Role role;

    private List<Commande> commandes = new ArrayList<>();

    public Users() {
    }

    public Users(String nom, String email, String mdp, Role role) {
        this.nom = nom;
        this.email = email;
        this.mdp = mdp;
        this.role = role;
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

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


    public enum Role {
        Fan,
        Organizer
    }

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public void setType(Role role) {
        this.role = role;
    }


    @OneToMany(mappedBy = "acheteur", cascade = CascadeType.ALL, orphanRemoval = true)
    public List<Commande> getCommandes() {
        return commandes;
    }

    public void setCommandes(List<Commande> commandes) {
        this.commandes = commandes;
    }




}
