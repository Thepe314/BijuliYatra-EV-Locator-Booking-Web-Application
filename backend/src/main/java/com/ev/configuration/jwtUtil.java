package com.ev.configuration;
import java.util.Date;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;
import java.security.Key;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import com.ev.model.RoleType;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
@Component
public class jwtUtil {

    @Value("${jwt.secret}")
    private String base64Key;

    private final long EXPIRATION_TIME = 1000 * 60 * 60 * 10; // 10 hours

    private Key getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(base64Key);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    // Generate token with comma-separated roles (accepts String now)
    public String generateToken(String email, String roleString, Long userId) {
        String jti = UUID.randomUUID().toString();

        return Jwts.builder()
            .setSubject(email)
            .claim("role", roleString)
            .claim("userId", userId)
            .setId(jti)
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
            .signWith(getSigningKey(), SignatureAlgorithm.HS256)
            .compact();
    }

    // Extract roles from token and return as comma-separated String
    public String getRolesFromToken(String token) {
        return Jwts.parser()
            .setSigningKey(getSigningKey())
            .build()
            .parseClaimsJws(token)
            .getBody()
            .get("role", String.class);
    }

    // Extract roles as Set<RoleType> if needed
    public Set<RoleType> getRolesAsSetFromToken(String token) {
        String rolesClaim = getRolesFromToken(token);
        Set<RoleType> roleTypes = new HashSet<>();

        if (rolesClaim != null && !rolesClaim.isEmpty()) {
            String[] roles = rolesClaim.split(",");
            for (String role : roles) {
                try {
                    roleTypes.add(RoleType.valueOf(role.trim()));
                } catch (IllegalArgumentException e) {
                    System.err.println("Unknown role: " + role);
                }
            }
        }
        return roleTypes;
    }

    public String getJti(String token) {
        return Jwts.parser()
            .setSigningKey(getSigningKey())
            .build()
            .parseClaimsJws(token)
            .getBody()
            .getId();
    }

    public Long getUserIdFromToken(String token) {
        return Jwts.parser()
            .setSigningKey(getSigningKey())
            .build()
            .parseClaimsJws(token)
            .getBody()
            .get("userId", Long.class);
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            System.err.println("JWT validation failed: " + e.getMessage());
            return false;
        }
    }

    public String getEmailFromToken(String token) {
        return Jwts.parser()
            .setSigningKey(getSigningKey())
            .build()
            .parseClaimsJws(token)
            .getBody()
            .getSubject();
    }
}