package com.jamesaworo.stocky.features.stock.data.interactor.implementation;

import com.jamesaworo.stocky.core.annotations.Interactor;
import com.jamesaworo.stocky.features.product.data.repository.ProductRepository;
import com.jamesaworo.stocky.features.product.domain.entity.Product;
import com.jamesaworo.stocky.features.product.domain.entity.ProductBasic;
import com.jamesaworo.stocky.features.product.domain.usecase.IProductBasicUsecase;
import com.jamesaworo.stocky.features.product.domain.usecase.IProductUsecase;
import com.jamesaworo.stocky.features.stock.data.interactor.contract.ILowStockAlertInteractor;
import com.jamesaworo.stocky.features.stock.data.request.BatchReplenishRequest;
import com.jamesaworo.stocky.features.stock.data.request.LowStockAlertRequest;
import com.jamesaworo.stocky.features.stock.data.request.ReplenishItemRequest;
import com.jamesaworo.stocky.features.stock.domain.entity.StockTransactionLog;
import com.jamesaworo.stocky.features.stock.domain.enums.StockTransactionType;
import com.jamesaworo.stocky.features.stock.domain.usecase.IStockTransactionLogUsecase;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import static org.springframework.security.core.context.SecurityContextHolder.getContext;
import static org.springframework.http.ResponseEntity.ok;

@Interactor
@RequiredArgsConstructor
public class LowStockAlertInteractor implements ILowStockAlertInteractor {

    private final ProductRepository productRepository;
    private final IProductUsecase productUsecase;
    private final IProductBasicUsecase productBasicUsecase;
    private final IStockTransactionLogUsecase transactionLogUsecase;

    @Override
    public ResponseEntity<List<LowStockAlertRequest>> getLowStockAlerts() {
        List<Product> lowStockProducts = this.productRepository.findLowStockProducts();
        List<LowStockAlertRequest> alerts = lowStockProducts.stream()
                .map(this::toLowStockAlertRequest)
                .collect(Collectors.toList());
        return ok().body(alerts);
    }

    @Override
    public ResponseEntity<Long> getLowStockCount() {
        Long count = this.productRepository.countLowStockProducts();
        return ok().body(count);
    }

    @Override
    @Transactional
    public ResponseEntity<Boolean> batchReplenish(BatchReplenishRequest request) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            return ok().body(false);
        }

        String currentUser = getCurrentUsername();

        for (ReplenishItemRequest item : request.getItems()) {
            if (item.getProductId() == null || item.getQuantity() == null || item.getQuantity() <= 0) {
                continue;
            }

            Optional<Product> optionalProduct = this.productUsecase.findById(item.getProductId());
            optionalProduct.ifPresent(product -> {
                ProductBasic basic = product.getBasic();
                Integer quantityBefore = basic.getQuantity();
                Integer quantityAfter = quantityBefore + item.getQuantity();

                this.productBasicUsecase.updateProductQuantity(
                        basic.getId(),
                        item.getQuantity(),
                        com.jamesaworo.stocky.features.product.domain.enums.ProductQuantityUpdateType.INCREMENT
                );

                StockTransactionLog log = StockTransactionLog.builder()
                        .product(product)
                        .transactionType(StockTransactionType.INCREMENT)
                        .quantityBefore(quantityBefore)
                        .quantityAfter(quantityAfter)
                        .changeAmount(item.getQuantity())
                        .remark(request.getRemark() != null ? request.getRemark() : "Batch replenish")
                        .operatorName(currentUser)
                        .build();

                this.transactionLogUsecase.save(log);
            });
        }

        return ok().body(true);
    }

    private LowStockAlertRequest toLowStockAlertRequest(Product product) {
        ProductBasic basic = product.getBasic();
        LowStockAlertRequest request = new LowStockAlertRequest();
        request.setProductId(product.getId());
        request.setProductName(basic.getProductName());
        request.setBrandName(basic.getBrandName());
        request.setSku(basic.getSku());
        request.setBarcode(basic.getBarcode());
        request.setCurrentQuantity(basic.getQuantity());
        request.setLowStockPoint(basic.getLowStockPoint());

        if (basic.getLowStockPoint() != null && basic.getQuantity() != null) {
            request.setShortageQuantity(basic.getLowStockPoint() - basic.getQuantity());
        }

        if (basic.getProductCategory() != null) {
            request.setCategoryName(basic.getProductCategory().getTitle());
        }

        return request;
    }

    private String getCurrentUsername() {
        if (getContext().getAuthentication() != null) {
            return getContext().getAuthentication().getName();
        }
        return "System";
    }
}
