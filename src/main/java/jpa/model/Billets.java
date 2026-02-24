package jpa.model;

import jakarta.persistence.*;

import java.io.Serializable;

@Entity
@Table(name = "billets")
public class Billets implements Serializable {
    private Long id;
    private String codeBarre;
    // --- RELATIONS (Clés Étrangères) ---
    private Commande commande;
    private TypeBillet typeBillet;




    public Billets() {
    }

    public Billets(String codeBarre, Commande commande, TypeBillet typeBillet) {
        this.codeBarre = codeBarre;
        this.commande = commande;
        this.typeBillet = typeBillet;
    }

    // Relation N..1 : Plusieurs billets appartiennent à une seule commande
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="commande_id", nullable = false)
    public Commande getCommande() {
        return commande;
    }

    public void setCommande(Commande commande) {
        this.commande = commande;
    }

    // Relation N..1 : Plusieurs billets peuvent être du même type (ex: 50 billets "VIP")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="type_billet_id", nullable = false)
    public TypeBillet getTypeBillet() {
        return typeBillet;
    }

    public void setTypeBillet(TypeBillet typeBillet) {
        this.typeBillet = typeBillet;
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    @Column(name="code_barre", nullable=false, unique=true)
    public String getCodeBarre() {
        return codeBarre;
    }

    public void setCodeBarre(String codeBarre) {
        this.codeBarre = codeBarre;
    }






}
