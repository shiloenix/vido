import { useState, useCallback, useRef } from "react";
import UrlInput from "./layouts/UrlInput";
import VideoCard from "./utils/VideoCard";
import ProgressBar from "./utils/ProgressBar";

const API = "http://localhost:39101";

const Download = () => {
  const [info, setInfo] = useState(null);
  const [fetchError, setFetchError] = useState("");
  const [fetchLoading, setFetchLoading] = useState(false);

  const [progress, setProgress] = useState(null);
  const [status, setStatus] = useState("");
  const [paused, setPaused] = useState(false);

  const abortRef = useRef(null);
  const readerRef = useRef(null);
  const pausedRef = useRef(false);
  const resumeRef = useRef(null);

  const handleFetch = useCallback(async (url) => {
    setFetchLoading(true);
    setFetchError("");
    setInfo(null);
    setProgress(null);
    setStatus("");
    setPaused(false);

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

  const handleCancel = useCallback(() => {
    if (resumeRef.current) {
      resumeRef.current();
      resumeRef.current = null;
    }
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    readerRef.current = null;
    pausedRef.current = false;
    setPaused(false);
    setStatus("");
    setProgress(null);
  }, []);

  const handlePause = useCallback(() => {
    const next = !pausedRef.current;
    pausedRef.current = next;
    setPaused(next);

    if (!next && resumeRef.current) {
      resumeRef.current();
      resumeRef.current = null;
    }
  }, []);

  const handleDownload = useCallback(
    async (formatId) => {
      if (!info) return;

      setStatus("downloading");
      setProgress({ percent: 0, speed: "—", eta: "—" });
      setPaused(false);
      pausedRef.current = false;

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch(`${API}/download`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: info.source_url, formatId }),
          signal: controller.signal,
        });

        if (!res.ok) throw new Error("Server error");

        const reader = res.body.getReader();
        readerRef.current = reader;
        const decoder = new TextDecoder();
        let buffer = "";

        const waitIfPaused = () =>
          new Promise((resolve) => {
            if (!pausedRef.current) return resolve();
            resumeRef.current = resolve;
          });

        while (true) {
          await waitIfPaused();

          let result;
          try {
            result = await reader.read();
          } catch {
            break;
          }

          const { done, value } = result;
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop();

          for (const line of lines) {
            if (!line.startsWith("data:")) continue;
            try {
              const msg = JSON.parse(line.slice(5).trim());
              if (msg.type === "progress") {
                setProgress({
                  percent: msg.percent,
                  speed: msg.speed,
                  eta: msg.eta,
                });
              }
              if (msg.type === "done") {
                setStatus("done");
                setProgress({ percent: 100, speed: "—", eta: "Done" });
              }
              if (msg.type === "error") {
                setStatus("error");
              }
            } catch {}
          }
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          setStatus("error");
        }
      }
    },
    [info]
  );

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

      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center px-4 pt-25 pb-20 gap-10">
        <div className="flex flex-col items-center gap-3 text-center">
          <img
              src="/vex.svg"
              alt=""
              className="h-25 w-auto"
            />
          <h1 className="font-mono text-3xl md:text-5xl font-bold tracking-tight">
            <span className="text-white/90">VI</span>
            <span className="text-amber-400">DO</span>
          </h1>
          <p className="font-mono text-xs text-white/25 tracking-[0.2em] uppercase">
            Multi-source video extraction system
          </p>
        </div>

        <UrlInput onFetch={handleFetch} loading={fetchLoading} />

        {fetchError && (
          <div className="w-full max-w-2xl border border-red-500/30 bg-red-500/5 px-4 py-3">
            <p className="font-mono text-xs text-red-400 tracking-wider">
              ✕ {fetchError}
            </p>
          </div>
        )}

        {info && (
          <VideoCard
            info={info}
            onDownload={handleDownload}
            downloading={status === "downloading"}
            status={status}
          />
        )}

        {progress && (
          <ProgressBar
            percent={progress.percent}
            speed={progress.speed}
            eta={progress.eta}
            status={status}
            paused={paused}
            onCancel={handleCancel}
            onPause={handlePause}
          />
        )}
      </div>
    </div>
  );
};

export default Download;