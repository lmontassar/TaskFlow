package com.taskflow.server.Config;

import java.util.Arrays;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;


@Configuration
@EnableWebSecurity
public class SecurityConfig {
    private final JWT jwt;

    @Value("${server.frontend_url}")
    private String frontend_url;

    public SecurityConfig(JWT jwt) {
        this.jwt = jwt;
    }
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf().disable()
                .cors().and()
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/user/login", "/user/register", "/user/avatar/**",
                                "/user/get", "/user/google", "/user/github",
                                "/user/resendcode", "/user/verifyEmail", "/user/sendcode",
                                "/user/resetpasswordtoken", "/user/resetpassword",
                                "/user/twofactoauth","/user/search","/ws/**", "/error"// Added /error
                        ).permitAll()
                        .anyRequest().authenticated()
                )
                .addFilterBefore(new JwtAuthenticationFilter(jwt), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        config.setAllowedOrigins(Arrays.asList(frontend_url)); // Allow requests from React app
        config.setAllowedHeaders(Arrays.asList("Authorization", "Cache-Control", "Content-Type"));
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }

}
