package com.streamingethico.modules.auth.api.dto;

import jakarta.validation.constraints.NotBlank;

public record RegisterArtistRequest(
        @NotBlank String email,
        @NotBlank String password,
        @NotBlank String fullName,
        @NotBlank String stageName,
        String biography
) {}
