import { atom, useAtom } from "jotai";
import { useEffect, useState, useRef } from "react";
import { scenes } from "./Experience";

export const slideAtom = atom(0);

/**  -----------  AJUSTA AQUÍ ------------- */
const ZOOM_FADE_THRESHOLD = 0.05; // 5% de zoom
const ZOOM_CLEAR_MS = 800; // milisegundos antes de volver visible
const DPR_POLL_INTERVAL = 300; // cada cuánto comprobar devicePixelRatio
/** --------------------------------------- */

export const Overlay = () => {
  const [slide, setSlide] = useAtom(slideAtom);
  const [displaySlide, setDisplaySlide] = useState(slide);
  const [visible, setVisible] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const wheelTimeout = useRef();
  const initialDPR = useRef(window.devicePixelRatio);

  /* ---------- Fade‑in inicial ---------- */
  useEffect(() => {
    const id = setTimeout(() => setVisible(true), 1000);
    return () => clearTimeout(id);
  }, []);

  /* ---------- Fade al cambiar de slide ---------- */
  useEffect(() => {
    setVisible(false);
    const id = setTimeout(() => {
      setDisplaySlide(slide);
      setVisible(true);
    }, 4000);
    return () => clearTimeout(id);
  }, [slide]);

  /* ---------- Función central para activar el fade por zoom ---------- */
  const triggerZoomFade = () => {
    console.log("Zoom detectado - ocultando texto");
    setZoomed(true);
    clearTimeout(wheelTimeout.current);
    wheelTimeout.current = setTimeout(() => {
      console.log("Restaurando texto después del zoom");
      setZoomed(false);
    }, ZOOM_CLEAR_MS);
  };

  /* ---------- Detección de zoom con rueda del ratón ---------- */
  useEffect(() => {
    const onWheel = (e) => {
      // Detectar Ctrl + rueda (Windows/Linux) o Cmd + rueda (Mac)
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault(); // Prevenir el zoom del navegador si es posible
        triggerZoomFade();
      }
    };

    // Usar capture para interceptar el evento antes
    window.addEventListener("wheel", onWheel, { passive: false });
    
    return () => {
      window.removeEventListener("wheel", onWheel);
      clearTimeout(wheelTimeout.current);
    };
  }, []);

  /* ---------- Detección de atajos de teclado para zoom ---------- */
  useEffect(() => {
    const onKeyDown = (e) => {
      // Detectar Ctrl/Cmd + (+, -, 0)
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "+" || e.key === "=" || e.key === "-" || e.key === "0") {
          console.log("Atajo de zoom detectado:", e.key);
          triggerZoomFade();
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  /* ---------- Detección de pinch zoom en dispositivos táctiles ---------- */
  useEffect(() => {
    if (!window.visualViewport) return;

    const checkPinchZoom = () => {
      const scale = window.visualViewport.scale;
      if (Math.abs(scale - 1) > ZOOM_FADE_THRESHOLD) {
        console.log("Pinch zoom detectado, escala:", scale);
        triggerZoomFade();
      }
    };

    window.visualViewport.addEventListener("resize", checkPinchZoom);
    window.visualViewport.addEventListener("scroll", checkPinchZoom);
    
    return () => {
      window.visualViewport.removeEventListener("resize", checkPinchZoom);
      window.visualViewport.removeEventListener("scroll", checkPinchZoom);
    };
  }, []);

  /* ---------- Polling de devicePixelRatio para detectar zoom del navegador ---------- */
  useEffect(() => {
    let lastDPR = window.devicePixelRatio;
    
    const checkDPR = () => {
      const currentDPR = window.devicePixelRatio;
      const dprChange = Math.abs(currentDPR - lastDPR);
      
      // Detectar cambios significativos en el DPR
      if (dprChange > 0.01) {
        console.log("Cambio en devicePixelRatio detectado:", lastDPR, "->", currentDPR);
        triggerZoomFade();
        lastDPR = currentDPR;
      }
    };

    const intervalId = setInterval(checkDPR, DPR_POLL_INTERVAL);
    
    // También escuchar el evento resize que puede indicar zoom
    const onResize = () => {
      checkDPR();
    };
    
    window.addEventListener("resize", onResize);
    
    return () => {
      clearInterval(intervalId);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  /* ---------- Detección adicional con gesturestart/gesturechange (Safari) ---------- */
  useEffect(() => {
    const onGesture = (e) => {
      if (e.scale !== 1) {
        console.log("Gesto de zoom detectado, escala:", e.scale);
        triggerZoomFade();
      }
    };

    window.addEventListener("gesturestart", onGesture);
    window.addEventListener("gesturechange", onGesture);
    
    return () => {
      window.removeEventListener("gesturestart", onGesture);
      window.removeEventListener("gesturechange", onGesture);
    };
  }, []);

  return (
    <div
      className={`fixed inset-0 z-10 flex flex-col justify-between pointer-events-none text-black transition-opacity duration-1000 ${
        visible && !zoomed ? "" : "opacity-0"
      }`}
    >
      {/* Header */}
      <div className="w-full text-center mt-8">
        {displaySlide === 0 && (
          <>
            <h2 className="text-3xl font-bold text-red-600 mb-2">Universidad del Valle</h2>
            <p className="text-gray-600">Presented to: Diego Fernando Tenorio Restrepo</p>
          </>
        )}
      </div>

      {/* Navegación */}
      <div className="absolute inset-0 flex items-center justify-between p-4">
        <svg
          onClick={() => setSlide((prev) => (prev > 0 ? prev - 1 : scenes.length - 1))}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-10 h-10 pointer-events-auto hover:opacity-60 cursor-pointer"
          fill="none"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 15.75L3 12m0 0l3.75-3.75M3 12h18" />
        </svg>
        <svg
          onClick={() => setSlide((prev) => (prev < scenes.length - 1 ? prev + 1 : 0))}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-10 h-10 pointer-events-auto hover:opacity-60 cursor-pointer"
          fill="none"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
        </svg>
      </div>

      {/* Contenido del slide */}
      <div className="bg-gradient-to-t from-white/90 pt-20 pb-10 p-4 flex flex-col items-center text-center">
        <h1 className="text-5xl font-extrabold">{scenes[displaySlide].name}</h1>
        <p className="italic text-lg mt-2 opacity-60">{scenes[displaySlide].description}</p>

        <div className="flex items-center gap-12 mt-10">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" fill="none" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
              <p className="font-semibold text-3xl">{scenes[displaySlide].stats.energy}</p>
            </div>
            <p className="text-sm opacity-80">{scenes[displaySlide].stats.label}</p>
          </div>
          {displaySlide === 4 && (
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" fill="none" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504 1.125 1.125 1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                </svg>
                <p className="font-semibold text-3xl">1.8</p>
              </div>
              <p className="text-sm opacity-80">On‑premises PUE</p>
            </div>
          )}
          {displaySlide === 5 && (
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" fill="none" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                </svg>
                <p className="font-semibold text-3xl">3</p>
              </div>
              <p className="text-sm opacity-80">Major providers</p>
            </div>
          )}
        </div>

        {/* Indicadores de slide */}
        <div className="flex gap-2 mt-8">
          {scenes.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setSlide(idx)}
              className={`w-2 h-2 rounded-full transition-all pointer-events-auto ${
                idx === displaySlide ? "w-8 bg-gray-800" : "bg-gray-400 hover:bg-gray-600"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 inset-x-0 text-center text-sm text-gray-600">
        Eyder Santiago Suarez Chavez | Universidad del Valle
      </div>
    </div>
  );
};