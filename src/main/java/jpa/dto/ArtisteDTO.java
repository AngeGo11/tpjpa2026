package jpa.dto;

import jakarta.xml.bind.annotation.XmlElement;
import jakarta.xml.bind.annotation.XmlRootElement;

@XmlRootElement(name = "Artiste")
public class ArtisteDTO {
    private Long id;
    private String nom;
    private String photoUrl;

    public ArtisteDTO() {
    }

    public ArtisteDTO(String nomArtiste, String photoUrl) {
        this.nom = nomArtiste;
        this.photoUrl = photoUrl;
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

    @XmlElement(name = "photoUrl")
    public String getPhotoUrl() {
        return photoUrl;
    }

    public void setPhotoUrl(String photoUrl) {
        this.photoUrl = photoUrl;
    }
}
