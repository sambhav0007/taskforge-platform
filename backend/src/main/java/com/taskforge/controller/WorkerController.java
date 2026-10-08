package com.taskforge.controller;

import com.taskforge.domain.entity.WorkerLease;
import com.taskforge.repository.WorkerLeaseRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/workers")
public class WorkerController {

    private final WorkerLeaseRepository workerLeaseRepository;

    public WorkerController(WorkerLeaseRepository workerLeaseRepository) {
        this.workerLeaseRepository = workerLeaseRepository;
    }

    @GetMapping
    public ResponseEntity<List<WorkerLease>> getActiveWorkers() {
        return ResponseEntity.ok(workerLeaseRepository.findAll());
    }
}
