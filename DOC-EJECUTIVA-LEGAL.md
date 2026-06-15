# Resumen Ejecutivo del Proyecto: Plataforma de Streaming Musical Ética para Artistas Independientes

## 1. Visión General del Proyecto

Se pretende desarrollar una plataforma de streaming de música digital centrada exclusivamente en artistas independientes que conservan la totalidad de sus derechos de autor. El objetivo principal es corregir las distorsiones del mercado actual ofreciendo un modelo de monetización transparente, ético y justo, donde la prioridad es la remuneración directa al creador en lugar de maximizar los márgenes de intermediarios o inversores externos.

La plataforma se distingue por prohibir explícitamente contenido generado total o parcialmente por Inteligencia Artificial, garantizando que todo el catálogo sea de creación humana auténtica.

---

## 2. Modelo de Negocio y Estructura de Ingresos

La plataforma operará bajo un modelo freemium con dos niveles de servicio claramente diferenciados:

### Nivel Gratuito
- Acceso limitado a la biblioteca musical (calidad de audio reducida, posibles restricciones de uso).
- No paga suscripción.
- **Sí genera regalías para los artistas**, pero con un peso menor que las reproducciones premium (ver sección 3).
- Función principal: descubrimiento de nuevos artistas y conversión hacia el plan de pago.

### Nivel de Suscripción (Premium)
- Cuota mensual fija.
- De este ingreso bruto se descontarán primero los costos operativos directos (servidores, ancho de banda, transacciones bancarias, mantenimiento).
- El remanente neto constituye el **fondo mensual de regalías** distribuido entre artistas.
- Las reproducciones de usuarios premium tienen **mayor peso** en el cálculo de reparto, alineando quién financia la plataforma con quién influye en la distribución.

---

## 3. Mecánica de Distribución de Regalías (Modelo Pro-Rata Ponderado Ético)

### 3.1 Principio general

El fondo neto mensual se distribuye de forma proporcional según el **consumo ponderado** de cada artista. No todas las reproducciones valen lo mismo: las de usuarios premium pesan más porque son quienes financian el fondo.

### 3.2 Pesos de reproducción (valores iniciales)

| Plan del oyente | Peso en el cálculo | Equivalencia |
|-----------------|-------------------|--------------|
| Premium         | **1.0**           | Referencia base |
| Gratuito        | **0.25**          | 4 reproducciones gratis = 1 premium |

Estos pesos son configurables y deben comunicarse con transparencia en los Términos de Servicio y en el panel del artista.

### 3.3 Criterio de reproducción válida

Una reproducción solo cuenta si:
1. El oyente escuchó al menos 30 segundos o el 80% de la duración de la canción (lo que sea menor).
2. No es un evento duplicado fraudulento.
3. La canción y el artista estaban activos y verificados en el momento del play.

### 3.4 Algoritmo de reparto mensual

1. Calcular `fondo_neto` = ingresos brutos premium − costes operativos − comisiones de pago.
2. Sumar el **peso total** de todas las reproducciones válidas del periodo (`total_peso`).
3. Por cada artista, calcular su `peso_artista` (suma de pesos de sus reproducciones válidas).
4. Calcular `share_bruto = (peso_artista / total_peso) × fondo_neto`.
5. Aplicar **tope máximo del 20%** del fondo neto por artista: `share_final = min(share_bruto, fondo_neto × 0.20)`.
6. Si hay excedente por topes, redistribuirlo proporcionalmente entre artistas que no alcanzaron el tope.
7. Registrar desglose completo y auditable para cada artista.

**Ejemplo:** Si el artista X acumula un 30% del peso total del mes, su share bruto es el 30% del fondo. Si eso supera el 20%, se aplica el tope y el excedente se redistribuye al resto.

### 3.5 Tope del 20% por artista

Ningún artista puede recibir más del 20% del fondo neto mensual, independientemente de su volumen de reproducciones. Objetivo: evitar concentración extrema en pocos artistas virales y favorecer una comunidad de independientes más equilibrada.

El tope debe figurar explícitamente en el contrato de licencia con artistas.

### 3.6 Justificación ética del modelo ponderado

Este diseño equilibra los intereses de los tres actores:

**Para los artistas:**
- Las reproducciones gratuitas **sí cuentan** — un artista emergente no queda fuera del reparto por tener audiencia no pagante.
- Las reproducciones premium **valen más** — se premia a quien convierte oyentes en suscriptores o atrae público que paga.
- El tope del 20% protege a la comunidad frente a la concentración de ingresos en un solo nombre.

**Para los usuarios premium:**
- Su suscripción financia el fondo; es justo que su escucha tenga más influencia en a quién llega ese dinero.
- Refuerza el valor percibido de pagar: no solo mejor experiencia (calidad, sin límites), sino mayor impacto directo en los artistas que escuchan.

