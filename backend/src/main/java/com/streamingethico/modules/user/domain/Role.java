package com.streamingethico.modules.user.domain;

import com.streamingethico.shared.domain.RoleName;
import jakarta.persistence.*;

@Entity
@Table(name = "roles")
public class Role {

    @Id
    private Short id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, unique = true)
    private RoleName nombre;

    public Short getId() {
        return id;
    }

    public void setId(Short id) {
        this.id = id;
    }

    public RoleName getNombre() {
        return nombre;
    }

    public void setNombre(RoleName nombre) {
        this.nombre = nombre;
    }
}
