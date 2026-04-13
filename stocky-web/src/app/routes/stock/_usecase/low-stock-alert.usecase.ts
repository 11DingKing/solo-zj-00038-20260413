import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {environment} from '@env/environment';
import {Observable} from 'rxjs';
import {BatchReplenishPayload, LowStockAlertPayload} from '../_data/low-stock-alert.payload';

@Injectable({providedIn: 'root'})
export class LowStockAlertUsecase {
    private url = environment.api.baseUrl + '/stock/low-stock';

    constructor(private http: HttpClient) {}

    public getLowStockAlerts(): Observable<LowStockAlertPayload[]> {
        return this.http.get<LowStockAlertPayload[]>(`${this.url}/list`);
    }

    public getLowStockCount(): Observable<number> {
        return this.http.get<number>(`${this.url}/count`);
    }

    public batchReplenish(payload: BatchReplenishPayload): Observable<boolean> {
        return this.http.post<boolean>(`${this.url}/batch-replenish`, payload);
    }
}
