package com.streamingethico.modules.catalog.api;

import jakarta.validation.constraints.NotBlank;

public record CreateAlbumRequest(
        @NotBlank String title,
        Integer releaseYear,
        String genre,
        String coverImageUrl
) {}
