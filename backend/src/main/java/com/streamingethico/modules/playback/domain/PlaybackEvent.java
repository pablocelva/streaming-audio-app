package com.streamingethico.modules.playback.domain;

import com.streamingethico.modules.artist.domain.Artist;
import com.streamingethico.modules.catalog.domain.Song;
import com.streamingethico.shared.domain.PlaybackOrigin;
import com.streamingethico.shared.domain.SubscriptionPlan;
import com.streamingethico.modules.user.domain.User;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "reproducciones")
public class PlaybackEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cancion_id", nullable = false)
    private Song song;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "artista_id", nullable = false)
    private Artist artist;

    @Column(name = "fecha_reproduccion", nullable = false)
    private Instant playedAt;

    @Column(name = "duracion_escuchada_segundos", nullable = false)
    private int listenedSeconds;

    @Enumerated(EnumType.STRING)
    @Column(name = "plan_usuario", nullable = false)
    private SubscriptionPlan userPlan;

    @Column(name = "peso_regalias", nullable = false)
    private BigDecimal royaltyWeight;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PlaybackOrigin origen;

    @Column(name = "es_valida_regalias", nullable = false)
    private boolean validForRoyalties;

    @Column(name = "session_id", nullable = false)
    private String sessionId;

    @PrePersist
    void onCreate() {
        if (playedAt == null) {
            playedAt = Instant.now();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Song getSong() {
        return song;
    }

    public void setSong(Song song) {
        this.song = song;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Artist getArtist() {
        return artist;
    }

    public void setArtist(Artist artist) {
        this.artist = artist;
    }

    public Instant getPlayedAt() {
        return playedAt;
    }

    public void setPlayedAt(Instant playedAt) {
        this.playedAt = playedAt;
    }

    public int getListenedSeconds() {
        return listenedSeconds;
    }

    public void setListenedSeconds(int listenedSeconds) {
        this.listenedSeconds = listenedSeconds;
    }

    public SubscriptionPlan getUserPlan() {
        return userPlan;
    }

    public void setUserPlan(SubscriptionPlan userPlan) {
        this.userPlan = userPlan;
    }

    public BigDecimal getRoyaltyWeight() {
        return royaltyWeight;
    }

    public void setRoyaltyWeight(BigDecimal royaltyWeight) {
        this.royaltyWeight = royaltyWeight;
    }

    public PlaybackOrigin getOrigen() {
        return origen;
    }

    public void setOrigen(PlaybackOrigin origen) {
        this.origen = origen;
    }

    public boolean isValidForRoyalties() {
        return validForRoyalties;
    }

    public void setValidForRoyalties(boolean validForRoyalties) {
        this.validForRoyalties = validForRoyalties;
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }
}
