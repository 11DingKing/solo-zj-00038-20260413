package com.jamesaworo.stocky.features.stock.data.usecase_impl;

import com.jamesaworo.stocky.core.annotations.Usecase;
import com.jamesaworo.stocky.features.stock.data.repository.StockTransactionLogRepository;
import com.jamesaworo.stocky.features.stock.domain.entity.StockTransactionLog;
import com.jamesaworo.stocky.features.stock.domain.usecase.IStockTransactionLogUsecase;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.Optional;

@Usecase
@RequiredArgsConstructor
public class StockTransactionLogUsecaseImpl implements IStockTransactionLogUsecase {

    private final StockTransactionLogRepository repository;

    @Override
    public StockTransactionLog save(StockTransactionLog log) {
        return this.repository.save(log);
    }

    @Override
    public Optional<StockTransactionLog> findById(Long id) {
        return this.repository.findById(id);
    }

    @Override
    public List<StockTransactionLog> findByProductId(Long productId) {
        return this.repository.findByProductIdOrderByCreatedAtDesc(productId);
    }

    @Override
    public List<StockTransactionLog> findAll() {
        return this.repository.findAll();
    }
}
