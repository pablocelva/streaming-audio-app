package com.streamingethico.modules.catalog.infrastructure;

import com.streamingethico.modules.catalog.domain.Song;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SongRepository extends JpaRepository<Song, UUID> {

    Optional<Song> findByFileHash(String fileHash);

    @Query("""
            SELECT s FROM Song s
            JOIN FETCH s.album a
            JOIN FETCH a.artist ar
            WHERE s.id = :id
            """)
    Optional<Song> findByIdWithRelations(UUID id);

    @Query("""
            SELECT s FROM Song s
            WHERE s.activo = true AND s.album.activo = true
            AND s.album.artist.verificado = true AND s.album.artist.activo = true
            ORDER BY s.uploadedAt DESC
            """)
    List<Song> findFeatured(Pageable pageable);

    @Query("""
            SELECT s FROM Song s
            JOIN s.album a
            JOIN a.artist ar
            WHERE s.activo = true AND a.activo = true AND ar.verificado = true AND ar.activo = true
            AND LOWER(s.titulo) LIKE LOWER(CONCAT('%', :query, '%'))
            """)
    List<Song> searchByTitle(String query, Pageable pageable);

    int countByAlbumArtistIdAndActivoTrue(UUID artistId);

    @Query("""
            SELECT s FROM Song s
            JOIN FETCH s.album a
            JOIN FETCH a.artist ar
            ORDER BY s.uploadedAt DESC
            """)
    List<Song> findAllForAdmin(Pageable pageable);
}
