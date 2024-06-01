import { CheckState, Color, Coords, FENChar, LastMove, SafeSquares } from "./models";
import { Bishop } from "./pieces/bishop";
import { King } from "./pieces/king";
import { Knight } from "./pieces/knight";
import { Pawn } from "./pieces/pawn";
import { Piece } from "./pieces/piece";
import { Queen } from "./pieces/queen";
import { Rook } from "./pieces/rook";

export class ChessBoard {
    private chessBoard: (Piece | null)[][]
    private readonly chessBoardSize: number = 8
    private _playerTurn = Color.White
    private _safeSquares: SafeSquares
    private _lastMove?: LastMove
    private _checkState: CheckState = { isInCheck: false }

    constructor() {
        this.chessBoard = [
            [
                new Rook(Color.White), new Knight(Color.White), new Bishop(Color.White), new Queen(Color.White),
                new King(Color.White), new Bishop(Color.White), new Knight(Color.White), new Rook(Color.White),
            ],
            [
                new Pawn(Color.White), new Pawn(Color.White), new Pawn(Color.White), new Pawn(Color.White), 
                new Pawn(Color.White), new Pawn(Color.White), new Pawn(Color.White), new Pawn(Color.White),
            ],
            [
                null, null, null, null,
                null, null, null, null,
            ],
            [
                null, null, null, null,
                null, null, null, null,
            ],
            [
                null, null, null, null,
                null, null, null, null,
            ],
            [
                null, null, null, null,
                null, null, null, null,
            ],
            [
                new Pawn(Color.Black), new Pawn(Color.Black), new Pawn(Color.Black), new Pawn(Color.Black),
                new Pawn(Color.Black), new Pawn(Color.Black), new Pawn(Color.Black), new Pawn(Color.Black),
            ],
            [
                new Rook(Color.Black), new Knight(Color.Black), new Bishop(Color.Black), new Queen(Color.Black),
                new King(Color.Black), new Bishop(Color.Black), new Knight(Color.Black), new Rook(Color.Black),
            ],
        ];

        this._safeSquares = this.findSafeSquare();
    }

    public get playerTurn(): Color {
        return this._playerTurn
    }

    public get chessBoardView(): (FENChar | null)[][] {
        return this.chessBoard.map(row => row.map(piece => piece ? piece.FENChar : null))
    }

    public get safeSquares(): SafeSquares {
        return this._safeSquares
    }

    public get checkState(): CheckState {
        return this._checkState
    }

    public get lastMove(): LastMove | undefined {
        return this._lastMove
    }

    public static isSquareDark(x: number, y: number): boolean {
        return (x % 2 === 0 && y % 2 === 0) || (x % 2 !== 0 && y % 2 !== 0)
    }

    private areCoordsValid(x: number, y: number): boolean {
        return x >= 0 && x < this.chessBoardSize && y >= 0 && y < this.chessBoardSize
    }

    public isInCheck(playerTurn: Color, checkingCurrentPosition: boolean): boolean {
        for(let x = 0; x < this.chessBoardSize; x++) {
            for(let y = 0; y < this.chessBoardSize; y++) {
                const piece: Piece|null = this.chessBoard[x][y]
                if (!piece || piece.color === playerTurn) {
                    continue
                }

                for (const {x: dx, y: dy} of piece.directions) {
                    let newX: number = x + dx
                    let newY: number = y + dy

                    if (!this.areCoordsValid(newX, newY)) {
                        continue
                    }

                    if (piece instanceof Pawn || piece instanceof King || piece instanceof Knight) {
                        if (piece instanceof Pawn && dy === 0) continue // as Pawns can only attack diagonally

                        const attackedPiece: Piece|null = this.chessBoard[newX][newY]
                        if (attackedPiece instanceof King && attackedPiece.color === playerTurn) {
                            if (checkingCurrentPosition)
                                this._checkState = {
                                    isInCheck: true,
                                    x: newX,
                                    y: newY
                                }

                            return true
                        }
                    }
                    else { // Queen, Rook, Bishop
                        while(this.areCoordsValid(newX, newY)) {
                            const attackedPiece: Piece|null = this.chessBoard[newX][newY]
                            if (attackedPiece instanceof King && attackedPiece.color === playerTurn) {
                                if (checkingCurrentPosition)
                                    this._checkState = {
                                        isInCheck: true,
                                        x: newX,
                                        y: newY
                                    }
    
                                return true
                            }

                            // We found another piece along the axis we are checking so we can not keep going on this direction
                            if (attackedPiece !== null) {
                                break
                            }
                            // updating the new coordinates to keep traversing along the same direction
                            newX += dx
                            newY += dy
                        }
                    }
                }
            }
        }
        if (checkingCurrentPosition)
            this._checkState = { isInCheck: false }
        return false
    }

