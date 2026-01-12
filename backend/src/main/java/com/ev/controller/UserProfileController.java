// com.ev.controller.UserProfileController
package com.ev.controller;

import com.ev.dto.UserProfileDTO;
import com.ev.model.Role;
import com.ev.model.User;
import com.ev.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
public class UserProfileController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/me")
    public UserProfileDTO getCurrentProfile(Authentication auth) {
        String email = (String) auth.getPrincipal(); // or auth.getName()
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Derive a single role string from roles collection
        String role = user.getRoles().stream()             // adjust if field name differs
                .findFirst()
                .map(r -> r.getName().name())              // e.g. RoleType enum name
                .orElse("ROLE_EV_OWNER");                  // sensible default

        UserProfileDTO dto = new UserProfileDTO();
        dto.setId(user.getUser_id());
        dto.setFullName(user.getFullname());
        dto.setEmail(user.getEmail());
        dto.setPhoneNumber(user.getPhoneNumber());
        dto.setAddress(user.getAddress());
        dto.setRole(role);

        return dto;
    }
}
