#!/usr/bin/env python3
"""Añade imports faltantes tras refactor modular."""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
JAVA_DIRS = [
    ROOT / "backend" / "src" / "main" / "java",
    ROOT / "backend" / "src" / "test" / "java",
]

TYPE_PACKAGES: dict[str, str] = {
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
    "RefreshToken": "com.streamingethico.modules.auth.domain",
    "RefreshTokenRepository": "com.streamingethico.modules.auth.infrastructure",
    "AuthService": "com.streamingethico.modules.auth.application",
    "AuthController": "com.streamingethico.modules.auth.api",
    "AuthResponse": "com.streamingethico.modules.auth.api.dto",
    "LoginRequest": "com.streamingethico.modules.auth.api.dto",
    "RefreshRequest": "com.streamingethico.modules.auth.api.dto",
    "RegisterRequest": "com.streamingethico.modules.auth.api.dto",
    "RegisterArtistRequest": "com.streamingethico.modules.auth.api.dto",
    "User": "com.streamingethico.modules.user.domain",
    "Role": "com.streamingethico.modules.user.domain",
    "Subscription": "com.streamingethico.modules.user.domain",
    "UserRepository": "com.streamingethico.modules.user.infrastructure",
    "RoleRepository": "com.streamingethico.modules.user.infrastructure",
    "SubscriptionRepository": "com.streamingethico.modules.user.infrastructure",
    "UserService": "com.streamingethico.modules.user.application",
    "UserController": "com.streamingethico.modules.user.api",
    "Artist": "com.streamingethico.modules.artist.domain",
    "ArtistDeclaration": "com.streamingethico.modules.artist.domain",
    "ArtistRepository": "com.streamingethico.modules.artist.infrastructure",
    "ArtistDeclarationRepository": "com.streamingethico.modules.artist.infrastructure",
    "ArtistService": "com.streamingethico.modules.artist.application",
    "ArtistController": "com.streamingethico.modules.artist.api",
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
    "PlaybackEvent": "com.streamingethico.modules.playback.domain",
    "PlaybackEventRepository": "com.streamingethico.modules.playback.infrastructure",
    "PlaybackService": "com.streamingethico.modules.playback.application",
    "PlaybackValidationService": "com.streamingethico.modules.playback.application",
    "PlaybackController": "com.streamingethico.modules.playback.api",
    "PlaybackEventRequest": "com.streamingethico.modules.playback.api",
    "PlaybackEventResponse": "com.streamingethico.modules.playback.api",
    "Favorite": "com.streamingethico.modules.library.domain",
    "Playlist": "com.streamingethico.modules.library.domain",
    "PlaylistSong": "com.streamingethico.modules.library.domain",
    "FavoriteRepository": "com.streamingethico.modules.library.infrastructure",
    "PlaylistRepository": "com.streamingethico.modules.library.infrastructure",
    "LibraryService": "com.streamingethico.modules.library.application",
    "LibraryController": "com.streamingethico.modules.library.api",
    "StorageService": "com.streamingethico.modules.storage.infrastructure",
    "AdminController": "com.streamingethico.modules.admin.api",
}

PACKAGE_RE = re.compile(r"^package\s+([\w.]+);", re.MULTILINE)
IMPORT_RE = re.compile(r"^import\s+([\w.]+);", re.MULTILINE)
WORD_RE_TEMPLATE = r"\b{}\b"


def add_missing_imports(path: Path) -> None:
    content = path.read_text(encoding="utf-8")
    package_match = PACKAGE_RE.search(content)
    if not package_match:
        return
    current_package = package_match.group(1)

    existing_imports = set(IMPORT_RE.findall(content))
    needed: list[str] = []

    for type_name, type_package in sorted(TYPE_PACKAGES.items(), key=lambda x: -len(x[0])):
        if type_package == current_package:
            continue
        full_name = f"{type_package}.{type_name}"
        if full_name in existing_imports:
            continue
        if not re.search(WORD_RE_TEMPLATE.format(re.escape(type_name)), content):
            continue
        # No importar si el archivo define la clase
        if re.search(rf"^(public\s+)?(class|interface|record|enum)\s+{re.escape(type_name)}\b", content, re.MULTILINE):
            continue
        needed.append(full_name)

    if not needed:
        return

    # Insertar después del package
    import_block = "\n".join(f"import {imp};" for imp in sorted(set(needed)))
    content = PACKAGE_RE.sub(lambda m: f"{m.group(0)}\n\n{import_block}", content, count=1)
    path.write_text(content, encoding="utf-8")


def main() -> None:
    for base in JAVA_DIRS:
        for file in sorted(base.rglob("*.java")):
            add_missing_imports(file)
    print("Imports faltantes añadidos.")


if __name__ == "__main__":
    main()
