# Recovery Plus - Component Specification & Consistency Guide

**Purpose:** Define static vs dynamic components and ensure uniformity across all 54 pages.

---

## Current State: Inconsistencies Found

### Critical Issues Identified

| Component | Issue | Pages Affected |
|-----------|-------|----------------|
| **Footer** | 3+ different versions | All pages |
| **Mobile Bottom Nav** | 16 pages missing it entirely | Account section |
| **Mobile Bottom Nav** | 3 different class names used | Various |
| **Header CTA** | Links to different destinations | Various |
| **Mobile Menu Links** | Different nav items per page | Various |
| **Social Links** | Some pages missing | Account section |

### Mobile Bottom Nav Inconsistencies
```
Current state:
- 10 pages: <nav class="mobile-bottom-nav">
- 8 pages:  <div class="mobile-sticky">
- 3 pages:  <div class="mobile-sticky-bar" style="..."> (inline styles!)
- 16 pages: NO MOBILE BOTTOM NAV AT ALL
```

### Footer Inconsistencies
```
Current state:
- Homepage: SVG logo, anchor links (#home, #about), no social
- Public pages: Image logo, full social, proper links, 4 columns
- Account pages: Minimal (logo + phone only), 2 columns
```

### Header CTA Inconsistencies
```
Current state:
- booking.html (correct for most pages)
- contact.html (wrong - should be booking)
- pages/booking.html (from root - correct)
- ../index.html#booking (wrong - should go to booking page)
```

---

## Part 1: Component Classification

### STATIC Components (Same on ALL pages)

| Component | Description | Must Be Identical |
|-----------|-------------|-------------------|
| **Logo** | Recovery Plus logo (PNG) | Yes |
| **Phone Number** | (707) 761-1528 | Yes |
| **Copyright** | © 2025 Recovery Plus | Yes |
| **Social Links** | LinkedIn, Facebook, Instagram | Yes |
| **Legal Links** | Privacy, Terms, Intake Form | Yes |
| **Footer Structure** | 4-column layout | Yes |
| **Color Scheme** | CSS variables (--accent-400, etc.) | Yes |
| **Typography** | Bebas Neue + Inter fonts | Yes |

### SEMI-STATIC Components (Same structure, different paths)

| Component | What Changes | Rule |
|-----------|--------------|------|
| **Header Nav Links** | Relative paths only | Adjust `../` based on depth |
| **Footer Nav Links** | Relative paths only | Adjust `../` based on depth |
| **CSS/JS Paths** | Relative paths only | Adjust `../` based on depth |
| **Logo Path** | Relative paths only | Adjust `../` based on depth |

### DYNAMIC Components (Change based on context)

| Component | What Changes | When |
|-----------|--------------|------|
| **Header CTA Button** | Text & destination | Based on page type |
| **Mobile Bottom Nav** | Primary action button | Based on page type |
| **Active Nav State** | Highlighted menu item | Current page |
| **User Avatar/Name** | Logged-in user info | Account pages only |
| **Page Title** | `<title>` tag | Every page |
| **Meta Description** | SEO description | Every page |

---

## Part 2: Standard Component Definitions

### Header (Standard - All Pages)

```html
<header class="header" data-header role="banner">
    <div class="container">
        <div class="header-inner">
            <!-- Logo (path varies by depth) -->
            <a href="{ROOT}/index.html" class="logo">
                <img src="{ROOT}/images/logo.png" alt="Recovery Plus" class="logo-full">
            </a>

            <!-- Desktop Navigation (ALWAYS these 6 links) -->
            <nav class="nav-desktop" aria-label="Primary Navigation">
                <a href="{ROOT}/index.html" class="nav-link">Home</a>
                <a href="{ROOT}/pages/services.html" class="nav-link">Services</a>
                <a href="{ROOT}/pages/pricing.html" class="nav-link">Pricing</a>
                <a href="{ROOT}/pages/faq.html" class="nav-link">FAQ</a>
                <a href="{ROOT}/pages/about.html" class="nav-link">About</a>
                <a href="{ROOT}/pages/contact.html" class="nav-link">Contact</a>
            </nav>

            <!-- Header Actions -->
            <div class="header-actions">
                <!-- Phone (ALWAYS same) -->
                <a href="tel:+17077611528" class="header-phone" aria-label="Call us">
                    <svg>...</svg>
                    (707) 761-1528
                </a>

                <!-- Login/Account (DYNAMIC) -->
                <!-- If logged out: -->
                <a href="{ROOT}/pages/account/login.html" class="nav-link">Login</a>
                <!-- If logged in: -->
                <a href="{ROOT}/pages/account/dashboard.html" class="nav-link">My Account</a>

                <!-- Primary CTA (DYNAMIC - see rules below) -->
                <a href="{ROOT}/pages/booking.html" class="btn btn-primary header-cta">
                    <span>Book Now</span>
                </a>

                <!-- Theme Toggle -->
                <button class="theme-toggle" id="themeToggle">...</button>

                <!-- Mobile Menu Toggle -->
                <button class="mobile-menu-toggle" aria-label="Menu">...</button>
            </div>
        </div>
    </div>
</header>
```

