import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { ProductService } from '../../../core/services/product.service';
import { Product, ProductHighlights } from '../../../core/models/product.model';

type DisplayProduct = {
  productId?: string;
  name: string;
  imageUrl: string;
  price?: number;
  category?: string;
  description?: string;
  badge?: string;
  highlight?: string;
  isDummy?: boolean;
};

interface HeroSlide {
  title: string;
  subtitle: string;
  cta: string;
  imageUrl: string;
  productId?: string;
  isDummy?: boolean;
}

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent
  ],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css'
})
export class LandingPageComponent implements OnInit, OnDestroy {
  constructor(private router: Router, private productService: ProductService) {}

  currentYear: number = new Date().getFullYear();
  heroSlides: HeroSlide[] = [];
  spotlightProducts: DisplayProduct[] = [];
  topDeals: DisplayProduct[] = [];
  newArrivals: DisplayProduct[] = [];
  isLoading = false;
  heroIndex = 0;
  heroInterval?: ReturnType<typeof setInterval>;

  private readonly heroFallback: HeroSlide[] = [
    {
      title: 'Big Festive Deals',
      subtitle: 'Save up to 60% on top electronics',
      cta: 'Shop Festive Offers',
      imageUrl: 'assets/products/bg.jpg',
      isDummy: true
    },
    {
      title: 'Revamp Your Home',
      subtitle: 'Curated furniture & décor under ₹9,999',
      cta: 'Discover Home Picks',
      imageUrl: 'assets/products/bg11.jpg',
      isDummy: true
    },
    {
      title: 'Fitness Essentials',
      subtitle: 'Everything you need to stay in shape',
      cta: 'Gear Up Now',
      imageUrl: 'assets/products/dumbell.jpg',
      isDummy: true
    }
  ];

  private readonly productFallback: DisplayProduct[] = [
    {
      name: 'Samsung Galaxy S23',
      price: 79999,
      description: 'Pro-grade camera | Snapdragon 8 Gen 2 | Dynamic AMOLED 2X',
      imageUrl: 'assets/products/s23.jpg',
      badge: 'Bestseller',
      isDummy: true
    },
    {
      name: 'Apple Watch Series 9',
      price: 41999,
      description: 'Your health companion with advanced sensors & crash detection',
      imageUrl: 'assets/products/applewatch9.jpg',
      badge: 'Trending',
      isDummy: true
    },
    {
      name: 'Sony WH-1000XM5',
      price: 29999,
      description: 'Industry-leading noise cancellation with immersive sound',
      imageUrl: 'assets/products/sonyheadphone.jpg',
      badge: 'Top Rated',
      isDummy: true
    },
    {
      name: 'LG 4K Smart TV 55"',
      price: 54999,
      description: 'AI powered webOS TV with Dolby Vision & Atmos',
      imageUrl: 'assets/products/lg5star.jpg',
      badge: 'Deal of the day',
      isDummy: true
    }
  ];

  ngOnInit(): void {
    this.loadHighlights();
    this.startHeroRotation();
  }

  ngOnDestroy(): void {
    if (this.heroInterval) {
      clearInterval(this.heroInterval);
    }
  }

  isLanding(): boolean {
    return this.router.url !== '/customer/home';
  }

  selectHero(index: number): void {
    this.heroIndex = index;
    this.restartHeroRotation();
  }

  nextHero(): void {
    this.heroIndex = (this.heroIndex + 1) % this.heroSlides.length;
  }

  previousHero(): void {
    this.heroIndex =
      this.heroIndex === 0 ? this.heroSlides.length - 1 : this.heroIndex - 1;
    this.restartHeroRotation();
  }

  exploreDeals(): void {
    this.router.navigate(['/login']);
  }

  shopProduct(product: DisplayProduct): void {
    if (product.productId) {
      this.router.navigate(['/login'], { queryParams: { product: product.productId } });
    } else {
      this.router.navigate(['/register']);
    }
  }

  trackByIndex(_: number, item: unknown): unknown {
    return item;
  }

  private loadHighlights(): void {
    this.isLoading = true;
    this.productService.getLandingHighlights().subscribe({
      next: (data) => {
        this.applyHighlights(data);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load landing products', err);
        this.applyHighlights();
        this.isLoading = false;
      }
    });
  }

  private applyHighlights(highlights?: ProductHighlights): void {
    const heroProducts = highlights?.heroProducts ?? [];
    this.heroSlides = this.buildHeroSlides(heroProducts);

    this.spotlightProducts = this.composeDisplayProducts(
      highlights?.spotlight ?? [],
      6
    );

    this.topDeals = this.composeDisplayProducts(
      highlights?.topDeals ?? [],
      8
    );

    this.newArrivals = this.composeDisplayProducts(
      highlights?.newArrivals ?? [],
      6
    );

    this.restartHeroRotation();
  }

  private buildHeroSlides(products: Product[]): HeroSlide[] {
    const slides = products.map((product) => ({
      title: product.name,
      subtitle: product.description || 'Discover the latest pick curated for you',
      cta: 'Shop now',
      imageUrl: this.resolveImage(product.imageUrl),
      productId: product.productId,
      isDummy: false
    }));

    return slides.length ? slides : [...this.heroFallback];
  }

  private composeDisplayProducts(products: Product[], desiredCount: number): DisplayProduct[] {
    const mapped = products.map((product, index) => ({
      productId: product.productId,
      name: product.name,
      price: product.price,
      description: product.description,
      category: product.category,
      imageUrl: this.resolveImage(product.imageUrl),
      badge: this.pickBadge(index),
      isDummy: false
    }));

    if (mapped.length >= desiredCount) {
      return mapped.slice(0, desiredCount);
    }

    const fallbackNeeded = desiredCount - mapped.length;
    const fallback = this.productFallback
      .slice(0, fallbackNeeded)
      .map((item, idx) => ({
        ...item,
        badge: item.badge ?? this.pickBadge(mapped.length + idx)
      }));

    return [...mapped, ...fallback];
  }

  private pickBadge(index: number): string {
    const badges = ['Bestseller', 'Hot pick', 'Trending', 'Limited time', 'New arrival', 'Popular'];
    return badges[index % badges.length];
  }

  private resolveImage(imageUrl?: string | null): string {
    if (!imageUrl || imageUrl.trim().length === 0) {
      return this.productFallback[0]?.imageUrl ?? 'assets/products/bg5.jpg';
    }

    if (imageUrl.startsWith('http') || imageUrl.startsWith('data:')) {
      return imageUrl;
    }

    return imageUrl.startsWith('assets/') ? imageUrl : `assets/products/${imageUrl}`;
  }

  startHeroRotation(): void {
    if (this.heroInterval) {
      clearInterval(this.heroInterval);
    }
    if (!this.heroSlides.length) {
      return;
    }
    this.heroInterval = setInterval(() => {
      if (this.heroSlides.length) {
        this.nextHero();
      }
    }, 5000);
  }

  restartHeroRotation(): void {
    this.startHeroRotation();
  }
}
