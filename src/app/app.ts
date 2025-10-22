import { Component } from '@angular/core';
// Importa RouterLink y RouterOutlet
import { RouterLink, RouterOutlet } from '@angular/router'; 

@Component({
  selector: 'app-root',
  standalone: true,
  // Asegúrate de que los imports se vean así
  imports: [RouterOutlet, RouterLink], 
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent {
  title = 'yammie-app';
}