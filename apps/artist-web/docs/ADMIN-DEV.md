## Crear usuario admin (desarrollo local)

No hay registro público de admin. En pgAdmin o `psql`, tras tener un usuario normal:

```sql
-- Sustituye el email por el de tu usuario
INSERT INTO usuario_roles (usuario_id, rol_id)
SELECT u.id, 3
FROM usuarios u
WHERE u.email = 'tu-email@ejemplo.com'
ON CONFLICT DO NOTHING;
```

Reinicia sesión en el portal para ver el menú **Administración** (`/admin`).
