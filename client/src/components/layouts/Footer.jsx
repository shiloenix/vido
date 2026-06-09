import { TbBrandGithub } from "react-icons/tb";

const PLATFORM_LINKS = {
  "YouTube": "https://youtube.com",
  "Twitter": "https://twitter.com",
  "Instagram": "https://instagram.com",
  "TikTok": "https://tiktok.com",
  "Facebook": "https://facebook.com",
  "1800+ more": "https://google.com",
};

const Footer = () => {
  return (
    <footer className="relative border-t border-amber-500/10 bg-black/90 backdrop-blur-sm">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">

          <div className="flex flex-col items-center md:items-start gap-1.5">
            <a href="/" className="flex items-center gap-0">
              <img
                src="/vex.svg"
                alt=""
                className="h-8 w-auto"
              />
              <span className="font-mono text-sm font-bold tracking-[0.2em] text-amber-400 uppercase">
                VIDO
              </span>
            </a>
            <p className="font-mono text-xs text-white/30 tracking-widest uppercase">
              Multi-source video extraction system
            </p>
          </div>

          <div className="flex flex-col items-center gap-2">
            <p className="font-mono text-xs text-white/25 tracking-widest uppercase mb-1">
              Supported
            </p>
            <div className="flex items-center gap-3 flex-wrap justify-center">
              {Object.entries(PLATFORM_LINKS).map(([site, href]) => (
                <a  
                  key={site}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-white/35 hover:text-amber-400/60 transition-colors"
                >
                  {site}
                </a>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center md:items-end gap-1.5">
            <p className="font-mono text-xs text-white/30 tracking-wider flex items-center gap-1.5">
              Powered by
              <a  
                href="https://github.com/yt-dlp/yt-dlp"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-500/50 hover:text-amber-400 transition-colors flex items-center gap-1"
              >
                <TbBrandGithub className="size-3" />
                yt-dlp
              </a>
            </p>
          </div>

        </div>

        <div className="mt-8 pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-mono text-xs text-white/20 tracking-wider">
            © 2026 VIDO — All rights reserved
          </p>
          <p className="font-mono text-xs text-white/20 tracking-wider">
            Always respect copyright and platform terms of service
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;