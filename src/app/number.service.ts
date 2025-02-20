import { DestroyRef, inject, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, interval, ReplaySubject, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NumberService {
  #destroyRef = inject(DestroyRef);
  #number$ = new ReplaySubject<number>(1);
  #number = 1;

  constructor() {
    this.#resetPolling();
  }

  /**
   * @private
   * Resets the polling process and reinitializes the number stream.
   * Throws an error when the number reaches 5 and restarts the polling.
   */
  #resetPolling() {
    this.#number = 1;
    this.#number$ = new ReplaySubject<number>(1);
    const originalSubject = this.#number$;

    interval(1000)
      .pipe(
        tap(() => {
          // Simulate an occasional error.
          if (this.#number === 5) {
            throw new Error('Number is 5!');
          }
        }),
        catchError((error) => {
          // If we get to this point then the underlying interval observable has errored and will complete.
          // We need to restart it if we want to continue polling.
          this.#resetPolling();

          // We still want to use the error infrastructure so that downstream subscriptions can catch or
          // use the error handler.
          return throwError(() => error);
        }),
        takeUntilDestroyed(this.#destroyRef)
      )
      .subscribe({
        next: () => this.#number$.next(this.#number++),
        // We need to pass the error to the original subject so that the error handler can be triggered.
        // Note that this is no longer this.#number$ because we replaced it in the catchError call to #resetPolling().
        error: (error) => originalSubject.error(error),
      });
  }

  watchNumber$() {
    return this.#number$.asObservable();
  }
}
