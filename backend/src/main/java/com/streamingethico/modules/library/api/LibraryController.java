package com.streamingethico.modules.library.api;

import com.streamingethico.modules.library.application.LibraryService;

import com.streamingethico.shared.security.UserPrincipal;
import com.streamingethico.modules.catalog.application.CatalogMapper;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/library")
public class LibraryController {

    private final LibraryService libraryService;

    public LibraryController(LibraryService libraryService) {
        this.libraryService = libraryService;
    }

    @GetMapping("/favorites")
    public List<CatalogMapper.SongSummaryResponse> favorites(@AuthenticationPrincipal UserPrincipal principal) {
        return libraryService.listFavorites(principal.getId());
    }

    @PostMapping("/favorites")
    @ResponseStatus(HttpStatus.CREATED)
    public void addFavorite(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody FavoriteRequest request
    ) {
        libraryService.addFavorite(principal.getId(), request.songId());
    }

    @DeleteMapping("/favorites/{songId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeFavorite(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID songId
    ) {
        libraryService.removeFavorite(principal.getId(), songId);
    }

    @GetMapping("/playlists")
    public List<LibraryService.PlaylistResponse> playlists(@AuthenticationPrincipal UserPrincipal principal) {
        return libraryService.listPlaylists(principal.getId());
    }

    @PostMapping("/playlists")
    @ResponseStatus(HttpStatus.CREATED)
    public LibraryService.PlaylistResponse createPlaylist(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody PlaylistRequest request
    ) {
        return libraryService.createPlaylist(principal.getId(), request.name());
    }

    public record FavoriteRequest(UUID songId) {}

    public record PlaylistRequest(@NotBlank String name) {}
}
