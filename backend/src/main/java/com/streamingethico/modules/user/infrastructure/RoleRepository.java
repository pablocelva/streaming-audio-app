package com.streamingethico.modules.user.infrastructure;

import com.streamingethico.modules.user.domain.Role;

import com.streamingethico.shared.domain.RoleName;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Short> {

    Optional<Role> findByNombre(RoleName nombre);
}
