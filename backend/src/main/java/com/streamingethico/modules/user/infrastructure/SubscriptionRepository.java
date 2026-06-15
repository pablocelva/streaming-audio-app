package com.streamingethico.modules.user.infrastructure;

import com.streamingethico.modules.user.domain.Subscription;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface SubscriptionRepository extends JpaRepository<Subscription, UUID> {

    Optional<Subscription> findByUserId(UUID userId);
}
