import { Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { interval, ReplaySubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NumberService {
  #number$ = new ReplaySubject<number>(1);
  #number = 0;

  constructor() {
    interval(1000)
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: () => {
          this.#number++;

          // Simulate an occasional error.
          if (this.#number === 5) {
            const oldSubject = this.#number$;

            // The underlying subject needs to be replaced since it will have completed.
            this.#number$ = new ReplaySubject<number>(1);
            this.#number = 0;

            oldSubject.error(new Error('Number is 5!'));
          } else {
            this.#number$.next(this.#number);
          }
        },
      });
  }

  watchNumber$() {
    return this.#number$.asObservable();
  }
}
