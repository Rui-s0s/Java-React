package com.playlists.backend.controller;

import com.playlists.backend.entity.Tag;
import com.playlists.backend.repository.TagRepository;

import org.springframework.web.bind.annotation.*;
import java.util.List;


@RestController
@RequestMapping("/api/tags")
public class TagController {

    private final TagRepository tagRepository;

    public TagController(TagRepository tagRepository) {
        this.tagRepository = tagRepository;
    }

    @GetMapping()
    public List<Tag> getAllTags() {
        return tagRepository.findAll();
    }
    
}
