package com.ev.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.ev.model.RoleType;
import com.ev.model.User;


@Repository
public interface UserRepository extends JpaRepository<User, Long> {

	Optional<User> findByEmail(String email);
	
	Optional<User> findById(Long id);
	  
	    // Find users by roles (ManyToMany)
	    @Query("SELECT u FROM User u JOIN u.roles r WHERE r.name IN :roles")
	    List<User> findByRoles(@Param("roles") List<RoleType> roles);

	    // Count users by roles
	    @Query("SELECT COUNT(u) FROM User u JOIN u.roles r WHERE r.name IN :roles")
	    long countByRoles(@Param("roles") List<RoleType> roles);

	    @Query("SELECT u.email FROM User u WHERE u.user_id = :id")
	    String findEmailById(@Param("id") Long id);

}

