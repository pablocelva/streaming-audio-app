#!/usr/bin/env python3
"""Reorganiza el backend Java a arquitectura modular por dominio."""

from __future__ import annotations

import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
JAVA_ROOT = ROOT / "backend" / "src" / "main" / "java" / "com" / "streamingethico"
TEST_JAVA_ROOT = ROOT / "backend" / "src" / "test" / "java" / "com" / "streamingethico"

# origen relativo a JAVA_ROOT -> destino relativo a JAVA_ROOT
MOVES: dict[str, str] = {
    # shared
    "common/HashUtils.java": "shared/common/HashUtils.java",
    "common/RoleName.java": "shared/domain/RoleName.java",
    "common/SubscriptionPlan.java": "shared/domain/SubscriptionPlan.java",
    "common/SubscriptionStatus.java": "shared/domain/SubscriptionStatus.java",
    "common/PlaybackOrigin.java": "shared/domain/PlaybackOrigin.java",
    "common/ApiException.java": "shared/domain/ApiException.java",
    "common/GlobalExceptionHandler.java": "shared/web/GlobalExceptionHandler.java",
    "config/AppConfig.java": "shared/config/AppConfig.java",
    "config/AppProperties.java": "shared/config/AppProperties.java",
    "config/MinioConfig.java": "shared/config/MinioConfig.java",
    "config/OpenApiConfig.java": "shared/config/OpenApiConfig.java",
    "config/SecurityConfig.java": "shared/config/SecurityConfig.java",
    "auth/JwtAuthenticationFilter.java": "shared/security/JwtAuthenticationFilter.java",
    "auth/JwtService.java": "shared/security/JwtService.java",
    "auth/UserPrincipal.java": "shared/security/UserPrincipal.java",
    "auth/CustomUserDetailsService.java": "shared/security/CustomUserDetailsService.java",
    # auth module
    "auth/RefreshToken.java": "modules/auth/domain/RefreshToken.java",
    "auth/RefreshTokenRepository.java": "modules/auth/infrastructure/RefreshTokenRepository.java",
    "auth/AuthService.java": "modules/auth/application/AuthService.java",
    "auth/AuthController.java": "modules/auth/api/AuthController.java",
    "auth/dto/AuthResponse.java": "modules/auth/api/dto/AuthResponse.java",
    "auth/dto/LoginRequest.java": "modules/auth/api/dto/LoginRequest.java",
    "auth/dto/RefreshRequest.java": "modules/auth/api/dto/RefreshRequest.java",
    "auth/dto/RegisterArtistRequest.java": "modules/auth/api/dto/RegisterArtistRequest.java",
    "auth/dto/RegisterRequest.java": "modules/auth/api/dto/RegisterRequest.java",
    # user module
    "user/User.java": "modules/user/domain/User.java",
    "user/Role.java": "modules/user/domain/Role.java",
    "user/Subscription.java": "modules/user/domain/Subscription.java",
    "user/UserRepository.java": "modules/user/infrastructure/UserRepository.java",
    "user/RoleRepository.java": "modules/user/infrastructure/RoleRepository.java",
    "user/SubscriptionRepository.java": "modules/user/infrastructure/SubscriptionRepository.java",
    "user/UserService.java": "modules/user/application/UserService.java",
    "user/UserController.java": "modules/user/api/UserController.java",
    # artist module
    "artist/Artist.java": "modules/artist/domain/Artist.java",
    "artist/ArtistDeclaration.java": "modules/artist/domain/ArtistDeclaration.java",
    "artist/ArtistRepository.java": "modules/artist/infrastructure/ArtistRepository.java",
    "artist/ArtistDeclarationRepository.java": "modules/artist/infrastructure/ArtistDeclarationRepository.java",
    "artist/ArtistService.java": "modules/artist/application/ArtistService.java",
    "artist/ArtistController.java": "modules/artist/api/ArtistController.java",
    # catalog module
    "catalog/Album.java": "modules/catalog/domain/Album.java",
    "catalog/Song.java": "modules/catalog/domain/Song.java",
    "catalog/AlbumRepository.java": "modules/catalog/infrastructure/AlbumRepository.java",
    "catalog/SongRepository.java": "modules/catalog/infrastructure/SongRepository.java",
    "catalog/CatalogService.java": "modules/catalog/application/CatalogService.java",
    "catalog/CatalogMapper.java": "modules/catalog/application/CatalogMapper.java",
    "catalog/CatalogController.java": "modules/catalog/api/CatalogController.java",
    "catalog/AlbumController.java": "modules/catalog/api/AlbumController.java",
    "catalog/SongController.java": "modules/catalog/api/SongController.java",
    "catalog/CreateAlbumRequest.java": "modules/catalog/api/CreateAlbumRequest.java",
    # playback module
    "playback/PlaybackEvent.java": "modules/playback/domain/PlaybackEvent.java",
    "playback/PlaybackEventRepository.java": "modules/playback/infrastructure/PlaybackEventRepository.java",
    "playback/PlaybackService.java": "modules/playback/application/PlaybackService.java",
    "playback/PlaybackValidationService.java": "modules/playback/application/PlaybackValidationService.java",
    "playback/PlaybackController.java": "modules/playback/api/PlaybackController.java",
    "playback/PlaybackEventRequest.java": "modules/playback/api/PlaybackEventRequest.java",
    "playback/PlaybackEventResponse.java": "modules/playback/api/PlaybackEventResponse.java",
    # library module
    "library/Favorite.java": "modules/library/domain/Favorite.java",
    "library/Playlist.java": "modules/library/domain/Playlist.java",
    "library/PlaylistSong.java": "modules/library/domain/PlaylistSong.java",
    "library/FavoriteRepository.java": "modules/library/infrastructure/FavoriteRepository.java",
    "library/PlaylistRepository.java": "modules/library/infrastructure/PlaylistRepository.java",
    "library/LibraryService.java": "modules/library/application/LibraryService.java",
    "library/LibraryController.java": "modules/library/api/LibraryController.java",
    # storage module
    "storage/StorageService.java": "modules/storage/infrastructure/StorageService.java",
    # admin module
    "admin/AdminController.java": "modules/admin/api/AdminController.java",
}

