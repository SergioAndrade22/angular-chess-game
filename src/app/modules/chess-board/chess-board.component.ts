import { Component, OnDestroy, OnInit } from '@angular/core';
import { ChessBoard } from '../../chess-logic/chess-board';
import { CheckState, Color, Coords, FENChar, LastMove, SafeSquares, pieceImagePath } from '../../chess-logic/models';
import { CommonModule } from '@angular/common';
import { SelectedSquare } from './models';
import { ChessBoardService } from './chess-board.service';
import { filter, fromEvent, Subscription, tap } from 'rxjs';

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
  public get gameOverMessage(): string | undefined { return this.chessBoard.gameOverMessage }

  private selectedSquare: SelectedSquare = { piece: null }
  private pieceSafeSquares: Coords[] = []
  private lastMove: LastMove | undefined = this.chessBoard.lastMove
  private checkState: CheckState = this.chessBoard.checkState

  // Properties necessary for pawn promotion
  public isPromotionActive: boolean = false
  private promotionCoords: Coords | null = null
  private promotedPiece: FENChar | null = null

  public flipMode = false

  constructor(protected chessBoardService: ChessBoardService) {}

  public promotionPieces(): FENChar[] { 
    return this.playerTurn === Color.White ? 
      [FENChar.WhiteKnight, FENChar.WhiteBishop, FENChar.WhiteRook, FENChar.WhiteQueen] :
      [FENChar.BlackKnight, FENChar.BlackBishop, FENChar.BlackRook, FENChar.BlackQueen]
  }

  public flipBoard(): void {
    this.flipMode = !this.flipMode
  }

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

  public isSquarePromotionSquare(x: number, y: number): boolean {
    if (!this.promotionCoords) return false
    return this.promotionCoords.x === x && this.promotionCoords.y === y
  }


  private demarkingPreviouslySelectedAndSafeSquares(): void {
    this.selectedSquare = { piece: null }
    this.pieceSafeSquares = []

    if (this.isPromotionActive) {
      this.isPromotionActive = false
      this.promotedPiece = null
      this.promotionCoords = null
    }
  }

  private selectingPiece(x: number, y: number): void {
    if (this.gameOverMessage !== undefined)
      return
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

    // pawn promotion
    const isPawnSelected: boolean = this.selectedSquare.piece === FENChar.WhitePawn || this.selectedSquare.piece === FENChar.BlackPawn
    const isPawnOnLastRank: boolean = isPawnSelected && (newX === 0 || newX === 7)
    const shouldOpenPromotionDialog: boolean = !this.isPromotionActive && isPawnOnLastRank

    if (shouldOpenPromotionDialog) {
      this.pieceSafeSquares = []
      this.isPromotionActive = true
      this.promotionCoords = { x: newX, y: newY }

      return // We do an early return here to wait for the user to select which piece to promote to
    }

    const {x: prevX, y: prevY} = this.selectedSquare
    this.updateBoard(prevX, prevY, newX, newY, this.promotedPiece)
  }

  protected updateBoard(prevX: number, prevY: number, newX: number, newY: number, promotedPiece: FENChar | null): void {
    this.chessBoard.move(prevX, prevY, newX, newY, promotedPiece)
    this.chessBoardView = this.chessBoard.chessBoardView
    this.checkState = this.chessBoard.checkState
    this.lastMove = this.chessBoard.lastMove
    this.demarkingPreviouslySelectedAndSafeSquares()
    this.chessBoardService.chessBoardState$.next(this.chessBoard.boardAsFEN);
  }

  public promotePiece(piece: FENChar): void {
    if (!this.promotionCoords || !this.selectedSquare.piece)
      return

    this.promotedPiece = piece
    const { x: newX, y: newY } = this.promotionCoords
    const { x: prevX, y: prevY } = this.selectedSquare
    this.updateBoard(prevX, prevY, newX, newY, this.promotedPiece)
  }

  public closePawnPromotionDialog(): void {
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
