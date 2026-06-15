package com.streamingethico.modules.catalog.api;

import com.streamingethico.modules.catalog.application.CatalogMapper;
import com.streamingethico.modules.catalog.application.CatalogService;

import com.streamingethico.shared.security.UserPrincipal;
import com.streamingethico.modules.catalog.application.CatalogMapper.FeaturedCatalogResponse;
import com.streamingethico.modules.catalog.application.CatalogMapper.SearchResultsResponse;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/catalog")
public class CatalogController {

    private final CatalogService catalogService;

    public CatalogController(CatalogService catalogService) {
        this.catalogService = catalogService;
    }

    @GetMapping("/featured")
    public FeaturedCatalogResponse featured() {
        return catalogService.getFeatured();
    }

    @GetMapping("/search")
    public SearchResultsResponse search(
            @RequestParam("q") String query,
            @RequestParam(defaultValue = "20") int limit
    ) {
        return catalogService.search(query, limit);
    }
}
