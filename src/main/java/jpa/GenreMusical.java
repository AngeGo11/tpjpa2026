package jpa;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "genre_musical")
public class GenreMusical {
    private Long id;
    private String nomGenre;
    private List<Artiste> artistes = new ArrayList<>();
    private List<Events> events = new ArrayList<>();

    public GenreMusical() {
    }

    public GenreMusical(String nomGenre) {
        this.nomGenre = nomGenre;
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    @Column(name = "nom_genre", nullable = false)
    public String getNomGenre() {
        return nomGenre;
    }

    public void setNomGenre(String nomGenre) {
        this.nomGenre = nomGenre;
    }

    @ManyToMany(mappedBy = "genresMusicaux")
    public List<Artiste> getArtistes() {
        return artistes;
    }

    public void setArtistes(List<Artiste> artistes) {
        this.artistes = artistes;
    }

    @OneToMany(mappedBy = "genreMusical")
    public List<Events> getEvents() {
        return events;
    }

    public void setEvents(List<Events> events) {
        this.events = events;
    }
}
