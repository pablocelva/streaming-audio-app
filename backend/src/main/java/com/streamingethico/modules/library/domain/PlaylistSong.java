package com.streamingethico.modules.library.domain;

import com.streamingethico.modules.catalog.domain.Song;
import jakarta.persistence.*;
import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "playlist_canciones")
@IdClass(PlaylistSong.PlaylistSongId.class)
public class PlaylistSong {

    @Id
    @Column(name = "playlist_id")
    private UUID playlistId;

    @Id
    @Column(name = "cancion_id")
    private UUID songId;

    @Column(nullable = false)
    private int orden = 1;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "playlist_id", insertable = false, updatable = false)
    private Playlist playlist;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cancion_id", insertable = false, updatable = false)
    private Song song;

    public UUID getPlaylistId() {
        return playlistId;
    }

    public void setPlaylistId(UUID playlistId) {
        this.playlistId = playlistId;
    }

    public UUID getSongId() {
        return songId;
    }

    public void setSongId(UUID songId) {
        this.songId = songId;
    }

    public int getOrden() {
        return orden;
    }

    public void setOrden(int orden) {
        this.orden = orden;
    }

    public Playlist getPlaylist() {
        return playlist;
    }

    public void setPlaylist(Playlist playlist) {
        this.playlist = playlist;
    }

    public Song getSong() {
        return song;
    }

    public void setSong(Song song) {
        this.song = song;
    }

    public static class PlaylistSongId implements Serializable {
        private UUID playlistId;
        private UUID songId;

        public PlaylistSongId() {}

        public PlaylistSongId(UUID playlistId, UUID songId) {
            this.playlistId = playlistId;
            this.songId = songId;
        }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;
            PlaylistSongId that = (PlaylistSongId) o;
            return Objects.equals(playlistId, that.playlistId) && Objects.equals(songId, that.songId);
        }

        @Override
        public int hashCode() {
            return Objects.hash(playlistId, songId);
        }
    }
}
