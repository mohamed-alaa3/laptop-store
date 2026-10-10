import { Component } from '@angular/core';
import { Hero } from './components/hero/hero';
import { LaptopScrollytelling } from './components/laptop-scrollytelling/laptop-scrollytelling';
import { FeaturedCategories } from './components/featured-categories/featured-categories';
import { TrendingProducts } from './components/trending-products/trending-products';
import { FindYourDevice } from './components/find-your-device/find-your-device';
import { PromoBanner } from './components/promo-banner/promo-banner';
import { WhyChooseUs } from './components/why-choose-us/why-choose-us';
import { WhatsappCta } from './components/whatsapp-cta/whatsapp-cta';

@Component({
  selector: 'app-home',
  imports: [
    LaptopScrollytelling,
    Hero,
    FeaturedCategories,
    TrendingProducts,
    FindYourDevice,
    PromoBanner,
    WhyChooseUs,
    WhatsappCta,
  ],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {}

