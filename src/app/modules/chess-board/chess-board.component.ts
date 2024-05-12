import { Component } from '@angular/core';
import { ChessBoard } from '../../chess-logic/chess-board';
import { Color, Coords, FENChar, SafeSquares, pieceImagePath } from '../../chess-logic/models';
import { CommonModule } from '@angular/common';
import { SelectedSquare } from './models';

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
  public chessBoardView: (FENChar | null)[][] = this.chessBoard.chessBoardView
  public get playerTurn(): Color { return this.chessBoard.playerTurn }
  public get safeSquares(): SafeSquares { return this.chessBoard.safeSquares }
  private selectedSquare: SelectedSquare = { piece: null }
  private pieceSafeSquare: Coords[] = []

  public isSquareDark(x: number, y: number): boolean {
    return ChessBoard.isSquareDark(x, y)
  }

  public isSquareSelected(x: number, y: number): boolean {
    return this.selectedSquare.piece ? this.selectedSquare.x === x && this.selectedSquare.y === y : false
  }

  public isSquareSafeForSelectedPiece(x: number, y: number): boolean {
    return this.pieceSafeSquare.some(square => square.x === x && square.y === y)
  }

  public selectingPiece(x: number, y: number): void {
    const piece: FENChar | null = this.chessBoardView[x][y]
    if (!piece) return
    if (this.isWrongPieceSelected(piece)) return

    this.selectedSquare = { piece, x, y }
    this.pieceSafeSquare = this.safeSquares.get(x + "," + y) || []
  }

  public isWrongPieceSelected(piece: FENChar): boolean {
    const isWhitePieceSelected: boolean = piece === piece.toUpperCase()
    return (isWhitePieceSelected && this.playerTurn === Color.Black) || 
      (!isWhitePieceSelected && this.playerTurn === Color.White)
  }
}
