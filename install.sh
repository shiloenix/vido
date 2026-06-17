#!/usr/bin/env bash

set -e
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'
log()    { echo -e "${BLUE}[VIDO]${NC} $1"; }
ok()     { echo -e "${GREEN}[OK]${NC} $1"; }
warn()   { echo -e "${YELLOW}[WARN]${NC} $1"; }
err()    { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

print_banner() {
  echo -e "${BLUE}"
  echo "  ██╗   ██╗██╗██████╗  ██████╗  "
  echo "  ██║   ██║██║██╔══██╗██╔═══██╗ "
  echo "  ██║   ██║██║██║  ██║██║   ██║ "
  echo "  ╚██╗ ██╔╝██║██║  ██║██║   ██║ "
  echo "   ╚████╔╝ ██║██████╔╝╚██████╔╝ "
  echo "    ╚═══╝  ╚═╝╚═════╝  ╚═════╝  "
  echo -e "${NC}"
  echo -e "${YELLOW}  Multi-source Video Extraction System${NC}"
  echo ""
}

detect_os() {
  if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
    OS_LIKE=$ID_LIKE
  elif [ "$(uname)" = "Darwin" ]; then
    OS="macos"
  else
    err "Cannot detect OS. Please install dependencies manually from deps/"
  fi
}

install_deps() {
  log "Detected OS: $OS"
  case "$OS" in
    arch | manjaro | endeavouros)
      log "Installing dependencies with pacman..."
      bash packages/arch.txt
      ;;
    debian)
      log "Installing dependencies for Debian..."
      bash packages/debian.txt
      ;;
    ubuntu | linuxmint | pop)
      log "Installing dependencies for Ubuntu..."
      bash packages/ubuntu.txt
      ;;
    fedora)
      log "Installing dependencies for Fedora..."
      bash packages/fedora.txt
      ;;
    *)
      if echo "$OS_LIKE" | grep -q "debian"; then
        log "Debian-like OS detected, using debian deps..."
        bash deps/debian.txt
      elif echo "$OS_LIKE" | grep -q "arch"; then
        log "Arch-like OS detected, using arch deps..."
        sudo pacman -Sy --needed python ffmpeg yt-dlp docker docker-compose nodejs npm
        sudo systemctl enable --now docker
      elif echo "$OS_LIKE" | grep -q "fedora"; then
        log "Fedora-like OS detected, using fedora deps..."
        bash deps/fedora.txt
      else
        warn "Unknown OS: $OS"
        warn "Please install dependencies manually from deps/"
        warn "Then re-run this script with --skip-deps"
        exit 1
      fi
      ;;
  esac

  if ! id -nG "$USER" | grep -qw docker; then
    log "Adding $USER to docker group..."
    sudo usermod -aG docker "$USER"
    ok "$USER added to docker group"
    exec sg docker "$0" --docker-ready
  fi

  ok "Dependencies installed"
}

check_already_installed() {
  log "Checking existing installations..."
  command -v python3 >/dev/null 2>&1 && ok "python3 already installed" || true
  command -v ffmpeg >/dev/null 2>&1  && ok "ffmpeg already installed"  || true
  command -v yt-dlp >/dev/null 2>&1  && ok "yt-dlp already installed"  || true
  command -v node >/dev/null 2>&1    && ok "node already installed"    || true
  command -v docker >/dev/null 2>&1  && ok "docker already installed"  || true
}

check_docker() {
  if ! command -v docker >/dev/null 2>&1; then
    err "Docker is not installed. Please re-run the script without --skip-deps"
  fi
  if ! docker info >/dev/null 2>&1; then
    warn "Docker daemon is not running. Attempting to start..."
    if [ "$OS" = "macos" ]; then
      open -a Docker
      log "Waiting for Docker to start..."
      sleep 10
    else
      sudo systemctl start docker
    fi
  fi
  ok "Docker is running ..."
}

launch() {
  log "Building ..."
  docker compose up --build
}

main() {
  SKIP_DEPS=false
  DOCKER_READY=false
  for arg in "$@"; do
    case $arg in
      --skip-deps)    SKIP_DEPS=true ;;
      --docker-ready) DOCKER_READY=true ;;
    esac
  done

  if [ "$DOCKER_READY" = true ]; then
    detect_os
    check_docker
    echo ""
    log "Starting VIDO on port 35179"
    echo ""
    launch
    return
  fi

  print_banner
  detect_os

  if [ "$SKIP_DEPS" = false ]; then
    check_already_installed
    install_deps
  else
    log "Skipping dependency installation (--skip-deps)"
  fi

  check_docker

  echo ""
  log "Starting VIDO on port 35179"
  echo ""
  launch
}

main "$@"
