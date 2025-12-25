import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit, OnDestroy {
  searchTerm: string = '';
  showLoginDropdown = false;

  constructor(
    private router: Router,
    private productService: ProductService
  ) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.login-dropdown')) {
      this.closeLoginDropdown();
    }
  }

  ngOnInit() {
    // Check for search query in URL
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    if (searchParam) {
      this.searchTerm = searchParam;
    }
  }

  ngOnDestroy() {}

  search() {
    if (this.searchTerm.trim()) {
      // Navigate to customer home with search query if logged in, otherwise to login
      const user = localStorage.getItem('currentUser');
      if (user) {
        this.router.navigate(['/customer/home'], { 
          queryParams: { search: this.searchTerm.trim() } 
        });
      } else {
        this.router.navigate(['/login'], { 
          queryParams: { search: this.searchTerm.trim() } 
        });
      }
    }
  }

  onSearchKeyPress(event: Event) {
    const keyboardEvent = event as KeyboardEvent;
    if (keyboardEvent.key === 'Enter') {
      this.search();
    }
  }

  toggleLoginDropdown(event?: MouseEvent) {
    if (event) {
      event.stopPropagation();
    }
    this.showLoginDropdown = !this.showLoginDropdown;
  }

  closeLoginDropdown() {
    this.showLoginDropdown = false;
  }
}
