"use client";

import { useEffect, useRef, useState } from "react";

function pickMimeType() {
  if (typeof window === "undefined" || !window.MediaRecorder) {
    return "";
  }

  const options = ["audio/webm;codecs=opus", "audio/mp4", "audio/webm"];
  return options.find((type) => MediaRecorder.isTypeSupported(type)) || "";
}

export function AudioRecorder({ value, onChange, label = "Grabar audio" }) {
  const [isRecording, setIsRecording] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(value?.previewUrl || "");
  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => {
    setPreviewUrl(value?.previewUrl || value?.url || "");
  }, [value]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  async function startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mimeType = pickMimeType();
    const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);

    streamRef.current = stream;
    recorderRef.current = recorder;
    chunksRef.current = [];

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
      const file = new File([blob], `nota-${Date.now()}.webm`, {
        type: blob.type || "audio/webm"
      });
      const localPreview = URL.createObjectURL(blob);

      setPreviewUrl(localPreview);
      onChange({
        file,
        previewUrl: localPreview
      });

      stream.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };

    recorder.start();
    setIsRecording(true);
  }

  function stopRecording() {
    recorderRef.current?.stop();
    setIsRecording(false);
  }

  return (
    <div className="recorder-shell">
      <button
        type="button"
        className={`recorder-button ${isRecording ? "is-live" : ""}`}
        onClick={isRecording ? stopRecording : startRecording}
      >
        <span className="recorder-dot" />
        {isRecording ? "Detener grabación" : label}
      </button>

      {previewUrl ? (
        <audio className="audio-preview" controls src={previewUrl}>
          Tu navegador no soporta audio.
        </audio>
      ) : (
        <p className="hint-text">Sin audio nuevo todavía.</p>
      )}
    </div>
  );
}
