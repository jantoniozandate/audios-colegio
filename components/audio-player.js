"use client";

import { useRef } from "react";

export function AudioPlayer({ src }) {
  const audioRef = useRef(null);

  function play() {
    audioRef.current?.play();
  }

  function reset() {
    if (!audioRef.current) {
      return;
    }

    audioRef.current.pause();
    audioRef.current.currentTime = 0;
  }

  return (
    <div className="listener-controls">
      <audio ref={audioRef} src={src} preload="metadata" />
      <button type="button" className="primary-pill primary-button" onClick={play}>
        Play
      </button>
      <button type="button" className="secondary-pill" onClick={reset}>
        Start over
      </button>
    </div>
  );
}
