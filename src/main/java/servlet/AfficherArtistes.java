package servlet;

import jakarta.persistence.EntityManager;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jpa.Artiste;
import jpa.EntityManagerHelper;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

@WebServlet(name="afficherArtistes", urlPatterns={"/AfficherArtistes"})
public class AfficherArtistes extends HttpServlet {
    public void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("text/html");
        PrintWriter out = response.getWriter();
        EntityManager em = EntityManagerHelper.getEntityManager();

        List<Artiste> artistes = em.createQuery("select a from Artiste a", Artiste.class).getResultList();

        out.println("<html><body><h1>Liste des Artistes</h1><ul>");
        for (Artiste a : artistes) {
            out.println("<li>" + a.getNomArtiste() + "</li>");
        }
        out.println("</ul><br><a href='ajoutArtiste.html'>Ajouter un artiste</a></body></html>");
    }
}