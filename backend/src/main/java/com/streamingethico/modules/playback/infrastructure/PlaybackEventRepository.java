package com.streamingethico.modules.playback.infrastructure;

import com.streamingethico.modules.playback.domain.PlaybackEvent;
import com.streamingethico.shared.domain.SubscriptionPlan;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface PlaybackEventRepository extends JpaRepository<PlaybackEvent, Long> {

    boolean existsByUserIdAndSongIdAndPlayedAtAfter(UUID userId, UUID songId, Instant after);

    @Query("""
            SELECT COUNT(p) FROM PlaybackEvent p
            WHERE p.artist.id = :artistId AND p.validForRoyalties = true
            AND p.playedAt BETWEEN :from AND :to
            """)
    long countValidPlaysByArtist(UUID artistId, Instant from, Instant to);

    @Query("""
            SELECT COUNT(p) FROM PlaybackEvent p
            WHERE p.artist.id = :artistId AND p.validForRoyalties = true
            AND p.userPlan = com.streamingethico.shared.domain.SubscriptionPlan.premium
            AND p.playedAt BETWEEN :from AND :to
            """)
    long countValidPremiumPlaysByArtist(UUID artistId, Instant from, Instant to);

    @Query("""
            SELECT p.song.id, p.song.titulo, COUNT(p)
            FROM PlaybackEvent p
            WHERE p.artist.id = :artistId AND p.validForRoyalties = true
            AND p.playedAt BETWEEN :from AND :to
            GROUP BY p.song.id, p.song.titulo
            ORDER BY COUNT(p) DESC
            """)
    List<Object[]> topSongsByArtist(UUID artistId, Instant from, Instant to, org.springframework.data.domain.Pageable pageable);

    @Query("""
            SELECT COUNT(p) FROM PlaybackEvent p
            WHERE p.validForRoyalties = true
            AND p.playedAt BETWEEN :from AND :to
            """)
    long countValidPlaysBetween(Instant from, Instant to);
}
