package com.jamesaworo.stocky.features.stock.data.request;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class LowStockAlertRequest {
    private Long productId;
    private String productName;
    private String brandName;
    private String sku;
    private String barcode;
    private Integer currentQuantity;
    private Integer lowStockPoint;
    private Integer shortageQuantity;
    private String categoryName;
}
