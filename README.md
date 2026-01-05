# Artist Website (Static)

This is a lightweight, premium-looking static website (HTML/CSS/JS) for a contemporary artist from Kazan, targeting the Middle East, Europe, and the US.

## What’s inside
- Multi-page site: Home, Work (catalog), Artwork page template, Collections, About, Commissions, Exhibitions, Shop, Contact
- Catalog data in `data/artworks.json`
- Minimal “museum” UI (neutral palette, typography-led)
- Forms are wired to Formspree placeholders (replace `your-id`)

## Quick start (local)
Open `index.html` in a browser, or run a small local server:

### Option A: Python
```bash
cd artist-site
python3 -m http.server 8080
```
Then open: http://localhost:8080

### Option B: Node
```bash
npx serve .
```

## Customize
1) Replace **ARTIST NAME**
- In every HTML file: search for `ARTIST NAME` and replace with the real name.
- Update email/WhatsApp in the footer.

2) Add real images
- The current “artwork images” are elegant placeholders (CSS gradients).
- To use real images:
  - Put images into `assets/`
  - In `js/site.js`, update `cardHTML()` and the artwork page to insert `<img src="assets/..." />` per artwork.
  - Optionally add `image` and `detailImages[]` fields to `data/artworks.json`.

3) Update artworks
Edit `data/artworks.json`:
- `title`, `year`, `medium`, `size_cm`, `size_in`, `collection`, `availability`, `price`, `slug`, `hero_note`

4) Make forms work
Replace:
`https://formspree.io/f/your-id`
with your Formspree endpoint, or connect your backend.

## Deployment
- Netlify / Vercel / GitHub Pages: upload the `artist-site` folder.
- For Vercel: choose “Other” and deploy as static.

