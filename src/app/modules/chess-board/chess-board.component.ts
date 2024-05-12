import { Component } from '@angular/core';
import { ChessBoard } from '../../chess-logic/chess-board';
import { Color, FENChar, pieceImagePath } from '../../chess-logic/models';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chess-board',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chess-board.component.html',
  styleUrl: './chess-board.component.css'
})
export class ChessBoardComponent {
  public pieceImagePaths = pieceImagePath

  protected chessBoard = new ChessBoard()
  protected chessBoardView: (FENChar | null)[][] = this.chessBoard.chessBoardView
  protected get playerTurn(): Color { return this.chessBoard.playerTurn }

  public isSquareDark(x: number, y: number): boolean {
    return ChessBoard.isSquareDark(x, y)
  }
}
