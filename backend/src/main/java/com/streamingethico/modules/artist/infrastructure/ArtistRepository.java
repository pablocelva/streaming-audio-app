package com.streamingethico.modules.artist.infrastructure;

import com.streamingethico.modules.artist.domain.Artist;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ArtistRepository extends JpaRepository<Artist, UUID> {

    Optional<Artist> findByUserId(UUID userId);

    List<Artist> findByVerificadoFalseAndActivoTrue();

    @Query("SELECT a FROM Artist a WHERE a.verificado = true AND a.activo = true AND LOWER(a.stageName) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Artist> searchVerified(@org.springframework.data.repository.query.Param("query") String query);
}
