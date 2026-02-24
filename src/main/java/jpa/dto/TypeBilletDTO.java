package jpa.dto;

import jakarta.xml.bind.annotation.XmlElement;
import jakarta.xml.bind.annotation.XmlRootElement;
import jpa.model.Events;

@XmlRootElement(name = "TypeBillet")
public class TypeBilletDTO {
    private Long id;
    private Long eventId;  // pour POST : ID de l'événement
    private Events event;  // pour GET : objet complet (optionnel)
    private Type type;
    private Double prix;
    private Integer stock;

    public TypeBilletDTO() {
    }

    public TypeBilletDTO(Events event, Type type, Double prix, Integer stock) {
        this.event = event;
        this.type = type;
        this.prix = prix;
        this.stock = stock;
    }


    @XmlElement(name = "id")
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    @XmlElement(name = "eventId")
    public Long getEventId() {
        return eventId;
    }

    public void setEventId(Long eventId) {
        this.eventId = eventId;
    }

    @XmlElement(name = "event")
    public Events getEvent() {
        return event;
    }

    public void setEvent(Events event) {
        this.event = event;
    }

    @XmlElement(name = "type")
    public Type getType() {
        return type;
    }

    public void setType(Type type) {
        this.type = type;
    }

    @XmlElement(name = "prix")
    public Double getPrix() {
        return prix;
    }

    public void setPrix(Double prix) {
        this.prix = prix;
    }

    @XmlElement(name = "stock")
    public Integer getStock() {
        return stock;
    }

    public void setStock(Integer stock) {
        this.stock = stock;
    }

    public enum Type {
        GrandPublic,
        VIP,
        VVIP
    }
}