    private isPositionSafeAfterMove(prevX: number, prevY: number, newX: number, newY: number): boolean {
        const piece: Piece | null = this.chessBoard[prevX][prevY]
        if (!piece)
            return false

        const newPiece: Piece|null = this.chessBoard[newX][newY]
        // Can't place your own piece on top of another one belonging to you
        if (newPiece && newPiece.color === piece.color) {
            return false
        }

        // Simulate new position
        this.chessBoard[prevX][prevY] = null
        this.chessBoard[newX][newY] = piece

        const isPositionSafe: boolean = !this.isInCheck(piece.color, false)

        // Restore old position
        this.chessBoard[prevX][prevY] = piece
        this.chessBoard[newX][newY] = newPiece

        return isPositionSafe
    }

    private findSafeSquare(): SafeSquares {
        const safeSquares: SafeSquares = new Map<string, Coords[]>();

        for(let x = 0; x < this.chessBoardSize; x++) {
            for(let y = 0; y < this.chessBoardSize; y++) {
                const piece: Piece|null = this.chessBoard[x][y]
                if (!piece || piece.color !== this._playerTurn) {
                    continue
                }

                const pieceSafeSquares: Coords[] = []

                for (const {x: dx, y: dy} of piece.directions) {
                    let newX: number = x + dx
                    let newY: number = y + dy

                    if (!this.areCoordsValid(newX, newY)) {
                        continue
                    }

                    let newPiece: Piece|null = this.chessBoard[newX][newY]

                    if (newPiece && newPiece.color === piece.color) {
                        continue
                    }

                    // Need to restrict Pawn movement in certain directions
                    if (piece instanceof Pawn) {
                        // Can't move if there is a piece in the way while moving 2 places
                        if (dx === 2 || dx === -2) {
                            if (newPiece) continue
                            if (this.chessBoard[newX + (dx === 2 ? -1 : 1)][newY]) continue
                        }
                        // Can't move if there is a piece in the way while moving 1 place
                        if ((dx === 1 || dx === -1) && dy === 0 && newPiece) continue
                        // Can't move diagonally if there is no piece or the piece is of the same color
                        if ((dy === 1 || dy === -1) && (!newPiece || piece.color === newPiece.color)) continue
                    }
                    if (piece instanceof Pawn || piece instanceof King || piece instanceof Knight) {
                        if (this.isPositionSafeAfterMove(x, y, newX, newY)) {
                            pieceSafeSquares.push({x: newX, y: newY})
                        }
                    } else {
                        while(this.areCoordsValid(newX, newY)) {
                            newPiece = this.chessBoard[newX][newY]
                            if (newPiece && newPiece.color === piece.color) {
                                break
                            }
                            if (this.isPositionSafeAfterMove(x, y, newX, newY)) {
                                pieceSafeSquares.push({x: newX, y: newY})
                            }
                            if (newPiece !== null) break
                            newX += dx
                            newY += dy
                        }
                    }
                }

                if (piece instanceof King) {
                    if (this.canCastle(piece, true)) // king side
                        pieceSafeSquares.push({x, y: 6})
                    if (this.canCastle(piece, false)) // queen side
                        pieceSafeSquares.push({x, y: 2})
                } else if (piece instanceof Pawn && this.canCaptureEnPassant(piece, x, y)) {
                    pieceSafeSquares.push({ x: x + (piece.color === Color.White ? 1 : -1), y: this._lastMove!.prevY })
                }

                if (pieceSafeSquares.length) {
                    safeSquares.set(x + "," + y, pieceSafeSquares)
                }
            }
        }

        return safeSquares
    }

    private canCaptureEnPassant(pawn: Pawn, pawnX: number, pawnY: number): boolean {
        if (!this._lastMove) return false
        const { piece, prevX, currX, currY } = this._lastMove

        if (
            !(piece instanceof Pawn) || // Only pawns can capture en passant
            pawn.color !== this._playerTurn || // The last pawn moved doesn't belong to this player
            Math.abs(currX - prevX) !== 2 || // En passant condition 1: the enemy moved his pawn 2 squares
            pawnX !== currX || // En passant condition 2: both the enemy pawn moved on his last turn and the current player one are on the same row
            Math.abs(pawnY - currY) !== 1 // En passant condition 3: both pawns are adjacent to each other
        ) return false
        
        const pawnNewPositionX: number = pawnX + (pawn.color === Color.White ? 1 : -1)
        const pawnNewPositionY: number = currY

        this.chessBoard[currX][currY] = null
        const isPositionSafe: boolean = this.isPositionSafeAfterMove(pawnX, pawnY, pawnNewPositionX, pawnNewPositionY)
        this.chessBoard[currX][currY] = piece

        return isPositionSafe
    }

