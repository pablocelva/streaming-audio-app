package com.streamingethico.modules.catalog.application;

import com.streamingethico.modules.catalog.domain.Album;
import com.streamingethico.modules.catalog.domain.Song;

import com.streamingethico.modules.artist.domain.Artist;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Component
public class CatalogMapper {

    public AlbumResponse toAlbumResponse(Album album) {
        List<SongSummaryResponse> songs = album.getSongs() == null ? List.of() :
                album.getSongs().stream().map(this::toSongSummary).toList();

        return new AlbumResponse(
                album.getId(),
                album.getTitulo(),
                album.getReleaseYear(),
                album.getGenero(),
                album.getCoverImageUrl(),
                album.getArtist().getId(),
                songs
        );
    }

    public SongResponse toSongResponse(Song song) {
        return new SongResponse(
                song.getId(),
                song.getAlbum().getId(),
                song.getTitulo(),
                song.getDurationSeconds(),
                song.getOrderInAlbum(),
                song.isExplicit()
        );
    }

    public SongSummaryResponse toSongSummary(Song song) {
        return new SongSummaryResponse(
                song.getId(),
                song.getTitulo(),
                song.getDurationSeconds(),
                song.getAlbum().getArtist().getStageName(),
                song.getAlbum().getTitulo()
        );
    }

    public ArtistProfileResponse toArtistProfile(Artist artist) {
        return new ArtistProfileResponse(
                artist.getId(),
                artist.getStageName(),
                artist.getBiografia(),
                artist.getProfileImageUrl(),
                artist.isVerificado(),
                artist.isActivo(),
                false
        );
    }

    public record AlbumResponse(
            UUID id,
            String title,
            Integer releaseYear,
            String genre,
            String coverImageUrl,
            UUID artistId,
            List<SongSummaryResponse> songs
    ) {}

    public record SongResponse(
            UUID id,
            UUID albumId,
            String title,
            int durationSeconds,
            int orderInAlbum,
            boolean isExplicit
    ) {}

    public record SongSummaryResponse(
            UUID id,
            String title,
            int durationSeconds,
            String artistName,
            String albumTitle
    ) {}

    public record ArtistProfileResponse(
            UUID id,
            String stageName,
            String biography,
            String profileImageUrl,
            boolean verified,
            boolean active,
            boolean declarationSigned
    ) {}

    public record StreamUrlResponse(
            String url,
            Instant expiresAt,
            String accessTier,
            Integer maxPlaySeconds,
            String quality
    ) {}

    public record FeaturedCatalogResponse(
            List<AlbumResponse> albums,
            List<SongSummaryResponse> songs
    ) {}

    public record SearchResultsResponse(
            List<ArtistProfileResponse> artists,
            List<SongSummaryResponse> songs
    ) {}
}
