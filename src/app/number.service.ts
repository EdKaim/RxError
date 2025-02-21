import { Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { interval, map, ReplaySubject } from 'rxjs';
import { ApiResponse } from './api-response';

@Injectable({
  providedIn: 'root',
})
export class NumberService {
  #number$ = new ReplaySubject<ApiResponse<number>>(1);
  #number = 0;

  constructor() {
    interval(1000)
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: () => {
          this.#number++;

          if (this.#number === 6) {
            // Simulate an occasional error when we hit 6.
            this.#number$.next({
              success: false,
              error: new Error('Number is 6!'),
            });
            this.#number = 0;
          } else if (this.#number === 3) {
            // Simulate the occasional null or undefined value when we hit 3.
            this.#number$.next({
              success: true,
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

  watchSquared$() {
    return this.watchNumber$().pipe(
      map((response) => {
        // If watchNumber$() emitted an error we wouldn't need to check this because it would
        // bypass this operator unless we explicitly caught it. But in this setup we need to always
        // check for success and pass it along.
        if (!response.success) return response;

        // If we don't have a value then we can't square it. But since we have to return a response
        // it means that everyone downstream will have to check for success as well as null or
        // undefined values. If we could emit an error then consumers expecting a valid square
        // could trust our emission.
        //
        // This is also predicated on the possibility of watchNumber$() emitting a successful response
        // that includes a null or undefined value. If we could guarantee that watchNumber$() would
        // only emit valid values when the success flag is set then this check would be less necessary.
        if (!response.result) {
          return {
            success: false,
            error: new Error(
              'Number could not be squared because it was null or undefined'
            ),
          };
        }

        return {
          success: true,
          result: response.result ** 2,
        };
      })
    );
  }

  watchHalvedSquare$() {
    return this.watchSquared$().pipe(
      map((response) => {
        // Once again, we have to check for success and pass it along if not.
        if (!response.success) return response;

        // We could potentially cut this check out since we know watchSquared$() will set success to
        // false if the number is null or undefined. But some people like to keep things like this
        // in just in case the upstream behavior changes down the road.
        //
        // There is a case to be made that this error message should replace the upstream error since
        // it's more meaningful to the consumer of this specific observable. But that would also
        // require a way to know that the error included with the upstream successful emission was
        // for this specific issue and not something like a network error or whatever. That would
        // probably be done by having a "type" property instead of a "success" boolean so it would
        // be easier to differentiate between different types of errors and offer a better consumer
        // experience. That's more of a preference/practice decision.
        if (!response.result) {
          return {
            success: false,
            error: new Error(
              'Square number could not be halved because it was null or undefined'
            ),
          };
        }

        return {
          success: true,
          result: response.result / 2,
        };
      })
    );
  }
}
