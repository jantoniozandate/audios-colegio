"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { AudioRecorder } from "@/components/audio-recorder";
import { generateQrDataUrl } from "@/lib/qr";

gsap.registerPlugin();

function emptyForm() {
  return {
    childName: "",
    audio: null
  };
}

export function AdminPanel({ initialNotes, appUrl }) {
  const [notes, setNotes] = useState(initialNotes);
  const [form, setForm] = useState(emptyForm());
  const [status, setStatus] = useState("");
  const [qrMap, setQrMap] = useState({});
  const [expandedId, setExpandedId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isPending, startTransition] = useTransition();
  const stackRef = useRef(null);

  const selectedCount = selectedIds.length;
  const printHref = useMemo(() => {
    const query = new URLSearchParams();
    query.set("ids", selectedIds.join(","));
    return `/admin/print?${query.toString()}`;
  }, [selectedIds]);

  useGSAP(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion || !stackRef.current) {
      return;
    }

    gsap.from("[data-note-shell]", {
      y: 24,
      opacity: 0,
      duration: 0.55,
      stagger: 0.06,
      ease: "power4.out"
    });
  }, [notes]);

  useEffect(() => {
    async function buildQrs() {
      const entries = await Promise.all(
        notes.map(async (note) => {
          const listenerUrl = `${appUrl}/listen/${note.id}`;
          const qr = await generateQrDataUrl(listenerUrl, 220);

          return [note.id, qr];
        })
      );

      setQrMap(Object.fromEntries(entries));
    }

    buildQrs();
  }, [appUrl, notes]);

  useEffect(() => {
    setSelectedIds((current) => current.filter((id) => notes.some((note) => note.id === id)));
  }, [notes]);

  async function refreshNotes() {
    const response = await fetch("/api/notes", {
      cache: "no-store"
    });
    const payload = await response.json();
    setNotes(payload.notes);
  }

  async function handleCreate(event) {
    event.preventDefault();
    setStatus("");

    if (!form.audio?.file) {
      setStatus("Graba audio antes de guardar.");
      return;
    }

    const body = new FormData();
    body.append("childName", form.childName);
    body.append("audio", form.audio.file);

    const response = await fetch("/api/notes", {
      method: "POST",
      body
    });

    const payload = await response.json();

    if (!response.ok) {
      setStatus(payload.error || "No se pudo guardar.");
      return;
    }

    setForm(emptyForm());
    setStatus("Nota creada.");
    setExpandedId(payload.note.id);
    startTransition(refreshNotes);
  }

  async function handleInlineUpdate(id, values) {
    const body = new FormData();
    body.append("childName", values.childName);

    if (values.audio?.file) {
      body.append("audio", values.audio.file);
    }

    const response = await fetch(`/api/notes/${id}`, {
      method: "PATCH",
      body
    });

    const payload = await response.json();

    if (!response.ok) {
      setStatus(payload.error || "No se pudo actualizar.");
      return;
    }

    setStatus("Registro actualizado.");
    startTransition(refreshNotes);
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  function toggleSelection(id) {
    setSelectedIds((current) => {
      if (current.includes(id)) {
        return current.filter((item) => item !== id);
      }

      return [...current, id];
    });
  }

  function toggleSelectAll() {
    if (selectedIds.length === notes.length) {
      setSelectedIds([]);
      return;
    }

    setSelectedIds(notes.map((note) => note.id));
  }

  return (
    <main className="page-shell admin-shell overflow-x-hidden">
      <header className="admin-topbar">
        <div>
          <p className="section-kicker">panel admin</p>
          <h1>Notas listas para familia</h1>
        </div>
        <button type="button" className="secondary-pill" onClick={logout}>
          Salir
        </button>
      </header>

      <section className="admin-grid">
        <form className="admin-card create-card" onSubmit={handleCreate}>
          <div className="card-head">
            <h2>Nueva nota</h2>
            <p>Nombre del niño y audio nuevo.</p>
          </div>

          <label className="field">
            <span>Nombre del niño</span>
            <input
              type="text"
              value={form.childName}
              onChange={(event) => {
                setForm((current) => ({
                  ...current,
                  childName: event.target.value
                }));
              }}
              placeholder="Ej. Mateo"
              required
            />
          </label>

          <AudioRecorder
            value={form.audio}
            onChange={(audio) => {
              setForm((current) => ({
                ...current,
                audio
              }));
            }}
          />

          <button type="submit" className="primary-pill primary-button" disabled={isPending}>
            Guardar en R2
          </button>

          {status ? <p className="status-line">{status}</p> : null}
        </form>

        <section className="admin-card list-card">
          <div className="list-toolbar">
            <div className="card-head">
              <h2>Lista de niños</h2>
              <p>{notes.length} registros</p>
            </div>
            <div className="bulk-actions">
              <button type="button" className="secondary-pill" onClick={toggleSelectAll}>
                {selectedIds.length === notes.length && notes.length > 0 ? "Quitar todos" : "Seleccionar todos"}
              </button>
              <Link
                href={selectedCount ? printHref : "#"}
                className={`primary-pill ${selectedCount ? "" : "is-disabled"}`}
                target={selectedCount ? "_blank" : undefined}
                aria-disabled={!selectedCount}
                onClick={(event) => {
                  if (!selectedCount) {
                    event.preventDefault();
                    setStatus("Selecciona uno o más niños para imprimir QR.");
                  }
                }}
              >
                Imprimir QR{selectedCount ? ` (${selectedCount})` : ""}
              </Link>
            </div>
          </div>

          <div className="notes-stack" ref={stackRef}>
            {notes.map((note) => (
              <EditableNoteCard
                key={note.id}
                note={note}
                qrSrc={qrMap[note.id]}
                appUrl={appUrl}
                onSave={handleInlineUpdate}
                expanded={expandedId === note.id}
                onToggle={() => {
                  setExpandedId((current) => (current === note.id ? null : note.id));
                }}
                selected={selectedIds.includes(note.id)}
                onSelect={() => toggleSelection(note.id)}
              />
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

function EditableNoteCard({
  note,
  qrSrc,
  appUrl,
  onSave,
  expanded,
  onToggle,
  selected,
  onSelect
}) {
  const [childName, setChildName] = useState(note.childName);
  const [audio, setAudio] = useState({
    url: note.audioUrl
  });
  const [copied, setCopied] = useState(false);
  const listenerUrl = `${appUrl}/listen/${note.id}`;
  const bodyRef = useRef(null);

  useGSAP(() => {
    if (!bodyRef.current) {
      return;
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      return;
    }

    gsap.fromTo(
      bodyRef.current.querySelectorAll("[data-note-body-item]"),
      {
        y: expanded ? 10 : 0,
        opacity: expanded ? 0 : 1
      },
      {
        y: 0,
        opacity: 1,
        duration: 0.32,
        stagger: 0.04,
        ease: "power3.out"
      }
    );
  }, [expanded]);

  async function copyUrl() {
    await navigator.clipboard.writeText(listenerUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <article className={`note-card ${expanded ? "is-open" : ""} ${selected ? "is-selected" : ""}`} data-note-shell>
      <div className="note-summary">
        <label className="select-chip">
          <input type="checkbox" checked={selected} onChange={onSelect} />
          <span />
        </label>

        <button type="button" className="note-toggle" onClick={onToggle} aria-expanded={expanded}>
          <div className="note-title-wrap">
            <p className="mini-label">Niño</p>
            <h3>{note.childName}</h3>
          </div>
          <div className="note-summary-side">
            <span className="summary-pill">{expanded ? "Cerrar" : "Abrir"}</span>
            <span className="chevron" aria-hidden="true" />
          </div>
        </button>
      </div>

      <div className={`note-collapsible ${expanded ? "is-open" : ""}`} ref={bodyRef}>
        <div className="note-collapsible-inner">
          <div className="note-meta" data-note-body-item>
            <label className="field compact-field">
              <span>Nombre</span>
              <input value={childName} onChange={(event) => setChildName(event.target.value)} />
            </label>
            <a href={listenerUrl} target="_blank" rel="noreferrer" className="nav-link">
              Abrir listener
            </a>
          </div>

          <div data-note-body-item>
            <AudioRecorder
              value={audio}
              label="Regrabar audio"
              onChange={(nextAudio) => setAudio(nextAudio)}
            />
          </div>

          <div className="note-actions" data-note-body-item>
            <button
              type="button"
              className="primary-pill primary-button"
              onClick={() => onSave(note.id, { childName, audio })}
            >
              Guardar cambios
            </button>
            <button type="button" className="secondary-pill" onClick={copyUrl}>
              {copied ? "URL copiada" : "Copiar URL"}
            </button>
          </div>

          <div className="note-footer" data-note-body-item>
            <div>
              <p className="mini-label">Audio actual</p>
              <audio controls src={audio.previewUrl || audio.url || note.audioUrl} className="audio-preview">
                Tu navegador no soporta audio.
              </audio>
            </div>
            {qrSrc ? (
              <div className="qr-box qr-box-fancy">
                <div className="qr-frame">
                  <img src={qrSrc} alt={`QR para ${note.childName}`} />
                </div>
                <p>QR de escucha pública</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
