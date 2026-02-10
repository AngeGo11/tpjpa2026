package jpa;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "events_category")
public class EventCategory {
    private Long id;
    private Events event;
    private TypeTicket typeTicket;
    private Double prix;
    private Integer stock;
    private List<BilletsVendus> billetsVendus = new ArrayList<>();

    public EventCategory() {
    }

    public EventCategory(Events event, TypeTicket typeTicket, Double prix, Integer stock) {
        this.event = event;
        this.typeTicket = typeTicket;
        this.prix = prix;
        this.stock = stock;
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
    @JoinColumn(name = "id_event", nullable = false)
    public Events getEvent() {
        return event;
    }

    public void setEvent(Events event) {
        this.event = event;
    }

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_TypeTicket", nullable = false)
    public TypeTicket getTypeTicket() {
        return typeTicket;
    }

    public void setTypeTicket(TypeTicket typeTicket) {
        this.typeTicket = typeTicket;
    }

    @Column(nullable = false)
    public Double getPrix() {
        return prix;
    }

    public void setPrix(Double prix) {
        this.prix = prix;
    }

    @Column(nullable = false)
    public Integer getStock() {
        return stock;
    }

    public void setStock(Integer stock) {
        this.stock = stock;
    }

    @OneToMany(mappedBy = "eventCategory", cascade = CascadeType.ALL, orphanRemoval = true)
    public List<BilletsVendus> getBilletsVendus() {
        return billetsVendus;
    }

    public void setBilletsVendus(List<BilletsVendus> billetsVendus) {
        this.billetsVendus = billetsVendus;
    }
}
