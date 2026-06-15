package com.streamingethico.modules.auth.api;

import com.streamingethico.modules.auth.api.dto.AuthResponse;
import com.streamingethico.modules.auth.api.dto.LoginRequest;
import com.streamingethico.modules.auth.api.dto.RefreshRequest;
import com.streamingethico.modules.auth.api.dto.RegisterArtistRequest;
import com.streamingethico.modules.auth.api.dto.RegisterRequest;
import com.streamingethico.modules.auth.application.AuthService;
import com.streamingethico.shared.security.UserPrincipal;

import com.streamingethico.modules.artist.infrastructure.ArtistRepository;
import com.streamingethico.modules.auth.api.dto.*;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.registerUser(request);
    }

    @PostMapping("/register/artist")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse registerArtist(@Valid @RequestBody RegisterArtistRequest request) {
        AuthResponse response = authService.registerArtist(request);
        return response;
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/refresh")
    public AuthResponse refresh(@Valid @RequestBody RefreshRequest request) {
        return authService.refresh(request);
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody(required = false) RefreshRequest request
    ) {
        String refreshToken = request != null ? request.refreshToken() : null;
        authService.logout(principal.getId(), refreshToken);
    }
}
