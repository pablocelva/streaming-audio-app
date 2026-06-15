#!/usr/bin/env python3
"""Corrige imports tras refactor modular (añade capa domain/application/etc.)."""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
JAVA_DIRS = [
    ROOT / "backend" / "src" / "main" / "java",
    ROOT / "backend" / "src" / "test" / "java",
]

# Clase simple -> paquete completo (sin el nombre de clase)
TYPE_PACKAGES: dict[str, str] = {
    # shared
    "HashUtils": "com.streamingethico.shared.common",
    "ApiException": "com.streamingethico.shared.domain",
    "RoleName": "com.streamingethico.shared.domain",
    "SubscriptionPlan": "com.streamingethico.shared.domain",
    "SubscriptionStatus": "com.streamingethico.shared.domain",
    "PlaybackOrigin": "com.streamingethico.shared.domain",
    "GlobalExceptionHandler": "com.streamingethico.shared.web",
    "AppProperties": "com.streamingethico.shared.config",
    "AppConfig": "com.streamingethico.shared.config",
    "MinioConfig": "com.streamingethico.shared.config",
    "OpenApiConfig": "com.streamingethico.shared.config",
    "SecurityConfig": "com.streamingethico.shared.config",
    "JwtService": "com.streamingethico.shared.security",
    "JwtAuthenticationFilter": "com.streamingethico.shared.security",
    "UserPrincipal": "com.streamingethico.shared.security",
    "CustomUserDetailsService": "com.streamingethico.shared.security",
    # auth
    "RefreshToken": "com.streamingethico.modules.auth.domain",
    "RefreshTokenRepository": "com.streamingethico.modules.auth.infrastructure",
    "AuthService": "com.streamingethico.modules.auth.application",
    "AuthController": "com.streamingethico.modules.auth.api",
    "AuthResponse": "com.streamingethico.modules.auth.api.dto",
    "LoginRequest": "com.streamingethico.modules.auth.api.dto",
    "RefreshRequest": "com.streamingethico.modules.auth.api.dto",
    "RegisterRequest": "com.streamingethico.modules.auth.api.dto",
    "RegisterArtistRequest": "com.streamingethico.modules.auth.api.dto",
    # user
    "User": "com.streamingethico.modules.user.domain",
    "Role": "com.streamingethico.modules.user.domain",
    "Subscription": "com.streamingethico.modules.user.domain",
    "UserRepository": "com.streamingethico.modules.user.infrastructure",
    "RoleRepository": "com.streamingethico.modules.user.infrastructure",
    "SubscriptionRepository": "com.streamingethico.modules.user.infrastructure",
    "UserService": "com.streamingethico.modules.user.application",
    "UserController": "com.streamingethico.modules.user.api",
    # artist
    "Artist": "com.streamingethico.modules.artist.domain",
    "ArtistDeclaration": "com.streamingethico.modules.artist.domain",
    "ArtistRepository": "com.streamingethico.modules.artist.infrastructure",
    "ArtistDeclarationRepository": "com.streamingethico.modules.artist.infrastructure",
    "ArtistService": "com.streamingethico.modules.artist.application",
    "ArtistController": "com.streamingethico.modules.artist.api",
    # catalog
    "Album": "com.streamingethico.modules.catalog.domain",
    "Song": "com.streamingethico.modules.catalog.domain",
    "AlbumRepository": "com.streamingethico.modules.catalog.infrastructure",
    "SongRepository": "com.streamingethico.modules.catalog.infrastructure",
    "CatalogService": "com.streamingethico.modules.catalog.application",
    "CatalogMapper": "com.streamingethico.modules.catalog.application",
    "CatalogController": "com.streamingethico.modules.catalog.api",
    "AlbumController": "com.streamingethico.modules.catalog.api",
    "SongController": "com.streamingethico.modules.catalog.api",
    "CreateAlbumRequest": "com.streamingethico.modules.catalog.api",
    # playback
    "PlaybackEvent": "com.streamingethico.modules.playback.domain",
    "PlaybackEventRepository": "com.streamingethico.modules.playback.infrastructure",
    "PlaybackService": "com.streamingethico.modules.playback.application",
    "PlaybackValidationService": "com.streamingethico.modules.playback.application",
    "PlaybackController": "com.streamingethico.modules.playback.api",
    "PlaybackEventRequest": "com.streamingethico.modules.playback.api",
    "PlaybackEventResponse": "com.streamingethico.modules.playback.api",
    # library
    "Favorite": "com.streamingethico.modules.library.domain",
    "Playlist": "com.streamingethico.modules.library.domain",
    "PlaylistSong": "com.streamingethico.modules.library.domain",
    "FavoriteRepository": "com.streamingethico.modules.library.infrastructure",
    "PlaylistRepository": "com.streamingethico.modules.library.infrastructure",
    "LibraryService": "com.streamingethico.modules.library.application",
    "LibraryController": "com.streamingethico.modules.library.api",
    # storage / admin
    "StorageService": "com.streamingethico.modules.storage.infrastructure",
    "AdminController": "com.streamingethico.modules.admin.api",
}

