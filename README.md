# Bhavya Agarwal — Notebook Portfolio Website 📓 (React + Tailwind CSS)

A modern, component-driven personal portfolio website built with **React 19**, **Tailwind CSS**, and **Vite**, handcrafted in the authentic aesthetic of an engineering notebook with graph paper, typewriter ink stamps, washi tape accents, and handwritten annotations.

---

## 🎨 Design & Tech Stack

- **Framework**: React 19 + Vite (lightning-fast HMR and build times)
- **Styling**: Tailwind CSS with custom notebook theme extensions
- **Typography**: 
  - `Special Elite` (Google Fonts): Vintage stamped typewriter font for headlines and stamps.
  - `Courier Prime` (Google Fonts): Monospace font for typed text, tags, and code.
  - `Caveat` (Google Fonts): Handwritten font for margin scribbles and notes.
- **Key Visual Features**:
  - Continuous 24px graph paper grid background.
  - Polaroid photo frame with tilted washi tape and doodle sparks.
  - Category-filtered project lab cards (`[ALL]`, `[AI / ML]`, `[FULL STACK]`, `[ALGO & TOOLS]`).
  - Stamped technical skill folders.
  - **Interactive 3D Flip Cards** in Milestones & Honors (headings on front, details & metrics reveal on hover/tap).
  - Notebook tear-off contact memo with copy-to-clipboard email and working note submission.
  - Automatic `.heic` format conversion support (displays iPhone photos without manual conversion).

---

## 📁 Project Structure

```
portfoliowebsite1.0/
├── public/                      # Static assets served at root
│   ├── profile.heic            # Your profile photo (supports .heic, .jpg, .png)
│   ├── profile.jpg             # Default portrait
│   ├── profile-sample.jpg      # Sample sketched portrait from mockup
│   └── Bhavya_Agarwal_Resume.pdf # Downloadable resume PDF
├── src/
│   ├── components/             # Modular React components
│   │   ├── Navbar.jsx          # Header with bracket navigation & sketch divider
│   │   ├── Hero.jsx            # Polaroid, typewriter titles, bio & socials
│   │   ├── Projects.jsx        # Category filters & lab notebook cards
│   │   ├── Skills.jsx          # Technical toolkit folder tabs
│   │   ├── Milestones.jsx      # 3D Flip cards (hover/tap)
│   │   ├── Contact.jsx         # Contact memo sheet & message sender
│   │   └── Footer.jsx          # Signature & back-to-top
│   ├── data/                   # Clean content data files (easy to edit!)
│   │   ├── projectsData.js     # Your projects, tech stacks & links
│   │   ├── skillsData.js       # Technical skills by category
│   │   └── milestonesData.js   # Honors & competitive coding highlights
│   ├── App.jsx                 # App layout & notebook separators
│   ├── main.jsx                # React DOM entry point
│   └── index.css               # Tailwind directives & grid pattern
├── index.html                  # HTML template with Google Fonts
├── vite.config.js              # Vite configuration
├── tailwind.config.js          # Custom colors, fonts & shadows
├── postcss.config.js           # PostCSS configuration
└── package.json                # Scripts & dependencies
```

---

## 🚀 Getting Started

### 1. Start the Development Server
```bash
npm run dev
```
Visit `http://localhost:3000` to view your live portfolio with instant Hot Module Replacement (HMR).

### 2. Build for Production
```bash
npm run build
```
Creates an optimized, minified production build in the `dist/` directory.

### 3. Preview Production Build
```bash
npm run preview
```

---

## ✏️ How to Customize

All content is cleanly separated into data files in `src/data/`:

1. **Adding / Modifying Projects**:
   - Open `src/data/projectsData.js` and edit or add project objects.
2. **Updating Skills**:
   - Open `src/data/skillsData.js` and add skills to any category.
3. **Updating Milestones & Honors**:
   - Open `src/data/milestonesData.js` to change titles, descriptions, or metrics on the flip cards.
4. **Updating Your Photo**:
   - Replace `public/profile.heic` or `public/profile.jpg` with your own photo.
5. **Updating Your Resume**:
   - Replace `public/Bhavya_Agarwal_Resume.pdf` with your actual resume PDF.
6. **Updating Social Links**:
   - Edit the URLs in `src/components/Hero.jsx` and `src/components/Contact.jsx`.

---

## 🌐 Deploying to GitHub Pages or Vercel

### Option A: Vercel / Netlify (Recommended)
1. Push your repository to GitHub.
2. Import the repo into [Vercel](https://vercel.com) or [Netlify](https://netlify.com).
3. The build command (`npm run build`) and output folder (`dist`) are detected automatically.

### Option B: GitHub Pages
1. Install `gh-pages`:
   ```bash
   npm i -D gh-pages
   ```
2. In `vite.config.js`, add `base: '/<your-repo-name>/'` (if deploying to a subpath).
3. Add to `package.json` scripts:
   ```json
   "deploy": "vite build && gh-pages -d dist"
   ```
4. Run `npm run deploy`.
