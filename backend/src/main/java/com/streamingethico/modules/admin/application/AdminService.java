package com.streamingethico.modules.admin.application;

import com.streamingethico.modules.artist.application.ArtistService;
import com.streamingethico.modules.artist.domain.Artist;
import com.streamingethico.modules.artist.infrastructure.ArtistDeclarationRepository;
import com.streamingethico.modules.artist.infrastructure.ArtistRepository;
import com.streamingethico.modules.catalog.application.CatalogMapper;
import com.streamingethico.modules.catalog.domain.Song;
import com.streamingethico.modules.catalog.infrastructure.SongRepository;
import com.streamingethico.modules.playback.infrastructure.PlaybackEventRepository;
import com.streamingethico.modules.user.infrastructure.UserRepository;
import com.streamingethico.shared.domain.ApiException;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final ArtistRepository artistRepository;
    private final ArtistDeclarationRepository declarationRepository;
    private final SongRepository songRepository;
    private final PlaybackEventRepository playbackEventRepository;
    private final ArtistService artistService;

    public AdminService(
            UserRepository userRepository,
            ArtistRepository artistRepository,
            ArtistDeclarationRepository declarationRepository,
            SongRepository songRepository,
            PlaybackEventRepository playbackEventRepository,
            ArtistService artistService
    ) {
        this.userRepository = userRepository;
        this.artistRepository = artistRepository;
        this.declarationRepository = declarationRepository;
        this.songRepository = songRepository;
        this.playbackEventRepository = playbackEventRepository;
        this.artistService = artistService;
    }

    @Transactional(readOnly = true)
    public AdminDashboardResponse getDashboard() {
        Instant from = LocalDate.now().withDayOfMonth(1).atStartOfDay().toInstant(ZoneOffset.UTC);
        Instant to = LocalDate.now().plusDays(1).atStartOfDay().toInstant(ZoneOffset.UTC);

        return new AdminDashboardResponse(
                userRepository.count(),
                artistRepository.countByVerificadoTrue(),
                artistRepository.countByVerificadoFalseAndActivoTrue(),
                playbackEventRepository.countValidPlaysBetween(from, to),
                0L
        );
    }

    @Transactional(readOnly = true)
    public List<CatalogMapper.ArtistProfileResponse> pendingArtists() {
        return artistService.pendingVerification();
    }

    @Transactional
    public CatalogMapper.ArtistProfileResponse verifyArtist(UUID artistId) {
        return artistService.verifyArtist(artistId);
    }

    @Transactional(readOnly = true)
    public List<CatalogMapper.ArtistProfileResponse> listArtists() {
        return artistRepository.findAllByOrderByStageNameAsc().stream()
                .map(this::toArtistProfile)
                .toList();
    }

    @Transactional
    public CatalogMapper.ArtistProfileResponse setArtistActive(UUID artistId, boolean active) {
        Artist artist = artistRepository.findById(artistId)
                .orElseThrow(() -> new ApiException("NOT_FOUND", "Artista no encontrado"));
        artist.setActivo(active);
        return toArtistProfile(artist);
    }

    @Transactional(readOnly = true)
    public List<AdminSongResponse> listSongs(int limit) {
        int pageSize = Math.min(Math.max(limit, 1), 100);
        return songRepository.findAllForAdmin(PageRequest.of(0, pageSize)).stream()
                .map(this::toAdminSong)
                .toList();
    }

    @Transactional
    public AdminSongResponse setSongActive(UUID songId, boolean active) {
        Song song = songRepository.findByIdWithRelations(songId)
                .orElseThrow(() -> new ApiException("NOT_FOUND", "Canción no encontrada"));
        song.setActivo(active);
        return toAdminSong(song);
    }

    private CatalogMapper.ArtistProfileResponse toArtistProfile(Artist artist) {
        boolean declarationSigned = declarationRepository.existsByArtistIdAndAceptadaTrue(artist.getId());
        return new CatalogMapper.ArtistProfileResponse(
                artist.getId(),
                artist.getStageName(),
                artist.getBiografia(),
                artist.getProfileImageUrl(),
                artist.isVerificado(),
                artist.isActivo(),
                declarationSigned
        );
    }

    private AdminSongResponse toAdminSong(Song song) {
        return new AdminSongResponse(
                song.getId(),
                song.getTitulo(),
                song.getAlbum().getArtist().getStageName(),
                song.getAlbum().getTitulo(),
                song.isActivo()
        );
    }

    public record AdminDashboardResponse(
            long registeredUsers,
            long verifiedArtists,
            long pendingArtists,
            long monthlyPlays,
            long pendingSettlements
    ) {}

    public record AdminSongResponse(
            UUID id,
            String title,
            String artistName,
            String albumTitle,
            boolean active
    ) {}

    public record SetActiveRequest(boolean active) {}
}
