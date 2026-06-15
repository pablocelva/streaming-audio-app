package com.streamingethico.modules.user.domain;

import com.streamingethico.shared.domain.SubscriptionPlan;
import com.streamingethico.shared.domain.SubscriptionStatus;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "suscripciones")
public class Subscription {

    @Id
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false, unique = true)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SubscriptionPlan plan = SubscriptionPlan.gratis;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SubscriptionStatus estado = SubscriptionStatus.activa;

    @Column(name = "fecha_inicio", nullable = false)
    private Instant startedAt;

    @Column(name = "fecha_vencimiento")
    private Instant expiresAt;

    @PrePersist
    void onCreate() {
        if (id == null) {
            id = UUID.randomUUID();
        }
        if (startedAt == null) {
            startedAt = Instant.now();
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

    public SubscriptionPlan getPlan() {
        return plan;
    }

    public void setPlan(SubscriptionPlan plan) {
        this.plan = plan;
    }

    public SubscriptionStatus getEstado() {
        return estado;
    }

    public void setEstado(SubscriptionStatus estado) {
        this.estado = estado;
    }

    public Instant getStartedAt() {
        return startedAt;
    }

    public void setStartedAt(Instant startedAt) {
        this.startedAt = startedAt;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(Instant expiresAt) {
        this.expiresAt = expiresAt;
    }
}
