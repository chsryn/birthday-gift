# 💌 A Birthday Surprise for the One Who Has My Heart

A story‑driven birthday web experience built with **React**, **Three.js**, **GSAP**, and a whole lot of love.
She'll type a secret code, watch a personal video, read a letter, and then open a 3D book of photos.

🌐 **Live site → [https://girl-friend-birthday-website.vercel.app](https://girl-friend-birthday-website.vercel.app)**

![Live status](https://img.shields.io/badge/live-vercel-success?logo=vercel)

---

## ✨ The flow

1. 💬 **Typewriter storytelling** – romantic lines appear one after another.
2. 🔐 **Secret passcode** – the right PIN unlocks everything.
3. 🎥 **Cinematic video reveal** – the screen turns black, then a personal video plays.
4. 💌 **3D love letter** – an aged‑paper note floating in space, with the full letter in Burmese and English. Scroll it, then close it.
5. 📖 **3D proposal book** – a page‑flipping book of your photos, ending on a giant scrolling marquee.

- 📱 **Phone rotation hint** and touch‑friendly navigation.

---

## 🛠️ Tech Stack

| Layer      | Tools                                                     |
| ---------- | --------------------------------------------------------- |
| Frontend   | React, Vite, Tailwind CSS (with custom theme)             |
| Animations | GSAP (GreenSock)                                          |
| 3D         | Three.js, React Three Fiber, @react-three/drei, maath     |
| Audio      | HTML5 `<audio>` for page‑flip and background music         |
| Fonts      | Playfair Display, Montserrat, Great Vibes (self‑hosted)   |
| Hosting    | Vercel (recommended) or Netlify                           |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** (v8 or higher)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/birthday-pj.git
cd birthday-pj

# Install dependencies
npm install
```

### Adding your own photos

Photos in `src/assets/book-pages/` are picked up **automatically**, sorted by filename:
`page-01.jpg` is the cover, and the last file is the back cover. Use any number of images.

```bash
# 3:4 portrait, ~1200x1600, decent quality before compressing
ffmpeg -i input.jpg -vf "crop='min(iw,ih*3/4)':'ih'" -q:v 2 page-01.jpg
```

The raw, full‑resolution originals are kept in `pipi/` (git‑ignored).

### Adding your own audio

- `public/audios/your-background-music.mp3` – background music on the book screen
- `public/audios/page-flip-01a.mp3` – played on every page turn

### Adding your own video

Drop the file at `src/assets/videos/vault.mp4`. It plays automatically once the passcode is correct.

---

## 🎬 Credits

The 3D book (page‑flip physics, particles, marquee, music player) is adapted from the
`animated-proposal-book` project, with photos, name, and audio swapped in.