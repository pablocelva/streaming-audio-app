package com.streamingethico.modules.playback.api;

public record PlaybackEventResponse(Long id, boolean isValidForRoyalties, double weight) {}
