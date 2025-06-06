import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import {isDevMode} from '@angular/core';

import * as Sentry from "@sentry/angular";

const originalToString = Function.prototype.toString;
Object.defineProperty(Function.prototype, 'ots', {
  get: () => originalToString,
  set: () => {}
})

if (!isDevMode()) {
  Sentry.init({
    dsn: "https://d076fcbb78861a7b9979e56b3d583180@o4509185227554816.ingest.de.sentry.io/4509185257766992",
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: false,
        maskAllInputs: false,
        blockAllMedia: false,
        networkDetailAllowUrls: [/^https?:\/\/kursy.szkolenia-prolife\.pl/],
        networkDetailDenyUrls: [/^https?:\/\/kursy.szkolenia-prolife\.pl\/api\/sentry/],
        networkCaptureBodies: true,
      }),
      Sentry.httpClientIntegration({
        failedRequestStatusCodes: [[400, 599]]
      })
    ],
    tracesSampleRate: 0.5,
    tracePropagationTargets: [/^https?:\/\/kursy.szkolenia-prolife\.pl/],
    replaysSessionSampleRate: 0.01,
    replaysOnErrorSampleRate: 1.0,
    tunnel: '/api/sentry',
    sendDefaultPii: true,
  });
}
else {
  console.log('Sentry disabled in dev mode...')
}

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
