package com.jamesaworo.stocky.features.stock.endpoint;

import com.jamesaworo.stocky.features.stock.data.interactor.contract.ILowStockAlertInteractor;
import com.jamesaworo.stocky.features.stock.data.request.BatchReplenishRequest;
import com.jamesaworo.stocky.features.stock.data.request.LowStockAlertRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

import static com.jamesaworo.stocky.core.constants.Global.API_PREFIX;

@RestController
@RequestMapping(value = API_PREFIX + "/stock/low-stock")
@RequiredArgsConstructor
public class LowStockAlertEndpoint {

    private final ILowStockAlertInteractor interactor;

    @GetMapping("/list")
    public ResponseEntity<List<LowStockAlertRequest>> getLowStockAlerts() {
        return this.interactor.getLowStockAlerts();
    }

    @GetMapping("/count")
    public ResponseEntity<Long> getLowStockCount() {
        return this.interactor.getLowStockCount();
    }

    @PostMapping("/batch-replenish")
    public ResponseEntity<Boolean> batchReplenish(@Valid @RequestBody BatchReplenishRequest request) {
        return this.interactor.batchReplenish(request);
    }
}
