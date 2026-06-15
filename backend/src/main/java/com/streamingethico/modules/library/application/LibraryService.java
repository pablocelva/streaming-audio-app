package com.streamingethico.modules.library.application;

import com.streamingethico.modules.library.domain.Favorite;
import com.streamingethico.modules.library.domain.Playlist;
import com.streamingethico.modules.library.infrastructure.FavoriteRepository;
import com.streamingethico.modules.library.infrastructure.PlaylistRepository;

import com.streamingethico.modules.catalog.application.CatalogMapper;
import com.streamingethico.modules.catalog.domain.Song;
import com.streamingethico.modules.catalog.infrastructure.SongRepository;
import com.streamingethico.shared.domain.ApiException;
import com.streamingethico.modules.user.domain.User;
import com.streamingethico.modules.user.infrastructure.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class LibraryService {

    private final FavoriteRepository favoriteRepository;
    private final PlaylistRepository playlistRepository;
    private final SongRepository songRepository;
    private final UserRepository userRepository;
    private final CatalogMapper catalogMapper;

    public LibraryService(
            FavoriteRepository favoriteRepository,
            PlaylistRepository playlistRepository,
            SongRepository songRepository,
            UserRepository userRepository,
            CatalogMapper catalogMapper
    ) {
        this.favoriteRepository = favoriteRepository;
        this.playlistRepository = playlistRepository;
        this.songRepository = songRepository;
        this.userRepository = userRepository;
        this.catalogMapper = catalogMapper;
    }

    @Transactional(readOnly = true)
    public List<CatalogMapper.SongSummaryResponse> listFavorites(UUID userId) {
        return favoriteRepository.findByUserIdWithSongs(userId).stream()
                .map(Favorite::getSong)
                .map(catalogMapper::toSongSummary)
                .toList();
    }

    @Transactional
    public void addFavorite(UUID userId, UUID songId) {
        Song song = songRepository.findByIdWithRelations(songId)
                .orElseThrow(() -> new ApiException("NOT_FOUND", "Canción no encontrada"));

        if (favoriteRepository.existsByUserIdAndSongId(userId, songId)) {
            return;
        }

        Favorite favorite = new Favorite();
        favorite.setUserId(userId);
        favorite.setSongId(song.getId());
        favoriteRepository.save(favorite);
    }

    @Transactional
    public void removeFavorite(UUID userId, UUID songId) {
        favoriteRepository.deleteByUserIdAndSongId(userId, songId);
    }

    @Transactional(readOnly = true)
    public List<PlaylistResponse> listPlaylists(UUID userId) {
        return playlistRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(playlist -> new PlaylistResponse(
                        playlist.getId(),
                        playlist.getNombre(),
                        playlist.getSongs().size(),
                        List.of()
                ))
                .toList();
    }

    @Transactional
    public PlaylistResponse createPlaylist(UUID userId, String name) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException("NOT_FOUND", "Usuario no encontrado"));
        Playlist playlist = new Playlist();
        playlist.setUser(user);
        playlist.setNombre(name);
        playlistRepository.save(playlist);
        return new PlaylistResponse(playlist.getId(), playlist.getNombre(), 0, List.of());
    }

    public record PlaylistResponse(
            UUID id,
            String name,
            int songCount,
            List<CatalogMapper.SongSummaryResponse> songs
    ) {}
}
