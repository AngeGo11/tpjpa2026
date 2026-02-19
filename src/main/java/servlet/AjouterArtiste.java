package servlet;

import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityTransaction;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jpa.Artiste;
import jpa.EntityManagerHelper;

import java.io.IOException;

@WebServlet(name="ajouterArtiste", urlPatterns={"/AjouterArtiste"})
public class AjouterArtiste extends HttpServlet {
    public void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        String nom = request.getParameter("nom");

        EntityManager em = EntityManagerHelper.getEntityManager();
        EntityTransaction tx = em.getTransaction();

        tx.begin();
        Artiste a = new Artiste();
        a.setNomArtiste(nom);
        em.persist(a);
        tx.commit();

        response.sendRedirect("/AfficherArtistes");
    }
}