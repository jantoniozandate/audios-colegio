"use client";

import { useState, useRef } from "react";

export function AudioPlayer({ src }) {
  const audioRef = useRef(null);
  const [error, setError] = useState("");

  async function play() {
    if (!audioRef.current) {
      return;
    }

    setError("");

    try {
      await audioRef.current.play();
    } catch (playError) {
      setError(
        "Este audio no es compatible con este navegador. Regraba en formato nuevo o prueba otro navegador."
      );
    }
  }

  function reset() {
    if (!audioRef.current) {
      return;
    }

    audioRef.current.pause();
    audioRef.current.currentTime = 0;
  }

  return (
    <div className="listener-player">
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        controls
        className="public-audio"
        onError={() => {
          setError(
            "No se pudo cargar audio. Revisa formato o acceso público archivo."
          );
        }}
      />
      <div className="listener-controls">
        <button type="button" className="primary-pill primary-button" onClick={play}>
          Play
        </button>
        <button type="button" className="secondary-pill" onClick={reset}>
          Start over
        </button>
      </div>
      {error ? <p className="form-error">{error}</p> : null}
    </div>
  );
}
