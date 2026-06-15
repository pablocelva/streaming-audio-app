package com.streamingethico.playback;

import com.streamingethico.modules.artist.domain.Artist;
import com.streamingethico.modules.catalog.domain.Album;
import com.streamingethico.modules.catalog.domain.Song;
import com.streamingethico.modules.playback.application.PlaybackValidationService;
import com.streamingethico.modules.playback.infrastructure.PlaybackEventRepository;
import com.streamingethico.shared.domain.SubscriptionPlan;
import com.streamingethico.shared.config.AppProperties;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PlaybackValidationServiceTest {

    @Mock
    private PlaybackEventRepository playbackEventRepository;

    private PlaybackValidationService service;

    @BeforeEach
    void setUp() {
        AppProperties properties = new AppProperties(
                new AppProperties.Jwt("secret", 15, 7),
                new AppProperties.Storage("http://localhost:9000", "k", "s", "audio", "us-east-1", 60),
                new AppProperties.Royalties(1.0, 0.25, 0.20),
                new AppProperties.Upload(52_428_800L)
        );
        service = new PlaybackValidationService(playbackEventRepository, properties);
    }

    @Test
    void validPremiumPlayGetsWeightOne() {
        Song song = songWithDuration(200);
        Artist artist = verifiedArtist();

        when(playbackEventRepository.existsByUserIdAndSongIdAndPlayedAtAfter(any(), any(), any()))
                .thenReturn(false);

        var result = service.validate(song, artist, UUID.randomUUID(), 45, SubscriptionPlan.premium, "sess-1");

        assertThat(result.validForRoyalties()).isTrue();
        assertThat(result.royaltyWeight().doubleValue()).isEqualTo(1.0);
    }

    @Test
    void validFreePlayGetsWeightZeroPointTwoFive() {
        Song song = songWithDuration(200);
        Artist artist = verifiedArtist();

        when(playbackEventRepository.existsByUserIdAndSongIdAndPlayedAtAfter(any(), any(), any()))
                .thenReturn(false);

        var result = service.validate(song, artist, UUID.randomUUID(), 45, SubscriptionPlan.gratis, "sess-2");

        assertThat(result.validForRoyalties()).isTrue();
        assertThat(result.royaltyWeight().doubleValue()).isEqualTo(0.25);
    }

    @Test
    void shortListenIsInvalid() {
        Song song = songWithDuration(200);
        Artist artist = verifiedArtist();

        var result = service.validate(song, artist, UUID.randomUUID(), 10, SubscriptionPlan.premium, "sess-3");

        assertThat(result.validForRoyalties()).isFalse();
        assertThat(result.royaltyWeight().doubleValue()).isEqualTo(0.0);
    }

    @Test
    void duplicatePlayWithinWindowIsInvalid() {
        Song song = songWithDuration(120);
        Artist artist = verifiedArtist();
        UUID userId = UUID.randomUUID();

        when(playbackEventRepository.existsByUserIdAndSongIdAndPlayedAtAfter(eq(userId), eq(song.getId()), any()))
                .thenReturn(true);

        var result = service.validate(song, artist, userId, 60, SubscriptionPlan.premium, "sess-4");

        assertThat(result.validForRoyalties()).isFalse();
    }

    @Test
    void unverifiedArtistIsInvalid() {
        Song song = songWithDuration(120);
        Artist artist = verifiedArtist();
        artist.setVerificado(false);

        var result = service.validate(song, artist, UUID.randomUUID(), 60, SubscriptionPlan.premium, "sess-5");

        assertThat(result.validForRoyalties()).isFalse();
    }

    private Song songWithDuration(int seconds) {
        Artist artist = verifiedArtist();
        Album album = new Album();
        album.setArtist(artist);
        album.setActivo(true);

        Song song = new Song();
        song.setId(UUID.randomUUID());
        song.setAlbum(album);
        song.setDurationSeconds(seconds);
        song.setActivo(true);
        return song;
    }

    private Artist verifiedArtist() {
        Artist artist = new Artist();
        artist.setId(UUID.randomUUID());
        artist.setActivo(true);
        artist.setVerificado(true);
        return artist;
    }
}
