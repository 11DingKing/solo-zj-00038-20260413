package com.jamesaworo.stocky.features.stock.data.repository;

import com.jamesaworo.stocky.features.stock.domain.entity.StockTransactionLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StockTransactionLogRepository extends JpaRepository<StockTransactionLog, Long> {
    List<StockTransactionLog> findByProductIdOrderByCreatedAtDesc(Long productId);
}
