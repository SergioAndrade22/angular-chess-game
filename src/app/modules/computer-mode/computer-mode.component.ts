import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ChessBoardComponent } from '../chess-board/chess-board.component';
import { CommonModule } from '@angular/common';
import { StockfishService } from './stockfish.service';
import { firstValueFrom, Subscription } from 'rxjs';
import { ChessBoardService } from '../chess-board/chess-board.service';
import { Color } from '../../chess-logic/models';

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
    const pcConfiguration$: Subscription = this.stockfishService.pcConfiguration$.subscribe({
      next: (pcConfiguration) => {
        if (pcConfiguration.color === Color.White)
          this.flipBoard()
      }
    })
    const chessBoardStateSubscription$: Subscription = this.chessBoardService.chessBoardState$.subscribe({
      next: async (fen: string) => {
        if (this.chessBoard.isGameOver) {
          chessBoardStateSubscription$.unsubscribe()
          return
        }
        const player: Color = fen.split(" ")[1] === "w" ? Color.White : Color.Black
        if (player !== this.stockfishService.pcConfiguration$.value.color) // Not computer move
          return

        const { prevX, prevY, newX, newY, promotedPiece } = await firstValueFrom(this.stockfishService.getBestMove(fen))
        this.updateBoard(prevX, prevY, newX, newY, promotedPiece)
      }
    })

    this.subscriptions$.add(chessBoardStateSubscription$)
    this.subscriptions$.add(pcConfiguration$)
  }

  ngOnDestroy(): void {
    this.subscriptions$.unsubscribe()
  }
}
