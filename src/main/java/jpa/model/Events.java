package jpa.model;

import jakarta.persistence.*;

import java.io.Serializable;
import java.sql.Time;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Entity
@Table(name = "events")
public class Events implements Serializable {
    private Long id;
    private String nom;
    private String lieu;
    private Date date;
    private Time heure;
    private String description;
    private Integer nbPlaces;
    private Organizer organizer;
    private GenreMusical genreMusical;
    private Artiste artistePrincipal;
    private List<Artiste> invites = new ArrayList<>();


    public Events() {
    }


    public Events(String nom, String lieu, Date date, Time heure, String description, Integer nbPlaces) {
        this.nom = nom;
        this.lieu = lieu;
        this.date = date;
        this.heure = heure;
        this.description = description;
        this.nbPlaces = nbPlaces;
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    @Column(nullable = false)
    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public String getLieu() {
        return lieu;
    }

    public void setLieu(String lieu) {
        this.lieu = lieu;
    }

    @Temporal(TemporalType.DATE)
    public Date getDate() {
        return date;
    }

    public void setDate(Date date) {
        this.date = date;
    }

    public Time getHeure() {
        return heure;
    }

    public void setHeure(Time heure) {
        this.heure = heure;
    }

    @Column(length = 2000)
    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    @Column(name = "nbplaces")
    public Integer getNbPlaces() {
        return nbPlaces;
    }

    public void setNbPlaces(Integer nbPlaces) {
        this.nbPlaces = nbPlaces;
    }

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_organizer", nullable = false)
    public Organizer getOrganizer() {
        return organizer;
    }

    public void setOrganizer(Organizer organizer) {
        this.organizer = organizer;
    }

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    public GenreMusical getGenreMusical() {
        return genreMusical;
    }

    public void setGenreMusical(GenreMusical genreMusical) {
        this.genreMusical = genreMusical;
    }


    // 1. L'Artiste Principal (Relation simple)
    // C'est OBLIGATOIRE (nullable = false), il faut au moins une star.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "main_artist_id", nullable = false)
    public Artiste getArtistePrincipal() {
        return artistePrincipal;
    }

    public void setArtistePrincipal(Artiste artistePrincipal) {
        this.artistePrincipal = artistePrincipal;
    }

    // 2. Les Invités (Relation ManyToMany unidirectionnelle)
    // C'est optionnel (on peut ne pas avoir d'invités).
    @ManyToMany
    @JoinTable(
            name="event_guests", //Crée la table d'association
            joinColumns=@JoinColumn(name="id_event"),
            inverseJoinColumns=@JoinColumn(name="id_artist")
    )
    public List<Artiste> getInvites() {
        return invites;
    }

    public void setInvites(List<Artiste> invites) {
        this.invites = invites;
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
