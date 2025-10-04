package com.ev.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ev.model.Role;
import com.ev.model.RoleType;

public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(RoleType name);
}