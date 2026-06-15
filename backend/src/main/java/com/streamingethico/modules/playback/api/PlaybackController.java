package com.streamingethico.modules.playback.api;

import com.streamingethico.modules.playback.application.PlaybackService;

import com.streamingethico.shared.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/playback")
public class PlaybackController {

    private final PlaybackService playbackService;

    public PlaybackController(PlaybackService playbackService) {
        this.playbackService = playbackService;
    }

    @PostMapping("/events")
    @ResponseStatus(HttpStatus.CREATED)
    public PlaybackEventResponse register(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody PlaybackEventRequest request
    ) {
        return playbackService.registerEvent(principal.getId(), request);
    }
}
