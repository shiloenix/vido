import { TbCheck, TbAlertTriangle, TbPlayerPause, TbPlayerPlay, TbX } from "react-icons/tb";

const JobProgress = ({ percent = 0, speed, eta, status, onCancel, onPause }) => {
  const done = status === "done";
  const error = status === "error";
  const paused = status === "paused";
  const downloading = status === "downloading" || paused;

  const color = error
    ? "bg-red-500"
    : done
    ? "bg-emerald-400"
    : paused
    ? "bg-gray-300/50"
    : "bg-gray-400";

  const borderColor = error
    ? "border-red-500/30"
    : done
    ? "border-emerald-400/30"
    : "border-gray-500/20";

  const cornerColor = done
    ? "border-emerald-400/60"
    : error
    ? "border-red-500/60"
    : "border-gray-500/60";

  return (
    <div className={`relative border ${borderColor} bg-black/30`}>
      <span className={`absolute -top-px -left-px w-3 h-3 border-t-2 border-l-2 ${cornerColor}`} />
      <span className={`absolute -top-px -right-px w-3 h-3 border-t-2 border-r-2 ${cornerColor}`} />
      <span className={`absolute -bottom-px -left-px w-3 h-3 border-b-2 border-l-2 ${cornerColor}`} />
      <span className={`absolute -bottom-px -right-px w-3 h-3 border-b-2 border-r-2 ${cornerColor}`} />

      <div className="p-3">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            {done && <TbCheck className="size-3.5 text-emerald-400" />}
            {error && <TbAlertTriangle className="size-3.5 text-red-400" />}
            {downloading && !paused && (
              <span className="relative flex size-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gray-400 opacity-60" />
                <span className="relative inline-flex rounded-full size-1.5 bg-gray-500" />
              </span>
            )}
            {paused && <span className="relative inline-flex rounded-full size-1.5 bg-gray-300/50" />}

            <span
              className={`text-xs tracking-widest uppercase ${
                done
                  ? "text-emerald-400"
                  : error
                  ? "text-red-400"
                  : paused
                  ? "text-gray-300/60"
                  : "text-gray-400"
              }`}
            >
              {done ? "Transfer complete" : error ? "Transfer failed" : paused ? "Paused" : "Transferring…"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-bold ${
                done ? "text-emerald-400" : error ? "text-red-400" : "text-gray-300"
              }`}
            >
              {percent.toFixed(1)}%
            </span>

            {downloading && (
              <button
                onClick={onPause}
                title={paused ? "Resume" : "Pause"}
                className="flex items-center gap-1 px-2 py-1 text-xs tracking-widest uppercase border border-gray-500/30 text-gray-400/70 hover:text-gray-300 hover:border-gray-400/50 transition-all"
              >
                {paused ? <TbPlayerPlay className="size-3" /> : <TbPlayerPause className="size-3" />}
              </button>
            )}

            {downloading && (
              <button
                onClick={onCancel}
                title="Cancel"
                className="flex items-center gap-1 px-2 py-1 text-xs tracking-widest uppercase border border-red-500/30 text-red-400/70 hover:text-red-300 hover:border-red-400/50 transition-all"
              >
                <TbX className="size-3" />
              </button>
            )}
          </div>
        </div>

        <div className="relative h-1.5 bg-white/5 overflow-hidden mb-2.5">
          {downloading && !paused && (
            <div className="absolute inset-y-0 left-0 bg-gray-500/10 animate-pulse" style={{ width: "100%" }} />
          )}
          <div
            className={`absolute inset-y-0 left-0 transition-all duration-500 ease-out ${color}`}
            style={{ width: `${percent}%` }}
          />
          {downloading && !paused && (
            <div
              className="absolute inset-y-0 w-6 bg-white/20 blur-sm transition-all duration-500"
              style={{ left: `calc(${percent}% - 12px)` }}
            />
          )}
        </div>

        {downloading && (
          <div className="flex items-center gap-5">
            <div>
              <p className="text-xs text-white/25 uppercase tracking-widest mb-0.5">Speed</p>
              <p className="text-xs text-white/60">{paused ? "—" : (speed ?? "—")}</p>
            </div>
            <div>
              <p className="text-xs text-white/25 uppercase tracking-widest mb-0.5">ETA</p>
              <p className="text-xs text-white/60">{paused ? "—" : (eta ?? "—")}</p>
            </div>
            <div className="flex-1 text-right">
              <p className="text-xs text-white/25 uppercase tracking-widest mb-0.5">Status</p>
              <p className={`text-xs ${paused ? "text-gray-300/40" : "text-gray-500/60 animate-pulse"}`}>
                {paused ? "Paused" : "Live"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobProgress;
