package com.example.awsstarterapi.controller;

import com.example.awsstarterapi.model.TestEntity;
import com.example.awsstarterapi.repository.TestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/test")
@CrossOrigin(origins = {
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://aws-starter-app.s3-website-us-west-1.amazonaws.com",
    "https://d23g2ah1oukxrw.cloudfront.net",
    "https://sloandev.net",
    "https://www.sloandev.net",
    "https://api.sloandev.net"
})
public class TestController {

    @Autowired
    private TestRepository testRepository;

    @PostMapping
    public TestEntity createTest(@RequestBody TestEntity testEntity) {
        testEntity.setTimestamp(System.currentTimeMillis());
        return testRepository.save(testEntity);
    }

    @GetMapping
    public List<TestEntity> getAllTests() {
        return testRepository.findAll();
    }
}
