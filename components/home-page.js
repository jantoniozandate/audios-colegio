"use client";

import Link from "next/link";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const proofPoints = [
  "Graba mensaje en segundos",
  "Sube audio directo a Cloudflare R2",
  "Comparte escucha con QR listo"
];

const bentoCards = [
  {
    title: "Grabación simple",
    body: "Nombre del niño, botón de grabar, guardar. Flujo corto para maestras en jornada real.",
    size: "wide"
  },
  {
    title: "Edición viva",
    body: "Admin puede corregir nombre, reemplazar audio y regenerar enlace sin perder orden.",
    size: "tall"
  },
  {
    title: "Escucha familiar",
    body: "Pantalla pública con play, start over y nombre grande para mamá o papá.",
    size: "square"
  },
  {
    title: "QR escolar",
    body: "Cada nota se vuelve destino fácil de imprimir o mandar por WhatsApp.",
    size: "wide"
  }
];

export function HomePage() {
  const heroRef = useRef(null);
  const bentoRef = useRef(null);
  const storyRef = useRef(null);

  useGSAP(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      return;
    }

    gsap.from("[data-hero-item]", {
      y: 36,
      opacity: 0,
      duration: 0.9,
      stagger: 0.12,
      ease: "power4.out"
    });

    gsap.from("[data-bento-card]", {
      scrollTrigger: {
        trigger: bentoRef.current,
        start: "top 75%"
      },
      y: 42,
      opacity: 0,
      scale: 0.94,
      duration: 0.8,
      stagger: 0.1,
      ease: "power4.out"
    });

    const storySection = storyRef.current;

    if (storySection) {
      const words = storySection.querySelectorAll("[data-word]");

      gsap.to(words, {
        opacity: 1,
        stagger: 0.08,
        ease: "none",
        scrollTrigger: {
          trigger: storySection,
          start: "top 68%",
          end: "bottom 50%",
          scrub: true
        }
      });
    }
  }, []);

  return (
    <main className="page-shell overflow-x-hidden">
      <nav className="floating-nav">
        <span className="brand-mark">Notas de voz QR</span>
        <div className="nav-actions">
          <Link href="/login" className="nav-link">
            Entrar
          </Link>
          <Link href="/admin" className="primary-pill">
            Ir a panel
          </Link>
        </div>
      </nav>

      <section className="hero-section" ref={heroRef}>
        <div className="hero-copy">
          <span className="eyebrow" data-hero-item>
            mensajes de aula con calor humano
          </span>
          <h1 className="hero-title" data-hero-item>
            Voz de escuela, QR de familia, escucha lista en un toque.
          </h1>
          <p className="hero-body" data-hero-item>
            App para maestras y coordinación que graba mensaje por niño, lo guarda
            en Cloudflare R2 y entrega enlace público amable para madres y padres.
          </p>
          <div className="hero-actions" data-hero-item>
            <Link href="/admin" className="primary-pill">
              Abrir admin
            </Link>
            <Link href="/login" className="secondary-pill">
              Entrar con clave
            </Link>
          </div>
          <ul className="proof-list" data-hero-item>
            {proofPoints.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="hero-poster" data-hero-item>
          <div className="poster-card poster-card-main">
            <span>Tarjeta viva</span>
            <strong>Alumno feliz. Audio cuidado.</strong>
          </div>
          <div className="poster-card poster-card-soft">
            <span>QR directo</span>
            <strong>Escuchar sin fricción</strong>
          </div>
          <div className="poster-bubble">
            <span />
            <span />
            <span />
          </div>
        </div>
      </section>

      <section className="bento-section section-block" ref={bentoRef}>
        <div className="section-copy">
          <p className="section-kicker">flujo escolar</p>
          <h2>Panel útil para escuela. Frente cálido para casa.</h2>
        </div>
        <div className="bento-grid">
          {bentoCards.map((card) => (
            <article
              key={card.title}
              className={`bento-card bento-${card.size}`}
              data-bento-card
            >
              <h3>{card.title}</h3>
              <p>{card.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="story-section section-block" ref={storyRef}>
        <div className="story-layout">
          <div className="story-sticky">
            <p className="section-kicker">momento deseo</p>
            <h2>Menos carga operativa. Más presencia emocional.</h2>
          </div>
          <p className="story-text">
            {"Cada nota se siente personal, ordenada y lista para viajar del salón al hogar sin pasos raros."
              .split(" ")
              .map((word, index) => (
                <span key={`${word}-${index}`} data-word>
                  {word}{" "}
                </span>
              ))}
          </p>
        </div>
      </section>

      <section className="cta-section section-block">
        <div className="cta-panel">
          <p className="section-kicker">acción</p>
          <h2>Graba primera nota. Sube audio. Comparte QR.</h2>
          <p>
            Listo para escuela pequeña o coordinación con varios grupos. Usa
            secreto simple hoy y puede crecer después.
          </p>
          <Link href="/admin" className="primary-pill">
            Empezar ahora
          </Link>
        </div>
      </section>
    </main>
  );
}
