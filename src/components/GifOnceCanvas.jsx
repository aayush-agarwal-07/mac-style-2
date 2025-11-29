import React, { useEffect, useImperativeHandle, forwardRef } from "react";
import useGifOnce from "../hooks/useGifOnce";

const GifOnceCanvas = forwardRef(function GifOnceCanvas(
  { url, autoplay = false, onDone, className = "" },
  ref
) {
  const { canvasRef, play, stop, isPlaying } = useGifOnce({
    url,
    autoplay,
    onDone,
  });

  useImperativeHandle(ref, () => ({ play, stop, isPlaying }), [
    play,
    stop,
    isPlaying,
  ]);

  useEffect(() => () => stop(), [stop]);

  return <canvas ref={canvasRef} className={className} aria-hidden />;
});

export default GifOnceCanvas;
