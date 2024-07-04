import { HttpClient, HttpParams } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable, of, switchMap } from 'rxjs'
import { ChessMove, PCConfiguration, StockfishQueryParams, StockfishResponse } from './models'
import { Color, FENChar } from '../../chess-logic/models'

@Injectable({
  providedIn: 'root'
})
export class StockfishService {
  private readonly api: string = 'https://stockfish.online/api/s/v2.php'
  public pcConfiguration$ = new BehaviorSubject<PCConfiguration>({
    color: Color.Black,
    level: 1,
  })

  constructor(private http: HttpClient) { }

  public getBestMove(fen: string): Observable<ChessMove> {
    const queryParams: StockfishQueryParams = {
      fen,
      depth: this.pcConfiguration$.value.level,
    }
    let params = new HttpParams().appendAll(queryParams)

    return this.http.get<StockfishResponse>(this.api, { params }).pipe(
      switchMap((response) => {
        console.log(response)
        const bestMove: string = response.bestmove.split(" ")[1]
        return of(this.moveFromStockfishString(bestMove))
      })
    )
  }

  private moveFromStockfishString(move: string): ChessMove {
    const prevY: number = this.convertColumnLetterToYCoord(move[0])
    const prevX: number = Number(move[1]) - 1
    const newY: number = this.convertColumnLetterToYCoord(move[2])
    const newX: number = Number(move[3]) - 1
    const promotedPiece = this.promotedPiece(move[4])
    return { prevX, prevY, newX, newY, promotedPiece}
  }

  private promotedPiece(piece: string | undefined): FENChar|null {
    if (!piece)
      return null
    const computerColor: Color = this.pcConfiguration$.value.color
    if (piece.toLowerCase() === 'n') return computerColor === Color.White ? FENChar.WhiteKnight :  FENChar.BlackKnight
    if (piece.toLowerCase() === 'b') return computerColor === Color.White ? FENChar.WhiteBishop :  FENChar.BlackBishop
    if (piece.toLowerCase() === 'r') return computerColor === Color.White ? FENChar.WhiteRook :  FENChar.BlackRook
    return computerColor === Color.White ? FENChar.WhiteQueen :  FENChar.BlackQueen
  }

  private convertColumnLetterToYCoord(letter: string): number {
    return letter.charCodeAt(0) - 'a'.charCodeAt(0)
  }
}
