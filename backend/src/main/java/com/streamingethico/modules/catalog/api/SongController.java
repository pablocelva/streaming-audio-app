package com.streamingethico.modules.catalog.api;

import com.streamingethico.modules.catalog.application.CatalogMapper;
import com.streamingethico.modules.catalog.application.CatalogService;

import com.streamingethico.shared.security.UserPrincipal;
import com.streamingethico.modules.catalog.application.CatalogMapper.SongResponse;
import com.streamingethico.modules.catalog.application.CatalogMapper.StreamUrlResponse;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@RestController
public class SongController {

    private final CatalogService catalogService;

    public SongController(CatalogService catalogService) {
        this.catalogService = catalogService;
    }

    @GetMapping("/songs/{songId}/stream-url")
    public StreamUrlResponse streamUrl(@PathVariable UUID songId) {
        return catalogService.getStreamUrl(songId);
    }

    @PostMapping("/albums/{albumId}/songs")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ARTIST')")
    public SongResponse uploadSong(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID albumId,
            @RequestParam String title,
            @RequestParam int durationSeconds,
            @RequestParam(required = false) Integer orderInAlbum,
            @RequestParam(required = false) Boolean isExplicit,
            @RequestParam("file") MultipartFile file
    ) throws IOException {
        return catalogService.uploadSong(
                principal.getId(),
                albumId,
                title,
                durationSeconds,
                orderInAlbum,
                isExplicit,
                file
        );
    }
}
