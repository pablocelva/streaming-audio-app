## Probar plan premium (desarrollo)

Stripe llega en Fase 4. Para simular premium en local:

```sql
UPDATE suscripciones
SET plan = 'premium', estado = 'activa'
WHERE usuario_id = (SELECT id FROM usuarios WHERE email = 'tu-email@ejemplo.com');
```

Cierra sesión y vuelve a entrar en http://localhost:5174
