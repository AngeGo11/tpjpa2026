package jpa.dto;

import jakarta.xml.bind.annotation.XmlElement;
import jakarta.xml.bind.annotation.XmlRootElement;

import java.time.LocalDateTime;

@XmlRootElement(name = "Commande")
public class CommandeDTO {
    private Long id;
    private LocalDateTime date;
    private Double montantTotal;
    private Long acheteurId;
    private StatutCommande statut;


    public CommandeDTO() {
    }

    public CommandeDTO(LocalDateTime date, Double montantTotal, Long acheteurId, StatutCommande statut) {
        this.date = date;
        this.montantTotal = montantTotal;
        this.acheteurId = acheteurId;
        this.statut = statut;
    }


    @XmlElement(name = "id")
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    @XmlElement(name = "date")
    public LocalDateTime getDate() {
        return date;
    }

    public void setDate(LocalDateTime date) {
        this.date = date;
    }

    @XmlElement(name = "montantTotal")
    public Double getMontantTotal() {
        return montantTotal;
    }

    public void setMontantTotal(Double montantTotal) {
        this.montantTotal = montantTotal;
    }

    @XmlElement(name = "acheteurId")
    public Long getAcheteurId() {
        return acheteurId;
    }

    public void setAcheteurId(Long acheteurId) {
        this.acheteurId = acheteurId;
    }

    @XmlElement(name = "statut")
    public StatutCommande getStatut() {
        return statut;
    }

    public void setStatut(StatutCommande statut) {
        this.statut = statut;
    }

    public enum StatutCommande {
        ANNULE,
        REMBOURSE,
        VALIDEE
    }
}
