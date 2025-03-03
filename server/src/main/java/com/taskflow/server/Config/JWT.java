package com.taskflow.server.Config;

import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import javax.crypto.SecretKey;

import com.taskflow.server.Entities.User;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

@Component
public class JWT {
    private static final long EXPIRATION_TIME = 864000000; // 10 days
    private static final String SECRET_KEY = "ifbzeibfeibzicbufbfiadaihazuehazpidpidsipqjcncdbvbdiuabih"; // Replace with at least 256-bit key

    // Get SecretKey from Base64 Encoded String
    private SecretKey getKey() {
        byte[] keyBytes = Decoders.BASE64.decode(SECRET_KEY);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    // Generate JWT Token
    public String generateToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("email", user.getEmail());

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(user.getId()) // Unique user identifier
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(getKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // Extract Claims from Token
    public String extractClaim(String token, String key) {
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(getKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
            return claims.get(key, String.class); // Extract specific claim value
        } catch (JwtException e) {
            throw new RuntimeException("Invalid or expired JWT token");
        }
    }

    // Validate JWT Token
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(getKey())
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (JwtException e) {
            return false;
        }
    }

    // Extract Subject (User ID) from Token
    public String extractUserId(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(getKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
            return claims.getSubject(); // Subject is the user ID
        } catch (JwtException e) {
            throw new RuntimeException("Invalid or expired JWT token");
        }
    }
}
