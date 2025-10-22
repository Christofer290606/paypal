import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-bienvenida',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bienvenida.html',
  styleUrls: ['./bienvenida.css']
})
export class BienvenidaComponent implements OnInit {

  constructor(private router: Router) {}

  ngOnInit() {
    // Redirige después de 3 segundos
    setTimeout(() => {
      this.router.navigate(['/pan']); // '/pan' es tu catálogo
    }, 3000);
  }
}