IMPORT_REPLACEMENTS: list[tuple[str, str]] = [
    ("com.streamingethico.common.", "com.streamingethico.shared.domain."),
    ("com.streamingethico.common.HashUtils", "com.streamingethico.shared.common.HashUtils"),
    ("com.streamingethico.shared.domain.HashUtils", "com.streamingethico.shared.common.HashUtils"),
    ("com.streamingethico.shared.domain.GlobalExceptionHandler", "com.streamingethico.shared.web.GlobalExceptionHandler"),
    ("com.streamingethico.config.", "com.streamingethico.shared.config."),
    ("com.streamingethico.auth.dto.", "com.streamingethico.modules.auth.api.dto."),
    ("com.streamingethico.auth.JwtAuthenticationFilter", "com.streamingethico.shared.security.JwtAuthenticationFilter"),
    ("com.streamingethico.auth.JwtService", "com.streamingethico.shared.security.JwtService"),
    ("com.streamingethico.auth.UserPrincipal", "com.streamingethico.shared.security.UserPrincipal"),
    ("com.streamingethico.auth.CustomUserDetailsService", "com.streamingethico.shared.security.CustomUserDetailsService"),
    ("com.streamingethico.auth.RefreshTokenRepository", "com.streamingethico.modules.auth.infrastructure.RefreshTokenRepository"),
    ("com.streamingethico.auth.RefreshToken", "com.streamingethico.modules.auth.domain.RefreshToken"),
    ("com.streamingethico.auth.AuthService", "com.streamingethico.modules.auth.application.AuthService"),
    ("com.streamingethico.auth.AuthController", "com.streamingethico.modules.auth.api.AuthController"),
    ("com.streamingethico.user.", "com.streamingethico.modules.user."),
    ("com.streamingethico.artist.", "com.streamingethico.modules.artist."),
    ("com.streamingethico.catalog.", "com.streamingethico.modules.catalog."),
    ("com.streamingethico.playback.", "com.streamingethico.modules.playback."),
    ("com.streamingethico.library.", "com.streamingethico.modules.library."),
    ("com.streamingethico.storage.StorageService", "com.streamingethico.modules.storage.infrastructure.StorageService"),
    ("com.streamingethico.admin.AdminController", "com.streamingethico.modules.admin.api.AdminController"),
]

