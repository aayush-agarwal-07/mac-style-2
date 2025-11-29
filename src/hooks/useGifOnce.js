// (same as I posted before; exact copy)
import { useEffect, useRef, useState, useCallback } from "react";
import { parseGIF, decompressFrames } from "gifuct-js";

export default function useGifOnce({ url, autoplay = false, onDone } = {}) {
  const canvasRef = useRef(null);
  const framesRef = useRef(null);
  const rafRef = useRef(null);
  const playingRef = useRef(false);
  const idxRef = useRef(0);
  const timeoutRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (!url) return;

    async function loadGif() {
      try {
        const res = await fetch(url, { mode: "cors" });
        const arrayBuffer = await res.arrayBuffer();
        const gif = parseGIF(arrayBuffer);
        const frames = decompressFrames(gif, true);
        if (!mounted) return;
        framesRef.current = frames;
        // draw first frame preview
        if (frames && frames.length) drawFrame(0);
        if (autoplay) play();
      } catch {
        if (typeof onDone === "function") onDone(new Error("parse-fail"));
      }
    }

    loadGif();
    return () => {
      mounted = false;
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  const stop = useCallback(() => {
    playingRef.current = false;
    setIsPlaying(false);
    idxRef.current = 0;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const drawFrame = useCallback((i) => {
    const canvas = canvasRef.current;
    const frames = framesRef.current;
    if (!canvas || !frames || !frames[i]) return;
    const ctx = canvas.getContext("2d");
    const frame = frames[i];
    if (
      canvas.width !== frame.dims.width ||
      canvas.height !== frame.dims.height
    ) {
      canvas.width = frame.dims.width;
      canvas.height = frame.dims.height;
    }
    const imageData = new ImageData(
      new Uint8ClampedArray(frame.patch),
      frame.dims.width,
      frame.dims.height
    );
    ctx.putImageData(imageData, 0, 0);
  }, []);

  const play = useCallback(() => {
    const frames = framesRef.current;
    if (!frames || !frames.length) {
      if (typeof onDone === "function") onDone();
      return;
    }
    if (playingRef.current) return;
    playingRef.current = true;
    setIsPlaying(true);
    idxRef.current = 0;

    const playNext = () => {
      if (!playingRef.current) return;
      const i = idxRef.current;
      if (i >= frames.length) {
        playingRef.current = false;
        setIsPlaying(false);
        idxRef.current = 0;
        if (typeof onDone === "function") onDone();
        return;
      }
      drawFrame(i);
      let delay = frames[i].delay != null ? frames[i].delay * 10 : 100;
      if (delay < 20) delay = 50;
      idxRef.current = i + 1;
      timeoutRef.current = setTimeout(playNext, delay);
    };

    playNext();
  }, [drawFrame, onDone]);

  return { canvasRef, play, stop, isPlaying };
}
