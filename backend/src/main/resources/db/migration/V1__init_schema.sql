CREATE TABLE usuarios (
    id              UUID PRIMARY KEY,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    nombre_completo VARCHAR(255),
    fecha_registro  TIMESTAMP NOT NULL DEFAULT NOW(),
    activo          BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE roles (
    id     SMALLINT PRIMARY KEY,
    nombre VARCHAR(20) NOT NULL UNIQUE
);

CREATE TABLE usuario_roles (
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    rol_id     SMALLINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (usuario_id, rol_id)
);

CREATE TABLE suscripciones (
    id                      UUID PRIMARY KEY,
    usuario_id              UUID NOT NULL UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
    plan                    VARCHAR(20) NOT NULL DEFAULT 'gratis',
    estado                  VARCHAR(20) NOT NULL DEFAULT 'activa',
    fecha_inicio            TIMESTAMP NOT NULL DEFAULT NOW(),
    fecha_vencimiento       TIMESTAMP,
    stripe_customer_id      VARCHAR(255),
    stripe_subscription_id  VARCHAR(255)
);

CREATE TABLE refresh_tokens (
    id          UUID PRIMARY KEY,
    usuario_id  UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    token_hash  VARCHAR(64) NOT NULL UNIQUE,
    expira_en   TIMESTAMP NOT NULL,
    revocado    BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_refresh_tokens_usuario ON refresh_tokens(usuario_id);

CREATE TABLE artistas (
    id                          UUID PRIMARY KEY,
    usuario_id                  UUID NOT NULL UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
    nombre_artistico            VARCHAR(255) NOT NULL,
    biografia                   TEXT,
    url_imagen_perfil           VARCHAR(512),
    verificado                  BOOLEAN NOT NULL DEFAULT FALSE,
    activo                      BOOLEAN NOT NULL DEFAULT TRUE,
    datos_bancarios_encriptados TEXT
);

CREATE TABLE declaraciones_artista (
    id                 UUID PRIMARY KEY,
    artista_id         UUID NOT NULL REFERENCES artistas(id) ON DELETE CASCADE,
    aceptada           BOOLEAN NOT NULL,
    fecha_firma        TIMESTAMP NOT NULL DEFAULT NOW(),
    ip_firma           VARCHAR(45),
    version_documento  VARCHAR(20) NOT NULL
);

CREATE TABLE albumes (
    id                UUID PRIMARY KEY,
    artista_id        UUID NOT NULL REFERENCES artistas(id) ON DELETE CASCADE,
    titulo            VARCHAR(255) NOT NULL,
    anio_lanzamiento  INTEGER,
    url_portada       VARCHAR(512),
    genero            VARCHAR(100),
    activo            BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_subida      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE canciones (
    id                  UUID PRIMARY KEY,
    album_id            UUID NOT NULL REFERENCES albumes(id) ON DELETE CASCADE,
    titulo              VARCHAR(255) NOT NULL,
    duracion_segundos   INTEGER NOT NULL,
    ruta_archivo_storage VARCHAR(512) NOT NULL,
    hash_archivo        VARCHAR(64) NOT NULL UNIQUE,
    orden_en_album      INTEGER NOT NULL DEFAULT 1,
    es_explicito        BOOLEAN NOT NULL DEFAULT FALSE,
    activo              BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_subida        TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE reproducciones (
    id                          BIGSERIAL PRIMARY KEY,
    cancion_id                  UUID NOT NULL REFERENCES canciones(id),
    usuario_id                  UUID NOT NULL REFERENCES usuarios(id),
    artista_id                  UUID NOT NULL REFERENCES artistas(id),
    fecha_reproduccion          TIMESTAMP NOT NULL DEFAULT NOW(),
    duracion_escuchada_segundos INTEGER NOT NULL,
    plan_usuario                VARCHAR(20) NOT NULL,
    peso_regalias               DECIMAL(5, 2) NOT NULL,
    origen                      VARCHAR(20) NOT NULL,
    es_valida_regalias          BOOLEAN NOT NULL,
    session_id                  VARCHAR(64) NOT NULL
);

CREATE INDEX idx_reproducciones_fecha ON reproducciones(fecha_reproduccion);
CREATE INDEX idx_reproducciones_artista_fecha ON reproducciones(artista_id, fecha_reproduccion);
CREATE INDEX idx_reproducciones_cancion ON reproducciones(cancion_id);
CREATE INDEX idx_reproducciones_usuario_cancion_fecha ON reproducciones(usuario_id, cancion_id, fecha_reproduccion);

CREATE TABLE favoritos (
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    cancion_id UUID NOT NULL REFERENCES canciones(id) ON DELETE CASCADE,
    PRIMARY KEY (usuario_id, cancion_id)
);

CREATE TABLE playlists (
    id             UUID PRIMARY KEY,
    usuario_id     UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    nombre         VARCHAR(255) NOT NULL,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE playlist_canciones (
    playlist_id UUID NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
    cancion_id  UUID NOT NULL REFERENCES canciones(id) ON DELETE CASCADE,
    orden       INTEGER NOT NULL DEFAULT 1,
    PRIMARY KEY (playlist_id, cancion_id)
);

CREATE TABLE pagos_suscripcion (
    id                   UUID PRIMARY KEY,
    usuario_id           UUID NOT NULL REFERENCES usuarios(id),
    monto                DECIMAL(12, 2) NOT NULL,
    moneda               VARCHAR(3) NOT NULL DEFAULT 'USD',
    fecha_pago           TIMESTAMP NOT NULL DEFAULT NOW(),
    stripe_payment_id    VARCHAR(255),
    estado               VARCHAR(20) NOT NULL
);

CREATE TABLE periodos_regalias (
    id                          UUID PRIMARY KEY,
    periodo_mes                 INTEGER NOT NULL,
    periodo_anio                INTEGER NOT NULL,
    ingresos_brutos             DECIMAL(14, 2) NOT NULL DEFAULT 0,
    costes_operativos           DECIMAL(14, 2) NOT NULL DEFAULT 0,
    comisiones_pago             DECIMAL(14, 2) NOT NULL DEFAULT 0,
    fondo_neto                  DECIMAL(14, 2) NOT NULL DEFAULT 0,
    total_reproducciones_validas BIGINT NOT NULL DEFAULT 0,
    total_peso_regalias         DECIMAL(16, 4) NOT NULL DEFAULT 0,
    peso_premium                DECIMAL(5, 2) NOT NULL DEFAULT 1.0,
    peso_gratis                 DECIMAL(5, 2) NOT NULL DEFAULT 0.25,
    tope_artista_porcentaje     DECIMAL(5, 2) NOT NULL DEFAULT 0.20,
    excedente_redistribuido     DECIMAL(14, 2) NOT NULL DEFAULT 0,
    fecha_calculo               TIMESTAMP NOT NULL DEFAULT NOW(),
    estado                      VARCHAR(20) NOT NULL DEFAULT 'calculado',
    UNIQUE (periodo_mes, periodo_anio)
);

CREATE TABLE transacciones_mensuales (
    id                       UUID PRIMARY KEY,
    periodo_id               UUID NOT NULL REFERENCES periodos_regalias(id),
    artista_id               UUID NOT NULL REFERENCES artistas(id),
    total_reproducciones     BIGINT NOT NULL DEFAULT 0,
    reproducciones_premium   BIGINT NOT NULL DEFAULT 0,
    reproducciones_gratis    BIGINT NOT NULL DEFAULT 0,
    peso_total               DECIMAL(16, 4) NOT NULL DEFAULT 0,
    porcentaje_participacion DECIMAL(8, 6) NOT NULL DEFAULT 0,
    monto_bruto              DECIMAL(14, 2) NOT NULL DEFAULT 0,
    tope_aplicado            BOOLEAN NOT NULL DEFAULT FALSE,
    monto_final              DECIMAL(14, 2) NOT NULL DEFAULT 0,
    estado_pago              VARCHAR(20) NOT NULL DEFAULT 'pendiente',
    fecha_pago               TIMESTAMP,
    UNIQUE (periodo_id, artista_id)
);

CREATE TABLE configuracion_sistema (
    clave        VARCHAR(64) PRIMARY KEY,
    valor        VARCHAR(255) NOT NULL,
    descripcion  TEXT
);

INSERT INTO roles (id, nombre) VALUES (1, 'USER'), (2, 'ARTIST'), (3, 'ADMIN');

INSERT INTO configuracion_sistema (clave, valor, descripcion) VALUES
    ('PESO_REGALIAS_PREMIUM', '1.0', 'Peso de reproducciones premium en cálculo de regalías'),
    ('PESO_REGALIAS_GRATIS', '0.25', 'Peso de reproducciones gratuitas en cálculo de regalías'),
    ('TOPE_ARTISTA_PORCENTAJE', '0.20', 'Tope máximo de participación por artista en el fondo neto');
