import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ChessBoardComponent } from "./modules/chess-board/chess-board.component";
import { NavMenuComponent } from './modules/nav-menu/nav-menu.component';

@Component({
    selector: 'app-root',
    standalone: true,
    templateUrl: './app.component.html',
    styleUrl: './app.component.css',
    imports: [RouterOutlet, ChessBoardComponent, NavMenuComponent]
})
export class AppComponent {
  title = 'angular-chess';
}
