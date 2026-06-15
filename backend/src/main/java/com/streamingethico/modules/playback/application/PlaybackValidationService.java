package com.streamingethico.modules.playback.application;

import com.streamingethico.modules.artist.domain.Artist;
import com.streamingethico.modules.catalog.domain.Song;
import com.streamingethico.modules.playback.infrastructure.PlaybackEventRepository;
import com.streamingethico.shared.domain.SubscriptionPlan;
import com.streamingethico.shared.config.AppProperties;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Service
public class PlaybackValidationService {

    private static final int MIN_LISTEN_SECONDS = 30;
    private static final int ANTI_FRAUD_WINDOW_SECONDS = 30;

    private final PlaybackEventRepository playbackEventRepository;
    private final double premiumWeight;
    private final double freeWeight;

    public PlaybackValidationService(PlaybackEventRepository playbackEventRepository, AppProperties appProperties) {
        this.playbackEventRepository = playbackEventRepository;
        this.premiumWeight = appProperties.royalties().premiumWeight();
        this.freeWeight = appProperties.royalties().freeWeight();
    }

    public PlaybackValidationResult validate(
            Song song,
            Artist artist,
            java.util.UUID userId,
            int listenedSeconds,
            SubscriptionPlan userPlan,
            String sessionId
    ) {
        boolean artistEligible = artist.isActivo() && artist.isVerificado();
        boolean songEligible = song.isActivo() && song.getAlbum().isActivo();

        int threshold = Math.min(MIN_LISTEN_SECONDS, (int) Math.floor(song.getDurationSeconds() * 0.8));
        boolean meetsDuration = listenedSeconds >= threshold;

        Instant windowStart = Instant.now().minus(ANTI_FRAUD_WINDOW_SECONDS, ChronoUnit.SECONDS);
        boolean duplicate = playbackEventRepository.existsByUserIdAndSongIdAndPlayedAtAfter(
                userId, song.getId(), windowStart
        );

        boolean valid = artistEligible && songEligible && meetsDuration && !duplicate;
        double weightValue = userPlan == SubscriptionPlan.premium ? premiumWeight : freeWeight;
        BigDecimal weight = valid ? BigDecimal.valueOf(weightValue) : BigDecimal.ZERO;

        return new PlaybackValidationResult(valid, weight);
    }

    public record PlaybackValidationResult(boolean validForRoyalties, BigDecimal royaltyWeight) {}
}
