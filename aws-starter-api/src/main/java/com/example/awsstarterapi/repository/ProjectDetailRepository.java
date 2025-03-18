package com.example.awsstarterapi.repository;

import com.example.awsstarterapi.model.ProjectDetailEntity;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ProjectDetailRepository extends MongoRepository<ProjectDetailEntity, String> {
}