    public canCastle(king: King, kingSideCastle: boolean): boolean {
        if (king.hasMoved) return false

        const kingPositionX: number = king.color === Color.White ? 0 : 7
        const kingPositionY: number = 4
        const rookPositionX: number = kingPositionX
        const rookPositionY: number = kingSideCastle ? 7 : 0

        const rook: Piece|null = this.chessBoard[rookPositionX][rookPositionY]

        if (!rook || !(rook instanceof Rook) || rook.hasMoved || this._checkState.isInCheck)
            return false

        const firstNextKingPositionY: number = kingPositionY + (kingSideCastle ? 1 : -1)
        const secondNextKingPositionY: number = kingPositionY + (kingSideCastle ? 2 : -2)

        // King side castle
        if (this.chessBoard[kingPositionX][firstNextKingPositionY] || this.chessBoard[kingPositionX][secondNextKingPositionY])
            return false

        if (!kingSideCastle && this.chessBoard[kingPositionX][1])
            return false

        return this.isPositionSafeAfterMove(kingPositionX, kingPositionY, kingPositionX, firstNextKingPositionY) &&
            this.isPositionSafeAfterMove(kingPositionX, kingPositionY, kingPositionX, secondNextKingPositionY)
    }

    public move(prevX: number, prevY: number, newX: number, newY: number, promotedPieceType: FENChar | null): void {
        if (!this.areCoordsValid(prevX, prevY) || !this.areCoordsValid(newX, newY)) {
            return
        }
        const piece: Piece|null = this.chessBoard[prevX][prevY]
        if (!piece || piece.color !== this._playerTurn) {
            return
        }

        const pieceSafeSquares: Coords[]|undefined = this._safeSquares.get(prevX + "," + prevY)
        if (!pieceSafeSquares || !pieceSafeSquares.find(square => square.x === newX && square.y === newY)) {
            throw new Error("Square not valid")
        }

        if ((piece instanceof Pawn || piece instanceof King || piece instanceof Rook) && !piece.hasMoved) {
            console.log(`Reached with ${piece.color} piece`)
            piece.hasMoved = true
        }

        this.handlingSpecialMoves(piece, prevX, prevY, newX, newY)
        // Updated Board
        if (promotedPieceType) {
            this.chessBoard[newX][newY] = this.promotedPiece(promotedPieceType)
        } else {
            this.chessBoard[newX][newY] = piece
        }

        this.chessBoard[prevX][prevY] = null

        this._lastMove = {
            prevX,
            prevY,
            currX: newX,
            currY: newY,
            piece,
        }
        this._playerTurn = this._playerTurn === Color.White ? Color.Black : Color.White
        this.isInCheck(this._playerTurn, true)
        this._safeSquares = this.findSafeSquare()
    }

    private handlingSpecialMoves(piece: Piece, prevX: number, prevY: number, newX: number, newY: number): void {
        if (piece instanceof King && Math.abs(newY- prevY) === 2) { // Castle happened
            const rookPositionX: number = prevX
            const rookPositionY: number = newY > prevY ? 7 : 0 // newY > prevY -> king side castle
            const rook = this.chessBoard[rookPositionX][rookPositionY] as Rook
            const rookNewPositionY: number = newY > prevY ? 5 : 3

            this.chessBoard[rookPositionX][rookPositionY] = null
            this.chessBoard[rookPositionX][rookNewPositionY] = rook
            rook.hasMoved = true
        } else if ( // En passant happened
            piece instanceof Pawn &&
            this._lastMove !== undefined &&
            this._lastMove.piece instanceof Pawn &&
            Math.abs(this._lastMove.currX - this._lastMove.prevX) === 2 &&
            prevX === this._lastMove.currX &&
            newY === this._lastMove.currY
        ) {
            this.chessBoard[this._lastMove.currX][this._lastMove.currY] = null
        }
    }

    private promotedPiece(promotedPieceType: FENChar): Knight | Bishop | Rook | Queen {
        if (promotedPieceType === FENChar.BlackKnight || promotedPieceType === FENChar.WhiteKnight) {
            return new Knight(this._playerTurn)
        }

        if (promotedPieceType === FENChar.BlackBishop || promotedPieceType === FENChar.WhiteBishop) {
            return new Bishop(this._playerTurn)
        }

        if (promotedPieceType === FENChar.BlackRook || promotedPieceType === FENChar.WhiteRook) {
            return new Rook(this._playerTurn)
        }

        return new Queen(this._playerTurn)
    }
}