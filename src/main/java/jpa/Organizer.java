package jpa;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "organizers")
@PrimaryKeyJoinColumn(name = "id")
public class Organizer extends Users{

    private String nomOrganisation;
    private List<Events> events = new ArrayList<>();


    public Organizer() {
    }

    public Organizer(String nomOrganisation) {
        this.nomOrganisation = nomOrganisation;
    }


    @Column(name="nom_organisation")
    public String getNomOrganisation() {
        return nomOrganisation;
    }

    public void setNomOrganisation(String nomOrganisation) {
        this.nomOrganisation = nomOrganisation;
    }

    @OneToMany(mappedBy = "organizer", cascade = CascadeType.ALL, orphanRemoval = true)
    public List<Events> getEvents() {
        return events;
    }

    public void setEvents(List<Events> events) {
        this.events = events;
    }
}
