package com.streamingethico;

import com.streamingethico.shared.domain.RoleName;
import com.streamingethico.modules.user.domain.Role;
import com.streamingethico.modules.user.infrastructure.RoleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public abstract class IntegrationTestBase {

    @Autowired
    protected MockMvc mockMvc;

    @Autowired
    private RoleRepository roleRepository;

    @BeforeEach
    void seedRoles() {
        if (roleRepository.count() == 0) {
            seedRole((short) 1, RoleName.USER);
            seedRole((short) 2, RoleName.ARTIST);
            seedRole((short) 3, RoleName.ADMIN);
        }
    }

    private void seedRole(short id, RoleName name) {
        Role role = new Role();
        role.setId(id);
        role.setNombre(name);
        roleRepository.save(role);
    }
}
