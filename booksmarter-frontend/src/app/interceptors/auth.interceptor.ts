import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // For API calls, add credentials
  if (req.url.includes('localhost:8080/api')) {
    const authReq = req.clone({
      withCredentials: true,
    });
    return next(authReq);
  }

  // For other requests, pass through unchanged
  return next(req);
};
