package com.taskflow.server.Config;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JWT jwt;

    public JwtAuthenticationFilter(JWT jwt) {
        this.jwt = jwt;
    }
    @Override
    protected void doFilterInternal(jakarta.servlet.http.HttpServletRequest request, jakarta.servlet.http.HttpServletResponse response, jakarta.servlet.FilterChain filterChain) throws jakarta.servlet.ServletException, IOException {
        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7); // Remove "Bearer " prefix

            if (jwt.validateToken(token)) {
                String userId = jwt.extractUserId(token);
                String roles = jwt.extractClaim(token, "roles"); // Extract roles
                System.out.println(roles);
                // Set authentication with roles
                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        userId, null, getAuthoritiesFromRoles(roles));

                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        }

        filterChain.doFilter(request, response);
    }
    private Collection<GrantedAuthority> getAuthoritiesFromRoles(String roles) {
        if (roles == null || roles.isEmpty()) {
            return List.of(); // Return empty list if no roles
        }

        return Arrays.stream(roles.split(","))
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role.trim().toUpperCase())) // Ensure correct format
                .collect(Collectors.toList());
    }


}