PACKAGE_OVERRIDES: dict[str, str] = {
    "shared/common/HashUtils.java": "com.streamingethico.shared.common",
    "shared/web/GlobalExceptionHandler.java": "com.streamingethico.shared.web",
    "shared/config/": "com.streamingethico.shared.config",
    "shared/security/": "com.streamingethico.shared.security",
    "shared/domain/": "com.streamingethico.shared.domain",
    "modules/auth/domain/": "com.streamingethico.modules.auth.domain",
    "modules/auth/infrastructure/": "com.streamingethico.modules.auth.infrastructure",
    "modules/auth/application/": "com.streamingethico.modules.auth.application",
    "modules/auth/api/dto/": "com.streamingethico.modules.auth.api.dto",
    "modules/auth/api/": "com.streamingethico.modules.auth.api",
    "modules/user/domain/": "com.streamingethico.modules.user.domain",
    "modules/user/infrastructure/": "com.streamingethico.modules.user.infrastructure",
    "modules/user/application/": "com.streamingethico.modules.user.application",
    "modules/user/api/": "com.streamingethico.modules.user.api",
    "modules/artist/domain/": "com.streamingethico.modules.artist.domain",
    "modules/artist/infrastructure/": "com.streamingethico.modules.artist.infrastructure",
    "modules/artist/application/": "com.streamingethico.modules.artist.application",
    "modules/artist/api/": "com.streamingethico.modules.artist.api",
    "modules/catalog/domain/": "com.streamingethico.modules.catalog.domain",
    "modules/catalog/infrastructure/": "com.streamingethico.modules.catalog.infrastructure",
    "modules/catalog/application/": "com.streamingethico.modules.catalog.application",
    "modules/catalog/api/": "com.streamingethico.modules.catalog.api",
    "modules/playback/domain/": "com.streamingethico.modules.playback.domain",
    "modules/playback/infrastructure/": "com.streamingethico.modules.playback.infrastructure",
    "modules/playback/application/": "com.streamingethico.modules.playback.application",
    "modules/playback/api/": "com.streamingethico.modules.playback.api",
    "modules/library/domain/": "com.streamingethico.modules.library.domain",
    "modules/library/infrastructure/": "com.streamingethico.modules.library.infrastructure",
    "modules/library/application/": "com.streamingethico.modules.library.application",
    "modules/library/api/": "com.streamingethico.modules.library.api",
    "modules/storage/infrastructure/": "com.streamingethico.modules.storage.infrastructure",
    "modules/admin/api/": "com.streamingethico.modules.admin.api",
}


def package_for(relative_dest: str) -> str:
    for prefix, package in sorted(PACKAGE_OVERRIDES.items(), key=lambda x: -len(x[0])):
        if relative_dest.startswith(prefix) or relative_dest == prefix.rstrip("/"):
            return package
    raise ValueError(f"No package mapping for {relative_dest}")


def move_files() -> None:
    for src_rel, dest_rel in MOVES.items():
        src = JAVA_ROOT / src_rel
        dest = JAVA_ROOT / dest_rel
        if not src.exists():
            raise FileNotFoundError(src)
        dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.move(str(src), str(dest))
        package = package_for(dest_rel)
        content = dest.read_text(encoding="utf-8")
        content = re.sub(r"^package\s+[\w.]+;", f"package {package};", content, count=1, flags=re.MULTILINE)
        dest.write_text(content, encoding="utf-8")

    for folder in ["common", "config", "auth", "user", "artist", "catalog", "playback", "library", "storage", "admin"]:
        path = JAVA_ROOT / folder
        if path.exists():
            shutil.rmtree(path)


def replace_imports(directory: Path) -> None:
    for file in directory.rglob("*.java"):
        content = file.read_text(encoding="utf-8")
        original = content
        for old, new in IMPORT_REPLACEMENTS:
            content = content.replace(old, new)
        if content != original:
            file.write_text(content, encoding="utf-8")


def main() -> None:
    move_files()
    replace_imports(JAVA_ROOT)
    replace_imports(TEST_JAVA_ROOT)
    print(f"Refactor completado: {len(MOVES)} archivos movidos.")


if __name__ == "__main__":
    main()
