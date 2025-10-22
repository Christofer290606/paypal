import { Component, OnInit } from '@angular/core';
// Importa RouterLink y RouterOutlet
import { RouterLink, RouterOutlet } from '@angular/router'; 
declare var AOS: any;

@Component({
  selector: 'app-root',
  standalone: true,
  // Asegúrate de que los imports se vean así
  imports: [RouterOutlet], 
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent implements OnInit {
  title = 'yammie-app';

  ngOnInit() {
    AOS.init(); 
  }
}