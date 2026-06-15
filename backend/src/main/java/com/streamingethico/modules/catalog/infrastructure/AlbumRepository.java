package com.streamingethico.modules.catalog.infrastructure;

import com.streamingethico.modules.catalog.domain.Album;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AlbumRepository extends JpaRepository<Album, UUID> {

    List<Album> findByArtistIdAndActivoTrueOrderByUploadedAtDesc(UUID artistId);

    @Query("""
            SELECT a FROM Album a
            WHERE a.activo = true AND a.artist.verificado = true AND a.artist.activo = true
            ORDER BY a.uploadedAt DESC
            """)
    List<Album> findFeatured(Pageable pageable);

    Optional<Album> findByIdAndArtistUserId(UUID id, UUID userId);
}
