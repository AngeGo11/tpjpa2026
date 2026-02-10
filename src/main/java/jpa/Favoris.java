package jpa;

import jakarta.persistence.*;

@Entity
@Table(name = "favoris")
public class Favoris {
    private Long id;
    private Users user;
    private Events event;

    public Favoris() {
    }

    public Favoris(Users user, Events event) {
        this.user = user;
        this.event = event;
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
    @JoinColumn(name = "idUser", nullable = false)
    public Users getUser() {
        return user;
    }

    public void setUser(Users user) {
        this.user = user;
    }

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idEvent", nullable = false)
    public Events getEvent() {
        return event;
    }

    public void setEvent(Events event) {
        this.event = event;
    }
}
