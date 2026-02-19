package servlet;

import jakarta.persistence.EntityManager;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jpa.EntityManagerHelper;
import jpa.Events;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

@WebServlet(name="afficherEvents", urlPatterns={"/AfficherEvents"})
public class AfficherEvents extends HttpServlet {
    public void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("text/html");
        PrintWriter out = response.getWriter();
        EntityManager em = EntityManagerHelper.getEntityManager();

        List<Events> events = em.createQuery("select e from Events e", Events.class).getResultList();

        out.println("<html><body><h1>Liste des Événements</h1>");
        out.println("<table border='1'><tr><th>Nom</th><th>Lieu</th><th>Places</th></tr>");

        for (Events e : events) {
            out.println("<tr>");
            out.println("<td>" + e.getNom() + "</td>");
            out.println("<td>" + e.getLieu() + "</td>");
            out.println("<td>" + e.getNbPlaces() + "</td>");
            out.println("</tr>");
        }
        out.println("</table><br><a href='ajoutEvent.html'>Ajouter un événement</a></body></html>");
    }
}