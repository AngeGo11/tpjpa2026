package servlet;

import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityTransaction;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jpa.EntityManagerHelper;
import jpa.Events;
import java.io.IOException;

@WebServlet(name="ajouterEvent", urlPatterns={"/AjouterEvent"})
public class AjouterEvent extends HttpServlet {
    public void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        String nom = request.getParameter("nom");
        String lieu = request.getParameter("lieu");
        String desc = request.getParameter("description");
        int nbPlaces = Integer.parseInt(request.getParameter("nbPlaces"));

        EntityManager em = EntityManagerHelper.getEntityManager();
        EntityTransaction tx = em.getTransaction();

        tx.begin();
        Events e = new Events();
        e.setNom(nom);
        e.setLieu(lieu);
        e.setDescription(desc);
        e.setNbPlaces(nbPlaces);
        em.persist(e);
        tx.commit();

        response.sendRedirect("/AfficherEvents");
    }
}