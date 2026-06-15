package com.streamingethico.modules.auth.application;

import com.streamingethico.modules.auth.api.dto.AuthResponse;
import com.streamingethico.modules.auth.api.dto.LoginRequest;
import com.streamingethico.modules.auth.api.dto.RefreshRequest;
import com.streamingethico.modules.auth.api.dto.RegisterArtistRequest;
import com.streamingethico.modules.auth.api.dto.RegisterRequest;
import com.streamingethico.modules.auth.domain.RefreshToken;
import com.streamingethico.modules.auth.infrastructure.RefreshTokenRepository;
import com.streamingethico.modules.user.domain.Role;
import com.streamingethico.modules.user.domain.Subscription;
import com.streamingethico.modules.user.domain.User;
import com.streamingethico.modules.user.infrastructure.RoleRepository;
import com.streamingethico.modules.user.infrastructure.SubscriptionRepository;
import com.streamingethico.modules.user.infrastructure.UserRepository;
import com.streamingethico.shared.domain.ApiException;
import com.streamingethico.shared.common.HashUtils;
import com.streamingethico.shared.domain.RoleName;
import com.streamingethico.shared.security.JwtService;

import com.streamingethico.modules.artist.domain.Artist;
import com.streamingethico.modules.artist.infrastructure.ArtistRepository;
import com.streamingethico.shared.config.AppProperties;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Set;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final ArtistRepository artistRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final AppProperties.Jwt jwtProperties;

    public AuthService(
            UserRepository userRepository,
            RoleRepository roleRepository,
            SubscriptionRepository subscriptionRepository,
            RefreshTokenRepository refreshTokenRepository,
            ArtistRepository artistRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            AuthenticationManager authenticationManager,
            AppProperties appProperties
    ) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.artistRepository = artistRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.jwtProperties = appProperties.jwt();
    }

    @Transactional
    public AuthResponse registerUser(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new ApiException("CONFLICT", "Email ya registrado");
        }

        User user = new User();
        user.setEmail(request.email().toLowerCase());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setFullName(request.fullName());
        user.setRoles(Set.of(requireRole(RoleName.USER)));
        userRepository.save(user);

        createFreeSubscription(user);
        return issueTokens(user);
    }

    @Transactional
    public AuthResponse registerArtist(RegisterArtistRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new ApiException("CONFLICT", "Email ya registrado");
        }

        User user = new User();
        user.setEmail(request.email().toLowerCase());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setFullName(request.fullName());
        user.setRoles(Set.of(requireRole(RoleName.USER), requireRole(RoleName.ARTIST)));
        userRepository.save(user);

        createFreeSubscription(user);

        Artist artist = new Artist();
        artist.setUser(user);
        artist.setStageName(request.stageName());
        artist.setBiografia(request.biography());
        artistRepository.save(artist);

        return issueTokens(userRepository.findByIdWithRoles(user.getId()).orElse(user));
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email().toLowerCase(), request.password())
        );
        User user = userRepository.findByEmailWithRoles(request.email().toLowerCase())
                .orElseThrow(() -> new ApiException("UNAUTHORIZED", "Credenciales inválidas"));
        return issueTokens(user);
    }

    @Transactional
    public AuthResponse refresh(RefreshRequest request) {
        String tokenHash = HashUtils.sha256(request.refreshToken());
        RefreshToken stored = refreshTokenRepository.findByTokenHashAndRevocadoFalse(tokenHash)
                .orElseThrow(() -> new ApiException("UNAUTHORIZED", "Refresh token inválido"));

        if (stored.getExpiresAt().isBefore(Instant.now())) {
            stored.setRevocado(true);
            throw new ApiException("UNAUTHORIZED", "Refresh token expirado");
        }

        User user = userRepository.findByIdWithRoles(stored.getUser().getId())
                .orElseThrow(() -> new ApiException("UNAUTHORIZED", "Usuario no encontrado"));

        stored.setRevocado(true);
        return issueTokens(user);
    }

    @Transactional
    public void logout(UUID userId, String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            return;
        }
        String tokenHash = HashUtils.sha256(refreshToken);
        refreshTokenRepository.findByTokenHashAndRevocadoFalse(tokenHash)
                .filter(token -> token.getUser().getId().equals(userId))
                .ifPresent(token -> token.setRevocado(true));
    }

    private AuthResponse issueTokens(User user) {
        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = UUID.randomUUID().toString();

        RefreshToken entity = new RefreshToken();
        entity.setUser(user);
        entity.setTokenHash(HashUtils.sha256(refreshToken));
        entity.setExpiresAt(Instant.now().plus(jwtProperties.refreshExpirationDays(), ChronoUnit.DAYS));
        refreshTokenRepository.save(entity);

        return new AuthResponse(accessToken, refreshToken, jwtService.getAccessExpirationSeconds());
    }

    private void createFreeSubscription(User user) {
        Subscription subscription = new Subscription();
        subscription.setUser(user);
        subscriptionRepository.save(subscription);
    }

    private Role requireRole(RoleName roleName) {
        return roleRepository.findByNombre(roleName)
                .orElseThrow(() -> new ApiException("INTERNAL", "Rol no configurado: " + roleName));
    }
}
