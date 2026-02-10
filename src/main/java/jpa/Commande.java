package jpa;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "commandes")
public class Commande {
    private Long id;
    private LocalDateTime date;
    private Double montantTotal;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable=false)
    private Users acheteur;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutCommande statut;


// Une commande peut contenir plusieurs billets
    @OneToMany(mappedBy = "commande", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Billets> billets = new ArrayList<>();




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

    public StatutCommande getStatut() {
        return statut;
    }

    public void setStatut(StatutCommande statut) {
        this.statut = statut;
    }

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
