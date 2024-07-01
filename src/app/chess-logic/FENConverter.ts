import { columns } from "../modules/chess-board/models";
import { Color, LastMove } from "./models";
import { King } from "./pieces/king";
import { Pawn } from "./pieces/pawn";
import { Piece } from "./pieces/piece";
import { Rook } from "./pieces/rook";

export class FENConverter {
    public convertBoardToFEN(
        board: (Piece|null)[][],
        playerTurn: Color,
        lastMove: LastMove | undefined,
        fiftyMoveRuleCounter: number,
        numberOfFullMoves: number,
    ): string {
        let FEN: string = '';
        for (let i = 7; i >= 0; i--) {
            let FENRow = '';
            let consecutiveEmptySquareCounter = 0;
            for (const piece of board[i]) {
                if (!piece){
                    consecutiveEmptySquareCounter += 1
                    continue
                }

                if (consecutiveEmptySquareCounter !== 0)
                    FENRow += String(consecutiveEmptySquareCounter)

                consecutiveEmptySquareCounter = 0
                FENRow += piece.FENChar
            }

            if (consecutiveEmptySquareCounter !== 0)
                FENRow += String(consecutiveEmptySquareCounter)

            FEN += (i === 0) ? FENRow : FENRow + '/'
        }

        const player = playerTurn === Color.White ? 'w' : 'b'
        FEN += " " + player
        FEN += " " + this.castlingAvailability(board)
        FEN += " " + this.enPassantPossibility(lastMove, playerTurn)
        FEN += " " + fiftyMoveRuleCounter * 2
        FEN += " " + numberOfFullMoves
        return FEN
    }

    private castlingAvailability(board: (Piece|null)[][]): string {
        const castlingPossibilities = (color: Color): string => {
            let castlingAvailability = ''
            const kingPositionX = color === Color.White ? 0 : 7
            const king = board[kingPositionX][4]

            if (king instanceof King && !king.hasMoved) {
                const rookPositionX = color === Color.White ? 0 : 7
                const kingSideRook = board[rookPositionX][7]
                const queenSideRook = board[rookPositionX][0]

                if (kingSideRook instanceof Rook && !kingSideRook.hasMoved) {
                    castlingAvailability += 'k'
                }

                if (queenSideRook instanceof Rook && !queenSideRook.hasMoved) {
                    castlingAvailability += 'q'
                }

                if (color === Color.White) {
                    castlingAvailability = castlingAvailability.toUpperCase()
                }
            }

            return castlingAvailability
        }
        const castlingAvailability = castlingPossibilities(Color.White) + castlingPossibilities(Color.Black)
        return castlingAvailability !== '' ? castlingAvailability : '-'
    }

    private enPassantPossibility(lastMove: LastMove | undefined, color: Color): string {
        if (!lastMove)
            return '-'

        const {piece, currX: newX, prevX, prevY} = lastMove

        if (piece instanceof Pawn && Math.abs(newX - prevX) === 2) {
            const row = color === Color.White ? 6 : 3
            return columns[prevY] + String(row)
        }
        return '-'
    }
}