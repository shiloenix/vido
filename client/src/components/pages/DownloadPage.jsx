import { useState, useEffect, useCallback, useRef } from "react";
import {
  TbHistory,
  TbTrash,
  TbExternalLink,
  TbX,
  TbDownload,
  TbBox,
  TbCheck,
  TbAlertTriangle,
  TbLoader2,
  TbPlayerPause,
} from "react-icons/tb";
import JobProgressBar from "../utils/JobProgressBar";

const API = "http://localhost:39101";

function timeAgo(ts) {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString();
}

const statusMeta = {
  done: { icon: TbCheck, color: "text-emerald-400", label: "Done" },
  error: { icon: TbAlertTriangle, color: "text-red-400", label: "Failed" },
  cancelled: { icon: TbX, color: "text-white/30", label: "Cancelled" },
  downloading: { icon: TbLoader2, color: "text-gray-400", label: "Downloading", spin: true },
  paused: { icon: TbPlayerPause, color: "text-gray-300/60", label: "Paused" },
};

const ACTIVE_STATUSES = ["downloading", "paused"];

const DownloadPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const esRefs = useRef({});

  const patchItem = useCallback((id, patch) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  }, []);

  const attachLive = useCallback(
    (id) => {
      if (esRefs.current[id]) return;

      const es = new EventSource(`${API}/download/${id}/stream`);
      esRefs.current[id] = es;

      const close = () => {
        es.close();
        delete esRefs.current[id];
      };

      es.onmessage = (e) => {
        let msg;
        try {
          msg = JSON.parse(e.data);
        } catch {
          return;
        }

        if (msg.type === "snapshot") {
          patchItem(id, msg.job);
          if (!ACTIVE_STATUSES.includes(msg.job.status)) close();
          return;
        }
        if (msg.type === "progress") {
          patchItem(id, { status: "downloading", percent: msg.percent, speed: msg.speed, eta: msg.eta });
        }
        if (msg.type === "paused") patchItem(id, { status: "paused" });
        if (msg.type === "resumed") patchItem(id, { status: "downloading" });
        if (msg.type === "done") {
          patchItem(id, { status: "done", percent: 100 });
          close();
        }
        if (msg.type === "error") {
          patchItem(id, { status: "error" });
          close();
        }
        if (msg.type === "cancelled") {
          patchItem(id, { status: "cancelled" });
          close();
        }
      };
    },
    [patchItem]
  );

  const load = useCallback(async () => {
    try {
      const res = await fetch(`${API}/jobs`);
      const data = await res.json();
      setItems(data);
      data.forEach((job) => {
        if (ACTIVE_STATUSES.includes(job.status)) attachLive(job.id);
      });
    } catch {
      // backend unreachable, keep last known state
    } finally {
      setLoading(false);
    }
  }, [attachLive]);

  useEffect(() => {
    load();
    const t = setInterval(load, 5000);
    return () => {
      clearInterval(t);
      Object.values(esRefs.current).forEach((es) => es.close());
      esRefs.current = {};
    };
  }, [load]);

  const handleDelete = useCallback(async (id) => {
    esRefs.current[id]?.close();
    delete esRefs.current[id];
    setItems((prev) => prev.filter((item) => item.id !== id));
    try {
      await fetch(`${API}/jobs/${id}`, { method: "DELETE" });
    } catch {}
  }, []);

  const handleClearAll = useCallback(async () => {
    const toDelete = items.map((i) => i.id);
    toDelete.forEach((id) => {
      esRefs.current[id]?.close();
      delete esRefs.current[id];
    });
    setItems([]);
    try {
      await Promise.all(toDelete.map((id) => fetch(`${API}/jobs/${id}`, { method: "DELETE" })));
    } catch {}
  }, [items]);

  const pauseOrResume = useCallback(async (id, isPaused) => {
    patchItem(id, { status: isPaused ? "downloading" : "paused" });
    try {
      await fetch(`${API}/download/${id}/${isPaused ? "resume" : "pause"}`, { method: "POST" });
    } catch {}
  }, [patchItem]);

  const cancelJob = useCallback(async (id) => {
    try {
      await fetch(`${API}/download/${id}/cancel`, { method: "POST" });
    } catch {}
  }, []);

  const activeCount = items.filter((i) => ACTIVE_STATUSES.includes(i.status)).length;

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

      <div className="relative z-10 flex flex-col items-center px-4 pt-32 pb-20 gap-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex items-center gap-3">
            <TbHistory className="size-10 text-gray-400" />
          </div>
          <p className="text-xs text-white/25 tracking-[0.2em] uppercase">
            {loading
              ? "Loading…"
              : `${items.length} extraction${items.length !== 1 ? "s" : ""} logged`}
            {activeCount > 0 && <span className="text-gray-400/70"> · {activeCount} active</span>}
          </p>
        </div>

        <div className="w-full max-w-4xl relative">
          {items.length > 0 ? (
            <>
              <span className="absolute -top-px -left-px w-5 h-5 border-t-2 border-l-2 border-gray-500/40" />
              <span className="absolute -top-px -right-px w-5 h-5 border-t-2 border-r-2 border-gray-500/40" />
              <span className="absolute -bottom-px -left-px w-5 h-5 border-b-2 border-l-2 border-gray-500/40" />
              <span className="absolute -bottom-px -right-px w-5 h-5 border-b-2 border-r-2 border-gray-500/40" />

              <div className="border border-gray-500/15 bg-black/40 backdrop-blur-sm divide-y divide-white/5">
                <div className="flex items-center gap-3 px-4 py-2 bg-white/2">
                  <span className="text-xs text-gray-500/40 tracking-widest uppercase flex-1">
                    Title
                  </span>
                  <span className="text-xs text-gray-500/40 tracking-widest uppercase w-24 text-right hidden sm:block">
                    Status
                  </span>
                  <span className="text-xs text-gray-500/40 tracking-widest uppercase w-20 text-right hidden sm:block">
                    When
                  </span>
                  <span className="w-16 flex justify-end">
                    <button
                      onClick={handleClearAll}
                      title="Clear all"
                      className="p-1 text-gray-500/40 hover:text-red-400 transition-colors"
                    >
                      <TbTrash className="size-3.5" />
                    </button>
                  </span>
                </div>

                {items.map((item) => {
                  const meta = statusMeta[item.status] || statusMeta.error;
                  const Icon = meta.icon;
                  const isActive = ACTIVE_STATUSES.includes(item.status);
                  const isPaused = item.status === "paused";

                  return (
                    <div key={item.id} className="px-4 py-3 hover:bg-white/2 transition-colors group">
                      <div className="flex items-center gap-3">
                        {item.thumbnail ? (
                          <img
                            src={item.thumbnail}
                            alt=""
                            className="w-14 h-9 object-cover shrink-0 opacity-80 group-hover:opacity-100 transition-opacity"
                            style={{
                              clipPath:
                                "polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))",
                            }}
                          />
                        ) : (
                          <div className="w-14 h-9 bg-white/5 shrink-0 flex items-center justify-center">
                            <TbDownload className="size-3 text-white/20" />
                          </div>
                        )}

                        <p className="text-xs text-white/60 group-hover:text-white/80 transition-colors flex-1 line-clamp-2 leading-relaxed min-w-0">
                          {item.title || "Unknown"}
                        </p>

                        <span
                          className={`items-center justify-end gap-1.5 text-xs w-24 text-right hidden sm:flex shrink-0 ${meta.color}`}
                        >
                          <Icon className={`size-3.5 shrink-0 ${meta.spin && !isPaused ? "animate-spin" : ""}`} />
                          <span className="leading-none">{meta.label}</span>
                        </span>

                        <span className="text-xs text-white/25 w-20 text-right hidden sm:block shrink-0">
                          {timeAgo(item.updatedAt || item.createdAt)}
                        </span>

                        <div className="flex items-center gap-1 shrink-0 w-16 justify-end">
                          {!isActive && item.webpage_url && (
                            <a
                              href={item.webpage_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Open source"
                              className="p-1.5 text-white/20 hover:text-gray-400 transition-colors"
                            >
                              <TbExternalLink className="size-3.5" />
                            </a>
                          )}
                          {!isActive && (
                            <button
                              onClick={() => handleDelete(item.id)}
                              title="Remove"
                              className="p-1.5 text-white/20 hover:text-red-400 transition-colors"
                            >
                              <TbTrash className="size-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {isActive && (
                        <div className="mt-3">
                          <JobProgressBar
                            percent={item.percent || 0}
                            speed={item.speed}
                            eta={item.eta}
                            status={item.status}
                            onPause={() => pauseOrResume(item.id, isPaused)}
                            onCancel={() => cancelJob(item.id)}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-4 py-20">
              <TbBox className="size-10 text-white/10" />
              <p className="text-xs text-white/20 tracking-widest uppercase">
                {loading ? "Loading…" : "No downloads yet"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DownloadPage;