### Header CTA Rules (DYNAMIC)

| Page Type | CTA Text | CTA Destination |
|-----------|----------|-----------------|
| **Public pages** | "Book Now" | /pages/booking.html |
| **Booking page** | "Call Us" | tel:+17077611528 |
| **Account pages** | "Book Now" | /pages/booking.html |
| **Check-in pages** | "Need Help?" | /pages/contact.html |
| **Payment pages** | "Support" | /pages/contact.html |

---

### Mobile Menu (Standard - All Pages)

```html
<div class="mobile-menu" id="mobileMenu">
    <nav class="mobile-nav">
        <a href="{ROOT}/index.html" class="mobile-nav-link">Home</a>
        <a href="{ROOT}/pages/services.html" class="mobile-nav-link">Services</a>
        <a href="{ROOT}/pages/pricing.html" class="mobile-nav-link">Pricing</a>
        <a href="{ROOT}/pages/booking.html" class="mobile-nav-link">Book Now</a>
        <a href="{ROOT}/pages/faq.html" class="mobile-nav-link">FAQ</a>
        <a href="{ROOT}/pages/about.html" class="mobile-nav-link">About</a>
        <a href="{ROOT}/pages/contact.html" class="mobile-nav-link">Contact</a>
    </nav>
    <div class="mobile-menu-footer">
        <a href="tel:+17077611528" class="btn btn-outline" style="width: 100%;">
            <span>Call (707) 761-1528</span>
        </a>
    </div>
</div>
```

---

### Mobile Bottom Navigation (Standard - ALL Pages)

**RULE: Every page MUST have mobile bottom nav. The primary action changes based on context.**

```html
<nav class="mobile-bottom-nav" role="navigation" aria-label="Mobile Navigation">
    <a href="{ROOT}/index.html" class="mobile-bottom-link" aria-label="Home">
        <svg><!-- Home icon --></svg>
        <span>Home</span>
    </a>
    <a href="{ROOT}/pages/services.html" class="mobile-bottom-link" aria-label="Services">
        <svg><!-- Services icon --></svg>
        <span>Services</span>
    </a>
    <!-- PRIMARY ACTION (DYNAMIC) -->
    <a href="{PRIMARY_ACTION_URL}" class="mobile-bottom-link mobile-bottom-link-primary" aria-label="{PRIMARY_ACTION_LABEL}">
        <svg><!-- Action icon --></svg>
        <span>{PRIMARY_ACTION_TEXT}</span>
    </a>
    <a href="{ROOT}/pages/contact.html" class="mobile-bottom-link" aria-label="Contact">
        <svg><!-- Contact icon --></svg>
        <span>Contact</span>
    </a>
</nav>
```

### Mobile Bottom Nav - Primary Action Rules (DYNAMIC)

| Page Type | Primary Action | Icon | URL |
|-----------|---------------|------|-----|
| **Homepage** | Book Now | Calendar | /pages/booking.html |
| **Public pages** | Book Now | Calendar | /pages/booking.html |
| **Booking page** | Call Now | Phone | tel:+17077611528 |
| **Account pages** | Book Now | Calendar | /pages/booking.html |
| **Check-in page** | Check In | Checkmark | (submit form) |
| **Rewards page** | My Rewards | Star | /pages/account/rewards-dashboard.html |
| **Payment pages** | Support | Headset | /pages/contact.html |

---

### Footer (Standard - All Pages)