# Paquetes cortos usados en imports incorrectos -> reemplazo por prefijo correcto en imports
BROKEN_PREFIX_FIXES: list[tuple[str, str]] = [
    ("import com.streamingethico.modules.auth.", "import com.streamingethico.modules.auth.application."),
    ("import com.streamingethico.modules.user.", "import com.streamingethico.modules.user.domain."),
    ("import com.streamingethico.modules.artist.", "import com.streamingethico.modules.artist.domain."),
    ("import com.streamingethico.modules.catalog.", "import com.streamingethico.modules.catalog.application."),
    ("import com.streamingethico.modules.playback.", "import com.streamingethico.modules.playback.application."),
    ("import com.streamingethico.modules.library.", "import com.streamingethico.modules.library.application."),
]

IMPORT_LINE = re.compile(r"^import\s+(?:static\s+)?([\w.]+);", re.MULTILINE)
SAME_MODULE_PREFIXES = [
    "com.streamingethico.modules.catalog.application.CatalogMapper",
    "com.streamingethico.modules.artist.application.ArtistService",
]


def fix_file(path: Path) -> None:
    content = path.read_text(encoding="utf-8")
    original = content

    # Corregir imports línea por línea
    def replace_import(match: re.Match[str]) -> str:
        full = match.group(1)
        simple = full.rsplit(".", 1)[-1]
        if simple in TYPE_PACKAGES:
            correct = f"{TYPE_PACKAGES[simple]}.{simple}"
            if full != correct:
                return match.group(0).replace(full, correct)
        return match.group(0)

    content = IMPORT_LINE.sub(replace_import, content)

    # Corregir referencias empaquetadas en código (CatalogMapper.X, ArtistService.X)
    for broken, fixed in [
        ("com.streamingethico.modules.catalog.CatalogMapper", "com.streamingethico.modules.catalog.application.CatalogMapper"),
        ("com.streamingethico.modules.artist.ArtistService", "com.streamingethico.modules.artist.application.ArtistService"),
        ("com.streamingethico.modules.catalog.CatalogService", "com.streamingethico.modules.catalog.application.CatalogService"),
        ("com.streamingethico.modules.library.LibraryService", "com.streamingethico.modules.library.application.LibraryService"),
        ("com.streamingethico.modules.playback.PlaybackService", "com.streamingethico.modules.playback.application.PlaybackService"),
        ("com.streamingethico.modules.user.UserService", "com.streamingethico.modules.user.application.UserService"),
    ]:
        content = content.replace(broken, fixed)

    if content != original:
        path.write_text(content, encoding="utf-8")


def main() -> None:
    for base in JAVA_DIRS:
        for file in base.rglob("*.java"):
            fix_file(file)
    print("Imports corregidos.")


if __name__ == "__main__":
    main()
