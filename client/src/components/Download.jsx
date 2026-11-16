import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { TbCheck, TbX, TbLoader2 } from "react-icons/tb";
import UrlInput from "./layouts/UrlInput";
import VideoCard from "./utils/VideoCard";

const API = "http://localhost:39101";
const ACTIVE_JOBS_KEY = "vido:activeJobIds";

function rememberJob(id) {
  try {
    const arr = JSON.parse(localStorage.getItem(ACTIVE_JOBS_KEY) || "[]");
    if (!arr.includes(id)) arr.push(id);
    localStorage.setItem(ACTIVE_JOBS_KEY, JSON.stringify(arr));
  } catch {
    localStorage.setItem(ACTIVE_JOBS_KEY, JSON.stringify([id]));
  }
}

const ConfirmModal = ({ title, format, loading, onCancel, onConfirm }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={!loading ? onCancel : undefined} />

    <div className="relative w-full max-w-md">
      <span className="absolute -top-px -left-px w-4 h-4 border-t-2 border-l-2 border-gray-500/60" />
      <span className="absolute -top-px -right-px w-4 h-4 border-t-2 border-r-2 border-gray-500/60" />
      <span className="absolute -bottom-px -left-px w-4 h-4 border-b-2 border-l-2 border-gray-500/60" />
      <span className="absolute -bottom-px -right-px w-4 h-4 border-b-2 border-r-2 border-gray-500/60" />

      <div className="bg-[#0a0f14] border border-gray-500/20 p-6 flex flex-col gap-4">
        <p className="text-xs text-gray-500/60 tracking-widest uppercase">Confirm</p>

        <p className="text-white/80 text-sm leading-snug line-clamp-2">{title}</p>

        <div className="flex items-center gap-2 px-3 py-2 bg-gray-500/5 border border-gray-500/15 w-fit">
          <span className="text-xs text-gray-300 tracking-wide">
            {format?.label || format?.id}
          </span>
          {format?.filesizeLabel && (
            <span className="text-xs text-white/30">· {format.filesizeLabel}</span>
          )}
        </div>


        <div className="flex gap-3 mt-2">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2.5 text-xs tracking-widest uppercase border border-white/10 text-white/40 hover:text-white/70 hover:border-white/20 transition-all disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 text-xs tracking-widest uppercase border border-gray-500/50 text-gray-300 bg-gray-500/10 hover:bg-gray-500/20 transition-all disabled:opacity-50"
          >
            {loading ? <TbLoader2 className="size-3.5 animate-spin" /> : null}
            {loading ? "Starting…" : "Download"}
          </button>
        </div>
      </div>
    </div>
  </div>
);

const Download = () => {
  const [info, setInfo] = useState(null);
  const [fetchError, setFetchError] = useState("");
  const [fetchLoading, setFetchLoading] = useState(false);

  const [confirmFormat, setConfirmFormat] = useState(null);
  const [starting, setStarting] = useState(false);
  const [toast, setToast] = useState(null); // { type: "ok" | "error", message }

  const handleFetch = useCallback(async (url) => {
    setFetchLoading(true);
    setFetchError("");
    setInfo(null);
    setToast(null);

    try {
      const res = await fetch(`${API}/formats?url=${encodeURIComponent(url)}`);
      if (!res.ok) throw new Error("Server error");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setInfo({ ...data, source_url: url });
    } catch (err) {
      setFetchError(err.message || "Could not fetch video info.");
    } finally {
      setFetchLoading(false);
    }
  }, []);

  const requestDownload = useCallback(
    (formatId) => {
      if (!info) return;
      const fmt = info.formats?.find((f) => f.id === formatId) || { id: formatId };
      setConfirmFormat(fmt);
    },
    [info]
  );

  const confirmDownload = useCallback(async () => {
    if (!info || !confirmFormat) return;
    setStarting(true);

    try {
      const res = await fetch(`${API}/download`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: info.source_url,
          formatId: confirmFormat.id,
          title: info.title,
          thumbnail: info.thumbnail,
          webpage_url: info.webpage_url,
        }),
      });
      if (!res.ok) throw new Error("Server error");
      const { jobId } = await res.json();

      rememberJob(jobId);
      setToast({ type: "ok", message: "Download started" });
    } catch {
      setToast({ type: "error", message: "Could not start download" });
    } finally {
      setStarting(false);
      setConfirmFormat(null);
      setTimeout(() => setToast(null), 4000);
    }
  }, [info, confirmFormat]);

  return (
    <div className="min-h-screen bg-[#050a0f] relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(251,191,36,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(251,191,36,0.5) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-100 bg-gray-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center px-4 pt-25 pb-20 gap-10">
        <div className="flex flex-col items-center gap-3 text-center">
          <img src="/.png" alt="" className="h-25 w-auto" />
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
            <span className="text-white/90">VI</span>
            <span className="text-gray-400">DO</span>
          </h1>
          <p className="text-xs text-white/25 tracking-[0.2em] uppercase">
            Multi-source video extraction system
          </p>
        </div>

        <UrlInput onFetch={handleFetch} loading={fetchLoading} />

        {fetchError && (
          <div className="w-full max-w-2xl border border-red-500/30 bg-red-500/5 px-4 py-3">
            <p className="text-xs text-red-400 tracking-wider">✕ {fetchError}</p>
          </div>
        )}

        {info && (
          <VideoCard
            info={info}
            onDownload={requestDownload}
            downloading={starting}
            status=""
          />
        )}
      </div>

      {confirmFormat && (
        <ConfirmModal
          title={info?.title}
          format={confirmFormat}
          loading={starting}
          onCancel={() => !starting && setConfirmFormat(null)}
          onConfirm={confirmDownload}
        />
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <div
            className={`flex items-center gap-3 px-4 py-3 border backdrop-blur-sm text-xs tracking-wide
              ${
                toast.type === "ok"
                  ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-300"
                  : "border-red-500/30 bg-red-500/10 text-red-300"
              }`}
          >
            {toast.type === "ok" ? <TbCheck className="size-4" /> : <TbX className="size-4" />}
            {toast.message}
            {toast.type === "ok" && (
              <Link to="/download" className="underline decoration-dotted hover:text-emerald-200">
                View Downloads →
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Download;
