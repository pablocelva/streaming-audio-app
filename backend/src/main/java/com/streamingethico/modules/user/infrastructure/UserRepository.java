package com.streamingethico.modules.user.infrastructure;

import com.streamingethico.modules.user.domain.User;

import com.streamingethico.shared.domain.RoleName;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    @Query("SELECT u FROM User u LEFT JOIN FETCH u.roles WHERE u.email = :email")
    Optional<User> findByEmailWithRoles(@Param("email") String email);

    @Query("SELECT u FROM User u LEFT JOIN FETCH u.roles WHERE u.id = :id")
    Optional<User> findByIdWithRoles(@Param("id") UUID id);

    @Query("SELECT CASE WHEN COUNT(u) > 0 THEN true ELSE false END FROM User u JOIN u.roles r WHERE u.id = :userId AND r.nombre = :role")
    boolean hasRole(@Param("userId") UUID userId, @Param("role") RoleName role);
}
