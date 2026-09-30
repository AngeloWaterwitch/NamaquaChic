import { Component, OnInit } from '@angular/core';
import { SeoService } from '../services/seo.service';

@Component({
  selector: 'app-privacy-policy',
  standalone: false,
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['./privacy-policy.component.css']
})
export class PrivacyPolicyComponent implements OnInit {
  lastUpdated = 'March 2026';

  constructor(private seoSvc: SeoService) {}

  ngOnInit(): void {
    this.seoSvc.set({
      title: 'Privacy Policy',
      description: 'Read the NamakwaChic Privacy Policy. We are committed to protecting your personal information in accordance with POPIA.'
    });
  }
}