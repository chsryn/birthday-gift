# 💌 An Interactive Birthday Gift

A personal web experience made to celebrate a birthday. Follow a short intro, enter a special code, read a 3D birthday message, and open an interactive memory book filled with photos, music, and animations.

This project combines a story-driven birthday experience with a 3D photo book. The photos, message, music, colors, and other details have been customized for this gift.

## ✨ The Experience

1. **Animated introduction** with a typewriter sequence, music, and a keypad for the special code.
2. **3D birthday message** revealed after the introduction.
3. **Interactive 3D memory book** with page turning, direct page navigation, and particle effects.
4. **Music and sound effects** for the intro, book, and page turns.
5. **Clean view** to hide the book controls, plus a rotation hint for phone screens.

> The keypad code is checked client-side. It is part of the experience, not an authentication or content-protection mechanism.

## 🛠️ Tech Stack

- React 19 and Vite 8
- Three.js, React Three Fiber, and Drei for the 3D scene
- GSAP for animation
- Tailwind CSS for styling
- Maath and React Icons

## 🚀 Run Locally

### Prerequisites

- Node.js `^20.19.0` or `>=22.12.0`
- npm

### Install and start

```bash
git clone https://github.com/chsryn/birthday-gift.git
cd birthday-gift
npm install
npm run dev
```

Other available commands:

```bash
npm run lint      # Check the code with ESLint
npm run build     # Create a production build in dist/
npm run preview   # Preview the production build locally
```

## 🖼️ Customize Photos and Content

- **Book photos:** add sequentially named, zero-padded JPG files to `src/assets/book-pages/`, such as `page-01.jpg`, `page-02.jpg`, and so on. Vite discovers and sorts them automatically. Use an even number of photos so they all fit in the book.
- **Covers:** replace `src/assets/book/book-cover.jpg` and `src/assets/book/book-back.jpg`.
- **Message:** edit the text in `src/components/NotePopup.jsx`.
- **Keypad code:** change `PASSCODE` in `src/components/Keypad.jsx`.
- **Music:** audio files are in `public/audios/`. If you rename a file, update the track list in `src/components/book/MusicPlayer.jsx` and the intro audio path in `src/components/TypewriterSequence.jsx`.
- **Book background:** replace `public/background-image.jpg`.

Make sure you have permission to use and share any photos, music, or other materials you add.

## 📁 Project Structure

```text
src/
├── App.jsx
├── components/
│   ├── TypewriterSequence.jsx
│   ├── NotePopup.jsx
│   ├── BookScreen.jsx
│   └── book/
│       ├── Book.jsx
│       ├── Experience.jsx
│       ├── MusicPlayer.jsx
│       └── pages.js
├── assets/
│   ├── book-pages/
│   ├── book/
│   └── fonts/
└── hooks/
    └── useTypewriterTimeline.js
public/
├── audios/
└── background-image.jpg
```

## 🙏 Inspiration

The birthday flow and 3D memory book have been customized for this project. Use only code and assets that you own or are permitted to use and share.
