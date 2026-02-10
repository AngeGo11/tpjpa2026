package jpa;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "organizer")
@PrimaryKeyJoinColumn(name = "idUser")
public class Organizer extends Users{

    private String nomOrganisat;
    private List<Events> events = new ArrayList<>();

    public Organizer() {
    }

    public Organizer(String nomOrganisat) {
        this.nomOrganisat = nomOrganisat;
    }


    public String getNomOrganisat() {
        return nomOrganisat;
    }

    public void setNomOrganisat(String nomOrganisat) {
        this.nomOrganisat = nomOrganisat;
    }

    @OneToMany(mappedBy = "organizer", cascade = CascadeType.ALL, orphanRemoval = true)
    public List<Events> getEvents() {
        return events;
    }

    public void setEvents(List<Events> events) {
        this.events = events;
    }
}
