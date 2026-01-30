// com.ev.controller.UserProfileController
package com.ev.controller;

import com.ev.dto.UserProfileDTO;
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
        String email = auth.getName(); // username/email from SecurityContext
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String role = user.getRoles().stream()
                .findFirst()
                .map(r -> r.getName().name())  // e.g. ROLE_EV_OWNER
                .orElse("ROLE_EV_OWNER");

        UserProfileDTO dto = new UserProfileDTO();
        dto.setId(user.getUser_id());
        dto.setFullName(user.getFullname());
        dto.setEmail(user.getEmail());
        dto.setPhoneNumber(user.getPhoneNumber());
        dto.setAddress(user.getAddress());
        dto.setLatitude(user.getLatitude());
        dto.setLongitude(user.getLongitude());
        dto.setRegion(user.getRegion());
        dto.setCity(user.getCity());
        dto.setDistrict(user.getDistrict());
        dto.setRole(role);

        return dto;
    }

    @PutMapping("/me")
    public UserProfileDTO updateCurrentProfile(
            Authentication auth,
            @RequestBody UserProfileDTO updateRequest
    ) {
        String email = auth.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // basic info
        user.setFullname(updateRequest.getFullName());
        user.setEmail(updateRequest.getEmail());
        user.setPhoneNumber(updateRequest.getPhoneNumber());
        user.setAddress(updateRequest.getAddress());

        // location + structured address
        user.setLatitude(updateRequest.getLatitude());
        user.setLongitude(updateRequest.getLongitude());
        user.setRegion(updateRequest.getRegion());
        user.setCity(updateRequest.getCity());
        user.setDistrict(updateRequest.getDistrict());

        user = userRepository.save(user);

        String role = user.getRoles().stream()
                .findFirst()
                .map(r -> r.getName().name())
                .orElse("ROLE_EV_OWNER");

        UserProfileDTO dto = new UserProfileDTO();
        dto.setId(user.getUser_id());
        dto.setFullName(user.getFullname());
        dto.setEmail(user.getEmail());
        dto.setPhoneNumber(user.getPhoneNumber());
        dto.setAddress(user.getAddress());
        dto.setLatitude(user.getLatitude());
        dto.setLongitude(user.getLongitude());
        dto.setRegion(user.getRegion());
        dto.setCity(user.getCity());
        dto.setDistrict(user.getDistrict());
        dto.setRole(role);

        return dto;
    }
}
