package com.streamingethico.modules.admin.api;

import com.streamingethico.modules.admin.application.AdminService;
import com.streamingethico.modules.catalog.application.CatalogMapper;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/dashboard")
    public AdminService.AdminDashboardResponse dashboard() {
        return adminService.getDashboard();
    }

    @GetMapping("/artists/pending")
    public List<CatalogMapper.ArtistProfileResponse> pendingArtists() {
        return adminService.pendingArtists();
    }

    @GetMapping("/artists")
    public List<CatalogMapper.ArtistProfileResponse> listArtists() {
        return adminService.listArtists();
    }

    @PostMapping("/artists/{artistId}/verify")
    public CatalogMapper.ArtistProfileResponse verifyArtist(@PathVariable UUID artistId) {
        return adminService.verifyArtist(artistId);
    }

    @PatchMapping("/artists/{artistId}/status")
    public CatalogMapper.ArtistProfileResponse setArtistStatus(
            @PathVariable UUID artistId,
            @Valid @RequestBody AdminService.SetActiveRequest request
    ) {
        return adminService.setArtistActive(artistId, request.active());
    }

    @GetMapping("/songs")
    public List<AdminService.AdminSongResponse> listSongs(
            @RequestParam(defaultValue = "50") int limit
    ) {
        return adminService.listSongs(limit);
    }

    @PatchMapping("/songs/{songId}/status")
    public AdminService.AdminSongResponse setSongStatus(
            @PathVariable UUID songId,
            @Valid @RequestBody AdminService.SetActiveRequest request
    ) {
        return adminService.setSongActive(songId, request.active());
    }
}
