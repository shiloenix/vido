import { useState } from "react";
import { MdContentPaste } from "react-icons/md";
import { TbScan, TbLoader2 } from "react-icons/tb";

const UrlInput = ({ onFetch, loading }) => {
  const [url, setUrl] = useState("");
  const [focused, setFocused] = useState(false);

  function handleSubmit() {
    if (url.trim() && !loading) onFetch(url.trim());
  }

  return (
    <div className="w-full flex flex-col items-center gap-4">
      <div className="relative w-full max-w-2xl">
        <span className={`absolute -top-px -left-px w-4 h-4 border-t-2 border-l-2 transition-colors duration-300 ${focused ? "border-gray-400" : "border-white/20"}`} />
        <span className={`absolute -top-px -right-px w-4 h-4 border-t-2 border-r-2 transition-colors duration-300 ${focused ? "border-gray-400" : "border-white/20"}`} />
        <span className={`absolute -bottom-px -left-px w-4 h-4 border-b-2 border-l-2 transition-colors duration-300 ${focused ? "border-gray-400" : "border-white/20"}`} />
        <span className={`absolute -bottom-px -right-px w-4 h-4 border-b-2 border-r-2 transition-colors duration-300 ${focused ? "border-gray-400" : "border-white/20"}`} />

        <div className="flex items-center bg-white/3 border border-white/10 backdrop-blur-sm">
          <span className="text-xs text-gray-500/70 pl-4 pr-3 select-none tracking-widest whitespace-nowrap drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]">
            URL://
          </span>

          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Paste the link here"
            className="flex-1 bg-transparent text-sm text-white/80 placeholder-white/20 focus:outline-none py-4 tracking-wide"
          />

          <button
            onClick={handleSubmit}
            disabled={!url.trim() || loading}
            className="flex items-center gap-2 px-5 py-4 text-xs tracking-widest uppercase
              bg-gray-500/10 hover:bg-gray-500/20 border-l border-gray-500/20
              text-gray-400 hover:text-gray-300
              disabled:opacity-30 disabled:cursor-not-allowed
              transition-all duration-200 active:scale-95
              shadow-[0_0_15px_rgba(251,191,36,0.15)]"
          >
            {loading
              ? <TbLoader2 className="size-4 animate-spin" />
              : <TbScan className="size-4" />
            }
            {loading ? "Scanning" : "Scan"}
          </button>
        </div>
      </div>

      <p className="text-xs text-white/20 tracking-wider">
        [
        <a
          href="https://www.youtube.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-gray-400 transition-colors"
        >
          Youtube
        </a>
        {" · "}
        <a
          href="https://x.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-gray-400 transition-colors"
        >
          Twitter
        </a>
        {" · "}
        <a
          href="https://www.facebook.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-gray-400 transition-colors"
        >
          Facebook  
        </a>
        {" · "}
        <a
          href="https://www.instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-gray-400 transition-colors"
        >
          Instagram
        </a>
        {" · "}
        <a
          href="https://www.tiktok.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-gray-400 transition-colors"
        >
          TikTok
        </a>
        {" · "}
        <a
          href="https://www.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-gray-400 transition-colors"
        >
          {"1800+ "}
        </a>
        ]
        </p>
    </div>
  );
};

export default UrlInput;
