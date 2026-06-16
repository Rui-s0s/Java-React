package com.playlists.backend.entity;

import jakarta.persistence.*; // This imports @Entity, @Id, @GeneratedValue, etc.

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;


@Entity
public class Video {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String title;
    private String url;
    private int likes;
    private int dislikes;

    @ManyToOne // Many videos belong to one playlist
    @JoinColumn(name = "playlist_id")
    @JsonIgnore
    private Playlist playlist;

    @OneToMany(mappedBy = "video", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Comment> comments = new ArrayList<>(); 

    // THIS CONTAINS TAGS
    @ManyToMany(cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
        name = "video_tag_mapping",
        joinColumns = @JoinColumn(name = "video_id"),
        inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    @JsonIgnoreProperties("videos") // Prevents infinite JSON loops
    private Set<Tag> tags = new HashSet<>();

    // Standard Boilerplate (Getters and Setters)
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String name) { this.title = name; }

    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }

    public int getLikes() { return likes; }
    public void addLike() { this.likes += 1; }

    public int getDislikes() { return dislikes; }
    public void addDislike() { this.dislikes += 1; }
    
    public Playlist getPlaylist() { return playlist;}
    public void setPlaylist(Playlist playlist) { this.playlist = playlist;}

    // Methods
    public void addComment(Comment comment) {
        this.comments.add(comment);
        comment.setVideo(this);    // Set the "Back Link"
    }

    public List<Comment> getComments() {
        return comments;
    }

    public Set<Tag> getTags() { return tags; }
    public void setTags(Set<Tag> tags) {
        // 1. Remove this video from any old tags currently attached to it
        if (this.tags != null) {
            for (Tag oldTag : this.tags) {
                oldTag.getVideos().remove(this);
            }
        }
        
        // 2. Assign the new collection
        this.tags = tags;
        
        // 3. Make sure the new tags point back to this video
        if (tags != null) {
            for (Tag newTag : tags) {
                newTag.getVideos().add(this);
            }
        }
    }
}