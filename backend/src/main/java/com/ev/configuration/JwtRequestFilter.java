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
import java.util.Collections;
import java.util.List;

@Component
public class JwtRequestFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    public JwtRequestFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

    	
        try {
            if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
                // Skip authentication for preflight requests
                chain.doFilter(request, response);
                return;
            }
            
//            String path = request.getRequestURI();
//            if (path.startsWith("/auth/")) {
//                // 👈 Skip JWT filter for login, register, forgot-password etc.
//                chain.doFilter(request, response);
//                return;
//            }

            


            final String header = request.getHeader("Authorization");

            if (header != null && header.startsWith("Bearer ")) {
                String token = header.substring(7);
                System.out.println("[JwtRequestFilter] Token found: " + token);

                if (jwtUtil.validateToken(token)) {
                    String username = jwtUtil.getEmailFromToken(token);
                    String role = jwtUtil.getRoleFromToken(token);

                    System.out.println("[JwtRequestFilter] Username from token: " + username);
                    System.out.println("[JwtRequestFilter] Role from token: " + role);

                    if (username != null && role != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                        List<GrantedAuthority> authorities = List.of(
                            new SimpleGrantedAuthority(role.toLowerCase()),
                            new SimpleGrantedAuthority("ROLE_" + role.toUpperCase())
                        );

                        UsernamePasswordAuthenticationToken auth =
                                new UsernamePasswordAuthenticationToken(username, null, authorities);

                        SecurityContextHolder.getContext().setAuthentication(auth);

                        System.out.println("[JwtRequestFilter] Authentication set for user: " + username);
                    } else {
                        System.out.println("[JwtRequestFilter] Authentication not set: username or role null or authentication already exists");
                    }

                } else {
                    // 🔐 JWT token is invalid or expired → logout
                    System.out.println("[JwtRequestFilter] JWT token validation failed");

                    // Invalidate session
                    HttpSession session = request.getSession(false);
                    if (session != null) {
                        session.invalidate();
                        System.out.println("[JwtRequestFilter] Session invalidated");
                    }

                    // Clear authentication
                    SecurityContextHolder.clearContext();

                    // Respond with 401
                    response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "JWT token expired or invalid");
                    return;
                }

            } else {
                // 🔐 No JWT token present → logout
                System.out.println("[JwtRequestFilter] No Bearer token found in Authorization header");

                HttpSession session = request.getSession(false);
                if (session != null) {
                    session.invalidate();
                    System.out.println("[JwtRequestFilter] Session invalidated");
                }

                SecurityContextHolder.clearContext();
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Missing JWT token");
                return;
            }

            chain.doFilter(request, response);

        } catch (Exception ex) {
            System.err.println("[JwtRequestFilter] Exception in filter: " + ex.getMessage());

            // Fail-safe: clear context and send error if something unexpected goes wrong
            SecurityContextHolder.clearContext();
            HttpSession session = request.getSession(false);
            if (session != null) session.invalidate();

            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Error processing JWT filter");
        }
    }
}
