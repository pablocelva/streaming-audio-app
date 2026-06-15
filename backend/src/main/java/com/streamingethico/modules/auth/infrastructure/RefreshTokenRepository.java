package com.streamingethico.modules.auth.infrastructure;

import com.streamingethico.modules.auth.domain.RefreshToken;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {

    Optional<RefreshToken> findByTokenHashAndRevocadoFalse(String tokenHash);
}
