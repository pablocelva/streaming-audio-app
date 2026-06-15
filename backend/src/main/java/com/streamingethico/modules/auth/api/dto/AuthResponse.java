package com.streamingethico.modules.auth.api.dto;

public record AuthResponse(String accessToken, String refreshToken, int expiresIn) {}
