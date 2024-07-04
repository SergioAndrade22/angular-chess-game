import { Routes } from '@angular/router';
import { ChessBoardComponent } from './modules/chess-board/chess-board.component';
import { ComputerModeComponent } from './modules/computer-mode/computer-mode.component';

export const routes: Routes = [
    { path: 'pvp', component: ChessBoardComponent, title: 'Play against your friend' },
    { path: 'pve', component: ComputerModeComponent, title: 'Play against the PC' }
];
