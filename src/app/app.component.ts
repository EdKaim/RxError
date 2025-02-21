import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NumberService } from './number.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [CommonModule],
  styleUrl: './app.component.css',
})
export class AppComponent {
  #numberService = inject(NumberService);
  numberUx$ = this.#numberService.watchNumber$();
  numberSquaredUx$ = this.#numberService.watchSquared$();
  numberHalvedSquareUx$ = this.#numberService.watchHalvedSquareAsString$();

  numberConsole$ = this.#numberService
    .watchNumber$()
    .pipe(takeUntilDestroyed())
    .subscribe({
      next: (number) => console.log(number),
      error: (error) => console.log(error.message),
    });
}
