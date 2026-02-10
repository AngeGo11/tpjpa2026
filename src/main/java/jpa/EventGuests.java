package jpa;

import jakarta.persistence.*;

/**
 * Table d'association event_guests : lien many-to-many entre Events et Artiste.
 */
@Entity
@Table(name = "event_guests")
public class EventGuests {
    private Long id;
    private Events event;
    private Artiste artiste;

    public EventGuests() {
    }

    public EventGuests(Events event, Artiste artiste) {
        this.event = event;
        this.artiste = artiste;
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_event", nullable = false)
    public Events getEvent() {
        return event;
    }

    public void setEvent(Events event) {
        this.event = event;
    }

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_artist", nullable = false)
    public Artiste getArtiste() {
        return artiste;
    }

    public void setArtiste(Artiste artiste) {
        this.artiste = artiste;
    }
}
