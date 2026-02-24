package jpa.model;

import jakarta.persistence.*;

import java.io.Serializable;


@Entity
@Table(name = "artists")
public class Artiste implements Serializable {
    private Long id;
    private String nomArtiste;
    private String photoUrl;

    public Artiste() {
    }

    public Artiste(String nomArtiste, String photoUrl) {
        this.nomArtiste = nomArtiste;
        this.photoUrl= photoUrl;
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


    public String getPhotoUrl() {
        return photoUrl;
    }
    public void setPhotoUrl(String photoUrl) {
        this.photoUrl = photoUrl;
    }

    
}
