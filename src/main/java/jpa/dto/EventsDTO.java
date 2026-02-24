package jpa.dto;

import jakarta.xml.bind.annotation.XmlElement;
import jakarta.xml.bind.annotation.XmlElementWrapper;
import jakarta.xml.bind.annotation.XmlRootElement;

import java.sql.Time;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@XmlRootElement(name = "Events")
public class EventsDTO {
    private Long id;
    private String nom;
    private String lieu;
    private Date date;
    private Time heure;
    private String description;
    private Integer nbPlaces;
    private Long organizerId;
    private GenreMusical genreMusical;
    private Long artistePrincipalId;
    private List<Long> inviteIds = new ArrayList<>();

    public EventsDTO() {
    }

    public EventsDTO(String nom, String lieu, Date date, Time heure, String description, Integer nbPlaces, Long organizerId, GenreMusical genreMusical, Long artistePrincipalId, List<Long> inviteIds) {
        this.nom = nom;
        this.lieu = lieu;
        this.date = date;
        this.heure = heure;
        this.description = description;
        this.nbPlaces = nbPlaces;
        this.organizerId = organizerId;
        this.genreMusical = genreMusical;
        this.artistePrincipalId = artistePrincipalId;
        this.inviteIds = inviteIds;
    }

    @XmlElement(name = "id")
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    @XmlElement(name = "nom")
    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    @XmlElement(name = "lieu")
    public String getLieu() {
        return lieu;
    }

    public void setLieu(String lieu) {
        this.lieu = lieu;
    }

    @XmlElement(name = "date")
    public Date getDate() {
        return date;
    }

    public void setDate(Date date) {
        this.date = date;
    }

    @XmlElement(name = "heure")
    public Time getHeure() {
        return heure;
    }

    public void setHeure(Time heure) {
        this.heure = heure;
    }

    @XmlElement(name = "description")
    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    @XmlElement(name = "nbPlaces")
    public Integer getNbPlaces() {
        return nbPlaces;
    }

    public void setNbPlaces(Integer nbPlaces) {
        this.nbPlaces = nbPlaces;
    }

    @XmlElement(name = "organizerId")
    public Long getOrganizerId() {
        return organizerId;
    }

    public void setOrganizerId(Long organizerId) {
        this.organizerId = organizerId;
    }

    @XmlElement(name = "genreMusical")
    public GenreMusical getGenreMusical() {
        return genreMusical;
    }

    public void setGenreMusical(GenreMusical genreMusical) {
        this.genreMusical = genreMusical;
    }

    @XmlElement(name = "artistePrincipalId")
    public Long getArtistePrincipalId() {
        return artistePrincipalId;
    }

    public void setArtistePrincipalId(Long artistePrincipalId) {
        this.artistePrincipalId = artistePrincipalId;
    }

    @XmlElementWrapper(name = "inviteIds")
    @XmlElement(name = "inviteId")
    public List<Long> getInviteIds() {
        return inviteIds;
    }

    public void setInviteIds(List<Long> inviteIds) {
        this.inviteIds = inviteIds;
    }

    public enum GenreMusical {
        POP,
        ROCK,
        SHATTA,
        JAZZ,
        HIP_HOP,
        ELECTRO,
        RAP
    }
}
