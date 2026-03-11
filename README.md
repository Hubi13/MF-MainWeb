# Maciej Figiel — Website Designer

Statyczna strona-portfolio dla freelancera / website designera. Zaprojektowana i zbudowana bez frameworków — czysty HTML, CSS i minimalny JS.

---

## Struktura projektu

```
d:\WEBISTES\
├── index.html                # Strona glowna
├── about.html                # O mnie
├── services.html             # Oferta i pakiety
├── contact.html              # Formularz kontaktowy
├── privacy.html              # Polityka prywatnosci
├── 404.html                  # Strona bledu 404
├── sitemap.xml               # Mapa strony dla SEO
├── robots.txt                # Dyrektywy dla botow
├── manifest.webmanifest      # PWA manifest
├── humans.txt                # Metadata
│
├── work/
│   ├── index.html            # Portfolio grid
│   ├── case-study-1.html     # Firma uslugowa - redesign
│   ├── case-study-2.html     # Marka premium - brand
│   └── case-study-3.html     # Platforma B2B - design system
│
└── assets/
    ├── css/
    │   ├── design-system.css # Tokeny, reset, typografia, buttony
    │   ├── components.css    # Header, footer, karty, formy, etc.
    │   └── pages/
    │       ├── home.css      # Specifyczne style strony glownej
    │       └── work.css      # Specificzne style portfolio i case studies
    ├── js/
    │   ├── main.js           # Nav, scroll reveal, filtry, progress bar
    │   ├── analytics.js      # GA4 event tracking (wymaga zgody)
    │   ├── consent.js        # Baner zgody na cookies
    │   └── form.js           # Walidacja i wysylka formularza
    ├── img/                  # Obrazy (patrz: Obrazy)
    └── fonts/                # Fonty lokalne (opcjonalne)
```

---

## Uruchomienie lokalnie

### Najprostrzy sposob (bez serwera)
Otwórz `index.html` bezposrednio w przegladarce. Wszystko dziala poza formularzem Netlify (wymaga deploymentu).

### Z lokalnym serwerem (zalecane)
```bash
# Python 3
python -m http.server 3000

# Node.js (npx)
npx serve .

# PHP
php -S localhost:3000
```
Nastepnie otworz: `http://localhost:3000`

---

## Konfiguracja przed deploymentem

### 1. Zamien dane personalne
Wyszukaj i zamien we wszystkich plikach `.html`:

| Placeholder | Zamien na |
|---|---|
| `Maciej Figiel` | Twoje imie i nazwisko |
| `jankowalski.pl` | Twoja domena |
| `mafi14@proton.me` | Twoj e-mail |
| `www.linkedin.com/in/maciej-figiel-6a03643b5/` | Twoj profil LinkedIn |
| `calendly.com/jankowalski` | Twoj link Calendly |
| `[Nazwa firmy]`, `[NIP]` | Dane firmy (privacy.html) |

### 2. Analytics — Google Analytics 4
Edytuj `assets/js/analytics.js`, linia ~8:
```javascript
const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX'; // <- wstaw swoje ID
```

### 3. Formularz kontaktowy
Strona uzywa Netlify Forms. Formularz dziala automatycznie po deploymentu na Netlify.

Jezeli uzywasz innego hostingu, zmien `action` na zewnetrzne API (Formspree, Basin, etc.) lub wdróz wlasny endpoint.

### 4. Obrazy
Wstaw swoje obrazy do `assets/img/`:

| Plik | Opis | Wymiary |
|---|---|---|
| `maciej-figiel.jpg` | Twoje zdjecie (about.html) | min. 600×800px |
| `og-image.jpg` | Obraz dla social share | 1200×630px |
| `icon-192.png` | PWA icon | 192×192px |
| `icon-512.png` | PWA icon | 512×512px |
| `case-study-1-cover.jpg` | Cover case study 1 | 1600×900px |
| `case-study-2-cover.jpg` | Cover case study 2 | 1600×900px |
| `case-study-3-cover.jpg` | Cover case study 3 | 1600×900px |

### 5. Favicon
Dodaj `favicon.ico` lub `favicon.svg` do katalogu glownego i dodaj do `<head>` w kazydm pliku:
```html
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon.ico" sizes="any">
```

---

## Deployment

### Netlify (zalecane — formularz dziala OOB)
1. Przeciagnij folder projektu na [app.netlify.com](https://app.netlify.com/drop) lub polacz repozytorium Git.
2. Custom domain → Custom domain → wprowadz domene.
3. HTTPS wlacza sie automatycznie.

### Vercel
```bash
npm i -g vercel
vercel --prod
```

### GitHub Pages
```bash
git init && git add . && git commit -m "initial"
git remote add origin https://github.com/YOURUSERNAME/REPO.git
git push -u origin main
```
W repozytorium → Settings → Pages → Deploy from branch → `main` / `root`.

> **Uwaga**: GitHub Pages nie obsluguje Netlify Forms. Uzyj Formspree lub innego serwisu.

---

## SEO — co zostalo zrobione

- ✅ Unikalne `<title>` i `<meta description>` na kazdej stronie
- ✅ Canonical URL na kazdej stronie
- ✅ Open Graph + Twitter Card
- ✅ JSON-LD schema (Person, Service, ContactPage, BreadcrumbList)
- ✅ `robots.txt` z disallow dla stron prawnych
- ✅ `sitemap.xml` z priorytetami
- ✅ Header hierarchy (`h1` → `h2` → itp.)
- ✅ Semantic HTML5 landmarks (header, main, footer, nav, section, article)
- ✅ `lang="pl"` na kazdej stronie
- ✅ Lazy loading obrazow (dodaj `loading="lazy"` do `<img>`)
- ✅ Breadcrumbs (case studies + work)

**Po zmianie domeny**: zaktualizuj wszystkie `https://jankowalski.pl/...` URLe w plikach HTML, sitemap.xml i manifest.webmanifest.

---

## Dostepnosc

- ✅ `prefers-reduced-motion` w CSS i JS
- ✅ Focus styles na elementach interaktywnych
- ✅ ARIA labels na kluczowych elementach
- ✅ Semantyczne role (role="banner", role="navigation", etc.)
- ✅ Honeypot na formularzu (ochrona przed spamem)

---

## Stack

| Warstwa | Technologia |
|---|---|
| Markup | HTML5 semantyczny |
| Style | CSS3 (Custom Properties, Grid, Clamp) |
| JS | Vanilla JS (ES6+), IntersectionObserver |
| Fonty | Playfair Display + Inter (Google Fonts) |
| Analityka | Google Analytics 4 (consent-gated) |
| Formularz | Netlify Forms + mailto fallback |
| Hosting | Netlify / Vercel / GitHub Pages |

---

## Personalizacja tresci

### Zmiana kolorow (design-system.css)
```css
:root {
  --color-accent: #c8b88a;     /* Zmien akcent */
  --color-bg: #0a0a0b;         /* Zmien tlo */
}
```

### Dodanie case study
1. Skopiuj `work/case-study-1.html` jako `work/case-study-N.html`
2. Edytuj tresc, meta, schema i breadcrumbs
3. Dodaj karte do `work/index.html`
4. Dodaj URL do `sitemap.xml`

---

*Strona zbudowana z mysla o szybkosci, SEO i konwersjach. Zero zbednych zaleznosci.*
