package jpa.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.xml.bind.annotation.XmlElement;
import jakarta.xml.bind.annotation.XmlRootElement;

import java.util.Date;

@XmlRootElement(name = "Commande")
public class CommandeDTO {
    private Long id;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss", timezone = "Europe/Paris")
    private Date date;
    private Double montantTotal;
    private Long acheteurId;
    private StatutCommande statut;


    public CommandeDTO() {
    }

    public CommandeDTO(Date date, Double montantTotal, Long acheteurId, StatutCommande statut) {
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
    public Date getDate() {
        return date;
    }

    public void setDate(Date date) {
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
        EN_ATTENTE,
        REMBOURSE,
        VALIDEE
    }
}
