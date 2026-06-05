package com.playlists.backend.repository;

import com.playlists.backend.entity.Playlist;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface PlaylistRepository extends JpaRepository<Playlist, Long> {
   @Query("SELECT DISTINCT p FROM Playlist p " +
           "JOIN p.videos v " +
           "JOIN v.tags t " +
           "WHERE t.name IN :tagNames")
    List<Playlist> findPlaylistsByTagNames(@Param("tagNames") List<String> tagNames);
}