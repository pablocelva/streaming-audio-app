package com.streamingethico.modules.artist.api;

import com.streamingethico.modules.artist.application.ArtistService;

import com.streamingethico.shared.security.UserPrincipal;
import com.streamingethico.modules.catalog.application.CatalogMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/artists")
public class ArtistController {

    private final ArtistService artistService;

    public ArtistController(ArtistService artistService) {
        this.artistService = artistService;
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('ARTIST')")
    public CatalogMapper.ArtistProfileResponse me(@AuthenticationPrincipal UserPrincipal principal) {
        return artistService.getMyProfile(principal.getId());
    }

    @PatchMapping("/me")
    @PreAuthorize("hasRole('ARTIST')")
    public CatalogMapper.ArtistProfileResponse update(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody ArtistService.UpdateArtistRequest request
    ) {
        return artistService.updateProfile(principal.getId(), request);
    }

    @PostMapping("/me/declaration")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ARTIST')")
    public void signDeclaration(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ArtistService.SignDeclarationRequest request,
            HttpServletRequest httpRequest
    ) {
        artistService.signDeclaration(principal.getId(), request, httpRequest);
    }

    @GetMapping("/me/stats")
    @PreAuthorize("hasRole('ARTIST')")
    public ArtistService.ArtistStatsResponse stats(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        return artistService.getStats(principal.getId(), from, to);
    }
}
