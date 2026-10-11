# Ziad Gamal — Flutter Developer Portfolio

A high-performance, responsive portfolio website built with **React 19**, **TypeScript**, and **Vite 8**, showcasing 2+ years of production experience in Flutter & Dart cross-platform mobile and web application development.

---

## ⚡ Features & Architecture

- **Creative Hero Code Card (`portfolio.dart`)**:
  - Live interactive Flutter dev console with real-time Dart code typing animation.
  - Interactive "Inspect My Portfolio" widget tree inspection that live-highlights matching UI components on the page.
  - 3D perspective tilt with radial spotlight hairline border and light sweep.
- **Skill Connection Network**:
  - Interactive 3D Dotted Globe canvas with real-time bezier skill connection arcs and landing pulse rings.
- **Pinned Work Showcase**:
  - Pinned horizontal/vertical GSAP ScrollTrigger timeline featuring 5 comprehensive production projects (*Sintir Educational Apps*, *Sintir Admin Panel*, *In Egypt Mobile*, *In Egypt Admin Panel*, *FruitHub E-Commerce*).
  - Deep-dive Project Details modal rendered via React portal outside transform containers, complete with keyboard navigation (arrows/Esc), focus trap, and smooth scroll retention.
- **Dual Theme System (Light & Dark)**:
  - Theme-aware design system using CSS custom properties on `:root` and `[data-theme]`.
  - Circular clip-path reveal using the native View Transitions API with seamless fallback for reduced-motion.
- **Web3Forms Contact Form**:
  - Client-side RFC email validation and empty-field checks.
  - Duplicate submission protection with live loading spinner and button morphing.
  - Clear, accessible success and error feedback alerts.
- **Accessibility & Motion First**:
  - Full WCAG 2.2 AA compliance: high-contrast text ratios, visible focus indicators, screen-reader friendly semantic landmarks (`<main>`, `<nav>`, `<aside>`, `<section>`, `<footer>`).
  - Automatic `prefers-reduced-motion` detection disabling heavy canvas loops and complex transforms.
  - Custom cursor system that seamlessly yields to native pointer inside modal dialogs and form inputs.

---

## 🛠 Tech Stack

- **Framework**: React 19 + TypeScript (Strict mode)
- **Bundler & Tooling**: Vite 8, Rolldown / Oxc, Oxlint
- **Styling**: Tailwind CSS 3, PostCSS, Autoprefixer
- **Motion & Scrolling**: Framer Motion 14, GSAP 3 (ScrollTrigger), Lenis 1.3
- **Testing**: Vitest 5 + JSDOM
- **Email Delivery**: Web3Forms API
- **Typography**: Self-hosted Latin fonts via `@fontsource` (Space Grotesk, Inter, JetBrains Mono)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (Node 20+ recommended)
- npm, pnpm, or yarn

### Installation
```bash
git clone https://github.com/Ziad-Gamal12/portfolio.git
cd portfolio
npm install
```

### Environment Configuration
Create a `.env` file in the project root (see `.env.example`):
```bash
cp .env.example .env
```
Add your Web3Forms access key:
```env
VITE_WEB3FORMS_KEY=your_web3forms_access_key_here
```

### Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Vite development server with HMR at `http://localhost:5173/` |
| `npm run build` | Type-checks with `tsc` and compiles a production bundle in `dist/` |
| `npm test` | Runs the Vitest automated test suite |
| `npm run lint` | Runs the fast Oxlint linter across all source files |
| `npm run preview` | Serves the production build locally for verification |

---

## 🧪 Testing

The project includes unit and integration tests covering:
- **Contact Form**: Email regex validation, field trimming, duplicate prevention, and Web3Forms API mocking (success, invalid key, network timeout).
- **Portfolio Data**: Schema and link integrity across all 5 projects, services, experiences, and statistics.
- **Theme Persistence**: Light/dark mode switching and `localStorage` persistence.

Run tests:
```bash
npm test
```

---

## 🌐 Deployment

### Vercel (Recommended)
1. Import the repository in [Vercel](https://vercel.com).
2. Configure **Environment Variables**:
   - `VITE_WEB3FORMS_KEY`: Your Web3Forms access key.
3. Deploy! Vercel automatically detects Vite (`npm run build` -> `dist`).

### GitHub Pages
A GitHub Actions workflow can build and deploy the static `dist/` directory to GitHub Pages. Remember to add `VITE_WEB3FORMS_KEY` as a GitHub Actions secret.

---

## 📄 License & Credits

Designed & Developed by **Ziad Gamal** © 2026.
- GitHub: [@Ziad-Gamal12](https://github.com/Ziad-Gamal12)
- LinkedIn: [Ziad Gamal](https://linkedin.com/in/ziad-gamal-54b052375/)
- Email: [ziadgamal.work@gmail.com](mailto:ziadgamal.work@gmail.com)
