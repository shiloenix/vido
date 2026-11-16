import { useState } from "react";
import { TbDownload, TbVideo, TbMusic, TbExternalLink, TbLoader2 } from "react-icons/tb";

const VideoCard = ({ info, onDownload, downloading, status }) => {
  const [selectedFormat, setSelectedFormat] = useState(info.formats?.[0]?.id || "");
  const [tab, setTab] = useState("video");

  const videoFormats =
    info.formats?.filter((f) => f.resolution && f.resolution !== "audio only") ?? [];
  const audioFormats =
    info.formats?.filter((f) => f.resolution === "audio only") ?? [];

  const displayedFormats = tab === "video" ? videoFormats : audioFormats;
  const isActive = status === "downloading" || status === "done" || status === "error";

  if (isActive) {
    return (
      <div className="w-full max-w-2xl relative">
        <span className="absolute -top-px -left-px w-5 h-5 border-t-2 border-l-2 border-gray-500/60" />
        <span className="absolute -top-px -right-px w-5 h-5 border-t-2 border-r-2 border-gray-500/60" />
        <span className="absolute -bottom-px -left-px w-5 h-5 border-b-2 border-l-2 border-gray-500/60" />
        <span className="absolute -bottom-px -right-px w-5 h-5 border-b-2 border-r-2 border-gray-500/60" />
        <div className="bg-black/40 border border-gray-500/20 backdrop-blur-sm flex items-center gap-4 px-4 py-3">
          {info.thumbnail && (
            <img
              src={info.thumbnail}
              alt=""
              className="w-16 h-10 object-cover shrink-0"
              style={{
                clipPath:
                  "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))",
              }}
            />
          )}
          <p className="text-white/70 text-xs leading-snug line-clamp-2 flex-1">
            {info.title}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl relative">
      <span className="absolute -top-px -left-px w-5 h-5 border-t-2 border-l-2 border-gray-500/60" />
      <span className="absolute -top-px -right-px w-5 h-5 border-t-2 border-r-2 border-gray-500/60" />
      <span className="absolute -bottom-px -left-px w-5 h-5 border-b-2 border-l-2 border-gray-500/60" />
      <span className="absolute -bottom-px -right-px w-5 h-5 border-b-2 border-r-2 border-gray-500/60" />

      <div className="bg-black/40 border border-gray-500/20 backdrop-blur-sm">
        <div className="flex items-center gap-3 px-4 py-2 border-b border-white/5 bg-white/2">
          <span className="text-xs text-gray-500/60 tracking-widest uppercase">
            Target acquired
          </span>
          <span className="flex-1 h-px bg-gray-500/10" />
          <span className="text-xs text-white/20">
            {info.formats?.length ?? 0} formats
          </span>
        </div>

        <div className="flex gap-4 p-4">
          {info.thumbnail && (
            <div className="relative shrink-0">
              <img
                src={info.thumbnail}
                alt=""
                className="w-40 h-30 object-cover"
                style={{
                  clipPath:
                    "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
                }}
              />
              <span className="absolute top-0 right-0 w-2 h-2 border-t border-r border-gray-400/80" />
              <span className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-gray-400/80" />
            </div>
          )}

          <div className="flex flex-col justify-between min-w-0 py-1">
            <p className="text-white/80 text-sm font-medium leading-snug line-clamp-2">
              {info.title}
            </p>
            <a
              href={info.webpage_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-gray-500/60 hover:text-gray-400 transition-colors w-fit"
            >
              <TbExternalLink className="size-3" />
              source
            </a>
          </div>
        </div>

        <div className="flex border-y border-white/5">
          {[
            { key: "video", icon: TbVideo, label: `Video (${videoFormats.length})` },
            { key: "audio", icon: TbMusic, label: `Audio (${audioFormats.length})` },
          ].map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => {
                setTab(key);
                const first = (key === "video" ? videoFormats : audioFormats)[0];
                if (first) setSelectedFormat(first.id);
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs tracking-widest uppercase transition-all
                ${
                  tab === key
                    ? "text-gray-300 bg-gray-500/8 border-b-2 border-gray-400"
                    : "text-white/30 hover:text-white/50 border-b-2 border-transparent"
                }`}
            >
              <Icon className="size-3.5" />
              {label}
            </button>
          ))}
        </div>

        <div className="max-h-44 overflow-y-auto divide-y divide-white/5 scrollbar-thin scrollbar-thumb-white/10">
          {displayedFormats.map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectedFormat(f.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all
                ${
                  selectedFormat === f.id
                    ? "bg-gray-500/10 text-white"
                    : "text-white/40 hover:text-white/70 hover:bg-white/3"
                }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 transition-all ${
                  selectedFormat === f.id ? "bg-gray-400" : "bg-white/15"
                }`}
              />

              <span className="text-xs tracking-wider flex-1">
                {f.label || f.id}
              </span>

              <span
                className={`text-xs px-1.5 py-0.5 border ${
                  selectedFormat === f.id
                    ? "border-gray-500/50 text-gray-400"
                    : "border-white/10 text-white/30"
                }`}
              >
                .{f.ext}
              </span>

              {f.resolution !== "audio only" && (
                <span className="text-xs text-white/25 w-16 text-right">
                  {f.resolution}
                </span>
              )}

              <span className="text-xs text-white/30 w-16 text-right">
                {f.filesizeLabel || "—"}
              </span>
            </button>
          ))}

          {displayedFormats.length === 0 && (
            <p className="text-xs text-white/20 text-center py-6">
              No {tab} formats found
            </p>
          )}
        </div>

        <div className="p-4 border-t border-white/5">
          <button
            onClick={() => onDownload(selectedFormat)}
            disabled={downloading || !selectedFormat}
            className={`w-full flex items-center justify-center gap-3 py-3 text-xs tracking-[0.25em] uppercase
              border transition-all duration-300 active:scale-[0.98]
              ${
                downloading
                  ? "border-gray-500/30 text-gray-500/50 bg-gray-500/5 cursor-not-allowed"
                  : "border-gray-500/50 text-gray-300 bg-gray-500/10 hover:bg-gray-500/20 hover:border-gray-400"
              }`}
          >
            {downloading ? (
              <>
                <TbLoader2 className="size-4 animate-spin" /> Downloading…
              </>
            ) : (
              <>
                <TbDownload className="size-4" /> Download
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
