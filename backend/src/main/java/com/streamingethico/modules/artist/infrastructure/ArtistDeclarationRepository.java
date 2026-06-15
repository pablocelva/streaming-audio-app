package com.streamingethico.modules.artist.infrastructure;

import com.streamingethico.modules.artist.domain.ArtistDeclaration;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ArtistDeclarationRepository extends JpaRepository<ArtistDeclaration, UUID> {

    boolean existsByArtistIdAndAceptadaTrue(UUID artistId);
}
