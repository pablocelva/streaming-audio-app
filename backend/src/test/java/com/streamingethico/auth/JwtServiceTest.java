package com.streamingethico.auth;

import com.streamingethico.shared.domain.RoleName;
import com.streamingethico.shared.config.AppProperties;
import com.streamingethico.shared.security.JwtService;
import com.streamingethico.modules.user.domain.Role;
import com.streamingethico.modules.user.domain.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class JwtServiceTest {

    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        AppProperties properties = new AppProperties(
                new AppProperties.Jwt("test-secret-key-for-jwt-signing-min-32-chars", 15, 7),
                new AppProperties.Storage("http://localhost:9000", "k", "s", "audio", "us-east-1", 60),
                new AppProperties.Royalties(1.0, 0.25, 0.20),
                new AppProperties.Upload(52_428_800L)
        );
        jwtService = new JwtService(properties);
    }

    @Test
    void generatesAndParsesAccessTokenWithRoles() {
        User user = new User();
        user.setId(UUID.randomUUID());
        user.setEmail("artist@example.com");

        Role userRole = new Role();
        userRole.setNombre(RoleName.USER);
        Role artistRole = new Role();
        artistRole.setNombre(RoleName.ARTIST);
        user.setRoles(Set.of(userRole, artistRole));

        String token = jwtService.generateAccessToken(user);
        UUID parsedId = jwtService.extractUserId(token);

        assertThat(parsedId).isEqualTo(user.getId());
        assertThat(jwtService.parseToken(token).get("email", String.class)).isEqualTo("artist@example.com");
        assertThat(jwtService.parseToken(token).get("roles", java.util.List.class))
                .containsExactlyInAnyOrder("USER", "ARTIST");
    }
}
