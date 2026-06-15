package com.streamingethico.modules.artist.application;

import com.streamingethico.modules.artist.domain.Artist;
import com.streamingethico.modules.artist.domain.ArtistDeclaration;
import com.streamingethico.modules.artist.infrastructure.ArtistDeclarationRepository;
import com.streamingethico.modules.artist.infrastructure.ArtistRepository;

import com.streamingethico.modules.catalog.application.CatalogMapper;
import com.streamingethico.shared.domain.ApiException;
import com.streamingethico.modules.playback.infrastructure.PlaybackEventRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;

@Service
public class ArtistService {

    private final ArtistRepository artistRepository;
    private final ArtistDeclarationRepository declarationRepository;
    private final PlaybackEventRepository playbackEventRepository;

    public ArtistService(
            ArtistRepository artistRepository,
            ArtistDeclarationRepository declarationRepository,
            PlaybackEventRepository playbackEventRepository
    ) {
        this.artistRepository = artistRepository;
        this.declarationRepository = declarationRepository;
        this.playbackEventRepository = playbackEventRepository;
    }

    @Transactional(readOnly = true)
    public CatalogMapper.ArtistProfileResponse getMyProfile(UUID userId) {
        Artist artist = artistRepository.findByUserId(userId)
                .orElseThrow(() -> new ApiException("NOT_FOUND", "El usuario no es artista"));
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

    @Transactional
    public CatalogMapper.ArtistProfileResponse updateProfile(UUID userId, UpdateArtistRequest request) {
        Artist artist = artistRepository.findByUserId(userId)
                .orElseThrow(() -> new ApiException("NOT_FOUND", "El usuario no es artista"));

        if (request.stageName() != null) {
            artist.setStageName(request.stageName());
        }
        if (request.biography() != null) {
            artist.setBiografia(request.biography());
        }

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

    @Transactional
    public void signDeclaration(UUID userId, SignDeclarationRequest request, HttpServletRequest httpRequest) {
        Artist artist = artistRepository.findByUserId(userId)
                .orElseThrow(() -> new ApiException("NOT_FOUND", "El usuario no es artista"));

        if (!request.accepted()) {
            throw new ApiException("VALIDATION_ERROR", "Debe aceptar la declaración");
        }

        ArtistDeclaration declaration = new ArtistDeclaration();
        declaration.setArtist(artist);
        declaration.setAceptada(true);
        declaration.setDocumentVersion(request.documentVersion());
        declaration.setIpAddress(httpRequest.getRemoteAddr());
        declarationRepository.save(declaration);
    }

    @Transactional(readOnly = true)
    public ArtistStatsResponse getStats(UUID userId, LocalDate from, LocalDate to) {
        Artist artist = artistRepository.findByUserId(userId)
                .orElseThrow(() -> new ApiException("NOT_FOUND", "El usuario no es artista"));

        Instant fromInstant = (from != null ? from : LocalDate.now().withDayOfMonth(1))
                .atStartOfDay().toInstant(ZoneOffset.UTC);
        Instant toInstant = (to != null ? to.plusDays(1) : LocalDate.now().plusDays(1))
                .atStartOfDay().toInstant(ZoneOffset.UTC);

        long total = playbackEventRepository.countValidPlaysByArtist(artist.getId(), fromInstant, toInstant);
        long premium = playbackEventRepository.countValidPremiumPlaysByArtist(artist.getId(), fromInstant, toInstant);
        long free = total - premium;

        List<ArtistStatsResponse.TopSong> topSongs = playbackEventRepository
                .topSongsByArtist(artist.getId(), fromInstant, toInstant, PageRequest.of(0, 5))
                .stream()
                .map(row -> new ArtistStatsResponse.TopSong(
                        (UUID) row[0],
                        (String) row[1],
                        ((Number) row[2]).longValue(),
                        0.0
                ))
                .toList();

        return new ArtistStatsResponse(total, premium, free, premium * 1.0 + free * 0.25, topSongs);
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('ADMIN')")
    public List<CatalogMapper.ArtistProfileResponse> pendingVerification() {
        return artistRepository.findByVerificadoFalseAndActivoTrue().stream()
                .map(artist -> new CatalogMapper.ArtistProfileResponse(
                        artist.getId(),
                        artist.getStageName(),
                        artist.getBiografia(),
                        artist.getProfileImageUrl(),
                        artist.isVerificado(),
                        artist.isActivo(),
                        declarationRepository.existsByArtistIdAndAceptadaTrue(artist.getId())
                ))
                .toList();
    }

    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public CatalogMapper.ArtistProfileResponse verifyArtist(UUID artistId) {
        Artist artist = artistRepository.findById(artistId)
                .orElseThrow(() -> new ApiException("NOT_FOUND", "Artista no encontrado"));
        artist.setVerificado(true);
        return new CatalogMapper.ArtistProfileResponse(
                artist.getId(),
                artist.getStageName(),
                artist.getBiografia(),
                artist.getProfileImageUrl(),
                artist.isVerificado(),
                artist.isActivo(),
                declarationRepository.existsByArtistIdAndAceptadaTrue(artist.getId())
        );
    }

    public record UpdateArtistRequest(String stageName, String biography) {}

    public record SignDeclarationRequest(boolean accepted, String documentVersion) {}

    public record ArtistStatsResponse(
            long totalPlays,
            long premiumPlays,
            long freePlays,
            double totalWeight,
            List<TopSong> topSongs
    ) {
        public record TopSong(UUID songId, String title, long plays, double weight) {}
    }
}
