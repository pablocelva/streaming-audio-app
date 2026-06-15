package com.streamingethico.modules.artist.domain;

import com.streamingethico.modules.user.domain.User;
import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "artistas")
public class Artist {

    @Id
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false, unique = true)
    private User user;

    @Column(name = "nombre_artistico", nullable = false)
    private String stageName;

    @Column
    private String biografia;

    @Column(name = "url_imagen_perfil")
    private String profileImageUrl;

    @Column(nullable = false)
    private boolean verificado = false;

    @Column(nullable = false)
    private boolean activo = true;

    @Column(name = "datos_bancarios_encriptados")
    private String encryptedBankData;

    @PrePersist
    void onCreate() {
        if (id == null) {
            id = UUID.randomUUID();
        }
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getStageName() {
        return stageName;
    }

    public void setStageName(String stageName) {
        this.stageName = stageName;
    }

    public String getBiografia() {
        return biografia;
    }

    public void setBiografia(String biografia) {
        this.biografia = biografia;
    }

    public String getProfileImageUrl() {
        return profileImageUrl;
    }

    public void setProfileImageUrl(String profileImageUrl) {
        this.profileImageUrl = profileImageUrl;
    }

    public boolean isVerificado() {
        return verificado;
    }

    public void setVerificado(boolean verificado) {
        this.verificado = verificado;
    }

    public boolean isActivo() {
        return activo;
    }

    public void setActivo(boolean activo) {
        this.activo = activo;
    }

    public String getEncryptedBankData() {
        return encryptedBankData;
    }

    public void setEncryptedBankData(String encryptedBankData) {
        this.encryptedBankData = encryptedBankData;
    }
}
