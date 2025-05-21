import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { provideServerRouting } from '@angular/ssr';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';
import { CookieService } from 'ngx-cookie-service'; // Import CookieService

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),
    provideServerRouting(serverRoutes),
    CookieService, // Add CookieService here
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
