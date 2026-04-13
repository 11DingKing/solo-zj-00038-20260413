package com.jamesaworo.stocky.features.stock.domain.usecase;

import com.jamesaworo.stocky.features.stock.domain.entity.StockTransactionLog;

import java.util.List;
import java.util.Optional;

public interface IStockTransactionLogUsecase {
    StockTransactionLog save(StockTransactionLog log);
    Optional<StockTransactionLog> findById(Long id);
    List<StockTransactionLog> findByProductId(Long productId);
    List<StockTransactionLog> findAll();
}
