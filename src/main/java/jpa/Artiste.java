package jpa;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

/**
 * Artiste : entité indépendante (pas un User). Liée à RoleArtiste, GenreMusical, et Events via EventGuests.
 */
@Entity
@Table(name = "artiste")
public class Artiste {
    private Long id;
    private String nomArtiste;
    private RoleArtiste roleArtiste;
    private List<GenreMusical> genresMusicaux = new ArrayList<>();
    private List<EventGuests> eventGuests = new ArrayList<>();

    public Artiste() {
    }

    public Artiste(String nomArtiste, RoleArtiste roleArtiste) {
        this.nomArtiste = nomArtiste;
        this.roleArtiste = roleArtiste;
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
    public String getNomArtiste() {
        return nomArtiste;
    }

    public void setNomArtiste(String nomArtiste) {
        this.nomArtiste = nomArtiste;
    }

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idRole", nullable = false)
    public RoleArtiste getRoleArtiste() {
        return roleArtiste;
    }

    public void setRoleArtiste(RoleArtiste roleArtiste) {
        this.roleArtiste = roleArtiste;
    }

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "artiste_genre",
            joinColumns = @JoinColumn(name = "id_artiste"),
            inverseJoinColumns = @JoinColumn(name = "id_genre")
    )
    public List<GenreMusical> getGenresMusicaux() {
        return genresMusicaux;
    }

    public void setGenresMusicaux(List<GenreMusical> genresMusicaux) {
        this.genresMusicaux = genresMusicaux;
    }

    @OneToMany(mappedBy = "artiste", cascade = CascadeType.ALL, orphanRemoval = true)
    public List<EventGuests> getEventGuests() {
        return eventGuests;
    }

    public void setEventGuests(List<EventGuests> eventGuests) {
        this.eventGuests = eventGuests;
    }
}
