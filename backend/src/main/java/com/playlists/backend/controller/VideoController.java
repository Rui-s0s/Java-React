package com.playlists.backend.controller;

import com.playlists.backend.entity.Video;
import com.playlists.backend.entity.Comment;
import com.playlists.backend.entity.Tag;
import com.playlists.backend.repository.TagRepository;
import com.playlists.backend.repository.VideoRepository;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/videos")
public class VideoController {

    private final VideoRepository videoRepository;
    private final TagRepository tagRepository;


    public VideoController(VideoRepository videoRepository, TagRepository tagRepository) {
        this.videoRepository = videoRepository;
        this.tagRepository = tagRepository;
    }

    @GetMapping("/{id}")
    public Video getVideoById(@PathVariable Long id) {
        return videoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Video not found"));
    }

    @PutMapping("/{id}")
    public Video updateVideo(@PathVariable Long id, @RequestBody Video updatedVideo) {
        return videoRepository.findById(id)
                .map(video -> {
                    video.setTitle(updatedVideo.getTitle());
                    video.setUrl(updatedVideo.getUrl());
                    return videoRepository.save(video);
                })
                .orElseThrow(() -> new RuntimeException("Video not found"));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteVideo(@PathVariable Long id) {
        videoRepository.deleteById(id);
    }

    @PostMapping("/{id}/comments")
    public Video addComment(@PathVariable Long id, @RequestBody Comment comment) {
        Video video = videoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Video not found"));
        
        video.addComment(comment); 
        return videoRepository.save(video);
    }

    @GetMapping("/{id}/comments")
    public List<Comment> getVideoComments(@PathVariable Long id) {
        Video video = videoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Video not found"));
        return video.getComments();
    }

    @PatchMapping("/{id}/like")
    public Video likeVideo(@PathVariable Long id) {
        Video video = videoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Video not found"));
        
        video.addLike(); 
        return videoRepository.save(video);
    }

    @PatchMapping("/{id}/dislike")
    public Video dislikeVideo(@PathVariable Long id) {
        Video video = videoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Video not found"));
        
        video.addDislike();
        return videoRepository.save(video);
    }

    @PutMapping("/{id}/tags")
    public Video updateVideoTags(@PathVariable Long id, @RequestBody List<String> tagNames) {
        return videoRepository.findById(id)
                .map(video -> {
                    Set<Tag> managedTags = new HashSet<>();
                    
                    for (String name : tagNames) {
                        // Find existing tag or create a brand new one if it's unique
                        Tag tag = tagRepository.findByNameIgnoreCase(name.trim())
                                .orElseGet(() -> tagRepository.save(new Tag(name.trim())));
                        managedTags.add(tag);
                    }
                    
                    video.setTags(managedTags);
                    return videoRepository.save(video);
                })
                .orElseThrow(() -> new RuntimeException("Video not found"));
    }
}