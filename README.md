# VIDO

**Multi-source Video Extraction System — free, open source, containerized, no ads.**

VIDO is a self-hosted video downloader built on [yt-dlp](https://github.com/yt-dlp/yt-dlp), wrapped in a clean terminal-aesthetic UI. Paste a link, pick a format, download. No accounts, no tracking, no ads, no limits.

---

## Features

### Multi-source support
Download from 1800+ supported sites including YouTube, Twitter/X, Facebook, Instagram, TikTok, Vimeo, Twitch, SoundCloud, and many more — anything yt-dlp supports, VIDO supports.

### Format selection
Before downloading, VIDO fetches all available formats for the video and lets you choose exactly what you want — resolution, codec, file size. No blind downloading.

### Real-time progress
A live progress bar shows download percentage, transfer speed, and ETA as the download happens — streamed in real time via SSE (Server-Sent Events).

### Download history
Every completed download is logged locally with title, thumbnail, format, and timestamp. Search, browse, and manage your history — or clear it all at once.

### No ads, no telemetry
VIDO collects nothing. No analytics, no tracking, no third-party scripts. Your downloads stay between you and your machine.

### Self-hosted Docker containerized
It ships as a Docker Compose stack. One command and it's running — no Node or Python setup required on the host.

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, Tailwind CSS |
| Backend | Node.js |
| Downloader | yt-dlp |
| Streaming | Server-Sent Events (SSE) |
| Containerization | Docker + Docker Compose |

---

## Prerequisites

Before running VIDO, install the required system dependencies for your OS. A setup script is provided that detects your OS and installs everything automatically.

| OS | Manual dependencies file |
|---|---|
| Arch Linux | `packages/arch.txt` |
| Debian | `packages/debian.txt` |
| Ubuntu | `packages/ubuntu.txt` |
| Fedora | `packages/fedora.txt` |

Required: `python3`, `ffmpeg`, `yt-dlp`, `docker`, `docker-compose`, `node`, `npm`

---

## Getting started

---
### Automatic (recommended)

The setup script detects your OS, installs all dependencies, and launches VIDO in one command:

```bash
git clone https://github.com/shiloenix/vido.git
cd vido
chmod +x install.sh
./install.sh
```

Then open [http://localhost:35179].

### Skip dependency installation

If you already have all dependencies installed:

```bash
./install.sh --skip-deps
```
### Manual setup without Docker

```bash
cd vido
npm install 
npm run dev
```

---

## Configuration

Downloads are saved to `~/Downloads` by default. To change this, edit `DOWNLOAD_DIR` in `server/server.js`:

```js
const DOWNLOAD_DIR = path.join(os.homedir(), "Downloads");
```

After any config change rebuild with:

```bash
docker compose up --build
```

---

## Usage

1. Paste a video URL into the input field
2. Click **Scan** — VIDO fetches all available formats
3. Select a video resolution or audio format from the list
4. Click **Download**
5. Watch the real-time progress bar — speed and ETA update live
6. Find your extracted file in `~/Downloads`

To pause a download click **Pause** in the progress bar. To cancel it entirely click **Cancel** — the underlying process is killed cleanly.

---

## Troubleshooting

**Transfer failed immediately**
Make sure `yt-dlp` and `ffmpeg` are installed on the host machine. Docker does not bundle them — see `packages/` for your OS.

**Progress bar doesn't update in real time**
Make sure nothing is proxying or buffering the response between the server and browser (e.g. nginx without `proxy_buffering off`).

**Port already in use**
Change the ports in `client/.env` and `server/.env`, update `docker-compose.yml` to match, then rebuild.

**Docker permission denied**
Run `sudo usermod -aG docker $USER` then log out and back in.

**yt-dlp outdated / site no longer works**
Update yt-dlp on the host: `pip install yt-dlp --upgrade` or `sudo pacman -Sy yt-dlp` on Arch.

---

