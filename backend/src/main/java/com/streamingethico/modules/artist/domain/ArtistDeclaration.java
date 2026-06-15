package com.streamingethico.modules.artist.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "declaraciones_artista")
public class ArtistDeclaration {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "artista_id", nullable = false)
    private Artist artist;

    @Column(nullable = false)
    private boolean aceptada;

    @Column(name = "fecha_firma", nullable = false)
    private Instant signedAt;

    @Column(name = "ip_firma")
    private String ipAddress;

    @Column(name = "version_documento", nullable = false)
    private String documentVersion;

    @PrePersist
    void onCreate() {
        if (id == null) {
            id = UUID.randomUUID();
        }
        if (signedAt == null) {
            signedAt = Instant.now();
        }
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Artist getArtist() {
        return artist;
    }

    public void setArtist(Artist artist) {
        this.artist = artist;
    }

    public boolean isAceptada() {
        return aceptada;
    }

    public void setAceptada(boolean aceptada) {
        this.aceptada = aceptada;
    }

    public Instant getSignedAt() {
        return signedAt;
    }

    public void setSignedAt(Instant signedAt) {
        this.signedAt = signedAt;
    }

    public String getIpAddress() {
        return ipAddress;
    }

    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }

    public String getDocumentVersion() {
        return documentVersion;
    }

    public void setDocumentVersion(String documentVersion) {
        this.documentVersion = documentVersion;
    }
}
