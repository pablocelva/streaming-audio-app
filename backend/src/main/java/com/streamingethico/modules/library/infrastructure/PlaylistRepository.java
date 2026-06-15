package com.streamingethico.modules.library.infrastructure;

import com.streamingethico.modules.library.domain.Playlist;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PlaylistRepository extends JpaRepository<Playlist, UUID> {

    List<Playlist> findByUserIdOrderByCreatedAtDesc(UUID userId);

    @Query("""
            SELECT p FROM Playlist p
            LEFT JOIN FETCH p.songs ps
            LEFT JOIN FETCH ps.song s
            WHERE p.id = :id AND p.user.id = :userId
            """)
    Optional<Playlist> findByIdAndUserIdWithSongs(UUID id, UUID userId);
}
