package jpa.model;

import jakarta.persistence.*;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;



@NamedQuery(
    name="Commande.findByStatut", query="SELECT c FROM Commande c WHERE c.statut = :statut"
)
@Entity
@Table(name = "commandes")
public class Commande implements Serializable {
    private Long id;
    private LocalDateTime date;
    private Double montantTotal;
    private Users acheteur;
    private StatutCommande statut;
    private List<Billets> billets = new ArrayList<>();




    @ManyToOne
    @JoinColumn(name = "user_id", nullable=false)
    public Users getAcheteur() {
        return acheteur;
    }

    public void setAcheteur(Users acheteur) {
        this.acheteur = acheteur;
    }

    public Commande() {
    }


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDateTime getDate() {
        return date;
    }

    public void setDate(LocalDateTime date) {
        this.date = date;
    }

    public Double getMontantTotal() {
        return montantTotal;
    }

    public void setMontantTotal(Double montantTotal) {
        this.montantTotal = montantTotal;
    }

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    public StatutCommande getStatut() {
        return statut;
    }

    public void setStatut(StatutCommande statut) {
        this.statut = statut;
    }

    // Une commande peut contenir plusieurs billets
    @OneToMany(mappedBy = "commande", cascade = CascadeType.ALL, orphanRemoval = true)
    public List<Billets> getBillets() {
        return billets;
    }

    public void setBillets(List<Billets> billets) {
        this.billets = billets;
    }

    public enum StatutCommande{
        ANNULE,
        REMBOURSE,
        VALIDEE
    }
}
