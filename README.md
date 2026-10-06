# Bhavya Agarwal — Notebook Portfolio Website 📓

A handcrafted personal portfolio website styled as an authentic engineering notebook with graph paper, typewriter ink stamps, washi tape accents, and handwritten annotations.

---

## 🎨 Design Overview

- **Aesthetic**: Vintage engineering / lab graph paper with blue ink stamps (`#18417e`) and handwritten notes.
- **Typography**: 
  - `Special Elite` (Google Fonts): Vintage stamped typewriter font for headlines and name stamps.
  - `Courier Prime` (Google Fonts): Clean, classic monospace font for text and tags.
  - `Caveat` (Google Fonts): Casual handwritten font for margin scribbles and notes.
- **Key Visual Elements**:
  - Grid background with subtle 24px grid lines.
  - Polaroid photo frame with semi-transparent blue washi tape and doodle sparks.
  - Lab notebook cards with taped corners and hover effects.
  - **Interactive 3D Flip Cards** in Milestones & Honors (clean heading on front, details & metrics reveal on hover/tap).
  - Bracket-styled typewriter navigation `[HOME]`, `[PROJECTS]`, `[SKILLS]`, `[HONORS]`, `[CONTACT]`.
  - Responsive mobile drawer navigation.
  - Automatic `.heic` format conversion support for iPhone photos.

---

## 📁 File Structure

```
portfoliowebsite1.0/
├── index.html           # Main single-page scrollable structure
├── style.css            # Notebook & graph paper styles, 3D flip card styles
├── script.js            # Smooth scroll, project filters, flip cards, contact form
├── README.md            # Documentation & instructions
└── assets/
    ├── profile.heic     # Your profile photo (supports .heic, .jpg, .png)
    ├── profile.jpg      # Your profile photo
    ├── profile-sample.jpg # Cropped sample portrait from the mockup
    └── Bhavya_Agarwal_Resume.pdf # Your downloadable resume PDF
```

---

## 🚀 How to Run Locally

Because this is built with clean vanilla HTML, CSS, and JavaScript, there are **no heavy build tools or npm installs required**!

### Option 1: Just Open in Browser
Double-click `index.html` to open it directly in Chrome, Edge, Safari, or Firefox.

### Option 2: Run a Local Dev Server
In the project directory, run:
```bash
# Using Python
python -m http.server 3000

# Or using Node
npx serve .
```
Then visit `http://localhost:3000` in your browser.

---

## ✏️ How to Customize

### 1. Replacing the Profile Picture
- Place your photo inside the `assets/` folder named `profile.jpg` (or `.png`).
- The CSS automatically applies the polaroid frame, washi tape, and tilt angle!

### 2. Updating Your Resume
- Replace `assets/Bhavya_Agarwal_Resume.pdf` with your actual resume PDF.

### 3. Adding Your Social & Project Links
- Open `index.html`:
  - Search for `https://github.com` and replace with your GitHub handle.
  - Search for `https://linkedin.com` and replace with your LinkedIn profile URL.
  - Search for `https://leetcode.com` and replace with your LeetCode profile URL.
  - Search for `bhavya.agarwal@example.com` and replace with your email address.

### 4. Adding or Editing Projects
In `index.html`, find the `<section class="section projects-section" id="projects">`. Each project is enclosed in:
```html
<div class="project-card" data-category="ai-ml">
  ...
</div>
```
Categories available for filtering:
- `data-category="ai-ml"`: AI / Machine Learning
- `data-category="fullstack"`: Web Development / Full-Stack
- `data-category="systems"`: Algorithms, Systems, & Tools

---

## 🌐 Deploying to GitHub Pages (Free Hosting)

1. Commit your changes:
   ```bash
   git add .
   git commit -m "Initial portfolio release"
   ```
2. Push to your GitHub repository:
   ```bash
   git remote add origin https://github.com/<your-username>/<repo-name>.git
   git branch -M main
   git push -u origin main
   ```
3. In your GitHub repository:
   - Go to **Settings** > **Pages**.
   - Under **Source**, choose **Deploy from a branch**.
   - Select `main` branch and `/ (root)` folder.
   - Click **Save**. Your site will be live at `https://<your-username>.github.io/<repo-name>/`!