```html
<footer class="footer" role="contentinfo">
    <div class="container">
        <div class="footer-grid">
            <!-- Column 1: Brand -->
            <div class="footer-brand">
                <a href="{ROOT}/index.html" class="logo">
                    <img src="{ROOT}/images/logo.png" alt="Recovery Plus">
                </a>
                <p class="footer-tagline">Elite mobile cryotherapy bringing professional recovery directly to you.</p>
                <div class="footer-social">
                    <a href="https://www.linkedin.com/company/recovery-plus" target="_blank" rel="noopener" aria-label="LinkedIn">
                        <svg><!-- LinkedIn icon --></svg>
                    </a>
                    <a href="https://www.facebook.com/recoveryplus" target="_blank" rel="noopener" aria-label="Facebook">
                        <svg><!-- Facebook icon --></svg>
                    </a>
                    <a href="https://www.instagram.com/recoveryplus" target="_blank" rel="noopener" aria-label="Instagram">
                        <svg><!-- Instagram icon --></svg>
                    </a>
                </div>
            </div>

            <!-- Column 2: Services -->
            <div class="footer-col">
                <h4>Services</h4>
                <ul class="footer-links">
                    <li><a href="{ROOT}/pages/services.html">All Services</a></li>
                    <li><a href="{ROOT}/pages/services/cryo-facial-12.html">Cryo Facials</a></li>
                    <li><a href="{ROOT}/pages/services/pain-relief-12.html">Pain Relief</a></li>
                    <li><a href="{ROOT}/pages/services/subscription-gold.html">Subscriptions</a></li>
                    <li><a href="{ROOT}/pages/gift-cards.html">Gift Cards</a></li>
                </ul>
            </div>

            <!-- Column 3: Company -->
            <div class="footer-col">
                <h4>Company</h4>
                <ul class="footer-links">
                    <li><a href="{ROOT}/pages/about.html">About Us</a></li>
                    <li><a href="{ROOT}/pages/how-it-works.html">How It Works</a></li>
                    <li><a href="{ROOT}/pages/testimonials.html">Testimonials</a></li>
                    <li><a href="{ROOT}/pages/gallery.html">Results Gallery</a></li>
                    <li><a href="{ROOT}/pages/service-areas.html">Service Areas</a></li>
                    <li><a href="{ROOT}/pages/corporate-wellness.html">Corporate</a></li>
                    <li><a href="{ROOT}/pages/blog/index.html">Blog</a></li>
                </ul>
            </div>

            <!-- Column 4: Support -->
            <div class="footer-col">
                <h4>Support</h4>
                <ul class="footer-links">
                    <li><a href="{ROOT}/pages/faq.html">FAQ</a></li>
                    <li><a href="{ROOT}/pages/contact.html">Contact Us</a></li>
                    <li><a href="{ROOT}/pages/first-visit.html">First Visit</a></li>
                    <li><a href="{ROOT}/pages/booking-cancellation.html">Modify Booking</a></li>
                    <li><a href="tel:+17077611528">(707) 761-1528</a></li>
                    <li><a href="mailto:Brian.recoveryplus@outlook.com">Email Us</a></li>
                </ul>
            </div>
        </div>

        <!-- Footer Bottom -->
        <div class="footer-bottom">
            <div class="footer-legal">
                <a href="{ROOT}/pages/legal/privacy-policy.html">Privacy Policy</a>
                <a href="{ROOT}/pages/legal/terms-and-conditions.html">Terms & Conditions</a>
                <a href="{ROOT}/pages/legal/intake-form.html">Intake Form</a>
            </div>
            <div class="footer-copyright">
                &copy; 2025 Recovery Plus. All rights reserved.
            </div>
        </div>
    </div>
</footer>
```

---

## Part 3: Page Type Specifications

### Type A: Public Marketing Pages (22 pages)

**Includes:** Homepage, About, Services, Pricing, FAQ, Contact, Testimonials, Gallery, How It Works, First Visit, Gift Cards, Corporate Wellness, Referral Program, Service Areas, Blog, all Service Detail pages

| Component | State |
|-----------|-------|
| Header | Standard, CTA = "Book Now" |
| Mobile Menu | Standard |
| Mobile Bottom Nav | Standard, Primary = "Book Now" |
| Footer | Full 4-column |
| Login State | Show "Login" link |

### Type B: Booking Flow Pages (6 pages)

**Includes:** Booking, Booking Visual, Booking Layouts, Booking Confirmation, Booking Cancellation, Payment Success/Failure

| Component | State |
|-----------|-------|
| Header | Standard, CTA = "Call Us" or "Support" |
| Mobile Menu | Standard |
| Mobile Bottom Nav | Standard, Primary = "Call Now" |
| Footer | Full 4-column |
| Login State | Show "Login" or user name |

### Type C: Account Portal Pages (13 pages)

**Includes:** Login, Signup, Forgot Password, Reset Password, Dashboard, Profile, Bookings, Subscription, Invoices, Payment Methods, Rewards Dashboard, Referrals, Notifications

| Component | State |
|-----------|-------|
| Header | Standard, CTA = "Book Now" |
| Mobile Menu | Standard + Account links |
| Mobile Bottom Nav | Standard, Primary = "Book Now" |
| Footer | Full 4-column (NOT minimal!) |
| Login State | Show user name + avatar |
| Account Sidebar | Yes (on dashboard pages) |

