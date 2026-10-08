package com.taskforge.service;

import com.taskforge.domain.entity.WorkerLease;
import com.taskforge.repository.WorkerLeaseRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.InetAddress;
import java.time.Instant;
import java.util.List;

@Service
public class WorkerHeartbeatService {

    private static final Logger log = LoggerFactory.getLogger(WorkerHeartbeatService.class);

    private final WorkerLeaseRepository workerLeaseRepository;

    @Value("${taskforge.worker.id:worker-local-1}")
    private String workerId;

    public WorkerHeartbeatService(WorkerLeaseRepository workerLeaseRepository) {
        this.workerLeaseRepository = workerLeaseRepository;
    }

    @Scheduled(fixedDelay = 5000)
    @Transactional
    public void sendHeartbeat() {
        String hostname = "localhost";
        try {
            hostname = InetAddress.getLocalHost().getHostName();
        } catch (Exception ignored) {}

        WorkerLease lease = workerLeaseRepository.findById(workerId)
            .orElseGet(() -> new WorkerLease(workerId, "localhost"));

        lease.setHostname(hostname);
        lease.setHeartbeatAt(Instant.now());
        lease.setStatus("HEALTHY");

        workerLeaseRepository.save(lease);
    }

    @Scheduled(fixedDelay = 15000)
    @Transactional
    public void cleanupDeadWorkerLeases() {
        Instant cutoff = Instant.now().minusSeconds(30);
        List<WorkerLease> staleWorkers = workerLeaseRepository.findByHeartbeatAtBefore(cutoff);
        for (WorkerLease worker : staleWorkers) {
            worker.setStatus("DEAD");
            workerLeaseRepository.save(worker);
            log.warn("Worker [{}] has missed heartbeats and is marked DEAD", worker.getWorkerId());
        }
    }
}
