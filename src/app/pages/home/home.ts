import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router'; // Importa RouterLink

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink], // Añade RouterLink
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent {

}
