package jpa;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "paiement")
public class Paiement {
    private Long id;
    private Users user;
    private LocalDateTime date;
    private Double montant;
    private StatutPaiement statut;
    private List<BilletsVendus> billetsVendus = new ArrayList<>();

    public Paiement() {
    }

    public Paiement(Users user, LocalDateTime date, Double montant, StatutPaiement statut) {
        this.user = user;
        this.date = date;
        this.montant = montant;
        this.statut = statut;
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idUser", nullable = false)
    public Users getUser() {
        return user;
    }

    public void setUser(Users user) {
        this.user = user;
    }

    @Column(nullable = false)
    public LocalDateTime getDate() {
        return date;
    }

    public void setDate(LocalDateTime date) {
        this.date = date;
    }

    @Column(nullable = false)
    public Double getMontant() {
        return montant;
    }

    public void setMontant(Double montant) {
        this.montant = montant;
    }

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    public StatutPaiement getStatut() {
        return statut;
    }

    public void setStatut(StatutPaiement statut) {
        this.statut = statut;
    }

    @OneToMany(mappedBy = "paiement", cascade = CascadeType.ALL, orphanRemoval = true)
    public List<BilletsVendus> getBilletsVendus() {
        return billetsVendus;
    }

    public void setBilletsVendus(List<BilletsVendus> billetsVendus) {
        this.billetsVendus = billetsVendus;
    }
}
