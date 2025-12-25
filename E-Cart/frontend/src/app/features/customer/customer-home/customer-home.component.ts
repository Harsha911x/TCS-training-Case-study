// customer-home.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { Product, ProductCategory, ProductHighlights } from '../../../core/models/product.model';
import { Page } from '../../../core/models/page.model';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { ImageStorageService } from '../../../core/services/image-storage.service';
import { Subscription } from 'rxjs';

interface CustomerHeroSlide {
  image: string;
  title: string;
  description: string;
  alt: string;
  productId?: string;
  isDummy?: boolean;
}

@Component({
  selector: 'app-customer-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NavbarComponent],
  template: `
    <div class="customer-home-container">
      <app-navbar [role]="'customer'" [userName]="customerName" [cartCount]="cartItemCount" (signOut)="logout()">
        <div search class="header-search">
          <input type="text" [(ngModel)]="searchName" placeholder="Search products..."
                 class="search-input" (keyup.enter)="search()">
          <button (click)="search()" class="search-btn">🔍</button>
        </div>
      </app-navbar>

      <div class="hero-carousel" (mouseenter)="pauseCarousel()" (mouseleave)="resumeCarousel()">
        <div class="carousel-container">
          <div class="carousel-slides">
            <div class="carousel-item" *ngFor="let slide of carouselSlides; let i = index" [class.active]="i === currentSlide">
              <img [src]="slide.image" [alt]="slide.alt" class="banner-img">
              <div class="carousel-caption">
                <h2>{{slide.title}}</h2>
                <p>{{slide.description}}</p>
              </div>
            </div>
          </div>

          <button class="carousel-control prev" (click)="previousSlide()" aria-label="Previous">
            <span>‹</span>
          </button>
          <button class="carousel-control next" (click)="nextSlide()" aria-label="Next">
            <span>›</span>
          </button>
        </div>
      </div>

      <div class="container">
        <h3 class="mb-3 text-center mt-4">{{ searchName ? 'Search Results' : 'Featured Products' }}</h3>

        <div *ngIf="searchName && products?.content?.length === 0" class="no-results">
          <p>No products found for "{{ searchName }}"</p>
          <button (click)="clearSearch()" class="btn-clear-search">Clear Search</button>
        </div>

        <div class="products-grid">
          <div *ngFor="let product of productList" class="product-card">
            <div class="product-image">
              <img [src]="resolveProductImage(product)" [alt]="product.name"
                   (error)="onImageError($event, product.productId, product.name)"
                   (load)="onImageLoad($event, product.productId)">
            </div>
            <div class="product-info">
              <h3>{{product.name}}</h3>
              <p class="product-brand">{{product.category}}</p>
              <p class="product-description">{{product.description}}</p>
              <div class="product-footer">
                <span class="product-price">{{ '₹' + product.price }}</span>
                <!-- default quantity = 1 -->
                <button class="btn btn-primary" (click)="addToCart(product.name, product.productId, 1)">Add to Cart</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="container" *ngIf="newArrivalProducts?.length">
        <h3 class="mb-3 text-center mt-4">New Arrivals For You</h3>
        <div class="products-grid slim">
          <div *ngFor="let product of newArrivalProducts" class="product-card">
            <div class="product-image">
              <img [src]="resolveProductImage(product)" [alt]="product.name"
                   (error)="onImageError($event, product.productId, product.name)"
                   (load)="onImageLoad($event, product.productId)">
            </div>
            <div class="product-info">
              <h3>{{product.name}}</h3>
              <p class="product-brand">{{product.category}}</p>
              <p class="product-description">{{product.description}}</p>
              <div class="product-footer">
                <span class="product-price">{{ '₹' + product.price }}</span>
                <button class="btn btn-secondary" [disabled]="!product.productId" (click)="addToCart(product.name, product.productId, 1)">Add</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer class="footer">
        <div class="footer-content">
          <div class="footer-section about">
            <h4>About Us</h4>
            <p>
              E-Cart is your one-stop online store offering top-quality products at unbeatable prices.
              We aim to provide a seamless shopping experience with trusted brands and secure payments.
            </p>
          </div>
          <div class="footer-section services">
            <h4>Our Services</h4>
            <ul>
              <li>Fast & Secure Delivery</li>
              <li>Customer Support 24/7</li>
              <li>Easy Returns & Refunds</li>
              <li>Exclusive Member Discounts</li>
            </ul>
          </div>
          <div class="footer-section contact">
            <h4>Contact Us</h4>
            <p>Email: support&#64;ecart.com</p>
            <p>Phone: +91 98765 43210</p>
            <p>Address: 123 E-Cart Street, Mumbai, India</p>
          </div>
        </div>
        <div class="footer-bottom">
          <p>© {{currentYear}} E-Cart. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    /* CSS kept unchanged for brevity — copy your existing styles here */
    .customer-home-container { min-height: 100vh; background: #EAEDED; }
    /* ... rest of CSS from your file ... */
    /* (kept the same CSS from your original file) */
    .customer-home-container { min-height: 100vh; background: #EAEDED; }
    .header-search { flex: 1; max-width: 600px; display: flex; gap: 0; }
    .search-input { flex: 1; padding: 10px 15px; border: none; border-radius: 4px 0 0 4px; font-size: 14px; }
    .search-btn { padding: 10px 20px; background: #febd69; border: none; border-radius: 0 4px 4px 0; cursor: pointer; font-size: 18px; }
    .hero-carousel { margin-bottom: 30px; position: relative; }
    .carousel-container { position: relative; overflow: hidden; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
    .carousel-slides { display: flex; transition: transform 0.5s ease-in-out; }
    .carousel-item { min-width: 100%; position: relative; }
    .banner-img { width: 100%; height: 350px; object-fit: cover; display: block; }
    .carousel-caption { position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); text-align: center; }
    .carousel-caption h2 { font-weight: bold; background: rgba(0,0,0,0.5); padding: 10px 20px; border-radius: 5px; color: white; margin-bottom: 10px; }
    .carousel-caption p { background: rgba(0,0,0,0.5); padding: 5px 15px; border-radius: 5px; color: white; }
    .carousel-control { position: absolute; top: 50%; transform: translateY(-50%); background: rgba(0,0,0,0.5); border: none; color: white; font-size: 30px; width: 50px; height: 50px; border-radius: 50%; cursor: pointer; z-index: 10; display: flex; align-items: center; justify-content: center; }
    .carousel-control:hover { background: rgba(0,0,0,0.7); }
    .carousel-control.prev { left: 20px; }
    .carousel-control.next { right: 20px; }
    .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
    .mb-3 { margin-bottom: 1rem; }
    .mt-4 { margin-top: 1.5rem; }
    .text-center { text-align: center; }
    .products-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 40px; }
    .products-grid.slim { grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
    .product-card { border: 1px solid #ddd; border-radius: 10px; padding: 10px; transition: transform 0.2s ease, box-shadow 0.2s ease; background-color: white; display: flex; flex-direction: column; }
    .product-card:hover { transform: translateY(-5px); box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
    .product-image { position: relative; width: 100%; height: 180px; overflow: hidden; border-radius: 8px; background: #f5f5f5; display: flex; align-items: center; justify-content: center; }
    .product-image img { width: 100%; height: 100%; object-fit: cover; }
    .product-image-alt { padding: 20px; text-align: center; color: #767676; font-size: 14px; }
    .product-info { margin-top: 10px; display: flex; flex-direction: column; flex-grow: 1; }
    .product-info h3 { font-size: 16px; font-weight: 500; margin-bottom: 5px; color: #111; }
    .product-brand { font-size: 0.9rem; color: #666; margin-bottom: 5px; }
    .product-description { font-size: 0.9rem; flex-grow: 1; margin-bottom: 10px; color: #555; }
    .product-footer { display: flex; justify-content: space-between; align-items: center; margin-top: auto; }
    .product-price { font-size: 1.2rem; font-weight: 600; color: #e53935; }
    .btn { padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; transition: all 0.2s; }
    .btn-primary { background-color: #007bff; color: white; }
    .btn-primary:hover { background-color: #0056b3; }
    .btn-secondary { background-color: #131921; color: #fff; }
    .btn-secondary:hover { background-color: #0b1118; }
    .btn-secondary:disabled { background-color: #d5d5d5; color: #6c6c6c; cursor: not-allowed; }
    .footer { background-color: #131921; color: #f1f1f1; padding: 40px 0 20px 0; margin-top: 40px; font-size: 14px; }
    .footer-content { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 30px; max-width: 1200px; margin: 0 auto; padding: 0 20px; }
    .footer-section h4 { color: #ff9900; margin-bottom: 15px; font-size: 18px; }
    .footer-section p { line-height: 1.6; }
    .footer-section ul { list-style: none; padding: 0; margin: 0; }
    .footer-section ul li { margin-bottom: 8px; color: #ddd; }
    .footer-section ul li::before { content: "• "; color: #ff9900; }
    .footer-bottom { text-align: center; border-top: 1px solid rgba(255,255,255,0.2); margin-top: 30px; padding-top: 15px; font-size: 13px; color: #ccc; }
    .no-results {
      text-align: center;
      padding: 40px 20px;
      background: white;
      border-radius: 8px;
      margin: 20px 0;
    }
    .no-results p {
      font-size: 18px;
      color: #666;
      margin-bottom: 20px;
    }
    .btn-clear-search {
      padding: 10px 20px;
      background: #FF9900;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      transition: all 0.2s;
    }
    .btn-clear-search:hover {
      background: #FFB84D;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(255, 153, 0, 0.3);
    }
    @media (max-width: 768px) {
      .products-grid { grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px; }
      .footer-content { grid-template-columns: 1fr; text-align: center; }
      .banner-img { height: 250px; }
    }
  
  `]
})
export class CustomerHomeComponent implements OnInit, OnDestroy {
  products: Page<Product> | null = null;
  featuredProducts: Product[] = [];
  newArrivalProducts: Product[] = [];
  searchProductId = '';
  searchName = '';
  selectedCategory = '';
  categories = Object.values(ProductCategory);
  customerName = '';
  cartItemCount = 0;
  currentPage = 0;
  pageSize = 12;
  currentYear = new Date().getFullYear();
  currentSlide = 0;
  carouselInterval: ReturnType<typeof setInterval> | null = null;
  carouselSlides: CustomerHeroSlide[] = [];

