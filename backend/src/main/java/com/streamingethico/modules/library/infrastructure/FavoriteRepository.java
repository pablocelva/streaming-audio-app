package com.streamingethico.modules.library.infrastructure;

import com.streamingethico.modules.library.domain.Favorite;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface FavoriteRepository extends JpaRepository<Favorite, Favorite.FavoriteId> {

    @Query("""
            SELECT f FROM Favorite f
            JOIN FETCH f.song s
            JOIN FETCH s.album a
            JOIN FETCH a.artist ar
            WHERE f.userId = :userId AND s.activo = true
            """)
    List<Favorite> findByUserIdWithSongs(UUID userId);

    boolean existsByUserIdAndSongId(UUID userId, UUID songId);

    void deleteByUserIdAndSongId(UUID userId, UUID songId);
}