**Para los usuarios gratuitos:**
- Su escucha **sí contribuye** al artista (peso 0.25), no es irrelevante.
- Pueden descubrir música y apoyar artistas; si desean impactar más, pueden pasar a premium.
- El plan gratuito sigue siendo un funnel de descubrimiento, no una audiencia invisible.

**Conclusión ética:** El modelo ponderado es más justo que contar todas las reproducciones por igual, porque conecta la fuente del dinero (premium) con la influencia en el reparto, sin eliminar el valor del descubrimiento gratuito.

---

## 4. Transparencia y Derechos de los Artistas

Los artistas deben poder verificar en todo momento:

- Total de reproducciones del periodo (desglosadas: gratuitas vs premium).
- Peso acumulado y porcentaje de participación.
- Share bruto, tope aplicado (sí/no) y monto final.
- Estado del pago (`pendiente`, `pagado`, `fallido`).
- Fondo neto total del periodo y parámetros vigentes (pesos, tope).

Esta transparencia es un requisito contractual y de confianza, no solo técnico.

---

## 5. Requisitos Legales Críticos a Consultar

### A. Contratos de Licencia con Artistas
- Contrato tipo de adhesión donde el artista cede únicamente los derechos de comunicación pública y reproducción digital, manteniendo la propiedad intelectual total.
- Cláusulas que garanticen autoría humana al 100% (declaración jurada de no uso de IA generativa).
- Cláusula explícita del **tope del 20%** y de la **ponderación de reproducciones** (premium vs gratuito), con fórmula de cálculo reproducible.
- Mecanismos de auditoría para que el artista verifique el cálculo de sus regalías.
- Cláusulas de indemnización si el artista falsea autoría o titularidad de derechos.

### B. Gestión de Derechos de Autor y Sociedades de Gestión
- Determinar si la plataforma debe pagar canon a Sociedades de Gestión Colectiva locales o internacionales operando con direct licensing.
- Estrategia para operar legalmente en múltiples jurisdicciones sin doble imposición ni conflictos con entidades de gestión tradicionales.

### C. Propiedad Intelectual y Contenido Generado por IA
- Marco legal para el rechazo y eliminación de contenido sospechoso de ser generado por IA.
- Responsabilidad de la plataforma si un artista infringe la política de "solo humanos" o derechos de terceros.

### D. Términos de Servicio y Privacidad
- Diferenciación clara de derechos y obligaciones entre usuarios gratuitos y premium, incluyendo el peso distinto de sus reproducciones en el modelo de regalías.
- Comunicación transparente a usuarios premium de que su suscripción financia directamente a los artistas.
- Cumplimiento GDPR (Europa) y leyes locales de protección de datos (Latinoamérica) por el manejo de datos de consumo musical y pagos.

### E. Modelo de Reparto y Equidad Contractual
- Validar jurídicamente que el tope del 20% no vulnera libertad contractual ni expectativas razonables del artista.
- Validar que la ponderación premium/gratuito esté correctamente informada y aceptada en el contrato de adhesión.
- Definir tratamiento del excedente no redistribuido si todos los artistas alcanzan el tope.

---

## 6. Preguntas Específicas para el Abogado

1. ¿Es viable legalmente el modelo de reparto pro-rata ponderado (premium pesa más que gratuito) con direct licensing, sin interferencia de sociedades de gestión?
2. ¿Qué cláusulas de indemnización son necesarias si un artista miente sobre autoría humana o titularidad de derechos?
3. ¿Cómo estructurar la entidad legal para operar como intermediario de pagos transfronterizos sin licencia bancaria completa?
4. ¿Existe precedente legal sobre prohibición contractual de contenido generado por IA en plataformas de entretenimiento?
5. ¿Es exigible contractualmente el tope del 20% por artista y la redistribución del excedente? ¿Qué disclosure mínimo se requiere hacia el artista?
6. ¿Debe informarse explícitamente al usuario gratuito y premium el peso distinto de sus reproducciones, y en qué momento (registro, upgrade, Términos)?
7. ¿Cómo documentar el cálculo mensual para que sea auditable ante disputas de artistas sobre su liquidación?

---

## 7. Parámetros del Modelo (Resumen)

| Parámetro | Valor inicial | Configurable |
|-----------|---------------|--------------|
| Peso reproducción premium | 1.0 | Sí |
| Peso reproducción gratuita | 0.25 | Sí |
| Tope máximo por artista | 20% del fondo neto | Sí |
| Umbral reproducción válida | 30 s o 80% duración | Sí |
| Frecuencia de liquidación | Mensual (día 1) | — |

---

Este documento debe mantenerse alineado con `DOC-PLAN-DESARROLLO.md`, que contiene la implementación técnica de estas reglas.
