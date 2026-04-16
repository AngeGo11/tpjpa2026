package jpa.service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

public class LocalImageStorageService {
    private static final Set<String> ALLOWED_MIME_TYPES = Set.of(
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp",
            "image/gif"
    );

    private final Path storageRoot;
    private final String publicBasePath;

    public LocalImageStorageService() {
        Path projectRoot = detectProjectRoot();
        Path defaultStorageRoot = projectRoot.resolve(Paths.get("frontend", "images")).normalize().toAbsolutePath();
        String configuredStoragePath = System.getProperty("images.storage.path");
        if (configuredStoragePath == null || configuredStoragePath.isBlank()) {
            configuredStoragePath = System.getenv("IMAGES_STORAGE_PATH");
        }

        String configuredPublicBasePath = System.getProperty("images.public.base-url");
        if (configuredPublicBasePath == null || configuredPublicBasePath.isBlank()) {
            configuredPublicBasePath = System.getenv("IMAGES_PUBLIC_BASE_URL");
        }
        if (configuredPublicBasePath == null || configuredPublicBasePath.isBlank()) {
            configuredPublicBasePath = "/images";
        }

        this.storageRoot = resolveStorageRoot(configuredStoragePath, defaultStorageRoot);
        this.publicBasePath = normalizePublicBasePath(configuredPublicBasePath);
    }

    public String storeImage(InputStream inputStream, String originalFileName, String contentType) throws IOException {
        return storeImage(inputStream, originalFileName, contentType, null);
    }

    public String storeImage(
            InputStream inputStream,
            String originalFileName,
            String contentType,
            String subDirectory
    ) throws IOException {
        if (inputStream == null) {
            throw new IllegalArgumentException("Fichier image manquant.");
        }
        if (contentType == null || !ALLOWED_MIME_TYPES.contains(contentType.toLowerCase(Locale.ROOT))) {
            throw new IllegalArgumentException("Type de fichier non autorise. Types acceptes: jpeg, png, webp, gif.");
        }

        String extension = resolveExtension(originalFileName, contentType);
        String generatedFileName = UUID.randomUUID() + extension;
        String normalizedSubDirectory = normalizeSubDirectory(subDirectory);
        Path targetDirectory = normalizedSubDirectory.isEmpty()
                ? storageRoot
                : storageRoot.resolve(normalizedSubDirectory).normalize();

        Files.createDirectories(targetDirectory);
        Path targetPath = targetDirectory.resolve(generatedFileName).normalize();
        try (InputStream fileData = inputStream) {
            Files.copy(fileData, targetPath, StandardCopyOption.REPLACE_EXISTING);
        }

        return normalizedSubDirectory.isEmpty()
                ? publicBasePath + "/" + generatedFileName
                : publicBasePath + "/" + normalizedSubDirectory + "/" + generatedFileName;
    }

    private String normalizePublicBasePath(String value) {
        String normalized = value.trim().replace("\\", "/");
        if (!normalized.startsWith("/")) {
            normalized = "/" + normalized;
        }
        if (normalized.endsWith("/")) {
            normalized = normalized.substring(0, normalized.length() - 1);
        }
        return normalized;
    }

    private String resolveExtension(String originalFileName, String contentType) {
        if (originalFileName != null && originalFileName.contains(".")) {
            String fromName = originalFileName.substring(originalFileName.lastIndexOf(".")).toLowerCase(Locale.ROOT);
            if (fromName.matches("\\.[a-z0-9]{1,5}")) {
                return fromName;
            }
        }

        switch (contentType.toLowerCase(Locale.ROOT)) {
            case "image/png":
                return ".png";
            case "image/webp":
                return ".webp";
            case "image/gif":
                return ".gif";
            default:
                return ".jpg";
        }
    }

    private String normalizeSubDirectory(String subDirectory) {
        if (subDirectory == null || subDirectory.isBlank()) {
            return "";
        }
        String normalized = subDirectory.trim().replace("\\", "/");
        normalized = normalized.replaceAll("^/+", "").replaceAll("/+$", "");
        if (normalized.contains("..")) {
            throw new IllegalArgumentException("Sous-dossier d'image invalide.");
        }
        if (!normalized.matches("[a-zA-Z0-9/_-]+")) {
            throw new IllegalArgumentException("Sous-dossier d'image invalide.");
        }
        return normalized;
    }

    private Path resolveStorageRoot(String configuredStoragePath, Path defaultStorageRoot) {
        if (configuredStoragePath == null || configuredStoragePath.isBlank()) {
            return defaultStorageRoot;
        }
        Path configuredPath = Paths.get(configuredStoragePath.trim()).normalize();
        if (!configuredPath.isAbsolute()) {
            String normalized = configuredPath.toString().replace("\\", "/");
            if ("images".equals(normalized) || "./images".equals(normalized)) {
                return defaultStorageRoot;
            }
            return detectProjectRoot().resolve(configuredPath).normalize().toAbsolutePath();
        }
        return configuredPath.toAbsolutePath().normalize();
    }

    private Path detectProjectRoot() {
        Path current = Paths.get(System.getProperty("user.dir")).toAbsolutePath().normalize();
        while (current != null) {
            if (Files.exists(current.resolve("pom.xml")) && Files.isDirectory(current.resolve("frontend"))) {
                return current;
            }
            current = current.getParent();
        }
        return Paths.get(System.getProperty("user.dir")).toAbsolutePath().normalize();
    }
}
