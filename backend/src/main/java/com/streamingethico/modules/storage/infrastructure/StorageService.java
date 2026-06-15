package com.streamingethico.modules.storage.infrastructure;

import com.streamingethico.shared.domain.ApiException;
import com.streamingethico.shared.config.AppProperties;
import io.minio.GetPresignedObjectUrlArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.http.Method;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.time.Instant;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
public class StorageService {

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "audio/mpeg",
            "audio/mp3",
            "audio/mp4",
            "audio/x-m4a",
            "audio/m4a"
    );
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("mp3", "m4a");

    private final MinioClient minioClient;
    private final AppProperties.Storage storageProperties;
    private final long maxFileSizeBytes;

    public StorageService(MinioClient minioClient, AppProperties appProperties) {
        this.minioClient = minioClient;
        this.storageProperties = appProperties.storage();
        this.maxFileSizeBytes = appProperties.upload().maxFileSizeBytes();
    }

    public StoredObject storeAudio(MultipartFile file, UUID artistId) {
        validateFile(file);

        String extension = extractExtension(file.getOriginalFilename());
        String objectKey = "artists/%s/%s.%s".formatted(artistId, UUID.randomUUID(), extension);

        try (InputStream inputStream = file.getInputStream()) {
            minioClient.putObject(PutObjectArgs.builder()
                    .bucket(storageProperties.bucket())
                    .object(objectKey)
                    .stream(inputStream, file.getSize(), -1)
                    .contentType(file.getContentType())
                    .build());
        } catch (Exception e) {
            throw new ApiException("STORAGE_ERROR", "No se pudo almacenar el archivo de audio");
        }

        return new StoredObject(objectKey, file.getSize());
    }

    public PresignedUrl generatePresignedUrl(String objectKey) {
        try {
            String url = minioClient.getPresignedObjectUrl(GetPresignedObjectUrlArgs.builder()
                    .method(Method.GET)
                    .bucket(storageProperties.bucket())
                    .object(objectKey)
                    .expiry(storageProperties.presignedUrlExpirationMinutes(), TimeUnit.MINUTES)
                    .build());

            Instant expiresAt = Instant.now().plusSeconds(storageProperties.presignedUrlExpirationMinutes() * 60L);
            return new PresignedUrl(url, expiresAt);
        } catch (Exception e) {
            throw new ApiException("STORAGE_ERROR", "No se pudo generar la URL de streaming");
        }
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ApiException("VALIDATION_ERROR", "El archivo de audio es obligatorio");
        }
        if (file.getSize() > maxFileSizeBytes) {
            throw new ApiException("VALIDATION_ERROR", "El archivo supera el tamaño máximo de 50 MB");
        }

        String extension = extractExtension(file.getOriginalFilename());
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new ApiException("VALIDATION_ERROR", "Formato no permitido. Use MP3 o M4A");
        }

        String contentType = file.getContentType();
        if (contentType != null && !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new ApiException("VALIDATION_ERROR", "Tipo de contenido no permitido");
        }
    }

    private String extractExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
    }

    public record StoredObject(String objectKey, long sizeBytes) {}
    public record PresignedUrl(String url, Instant expiresAt) {}
}
