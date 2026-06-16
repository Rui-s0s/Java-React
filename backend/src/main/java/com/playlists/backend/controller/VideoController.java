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
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/videos")
public class VideoController {

    private final VideoRepository videoRepository;
    private final TagRepository tagRepository;


    public VideoController(VideoRepository videoRepository, TagRepository tagRepository) {
        this.videoRepository = videoRepository;
        this.tagRepository = tagRepository;
    }

    public static class TagRequest {
        private List<String> tags;
        public List<String> getTags() { return tags; }
        public void setTags(List<String> tags) { this.tags = tags; }
    }

    @GetMapping("/test")
    public String test() {
        return "hello";
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
    public Video updateVideoTags(@PathVariable Long id, @RequestBody TagRequest tagRequest) {
        return videoRepository.findById(id)
                .map(video -> {
                    // Transform the list of string names into managed Entity objects cleanly
                    Set<Tag> managedTags = (tagRequest.getTags() == null) ? new HashSet<>() :
                        tagRequest.getTags().stream()
                            .map(String::trim)
                            .filter(name -> !name.isEmpty())
                            .map(name -> tagRepository.findByNameIgnoreCase(name)
                                    .orElseGet(() -> tagRepository.save(new Tag(name))))
                            .collect(Collectors.toSet());
                    
                    video.setTags(managedTags);
                    return videoRepository.save(video);
                })
                .orElseThrow(() -> new RuntimeException("Video not found"));
    }
}