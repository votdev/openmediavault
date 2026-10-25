import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NgModule } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import {
  TRANSLOCO_MISSING_HANDLER,
  TranslocoConfig,
  TranslocoMissingHandler,
  TranslocoTestingModule
} from '@jsverse/transloco';
import { ToastrModule } from '@openng/ngx-toastr';

export class TestingTranslocoMissingHandler implements TranslocoMissingHandler {
  handle(key: string, config: TranslocoConfig) {
    return key;
  }
}

@NgModule({
  exports: [RouterTestingModule],
  imports: [
    NoopAnimationsModule,
    RouterTestingModule,
    TranslocoTestingModule.forRoot({
      langs: { en: {} },
      translocoConfig: { availableLangs: ['en'], defaultLang: 'en' },
      preloadLangs: true
    }),
    ToastrModule.forRoot()
  ],
  providers: [
    // Disable 'Missing translation for ...' warnings.
    { provide: TRANSLOCO_MISSING_HANDLER, useClass: TestingTranslocoMissingHandler },
    provideHttpClient(withInterceptorsFromDi()),
    provideHttpClientTesting()
  ]
})
export class TestingModule {}
