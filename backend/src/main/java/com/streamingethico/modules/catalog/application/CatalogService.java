package com.streamingethico.modules.catalog.application;

import com.streamingethico.modules.catalog.api.CreateAlbumRequest;
import com.streamingethico.modules.catalog.domain.Album;
import com.streamingethico.modules.catalog.domain.Song;
import com.streamingethico.modules.catalog.infrastructure.AlbumRepository;
import com.streamingethico.modules.catalog.infrastructure.SongRepository;

import com.streamingethico.modules.artist.domain.Artist;
import com.streamingethico.modules.artist.infrastructure.ArtistRepository;
import com.streamingethico.modules.catalog.application.CatalogMapper.AlbumResponse;
import com.streamingethico.modules.catalog.application.CatalogMapper.FeaturedCatalogResponse;
import com.streamingethico.modules.catalog.application.CatalogMapper.SearchResultsResponse;
import com.streamingethico.modules.catalog.application.CatalogMapper.SongResponse;
import com.streamingethico.modules.catalog.application.CatalogMapper.StreamUrlResponse;
import com.streamingethico.shared.domain.ApiException;
import com.streamingethico.shared.common.HashUtils;
import com.streamingethico.shared.domain.RoleName;
import com.streamingethico.modules.storage.infrastructure.StorageService;
import com.streamingethico.modules.user.infrastructure.UserRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Service
public class CatalogService {

    private final AlbumRepository albumRepository;
    private final SongRepository songRepository;
    private final ArtistRepository artistRepository;
    private final UserRepository userRepository;
    private final StorageService storageService;
    private final CatalogMapper catalogMapper;

    public CatalogService(
            AlbumRepository albumRepository,
            SongRepository songRepository,
            ArtistRepository artistRepository,
            UserRepository userRepository,
            StorageService storageService,
            CatalogMapper catalogMapper
    ) {
        this.albumRepository = albumRepository;
        this.songRepository = songRepository;
        this.artistRepository = artistRepository;
        this.userRepository = userRepository;
        this.storageService = storageService;
        this.catalogMapper = catalogMapper;
    }

    @Transactional
    public AlbumResponse createAlbum(UUID userId, CreateAlbumRequest request) {
        Artist artist = requireArtist(userId);

        Album album = new Album();
        album.setArtist(artist);
        album.setTitulo(request.title());
        album.setReleaseYear(request.releaseYear());
        album.setGenero(request.genre());
        album.setCoverImageUrl(request.coverImageUrl());
        albumRepository.save(album);

        return catalogMapper.toAlbumResponse(album);
    }

    @Transactional
    public SongResponse uploadSong(
            UUID userId,
            UUID albumId,
            String title,
            Integer durationSeconds,
            Integer orderInAlbum,
            Boolean isExplicit,
            MultipartFile file
    ) throws IOException {
        Artist artist = requireArtist(userId);
        Album album = albumRepository.findByIdAndArtistUserId(albumId, userId)
                .orElseThrow(() -> new ApiException("NOT_FOUND", "Álbum no encontrado"));

        if (durationSeconds == null || durationSeconds < 30) {
            throw new ApiException("VALIDATION_ERROR", "La duración mínima de la canción es 30 segundos");
        }

        byte[] bytes = file.getBytes();
        String fileHash = HashUtils.sha256(bytes);
        if (songRepository.findByFileHash(fileHash).isPresent()) {
            throw new ApiException("CONFLICT", "Este archivo ya fue subido");
        }

        StorageService.StoredObject stored = storageService.storeAudio(file, artist.getId());

        Song song = new Song();
        song.setAlbum(album);
        song.setTitulo(title);
        song.setDurationSeconds(durationSeconds);
        song.setStoragePath(stored.objectKey());
        song.setFileHash(fileHash);
        song.setOrderInAlbum(orderInAlbum != null ? orderInAlbum : 1);
        song.setExplicit(Boolean.TRUE.equals(isExplicit));
        songRepository.save(song);

        return catalogMapper.toSongResponse(song);
    }

    @Transactional(readOnly = true)
    public StreamUrlResponse getStreamUrl(UUID songId) {
        Song song = songRepository.findByIdWithRelations(songId)
                .orElseThrow(() -> new ApiException("NOT_FOUND", "Canción no encontrada"));

        if (!song.isActivo() || !song.getAlbum().isActivo()
                || !song.getAlbum().getArtist().isActivo()
                || !song.getAlbum().getArtist().isVerificado()) {
            throw new ApiException("NOT_FOUND", "Canción no disponible");
        }

        StorageService.PresignedUrl presigned = storageService.generatePresignedUrl(song.getStoragePath());
        return new StreamUrlResponse(presigned.url(), presigned.expiresAt());
    }

    @Transactional(readOnly = true)
    public FeaturedCatalogResponse getFeatured() {
        var page = PageRequest.of(0, 10);
        List<Album> albums = albumRepository.findFeatured(page);
        List<Song> songs = songRepository.findFeatured(page);
        return new FeaturedCatalogResponse(
                albums.stream().map(catalogMapper::toAlbumResponse).toList(),
                songs.stream().map(catalogMapper::toSongSummary).toList()
        );
    }

    @Transactional(readOnly = true)
    public SearchResultsResponse search(String query, int limit) {
        if (query == null || query.length() < 2) {
            throw new ApiException("VALIDATION_ERROR", "La búsqueda requiere al menos 2 caracteres");
        }
        var page = PageRequest.of(0, Math.min(limit, 50));
        List<Song> songs = songRepository.searchByTitle(query, page);
        List<Artist> artists = artistRepository.searchVerified(query);

        return new SearchResultsResponse(
                artists.stream().map(catalogMapper::toArtistProfile).toList(),
                songs.stream().map(catalogMapper::toSongSummary).toList()
        );
    }

    private Artist requireArtist(UUID userId) {
        if (!userRepository.hasRole(userId, RoleName.ARTIST)) {
            throw new ApiException("FORBIDDEN", "Se requiere rol de artista");
        }
        return artistRepository.findByUserId(userId)
                .orElseThrow(() -> new ApiException("NOT_FOUND", "Perfil de artista no encontrado"));
    }
}
