<div align="center">
<img width="1200" height="475" alt="NanoManga Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

# 🎨 NanoManga Pro

**Professional AI-Powered Manga & Comic Generation**

Transform your photos into stunning manga pages and western comics using Google's advanced Gemini AI models.

[![React](https://img.shields.io/badge/React-19.2.0-61dafb?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2.0-646cff?logo=vite)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

[Features](#-features) • [Demo](#-demo) • [Installation](#-installation) • [Usage](#-usage) • [Tech Stack](#-tech-stack) • [Contributing](#-contributing)

</div>

---

## 📖 About

**NanoManga Pro** is a cutting-edge web application that leverages Google's Gemini AI to transform ordinary photos into professional manga panels and comic book pages. Whether you're a manga enthusiast, comic artist, or creative storyteller, NanoManga Pro provides powerful tools to bring your vision to life with multiple art styles, character dialogue, and customizable layouts.

### 🌟 Key Highlights

- 🤖 **Dual AI Models**: Choose between Gemini Flash (fast & free) or Gemini Pro (premium quality)
- 🎨 **20+ Art Styles**: From Shonen Jump to Studio Ghibli, Sin City to Marvel
- 💬 **Interactive Dialogue**: Add speech bubbles and character interactions
- 📚 **Multi-Panel Layouts**: Single-page, single-box, or two-page spread options
- 🔄 **Consistency Mode**: Maintain character consistency across multiple pages
- 📖 **Built-in Reader**: Browse your generated manga with an immersive reader
- 💾 **History Management**: Keep track of all your created pages

---

## ✨ Features

### 🎭 Art Style Library

#### Anime Styles
- **Shonen Jump** (Modern Action) - Sharp, angular, high-contrast action manga
- **90s Retro / Cel Aesthetic** - Nostalgic hand-painted animation look
- **Studio Ghibli** - Soft, painterly Miyazaki-inspired art
- **Moe / KyoAni** - Highly polished, glossy, emotional style
- **Studio Trigger** - Neon pop art with exaggerated perspectives
- **Classic Shojo** - Romantic style with sparkly eyes and pastel colors
- **Makoto Shinkai** - Hyper-realistic scenery with cinematic lighting
- **JoJo Style** - Dramatic poses with heavy shading and bold colors
- **Ufotable Digital** - High-fidelity with particle effects and 2D/3D blending
- **Chibi** - Super deformed, cute characters

#### Western Comic Styles
- **Classic Superhero** (Silver Age) - Bright colors and heroic anatomy
- **Kirby Style** - Cosmic energy with dynamic explosive action
- **Image Comics** (90s Extreme) - Gritty, exaggerated muscular style
- **Noir / High-Contrast** (Frank Miller) - Sin City black and white aesthetic
- **Ligne Claire** (Tintin) - Clear outlines with flat vivid colors
- **Vertigo / Painted** - Realistic, dreamlike painted artwork
- **Animated Style** (Bruce Timm) - Simplified angular shapes
- **Underground Comix** - Grotesque, hand-drawn aesthetic
- **Modern House Style** - Cinematic widescreen superhero comics
- **Indie / Graphic Memoir** - Sketchy, minimalist, emotional focus

### 🎯 Core Features

- **Multi-Image Support**: Upload up to 14 character images (Pro) or 3 (Flash)
- **Character Editor**: Define actions, context, and dialogue for each character
- **Custom Style References**: Upload reference images for specific art styles
- **Panel Layout Options**: Choose from various manga panel configurations
- **Narrator Captions**: Add scene-setting text and narration
- **Page Consistency**: Link pages together for cohesive storytelling
- **Instant Download**: Save your creations in high quality
- **Responsive Design**: Works seamlessly on desktop and mobile devices

---

## 🖼️ Demo

### NanoManga in Action

> 💡 **Try it online**: [NanoManga Pro on AI Studio](https://ai.studio/apps/drive/1LtWClX9RDAzWskLr4p8TDaqdMwAJLBwj)

*Screenshots and demo videos will be added soon. In the meantime, try the live demo above to see NanoManga in action!*

---

## 🚀 Installation

### Prerequisites

- **Node.js** (v18 or higher recommended)
- **npm** or **yarn**
- **Gemini API Key** ([Get one free here](https://aistudio.google.com/app/apikey))

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/KhazP/NanoManga.git
   cd NanoManga
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API Key** (Optional for local development)
   
   Create a `.env.local` file in the root directory:
   ```env
   VITE_GEMINI_API_KEY=your_api_key_here
   ```
   
   ⚠️ **Security Note**: Never commit your API key to version control. The `.env.local` file is already included in `.gitignore`.
   
   *Alternatively: You can enter your API key directly in the app interface.*

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:5173` (or the URL shown in your terminal)

### Build for Production

```bash
npm run build
npm run preview
```

The production-ready files will be in the `dist/` directory.

---

## 📘 Usage

### Getting Started

1. **Choose Your AI Model**
   - **Flash**: Fast generation, free tier available, supports 3 images
   - **Pro**: Maximum quality, requires paid API key, supports 14 images

2. **Configure API Key**
   - Enter your Gemini API key when prompted
   - Free API keys are available at [Google AI Studio](https://aistudio.google.com/app/apikey)

3. **Upload Characters**
   - Click "Characters" section to upload images
   - Each image represents a character or element in your manga
   - Click on any character to add dialogue and context

4. **Select Art Style**
   - Choose between Anime or Western style categories
   - Pick from 20+ preset styles or create your own
   - Optionally upload a reference image for custom styles

5. **Configure Layout**
   - **Single Page**: Traditional manga page layout
   - **Single Box**: Focused single panel
   - **Two Page**: Manga spread across two pages

6. **Add Dialogue & Context**
   - Click characters to add speech bubbles
   - Use "Narrator / Caption" for scene text
   - Describe character actions and emotions

7. **Generate Your Manga**
   - Click "GENERATE!" to create your page
   - Enable "Consistency Mode" to reference previous pages
   - View results in the canvas area

8. **Manage Your Work**
   - Switch to "HISTORY" mode to view all generated pages
   - Use the built-in reader to browse your manga
   - Download individual pages or entire collections

### API Key Options

#### Using Google AI Studio (Recommended for AI Studio users)
- The app will prompt you to select your API key
- Keys are managed securely through the AI Studio interface

#### Using Manual API Key
- Enter your key directly in the app
- Key starts with `AIza...`
- Stored locally in your browser session

### Cost Information

- **Gemini Flash**: Free tier available (rate limits apply)
- **Gemini Pro**: Approximately $0.134 per image generation
- Costs are tracked in the app interface during your session

---

## 🛠️ Tech Stack

### Frontend Framework
- **React 19.2.0** - Modern UI library
- **TypeScript 5.8.2** - Type-safe development
- **Vite 6.2.0** - Lightning-fast build tool

### AI & APIs
- **Google Gemini AI** - Advanced image generation models
- **@google/genai 1.30.0** - Official Gemini SDK

### UI & Styling
- **Lucide React** - Beautiful icon library
- **TailwindCSS** (via inline styles) - Comic-book inspired design system
- **Custom Comic UI** - Unique manga/comic aesthetic

### Development Tools
- **@vitejs/plugin-react** - React integration for Vite
- **@types/node** - Node.js type definitions

---

## 📁 Project Structure

```
NanoManga/
├── components/
│   ├── Header.tsx           # Top navigation bar
│   ├── ImageUploader.tsx    # Image upload component
│   └── LoadingOverlay.tsx   # Loading animation
├── services/
│   └── geminiService.ts     # Gemini API integration
├── App.tsx                  # Main application component
├── index.tsx                # Application entry point
├── types.ts                 # TypeScript type definitions
├── metadata.json            # App metadata
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript configuration
├── package.json             # Project dependencies
└── README.md                # This file
```

---

## 🤝 Contributing

Contributions are welcome! Whether you're fixing bugs, adding features, or improving documentation, your help makes NanoManga better.

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
   - Follow the existing code style
   - Add comments for complex logic
   - Test your changes thoroughly
4. **Commit your changes**
   ```bash
   git commit -m 'Add some amazing feature'
   ```
5. **Push to your branch**
   ```bash
   git push origin feature/amazing-feature
   ```
6. **Open a Pull Request**

### Development Guidelines

- Use TypeScript for type safety
- Follow React best practices and hooks patterns
- Keep components modular and reusable
- Write descriptive commit messages
- Test on multiple browsers and devices

### Ideas for Contribution

- 🎨 Add more art style presets
- 🌍 Internationalization (i18n) support
- 📱 Enhanced mobile experience
- 🎭 Custom panel shapes and effects
- 💾 Cloud storage integration
- 🔄 Batch processing features
- 📊 Analytics and usage statistics

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Google AI** - For providing the powerful Gemini models
- **React Team** - For the amazing framework
- **Vite Team** - For the incredibly fast build tool
- **Lucide** - For the beautiful icon library
- **Open Source Community** - For inspiration and support

---

## 📞 Contact & Support

- **Issues**: [GitHub Issues](https://github.com/KhazP/NanoManga/issues)
- **Discussions**: [GitHub Discussions](https://github.com/KhazP/NanoManga/discussions)
- **AI Studio**: [View on Google AI Studio](https://ai.studio/apps/drive/1LtWClX9RDAzWskLr4p8TDaqdMwAJLBwj)

---

## 🌟 Star History

If you find NanoManga useful, please consider giving it a ⭐ on GitHub!

---

<div align="center">

**Built with ❤️ using Google Gemini AI**

Made for manga artists, comic creators, and storytellers worldwide

</div>
