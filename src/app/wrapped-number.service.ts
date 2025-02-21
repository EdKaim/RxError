import { Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { interval, ReplaySubject } from 'rxjs';
import { ApiResponse } from './api-response';

@Injectable({
  providedIn: 'root',
})
export class WrappedNumberService {
  #number$ = new ReplaySubject<ApiResponse<number>>(1);
  #number = 0;

  constructor() {
    interval(1000)
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: () => {
          this.#number++;

          // Simulate an occasional error.
          if (this.#number === 5) {
            this.#number$.next({
              success: false,
              error: new Error('Number is 5!'),
            });
          } else {
            this.#number$.next({
              success: true,
              result: this.#number,
            });
          }
        },
      });
  }

  watchNumber$() {
    return this.#number$.asObservable();
  }
}
