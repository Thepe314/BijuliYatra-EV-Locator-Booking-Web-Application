package com.ev.configuration;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
@Component
public class JwtRequestFilter extends OncePerRequestFilter {

    private final jwtUtil jwtUtil;

    public JwtRequestFilter(jwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        try {
            String method = request.getMethod();
            String path = request.getRequestURI();

            // Allow OPTIONS and public endpoints to pass through
            if ("OPTIONS".equalsIgnoreCase(method) ||
                path.startsWith("/auth/login") ||
                path.equals("/auth/login/verify-otp") ||
                path.startsWith("/auth/signup/ev-owner") ||
                path.startsWith("/auth/signup/operator") ||
                path.equals("/auth/forgot-password") ||
                path.equals("/auth/forgot-password/verify-otp") ||
                path.equals("/auth/reset-password")) {
                chain.doFilter(request, response);
                return;
            }

            final String header = request.getHeader("Authorization");

            if (header != null && header.startsWith("Bearer ")) {
                String token = header.substring(7);
                System.out.println("[JwtRequestFilter] Token found: " + token);

                if (jwtUtil.validateToken(token)) {
                    String username = jwtUtil.getEmailFromToken(token);
                    String rolesString = jwtUtil.getRolesFromToken(token);

                    if (username != null && rolesString != null &&
                        SecurityContextHolder.getContext().getAuthentication() == null) {

                        List<GrantedAuthority> authorities = new ArrayList<>();
                        for (String role : rolesString.split(",")) {
                            role = role.trim();
                            authorities.add(new SimpleGrantedAuthority(role));
                            if (!role.startsWith("ROLE_")) {
                                authorities.add(new SimpleGrantedAuthority("ROLE_" + role));
                            }
                        }

                        UsernamePasswordAuthenticationToken auth =
                                new UsernamePasswordAuthenticationToken(username, null, authorities);
                        SecurityContextHolder.getContext().setAuthentication(auth);

                        System.out.println("[JwtRequestFilter] Authenticated user: " + username);
                    }
                } else {
                    System.out.println("[JwtRequestFilter] Invalid JWT token");
                    invalidateSession(request);
                    response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "JWT token expired or invalid");
                    return;
                }

            } else {
                System.out.println("[JwtRequestFilter] No Bearer token found");
                invalidateSession(request);
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Missing JWT token");
                return;
            }

            chain.doFilter(request, response);

        } catch (Exception ex) {
            System.err.println("[JwtRequestFilter] Exception: " + ex.getMessage());
            ex.printStackTrace();
            invalidateSession(request);
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Error processing JWT filter");
        }
    }

    private void invalidateSession(HttpServletRequest request) {
        SecurityContextHolder.clearContext();
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
            System.out.println("[JwtRequestFilter] Session invalidated");
        }
    }
}