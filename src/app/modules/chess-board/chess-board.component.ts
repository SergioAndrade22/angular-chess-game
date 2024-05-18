import { Component } from '@angular/core';
import { ChessBoard } from '../../chess-logic/chess-board';
import { CheckState, Color, Coords, FENChar, LastMove, SafeSquares, pieceImagePath } from '../../chess-logic/models';
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
  private pieceSafeSquares: Coords[] = []
  private lastMove: LastMove | undefined = this.chessBoard.lastMove
  private checkState: CheckState = this.chessBoard.checkState

  public isSquareDark(x: number, y: number): boolean {
    return ChessBoard.isSquareDark(x, y)
  }

  public isSquareSelected(x: number, y: number): boolean {
    return this.selectedSquare.piece ? this.selectedSquare.x === x && this.selectedSquare.y === y : false
  }

  public isSquareSafeForSelectedPiece(x: number, y: number): boolean {
    return this.pieceSafeSquares.some(square => square.x === x && square.y === y)
  }

  public isSquareLastMove(x: number, y: number): boolean {
    if (!this.lastMove) return false

    const { prevX, prevY, currX, currY } = this.lastMove
    return prevX === x && prevY === y || currX === x && currY === y
  }

  public isSquareInCheck(x: number, y: number): boolean {
    return this.checkState.isInCheck && this.checkState.x === x && this.checkState.y === y
  }

  private demarkingPreviouslySelectedAndSafeSquares(): void {
    this.selectedSquare = { piece: null }
    this.pieceSafeSquares = []
  }

  private selectingPiece(x: number, y: number): void {
    const piece: FENChar | null = this.chessBoardView[x][y]
    if (!piece) return
    if (this.isWrongPieceSelected(piece)) return

    const isSameSquareClicked: boolean = !!this.selectedSquare.piece && this.selectedSquare.x === x && this.selectedSquare.y === y
    if (isSameSquareClicked) {
      this.demarkingPreviouslySelectedAndSafeSquares()
      return
    }

    this.selectedSquare = { piece, x, y }
    this.pieceSafeSquares = this.safeSquares.get(x + "," + y) || []
  }

  private placingPiece(newX: number, newY: number): void {
    if (!this.selectedSquare.piece) return
    if (!this.isSquareSafeForSelectedPiece(newX, newY)) return

    const {x: prevX, y: prevY} = this.selectedSquare
    this.chessBoard.move(prevX, prevY, newX, newY)
    this.chessBoardView = this.chessBoard.chessBoardView
    this.checkState = this.chessBoard.checkState
    this.lastMove = this.chessBoard.lastMove
    this.demarkingPreviouslySelectedAndSafeSquares()
  }

  public move(x: number, y: number): void {
    this.selectingPiece(x, y)
    this.placingPiece(x, y)
  }

  public isWrongPieceSelected(piece: FENChar): boolean {
    const isWhitePieceSelected: boolean = piece === piece.toUpperCase()
    return (isWhitePieceSelected && this.playerTurn === Color.Black) || 
      (!isWhitePieceSelected && this.playerTurn === Color.White)
  }
}
