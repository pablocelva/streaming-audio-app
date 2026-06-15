package com.streamingethico.modules.admin.api;

import com.streamingethico.modules.artist.application.ArtistService;
import com.streamingethico.modules.catalog.application.CatalogMapper;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final ArtistService artistService;

    public AdminController(ArtistService artistService) {
        this.artistService = artistService;
    }

    @GetMapping("/artists/pending")
    public List<CatalogMapper.ArtistProfileResponse> pendingArtists() {
        return artistService.pendingVerification();
    }

    @PostMapping("/artists/{artistId}/verify")
    public CatalogMapper.ArtistProfileResponse verifyArtist(@PathVariable UUID artistId) {
        return artistService.verifyArtist(artistId);
    }
}
