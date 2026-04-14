import {Component, OnDestroy, OnInit} from '@angular/core';
import {NzModalService} from 'ng-zorro-antd/modal';
import {NzNotificationService} from 'ng-zorro-antd/notification';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {STOCK_VIEW_LOW_PRODUCT} from '../../../data/constant/crumb.constant';
import {UtilService} from '../../../shared/utils/util.service';
import {BatchReplenishPayload, LowStockAlertPayload, ReplenishItemPayload} from '../_data/low-stock-alert.payload';
import {LowStockAlertUsecase} from '../_usecase/low-stock-alert.usecase';

@Component({
    selector: 'app-view-low-stock',
    templateUrl: './view-low-stock.component.html',
    styles: [`
        .warning-row {
            background-color: #fff2f0 !important;
        }
        .critical-row {
            background-color: #fff1f0 !important;
        }
        .shortage-badge {
            background-color: #ff4d4f;
            color: white;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 12px;
        }
        .replenish-input {
            width: 100px;
        }
        .qty-badge {
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 500;
        }
        .qty-critical {
            background-color: #fff1f0;
            color: #ff4d4f;
            border: 1px solid #ffa39e;
        }
        .qty-warning {
            background-color: #fffbe6;
            color: #faad14;
            border: 1px solid #ffe58f;
        }
        .toolbar {
            margin-bottom: 16px;
            padding: 12px 16px;
            background-color: #f6ffed;
            border: 1px solid #b7eb8f;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
    `]
})
export class ViewLowStockComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();
    private tableDataSubject = new BehaviorSubject<LowStockAlertPayload[]>([]);

    public crumbs = STOCK_VIEW_LOW_PRODUCT;
    public isOpenHeader = true;
    public isLoading = false;
    public tableData$: Observable<LowStockAlertPayload[]> = this.tableDataSubject.asObservable();
    public selectedItems: LowStockAlertPayload[] = [];
    public allChecked = false;
    public indeterminate = false;

    constructor(
        private usecase: LowStockAlertUsecase,
        private notification: NzNotificationService,
        private modal: NzModalService,
        private util: UtilService
    ) {}

    public ngOnInit(): void {
        this.loadLowStockAlerts();
    }

    public ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    public loadLowStockAlerts = (): void => {
        this.isLoading = true;
        this.usecase.getLowStockAlerts()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (data) => {
                    data.forEach(item => {
                        item.selected = false;
                        item.replenishQuantity = item.shortageQuantity ? Math.max(item.shortageQuantity, 1) : 1;
                    });
                    this.tableDataSubject.next(data);
                    this.selectedItems = [];
                    this.updateCheckedStatus();
                    this.isLoading = false;
                },
                error: (err) => {
                    this.util.handleHttpRequestError(err, {service: this.notification});
                    this.isLoading = false;
                }
            });
    };

    public onRefresh = (): void => {
        this.loadLowStockAlerts();
    };

    public onItemChecked(item: LowStockAlertPayload, checked: boolean): void {
        item.selected = checked;
        this.updateCheckedStatus();
    }

    public onAllChecked(checked: boolean): void {
        const currentData = this.tableDataSubject.value;
        currentData.forEach(item => item.selected = checked);
        this.tableDataSubject.next([...currentData]);
        this.updateCheckedStatus();
    }

    private updateCheckedStatus(): void {
        const currentData = this.tableDataSubject.value;
        const checkedItems = currentData.filter(item => item.selected);
        this.selectedItems = checkedItems;
        this.allChecked = currentData.length > 0 && checkedItems.length === currentData.length;
        this.indeterminate = checkedItems.length > 0 && checkedItems.length < currentData.length;
    }

    public getSelectedCount(): number {
        return this.selectedItems.length;
    }

    public onBatchReplenish = (): void => {
        const selectedWithQty = this.selectedItems.filter(item => item.replenishQuantity && item.replenishQuantity > 0);

        if (selectedWithQty.length === 0) {
            this.notification.warning('Warning', 'Please select at least one product and enter replenish quantity');
            return;
        }

        this.modal.confirm({
            nzTitle: 'Confirm Batch Replenish',
            nzContent: `You are about to replenish ${selectedWithQty.length} product(s). Continue?`,
            nzOnOk: () => this.executeBatchReplenish(selectedWithQty)
        });
    };

    private executeBatchReplenish(items: LowStockAlertPayload[]): void {
        const payload: BatchReplenishPayload = {
            items: items.map(item => ({
                productId: item.productId,
                quantity: item.replenishQuantity
            } as ReplenishItemPayload)),
            remark: 'Batch replenish from low stock alert'
        };

        this.isLoading = true;
        this.usecase.batchReplenish(payload)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (success) => {
                    if (success) {
                        this.notification.success('Success', 'Batch replenish completed successfully');
                        this.loadLowStockAlerts();
                    } else {
                        this.notification.error('Error', 'Batch replenish failed');
                    }
                    this.isLoading = false;
                },
                error: (err) => {
                    this.util.handleHttpRequestError(err, {service: this.notification});
                    this.isLoading = false;
                }
            });
    }

    public onSingleReplenish = (item: LowStockAlertPayload): void => {
        if (!item.replenishQuantity || item.replenishQuantity <= 0) {
            this.notification.warning('Warning', 'Please enter a valid replenish quantity');
            return;
        }

        this.modal.confirm({
            nzTitle: 'Confirm Replenish',
            nzContent: `Replenish ${item.productName} with ${item.replenishQuantity} units?`,
            nzOnOk: () => {
                const payload: BatchReplenishPayload = {
                    items: [{
                        productId: item.productId,
                        quantity: item.replenishQuantity
                    }],
                    remark: `Replenish ${item.productName}`
                };

                this.isLoading = true;
                this.usecase.batchReplenish(payload)
                    .pipe(takeUntil(this.destroy$))
                    .subscribe({
                        next: (success) => {
                            if (success) {
                                this.notification.success('Success', 'Replenish completed successfully');
                                this.loadLowStockAlerts();
                            } else {
                                this.notification.error('Error', 'Replenish failed');
                            }
                            this.isLoading = false;
                        },
                        error: (err) => {
                            this.util.handleHttpRequestError(err, {service: this.notification});
                            this.isLoading = false;
                        }
                    });
            }
        });
    };

    public getRowClass(item: LowStockAlertPayload): string {
        if (item.currentQuantity === 0) {
            return 'critical-row';
        }
        if (item.shortageQuantity && item.shortageQuantity > 0) {
            return 'warning-row';
        }
        return '';
    }
}
