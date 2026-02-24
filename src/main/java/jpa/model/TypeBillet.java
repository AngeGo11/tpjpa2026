package jpa.model;

import jakarta.persistence.*;

import java.io.Serializable;

@Entity
@Table(name = "type_billet")
public class TypeBillet implements Serializable {

    private Long id;
    private Events event;
    private Type type;
    private Double prix;
    private Integer stock;

    public TypeBillet() {
    }

    public TypeBillet(Events event, Type type, Double prix, Integer stock) {
        this.event = event;
        this.type = type;
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

    // Un type de billet appartient forcément à un événement précis.
    // On ne peut pas créer un tarif "VIP" qui flotte dans le vide.
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name="event_id", nullable=false)
    public Events getEvent() {
        return event;
    }

    public void setEvent(Events event) {
        this.event = event;
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


    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    public Type getType() {
        return type;
    }

    public void setType(Type type) {
        this.type = type;
    }

    public enum Type {
        GrandPublic,
        VIP,
        VVIP
    }
}
