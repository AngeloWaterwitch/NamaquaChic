import { Component, OnInit } from '@angular/core';
import { SeoService } from '../services/seo.service';

@Component({
  selector: 'app-terms',
  standalone: false,
  templateUrl: './terms.component.html',
  styleUrls: ['./legal.component.css']
})
export class TermsComponent implements OnInit {
  lastUpdated = 'March 2026';

  constructor(private seoSvc: SeoService) {}

  ngOnInit(): void {
    this.seoSvc.set({
      title: 'Terms & Conditions',
      description: 'Read the NamakwaChic Terms and Conditions. Our policies on ordering, delivery, returns and more.'
    });
  }
}