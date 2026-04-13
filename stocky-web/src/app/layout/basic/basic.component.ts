import {Component, OnDestroy, OnInit} from '@angular/core';
import {SettingsService, User} from '@delon/theme';
import {LayoutDefaultOptions} from '@delon/theme/layout-default';
import {environment} from '@env/environment';
import {LowStockAlertService} from '../../shared/utils/low-stock-alert.service';
import {Observable} from 'rxjs';

@Component({
    selector: 'layout-basic',
    templateUrl: 'basic.component.html'
})
export class LayoutBasicComponent implements OnInit, OnDestroy {
    options: LayoutDefaultOptions = {
        logoExpanded: `./assets/images/logo-full.svg`,
        logoCollapsed: `./assets/images/logo-compact.svg`
    };
    searchToggleStatus = false;
    showSettingDrawer = !environment.production;
    lowStockCount$: Observable<number>;

    constructor(
        private settings: SettingsService,
        private lowStockAlertService: LowStockAlertService
    ) {
        this.lowStockCount$ = this.lowStockAlertService.lowStockCount$;
    }

    public ngOnInit(): void {
        this.lowStockAlertService.startPolling();
    }

    public ngOnDestroy(): void {
        this.lowStockAlertService.stopPolling();
    }

    get user(): User {
        return this.settings.user;
    }
}
