// File responsibility: Generates, validates, and parses JWT access and refresh tokens.
package com.taskmanager.security;

import com.taskmanager.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class JwtTokenProvider {
    private final SecretKey key;
    private final long expirationMs;
    private final long refreshExpirationMs;

    /**
     * Creates the JWT provider from configuration: signing secret, access-token TTL, and refresh-token TTL.
     */
    public JwtTokenProvider(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiration}") long expirationMs,
            @Value("${jwt.refresh-expiration}") long refreshExpirationMs
    ) {
        byte[] secretBytes = secret.getBytes(StandardCharsets.UTF_8);
        if (secretBytes.length < 64) {
            throw new IllegalStateException("jwt.secret must be at least 64 bytes for HS512 signing");
        }

        this.key = Keys.hmacShaKeyFor(secretBytes);
        this.expirationMs = expirationMs;
        this.refreshExpirationMs = refreshExpirationMs;
    }

    /**
     * Generates a short-lived access token for {@code user}; token type is stored as the "access" claim.
     */
    public String generateAccessToken(User user) {
        return generateToken(user, expirationMs, "access");
    }

    /**
     * Generates a long-lived refresh token for {@code user}; token type is stored as the "refresh" claim.
     */
    public String generateRefreshToken(User user) {
        return generateToken(user, refreshExpirationMs, "refresh");
    }

    /**
     * Reads the token subject and converts it to the authenticated user's UUID.
     */
    public UUID getUserId(String token) {
        return UUID.fromString(parseClaims(token).getSubject());
    }

    /**
     * Returns the custom token type claim, expected to be either access or refresh.
     */
    public String getTokenType(String token) {
        return parseClaims(token).get("type", String.class);
    }

    /**
     * Checks whether the token can be parsed and verified with the configured signing key.
     */
    public boolean isValid(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException exception) {
            return false;
        }
    }

    /**
     * Returns the configured access-token lifetime in milliseconds for API responses.
     */
    public long getExpirationMs() {
        return expirationMs;
    }

    /**
     * Builds a signed JWT for {@code user}; {@code ttlMs} controls expiration and {@code type} distinguishes token usage.
     */
    private String generateToken(User user, long ttlMs, String type) {
        Instant now = Instant.now();
        Instant expiresAt = now.plusMillis(ttlMs);

        return Jwts.builder()
                .subject(user.getId().toString())
                .claim("email", user.getEmail())
                .claim("username", user.getUsername())
                .claim("role", user.getRole().name())
                .claim("type", type)
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiresAt))
                .signWith(key, Jwts.SIG.HS512)
                .compact();
    }

    /**
     * Parses and verifies the signed JWT, returning claims for downstream subject and custom-claim reads.
     */
    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
