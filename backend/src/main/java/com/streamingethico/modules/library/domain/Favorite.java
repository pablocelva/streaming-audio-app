package com.streamingethico.modules.library.domain;

import com.streamingethico.modules.catalog.domain.Song;
import com.streamingethico.modules.user.domain.User;
import jakarta.persistence.*;
import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "favoritos")
@IdClass(Favorite.FavoriteId.class)
public class Favorite {

    @Id
    @Column(name = "usuario_id")
    private UUID userId;

    @Id
    @Column(name = "cancion_id")
    private UUID songId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", insertable = false, updatable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cancion_id", insertable = false, updatable = false)
    private Song song;

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public UUID getSongId() {
        return songId;
    }

    public void setSongId(UUID songId) {
        this.songId = songId;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Song getSong() {
        return song;
    }

    public void setSong(Song song) {
        this.song = song;
    }

    public static class FavoriteId implements Serializable {
        private UUID userId;
        private UUID songId;

        public FavoriteId() {}

        public FavoriteId(UUID userId, UUID songId) {
            this.userId = userId;
            this.songId = songId;
        }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;
            FavoriteId that = (FavoriteId) o;
            return Objects.equals(userId, that.userId) && Objects.equals(songId, that.songId);
        }

        @Override
        public int hashCode() {
            return Objects.hash(userId, songId);
        }
    }
}
