package jpa;

import java.util.logging.Logger;

import io.undertow.Undertow;
import org.jboss.resteasy.plugins.server.undertow.UndertowJaxrsServer;


public class RestServer {

    /**
     * RESTfull microservice, based on JAX-RS and JBoss Undertow
     *
     */

        private static final Logger logger = Logger.getLogger(RestServer.class.getName());

        public static void main( String[] args ) {

            UndertowJaxrsServer ut = new UndertowJaxrsServer();

            RestApplication app = new RestApplication();
            ut.deploy(app, "/"); // Préciser la racine du déploiement ("/" au lieu de dépendre du défaut qui pourrait être différent)

            ut.start(
                    Undertow.builder()
                            .addHttpListener(8080, "localhost")

            );

            logger.info("JAX-RS based micro-service running on http://localhost:8080/api");
        }
    }
