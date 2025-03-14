package com.example.awsstarterapi.repository;

import com.example.awsstarterapi.model.TestEntity;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface TestRepository extends MongoRepository<TestEntity, String> {
}
