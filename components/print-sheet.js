"use client";

export function PrintSheet({ notes }) {
  return (
    <main className="print-shell">
      <header className="print-toolbar no-print">
        <div>
          <p className="section-kicker">impresión rápida</p>
          <h1>Hoja de QR lista para PDF o papel</h1>
        </div>
        <button type="button" className="primary-pill primary-button" onClick={() => window.print()}>
          Imprimir / Guardar PDF
        </button>
      </header>

      <section className="print-page">
        <div className="print-grid">
          {notes.map((note) => (
            <article key={note.id} className="print-card">
              <div className="print-card-top">
                <span className="print-star" />
                <p>{note.childName}</p>
              </div>
              <div className="print-qr-wrap">
                <img src={note.qrSrc} alt={`QR de ${note.childName}`} />
              </div>
              <div className="print-card-bottom">
                <span>Escuchar nota</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
