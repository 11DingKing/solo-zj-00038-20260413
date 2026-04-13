import {Injectable, OnDestroy} from '@angular/core';
import {BehaviorSubject, interval, Subscription} from 'rxjs';
import {LowStockAlertUsecase} from '../../routes/stock/_usecase/low-stock-alert.usecase';

@Injectable({providedIn: 'root'})
export class LowStockAlertService implements OnDestroy {
    private lowStockCountSubject = new BehaviorSubject<number>(0);
    public lowStockCount$ = this.lowStockCountSubject.asObservable();
    private pollingSubscription?: Subscription;
    private readonly POLL_INTERVAL = 30000;

    constructor(private usecase: LowStockAlertUsecase) {}

    public startPolling(): void {
        this.refreshCount();

        this.pollingSubscription = interval(this.POLL_INTERVAL).subscribe(() => {
            this.refreshCount();
        });
    }

    public stopPolling(): void {
        if (this.pollingSubscription) {
            this.pollingSubscription.unsubscribe();
            this.pollingSubscription = undefined;
        }
    }

    public refreshCount(): void {
        this.usecase.getLowStockCount().subscribe({
            next: (count) => {
                this.lowStockCountSubject.next(count);
            },
            error: () => {
            }
        });
    }

    public getCurrentCount(): number {
        return this.lowStockCountSubject.value;
    }

    public ngOnDestroy(): void {
        this.stopPolling();
    }
}
