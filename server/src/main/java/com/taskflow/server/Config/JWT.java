package com.taskflow.server.Config;

import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import javax.crypto.SecretKey;

import com.taskflow.server.Entities.User;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

@Component
public class JWT {
    private static final long EXPIRATION_TIME = 864000000; // 10 days
    private static final long RPT_EXPIRATION_TIME =  10 * 60 * 1000; // 10 minutes in milliseconds
    private static final long TFA_EXPIRATION_TIME = 10 * 60 * 1000 ;

    private static final String SECRET_KEY = "w6H8Jd9kL2pQm4XyTzV7aNcRgUfXsYbC0E3oPqW1MvK5BZa8D1F7G0H2J3K4L5M6N7P8Q9R0S1T2U3V4W5X6Y7Z8";


    private static  String hideEmail(String email , int length ){
        if(length == 0) return email;
        else if ( email.indexOf('@')-2 < length ) return hideEmail(email,  email.indexOf('@')-2);
        return hideEmail(   email.substring(0, length)+ "*" + email.substring(length+1)  , length-1);
    }

    // Improved key generation - using a consistent method
    private static SecretKey getKey() {
        byte[] keyBytes = SECRET_KEY.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }
    

    // Generate JWT Token
    public String generateToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("id", user.getId());
        claims.put("email", user.getEmail());
        claims.put("activation", user.getActivation());
        claims.put("roles", "USER,ADMIN");
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(user.getId())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(getKey(), SignatureAlgorithm.HS256)
                .compact();
    }
    
    // Generate JWT Token
    public String generateResetPasswordToken(User user) {
        Map<String, Object> claims = new HashMap<>();

        claims.put("id", user.getId());
        claims.put("resetpassword", true);

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(user.getId()) // Unique user identifier
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() +  RPT_EXPIRATION_TIME ))
                .signWith(getKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String generateTwoFactoAuthToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("id", user.getId());
        claims.put("email",  hideEmail(user.getEmail() , user.getEmail().length())) ;
        claims.put("twoFactorAuth", true);
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(user.getId()) // Unique user identifier
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() +  TFA_EXPIRATION_TIME ))
                .signWith(getKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // Extract Claims from Token
    public String extractClaim(String token, String key) {
        try {
            if (token.startsWith("Bearer ")) {
                token = token.substring(7);
            }
            token = token.trim();
            
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
            if (token.startsWith("Bearer ")) {
                token = token.substring(7);
            }
            token = token.trim();

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
            if (token.startsWith("Bearer ")) {
                token = token.substring(7);
            }
            token = token.trim();

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

    public boolean isTokenExpired(String token) {
        try {
            if (token.startsWith("Bearer ")) {
                token = token.substring(7);
            }
            token = token.trim();


            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(getKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
    
            Date expiration = claims.getExpiration();
            return expiration.before(new Date());
        } catch (ExpiredJwtException e) {
            // This is actually expired
            return true;
        } catch (JwtException e) {
            // This is invalid for other reasons (signature, malformed, etc.)
            System.err.println("Token validation error (not expiration): " + e.getMessage());
            throw new RuntimeException("Invalid token (not expired): " + e.getMessage());
        }
    }

}
