package jpa;

import jakarta.persistence.*;

@Entity
@Table(name = "billets_vendus")
public class BilletsVendus {
    private Long id;
    private EventCategory eventCategory;
    private String codeBarre;
    private Paiement paiement;

    public BilletsVendus() {
    }

    public BilletsVendus(EventCategory eventCategory, String codeBarre, Paiement paiement) {
        this.eventCategory = eventCategory;
        this.codeBarre = codeBarre;
        this.paiement = paiement;
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
    @JoinColumn(name = "idEventCateg", nullable = false)
    public EventCategory getEventCategory() {
        return eventCategory;
    }

    public void setEventCategory(EventCategory eventCategory) {
        this.eventCategory = eventCategory;
    }

    @Column(nullable = false, unique = true)
    public String getCodeBarre() {
        return codeBarre;
    }

    public void setCodeBarre(String codeBarre) {
        this.codeBarre = codeBarre;
    }

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idPaiement", nullable = false)
    public Paiement getPaiement() {
        return paiement;
    }

    public void setPaiement(Paiement paiement) {
        this.paiement = paiement;
    }
}
