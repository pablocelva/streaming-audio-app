package com.streamingethico.modules.playback.application;

import com.streamingethico.modules.playback.api.PlaybackEventRequest;
import com.streamingethico.modules.playback.api.PlaybackEventResponse;
import com.streamingethico.modules.playback.domain.PlaybackEvent;
import com.streamingethico.modules.playback.infrastructure.PlaybackEventRepository;

import com.streamingethico.modules.artist.domain.Artist;
import com.streamingethico.modules.catalog.domain.Song;
import com.streamingethico.modules.catalog.infrastructure.SongRepository;
import com.streamingethico.shared.domain.ApiException;
import com.streamingethico.shared.domain.PlaybackOrigin;
import com.streamingethico.shared.domain.SubscriptionPlan;
import com.streamingethico.modules.user.domain.Subscription;
import com.streamingethico.modules.user.infrastructure.SubscriptionRepository;
import com.streamingethico.modules.user.domain.User;
import com.streamingethico.modules.user.infrastructure.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class PlaybackService {

    private final PlaybackEventRepository playbackEventRepository;
    private final SongRepository songRepository;
    private final UserRepository userRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final PlaybackValidationService validationService;

    public PlaybackService(
            PlaybackEventRepository playbackEventRepository,
            SongRepository songRepository,
            UserRepository userRepository,
            SubscriptionRepository subscriptionRepository,
            PlaybackValidationService validationService
    ) {
        this.playbackEventRepository = playbackEventRepository;
        this.songRepository = songRepository;
        this.userRepository = userRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.validationService = validationService;
    }

    @Transactional
    public PlaybackEventResponse registerEvent(UUID userId, PlaybackEventRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException("NOT_FOUND", "Usuario no encontrado"));

        Song song = songRepository.findByIdWithRelations(request.songId())
                .orElseThrow(() -> new ApiException("NOT_FOUND", "Canción no encontrada"));

        Artist artist = song.getAlbum().getArtist();
        SubscriptionPlan plan = subscriptionRepository.findByUserId(userId)
                .map(Subscription::getPlan)
                .orElse(SubscriptionPlan.gratis);

        PlaybackValidationService.PlaybackValidationResult validation = validationService.validate(
                song,
                artist,
                userId,
                request.listenedSeconds(),
                plan,
                request.sessionId()
        );

        PlaybackEvent event = new PlaybackEvent();
        event.setSong(song);
        event.setUser(user);
        event.setArtist(artist);
        event.setListenedSeconds(request.listenedSeconds());
        event.setUserPlan(plan);
        event.setRoyaltyWeight(validation.royaltyWeight());
        event.setOrigen(request.origin());
        event.setValidForRoyalties(validation.validForRoyalties());
        event.setSessionId(request.sessionId());

        playbackEventRepository.save(event);

        return new PlaybackEventResponse(
                event.getId(),
                event.isValidForRoyalties(),
                validation.royaltyWeight().doubleValue()
        );
    }
}
