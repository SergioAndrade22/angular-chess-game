import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { StockfishService } from '../computer-mode/stockfish.service';
import { Color } from '../../chess-logic/models';
import { Router } from '@angular/router';
import { stockfishDepths } from '../computer-mode/models';

@Component({
  selector: 'app-play-against-computer-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, CommonModule],
  templateUrl: './play-against-computer-dialog.component.html',
  styleUrl: './play-against-computer-dialog.component.css'
})
export class PlayAgainstComputerDialogComponent {
  public stockfishLevels: readonly number[] = [1, 2, 3, 4, 5]
  public stockfishLevel: number = this.stockfishLevels[0]

  constructor(
    private stockfishService: StockfishService,
    private dialog: MatDialog,
    private router: Router,
  ) {}

  selectStockfishLevel(level: number): void {
    this.stockfishLevel = level
  }

  selectSide(player: 'w' | 'b'): void {
    this.dialog.closeAll()
    this.stockfishService.pcConfiguration$.next({
      color: player === 'w' ? Color.Black : Color.White,
      level: stockfishDepths[this.stockfishLevel]
    })
    this.router.navigate(['pve'])
  }
  
  closeDialog(): void {
    this.router.navigate(['pvp'])
  }
}
