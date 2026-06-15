package com.playlists.backend.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.HashSet;
import java.util.Set;

@Entity
public class Tag {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String name;

    @ManyToMany(mappedBy = "tags")
    @JsonIgnoreProperties("tags") // Prevents infinite JSON loops during serialization
    private Set<Video> videos = new HashSet<>();

    // Constructors
    public Tag() {}
    public Tag(String name) { this.name = name; }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Set<Video> getVideos() { return videos; }
    public void setVideos(Set<Video> videos) { this.videos = videos; }
}