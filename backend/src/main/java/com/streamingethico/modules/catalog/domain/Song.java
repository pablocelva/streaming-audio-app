package com.streamingethico.modules.catalog.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "canciones")
public class Song {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "album_id", nullable = false)
    private Album album;

    @Column(nullable = false)
    private String titulo;

    @Column(name = "duracion_segundos", nullable = false)
    private int durationSeconds;

    @Column(name = "ruta_archivo_storage", nullable = false)
    private String storagePath;

    @Column(name = "hash_archivo", nullable = false, unique = true)
    private String fileHash;

    @Column(name = "orden_en_album", nullable = false)
    private int orderInAlbum = 1;

    @Column(name = "es_explicito", nullable = false)
    private boolean explicit = false;

    @Column(nullable = false)
    private boolean activo = true;

    @Column(name = "fecha_subida", nullable = false)
    private Instant uploadedAt;

    @PrePersist
    void onCreate() {
        if (id == null) {
            id = UUID.randomUUID();
        }
        if (uploadedAt == null) {
            uploadedAt = Instant.now();
        }
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Album getAlbum() {
        return album;
    }

    public void setAlbum(Album album) {
        this.album = album;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public int getDurationSeconds() {
        return durationSeconds;
    }

    public void setDurationSeconds(int durationSeconds) {
        this.durationSeconds = durationSeconds;
    }

    public String getStoragePath() {
        return storagePath;
    }

    public void setStoragePath(String storagePath) {
        this.storagePath = storagePath;
    }

    public String getFileHash() {
        return fileHash;
    }

    public void setFileHash(String fileHash) {
        this.fileHash = fileHash;
    }

    public int getOrderInAlbum() {
        return orderInAlbum;
    }

    public void setOrderInAlbum(int orderInAlbum) {
        this.orderInAlbum = orderInAlbum;
    }

    public boolean isExplicit() {
        return explicit;
    }

    public void setExplicit(boolean explicit) {
        this.explicit = explicit;
    }

    public boolean isActivo() {
        return activo;
    }

    public void setActivo(boolean activo) {
        this.activo = activo;
    }

    public Instant getUploadedAt() {
        return uploadedAt;
    }

    public void setUploadedAt(Instant uploadedAt) {
        this.uploadedAt = uploadedAt;
    }
}