  private readonly fallbackCarouselSlides: CustomerHeroSlide[] = [
    { image: 'assets/products/bg.jpg', title: 'Big Deals Week', description: 'Up to 60% off electronics & accessories', alt: 'Electronics deals', isDummy: true },
    { image: 'assets/products/bg20.jpg', title: 'Style Refresh', description: 'Handpicked fashion picks from top brands', alt: 'Fashion deals', isDummy: true },
    { image: 'assets/products/bg5.jpg', title: 'Gear Up & Go', description: 'Fitness must-haves to power your routine', alt: 'Fitness essentials', isDummy: true }
  ];
  private highlightFeaturedLocked = false;
  private subs = new Subscription();

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private imageStorageService: ImageStorageService
  ) {}

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    this.customerName = user?.customerName || '';
    this.carouselSlides = [...this.fallbackCarouselSlides];
    this.loadCustomerHighlights();
    this.loadCartCount();
    this.startCarousel();

    this.route.queryParams.subscribe(params => {
      const searchParam = params['search'];
      if (searchParam) {
        this.searchName = searchParam;
        this.search();
      } else {
        this.loadFeaturedProducts();
      }
    });
  }

  ngOnDestroy() {
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
    }
    this.subs.unsubscribe();
  }

  get productList(): Product[] {
    if (this.searchName && this.products?.content && this.products.content.length) {
      return this.products.content;
    }
    return this.featuredProducts || [];
  }

  resolveProductImage(product: Product): string {
    if (product.imageUrl && product.imageUrl.trim().length) {
      if (product.imageUrl.startsWith('http') || product.imageUrl.startsWith('data:')) {
        return product.imageUrl;
      }
      return product.imageUrl.startsWith('assets/')
        ? product.imageUrl
        : `assets/products/${product.imageUrl}`;
    }
    return this.imageStorageService.getProductImageUrl(product.productId);
  }

  onImageError(event: any, productId?: string, productName?: string) {
    const imgElement = event.target as HTMLImageElement;
    const parentElement = imgElement.parentElement;
    const storedImage = productId && this.imageStorageService.hasProductImage(productId)
      ? this.imageStorageService.getProductImageUrl(productId)
      : null;

    if (storedImage && storedImage !== imgElement.src) {
      imgElement.src = storedImage;
      return;
    }

    if (parentElement && !parentElement.querySelector('.product-image-alt')) {
      imgElement.style.display = 'none';
      const altText = document.createElement('div');
      altText.className = 'product-image-alt';
      altText.textContent = productName || 'No Image Available';
      parentElement.appendChild(altText);
    }
  }

  onImageLoad(event: any, productId?: string) {
    const imgElement = event.target as HTMLImageElement;
    if (productId && imgElement.src && !imgElement.src.startsWith('data:')) {
      this.imageStorageService.storeProductImage(productId, imgElement.src);
    }
  }

  startCarousel() {
    if (this.carouselInterval) { clearInterval(this.carouselInterval); }
    if (this.carouselSlides.length <= 1) { return; }
    this.carouselInterval = setInterval(() => this.nextSlide(), 4000);
  }

  private restartCarousel() {
    this.pauseCarousel();
    this.startCarousel();
  }

  pauseCarousel() {
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
      this.carouselInterval = null;
    }
  }

  resumeCarousel() { this.startCarousel(); }

  nextSlide() {
    if (this.carouselSlides.length <= 1) { return; }
    this.currentSlide = (this.currentSlide + 1) % this.carouselSlides.length;
  }

  previousSlide() {
    if (this.carouselSlides.length <= 1) { return; }
    this.currentSlide = this.currentSlide === 0 ? this.carouselSlides.length - 1 : this.currentSlide - 1;
  }

  loadFeaturedProducts() {
    this.productService.getProducts(undefined, undefined, undefined, 0, 4).subscribe({
      next: (data) => {
        if (!this.highlightFeaturedLocked) {
          this.featuredProducts = data.content || [];
        }
      },
      error: (err) => console.error('Error loading featured products:', err)
    });
  }

  private loadCustomerHighlights() {
    this.productService.getCustomerHighlights().subscribe({
      next: (highlights) => this.applyHighlights(highlights),
      error: (err) => {
        console.error('Error loading customer highlights:', err);
        this.carouselSlides = [...this.fallbackCarouselSlides];
      }
    });
  }

  private applyHighlights(highlights: ProductHighlights) {
    const heroSlides = this.buildHeroSlides(highlights.heroProducts ?? []);
    this.carouselSlides = heroSlides.length ? heroSlides : [...this.fallbackCarouselSlides];
    this.restartCarousel();

    if (highlights.spotlight?.length) {
      this.featuredProducts = highlights.spotlight;
      this.highlightFeaturedLocked = true;
    } else if (highlights.topDeals?.length) {
      this.featuredProducts = highlights.topDeals;
      this.highlightFeaturedLocked = true;
    }

    if (highlights.newArrivals?.length) {
      this.newArrivalProducts = highlights.newArrivals.slice(0, 6);
    }
  }

  private buildHeroSlides(products: Product[]): CustomerHeroSlide[] {
    return products.map((product) => ({
      image: this.resolveImage(product.imageUrl),
      title: product.name,
      description: product.description || 'Discover what customers are loving right now.',
      alt: product.name,
      productId: product.productId,
      isDummy: false
    }));
  }

  private resolveImage(imageUrl?: string | null): string {
    if (!imageUrl || imageUrl.trim().length === 0) {
      return this.fallbackCarouselSlides[0].image;
    }
    if (imageUrl.startsWith('http') || imageUrl.startsWith('data:')) {
      return imageUrl;
    }
    return imageUrl.startsWith('assets/') ? imageUrl : `assets/products/${imageUrl}`;
  }

  loadProducts() {
    this.productService.getProducts(
      this.searchProductId || undefined,
      this.searchName || undefined,
      (this.selectedCategory as ProductCategory) || undefined,
      this.currentPage,
      this.pageSize
    ).subscribe({
      next: (data) => {
        this.products = data;
        if (this.searchName && data.content) {
          this.featuredProducts = data.content;
        }
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.products = null;
        this.featuredProducts = [];
      }
    });
  }

  loadCartCount() {
    this.cartService.getCart().subscribe({
        next: (data: any) => {
          let totalCartItems = 0;
          for (let i of data.items) {
            totalCartItems += i.quantity;
          }
          this.cartItemCount = totalCartItems;
        },
        error: (err: any) => console.error('Error loading cart:', err)
    });
  }

  search() {
    this.currentPage = 0;
    if (this.searchName.trim()) {
      this.loadProducts();
    } else {
      this.loadFeaturedProducts();
    }
  }

  clearSearch() {
    this.searchName = '';
    this.searchProductId = '';
    this.selectedCategory = '';
    this.currentPage = 0;
    this.router.navigate(['/customer/home'], { queryParams: {} });
    this.loadFeaturedProducts();
  }

  previousPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadProducts();
    }
  }

  nextPage() {
    this.currentPage++;
    this.loadProducts();
  }

  logout() {
    try {
      this.authService.logout?.();
    } catch (e) {
      console.warn('Auth logout method failed', e);
    }
    this.router.navigate(['/login']).catch(() => {});
  }

  addToCart(productName: string, productId?: string, quantity: number = 1) {
    if (!productId) {
      console.warn('addToCart called without productId');
      return;
    }

    this.cartService.addToCart(productId, quantity).subscribe?.({
      next: () => {
        this.loadCartCount();
        this.showSuccessMessage(`${productName} added to cart`);
      },
      error: (err: any) => console.error('addToCart failed', err)
    });
  }

  showSuccessMessage(message: string) {
    const toast = document.createElement('div');
    toast.className = 'toast-success';
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      background: #28a745;
      color: white;
      padding: 12px 20px;
      border-radius: 4px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 1000;
      animation: slideIn 0.3s ease-out;
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease-in';
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 300);
    }, 3000);
  }
}