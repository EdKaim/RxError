import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, Observable, of, throwError } from 'rxjs';
import { NumberService } from './number.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [CommonModule],
  styleUrl: './app.component.css',
})
export class AppComponent {
  #numberService = inject(NumberService);
  #destroyRef = inject(DestroyRef);

  error?: Error;
  numberUx$ = new Observable<number>();

  numberConsole$ = new Observable<number>();

  constructor() {
    this.#resetUxSubscription();
    this.#resetConsoleSubscription();
  }

  #resetUxSubscription() {
    this.numberUx$ = this.#numberService.watchNumber$().pipe(
      catchError((error) => {
        this.error = error;
        this.#resetUxSubscription();

        // Using throwError here is probably the "correct" thing to do. However, this observable isn't this.numberUx$ anymore
        // since it was swapped out in this.#resetUxSubscription(). Rethrowing the error will result in an ugly dump to the console
        // because nobody is handling it anymore. To avoid this, you can return a value instead. This will keep the async pipe
        // happy for the split second between swapping out this observable for the new one.
        return throwError(() => error);
        //return of(-1);
      }),
      takeUntilDestroyed(this.#destroyRef)
    );
  }

  #resetConsoleSubscription() {
    this.numberConsole$ = this.#numberService.watchNumber$().pipe(
      catchError((error) => {
        this.error = error;
        this.#resetConsoleSubscription();
        return throwError(() => error);
      }),
      takeUntilDestroyed(this.#destroyRef)
    );

    this.numberConsole$.subscribe({
      next: (number) => console.log(number),
      error: (error) => console.log(error.message),
    });
  }
}
