import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ChessBoardComponent } from '../chess-board/chess-board.component';
import { CommonModule } from '@angular/common';
import { StockfishService } from './stockfish.service';
import { firstValueFrom, Subscription } from 'rxjs';
import { ChessBoardService } from '../chess-board/chess-board.service';

@Component({
  selector: 'app-computer-mode',
  standalone: true,
  imports: [CommonModule],
  templateUrl: '../chess-board/chess-board.component.html',
  styleUrl: '../chess-board/chess-board.component.css'
})
export class ComputerModeComponent extends ChessBoardComponent implements OnInit, OnDestroy {
  private subscriptions$ = new Subscription()

  constructor(private stockfishService: StockfishService) {
    super(inject(ChessBoardService));
  }

  public ngOnInit(): void {
    const chessBoardStateSubscription$: Subscription = this.chessBoardService.chessBoardState$.subscribe({
      next: async (fen: string) => {
        const player: string = fen.split(" ")[1]
        if (player === 'w')
          return

        const { prevX, prevY, newX, newY, promotedPiece } = await firstValueFrom(this.stockfishService.getBestMove(fen))
        this.updateBoard(prevX, prevY, newX, newY, promotedPiece)
      }
    })

    this.subscriptions$.add(chessBoardStateSubscription$)
  }

  ngOnDestroy(): void {
    this.subscriptions$.unsubscribe()
  }
}
