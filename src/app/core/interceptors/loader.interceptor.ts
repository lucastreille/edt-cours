import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { LoaderStore } from '../state/loader.store';

export const loaderInterceptor: HttpInterceptorFn = (req, next) => {
  const loader = inject(LoaderStore);
  loader.start();
  return next(req).pipe(finalize(() => loader.stop()));
};
