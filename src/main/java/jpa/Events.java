package jpa;

import jakarta.persistence.*;

import java.sql.Time;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Entity
@Table(name = "events")
public class Events {
    private Long id;
    private String nom;
    private String lieu;
    private Date date;
    private Time heure;
    private String description;
    private Integer nbPlaces;

    private Organizer organizer;
    private GenreMusical genreMusical;
    private List<EventCategory> categories = new ArrayList<>();
    private List<EventGuests> eventGuests = new ArrayList<>();
    private List<HistoriqueEvent> historiqueEvents = new ArrayList<>();
    private List<Favoris> favoris = new ArrayList<>();

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
    @JoinColumn(name = "idOrganizer", nullable = false)
    public Organizer getOrganizer() {
        return organizer;
    }

    public void setOrganizer(Organizer organizer) {
        this.organizer = organizer;
    }

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idGenreMusical")
    public GenreMusical getGenreMusical() {
        return genreMusical;
    }

    public void setGenreMusical(GenreMusical genreMusical) {
        this.genreMusical = genreMusical;
    }

    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true)
    public List<EventCategory> getCategories() {
        return categories;
    }

    public void setCategories(List<EventCategory> categories) {
        this.categories = categories;
    }

    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true)
    public List<EventGuests> getEventGuests() {
        return eventGuests;
    }

    public void setEventGuests(List<EventGuests> eventGuests) {
        this.eventGuests = eventGuests;
    }

    @OneToMany(mappedBy = "event")
    public List<HistoriqueEvent> getHistoriqueEvents() {
        return historiqueEvents;
    }

    public void setHistoriqueEvents(List<HistoriqueEvent> historiqueEvents) {
        this.historiqueEvents = historiqueEvents;
    }

    @OneToMany(mappedBy = "event")
    public List<Favoris> getFavoris() {
        return favoris;
    }

    public void setFavoris(List<Favoris> favoris) {
        this.favoris = favoris;
    }
}
