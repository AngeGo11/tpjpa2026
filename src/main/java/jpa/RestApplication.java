package jpa;

import jakarta.ws.rs.ApplicationPath;
import jakarta.ws.rs.core.Application;
import io.swagger.v3.jaxrs2.integration.resources.OpenApiResource;
import jpa.rest.*;

import java.util.HashSet;
import java.util.Set;

@ApplicationPath("/api")
public class RestApplication extends Application {


    @Override
    public Set<Class<?>> getClasses() {
        final Set<Class<?>> resources = new HashSet<>();


        // SWAGGER endpoints
        resources.add(OpenApiResource.class);
        resources.add(SwaggerResource.class);
        resources.add(ArtisteResource.class);
        resources.add(BilletsResource.class);
        resources.add(CommandeResource.class);
        resources.add(EventsResource.class);
        resources.add(OrganizerResource.class);
        resources.add(TypeBilletResource.class);
        resources.add(UsersResource.class);

        return resources;
    }
}