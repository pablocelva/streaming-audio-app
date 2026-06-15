package com.streamingethico.modules.playback.api;

import com.streamingethico.shared.domain.PlaybackOrigin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record PlaybackEventRequest(
        @NotNull UUID songId,
        @Min(0) int listenedSeconds,
        @NotBlank String sessionId,
        @NotNull PlaybackOrigin origin
) {}