### Type D: Check-In Pages (3 pages)

**Includes:** Check-In, Check-In Success, Admin Check-In

| Component | State |
|-----------|-------|
| Header | Standard, CTA = "Need Help?" |
| Mobile Menu | Standard |
| Mobile Bottom Nav | Primary = "Check In" or "Done" |
| Footer | Full 4-column |
| Login State | Show user name |

### Type E: Error/Utility Pages (2 pages)

**Includes:** 404, Payment Failure

| Component | State |
|-----------|-------|
| Header | Standard, CTA = "Support" |
| Mobile Menu | Standard |
| Mobile Bottom Nav | Primary = "Home" |
| Footer | Full 4-column |

---

## Part 4: Path Reference Table

All paths use `{ROOT}` placeholder. Replace based on page location:

| Page Location | {ROOT} Value |
|---------------|--------------|
| `/index.html` | `.` or empty |
| `/404.html` | `.` or empty |
| `/pages/*.html` | `..` |
| `/pages/account/*.html` | `../..` |
| `/pages/services/*.html` | `../..` |
| `/pages/legal/*.html` | `../..` |
| `/pages/blog/*.html` | `../..` |

---

## Part 5: Active State Rules

### Desktop Nav Active State
```css
/* Add 'active' class to current section */
.nav-link.active {
    color: var(--accent-400);
}
```

| Current Page | Active Link |
|--------------|-------------|
| Homepage | Home |
| About, Testimonials, Gallery, How It Works, Corporate, Blog | About |
| Services, Service Details, Pricing, Gift Cards | Services |
| FAQ | FAQ |
| Contact, Service Areas | Contact |
| Booking pages | (none) |
| Account pages | (none - use account nav) |

### Mobile Bottom Nav Active State
```css
.mobile-bottom-link.active {
    color: var(--accent-400);
}
```

---

## Part 6: Implementation Checklist

### Pages Needing Updates

#### Missing Mobile Bottom Nav (16 pages) - HIGH PRIORITY
- [ ] pages/account/bookings.html
- [ ] pages/account/dashboard.html
- [ ] pages/account/forgot-password.html
- [ ] pages/account/invoices.html
- [ ] pages/account/login.html
- [ ] pages/account/notifications.html
- [ ] pages/account/payment-methods.html
- [ ] pages/account/profile.html
- [ ] pages/account/referrals.html
- [ ] pages/account/reset-password.html
- [ ] pages/account/rewards-dashboard.html
- [ ] pages/account/signup.html
- [ ] pages/account/subscription.html
- [ ] pages/booking-confirmation.html
- [ ] pages/booking-layouts.html
- [ ] pages/booking-visual.html

#### Footer Needs Standardization (Account pages)
- [ ] All 13 account pages need full 4-column footer
- [ ] Homepage needs proper page links (not anchor links)

#### Header CTA Needs Fix
- [ ] Pages linking to contact.html should link to booking.html
- [ ] Pages linking to #booking should link to /pages/booking.html

#### Mobile Menu Standardization
- [ ] All pages need same 7 nav links
- [ ] Remove inconsistent items (some have Check-In, some don't)

---

## Part 7: Component HTML Snippets

### SVG Icons (Standard Set)

```html
<!-- Home Icon -->
<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
</svg>

<!-- Services Icon -->
<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect x="3" y="3" width="7" height="7"></rect>
    <rect x="14" y="3" width="7" height="7"></rect>
    <rect x="14" y="14" width="7" height="7"></rect>
    <rect x="3" y="14" width="7" height="7"></rect>
</svg>

<!-- Calendar/Book Icon -->
<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
</svg>

<!-- Phone Icon -->
<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
</svg>

<!-- Contact/Mail Icon -->
<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
    <polyline points="22,6 12,13 2,6"></polyline>
</svg>

<!-- Check Icon -->
<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
</svg>

<!-- User Icon -->
<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
</svg>
```

---

## Summary: What Should Be Uniform

| Component | Rule |
|-----------|------|
| **Header** | Same structure, same 6 nav links, CTA changes by page type |
| **Mobile Menu** | Same 7 links on ALL pages |
| **Mobile Bottom Nav** | Present on ALL 54 pages, 4 buttons, primary action changes |
| **Footer** | Full 4-column on ALL pages (no minimal version) |
| **Phone Number** | (707) 761-1528 everywhere |
| **Social Links** | Same 3 links (LinkedIn, Facebook, Instagram) everywhere |
| **Legal Links** | Same 3 links in footer bottom everywhere |
| **Copyright** | © 2025 Recovery Plus everywhere |

---

*This specification ensures consistent user experience across all pages and simplifies maintenance.*
