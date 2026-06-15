package com.streamingethico.shared.security;

import com.streamingethico.shared.config.AppProperties;
import com.streamingethico.modules.user.domain.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class JwtService {

    private final AppProperties.Jwt jwtProperties;
    private final SecretKey secretKey;

    public JwtService(AppProperties appProperties) {
        this.jwtProperties = appProperties.jwt();
        this.secretKey = Keys.hmacShaKeyFor(jwtProperties.secret().getBytes(StandardCharsets.UTF_8));
    }

    public String generateAccessToken(User user) {
        Instant now = Instant.now();
        Instant expiry = now.plusSeconds(jwtProperties.accessExpirationMinutes() * 60L);
        List<String> roles = user.getRoles().stream()
                .map(role -> role.getNombre().name())
                .collect(Collectors.toList());

        return Jwts.builder()
                .subject(user.getId().toString())
                .claim("email", user.getEmail())
                .claim("roles", roles)
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiry))
                .signWith(secretKey)
                .compact();
    }

    public Claims parseToken(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public UUID extractUserId(String token) {
        return UUID.fromString(parseToken(token).getSubject());
    }

    public int getAccessExpirationSeconds() {
        return jwtProperties.accessExpirationMinutes() * 60;
    }
}
