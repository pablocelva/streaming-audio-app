package com.streamingethico.modules.catalog.api;

import com.streamingethico.modules.catalog.application.CatalogMapper;
import com.streamingethico.modules.catalog.application.CatalogService;

import com.streamingethico.shared.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/albums")
public class AlbumController {

    private final CatalogService catalogService;

    public AlbumController(CatalogService catalogService) {
        this.catalogService = catalogService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ARTIST')")
    public CatalogMapper.AlbumResponse createAlbum(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateAlbumRequest request
    ) {
        return catalogService.createAlbum(principal.getId(), request);
    }
}
