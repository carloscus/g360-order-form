/**
 * useVoz.js
 * Búsqueda por voz nativa (Web Speech API, es-PE) — patrón de g360-ventas-pulse.
 * - Convierte números hablados a dígitos (útil para SKU/RUC/códigos por voz)
 * - Resultados interinos en vivo + transcript final normalizado
 */

import { useState, useRef, useEffect, useCallback } from 'react';

const NUMEROS = {
  cero: '0', uno: '1', una: '1', dos: '2', tres: '3', cuatro: '4',
  cinco: '5', seis: '6', siete: '7', ocho: '8', nueve: '9'
};

/**
 * Normaliza un transcript hablado: "cero uno seis siete seis tres" → "016763".
 * Colapsa solo dígitos consecutivos; el texto (nombres) se conserva.
 */
export function normalizarVoz(texto) {
  const palabras = (texto || '').toLowerCase().trim().split(/\s+/).filter(Boolean);
  const out = [];
  let buffer = '';
  for (const w of palabras) {
    let d = null;
    if (NUMEROS[w] !== undefined) d = NUMEROS[w];
    else if (/^\d+$/.test(w)) d = w;
    if (d !== null) buffer += d;
    else {
      if (buffer) { out.push(buffer); buffer = ''; }
      out.push(w);
    }
  }
  if (buffer) out.push(buffer);
  return out.join(' ');
}

export function vozSoportada() {
  return typeof window !== 'undefined' &&
    Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
}

/**
 * @param {Object} opts
 * @param {(texto: string) => void} opts.onTexto - Recibe el transcript (interino y final) normalizado
 * @param {string} [opts.lang] - BCP 47 (default 'es-PE')
 */
export function useVoz({ onTexto, lang = 'es-PE' }) {
  const [escuchando, setEscuchando] = useState(false);
  const recRef = useRef(null);
  const onTextoRef = useRef(onTexto);
  onTextoRef.current = onTexto;

  useEffect(() => () => {
    try { recRef.current?.abort(); } catch (e) { /* noop */ }
  }, []);

  const detener = useCallback(() => {
    try { recRef.current?.stop(); } catch (e) { /* noop */ }
  }, []);

  const escuchar = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    try { recRef.current?.abort(); } catch (e) { /* noop */ }
    const rec = new SR();
    recRef.current = rec;
    rec.lang = lang;
    rec.interimResults = true;
    rec.continuous = false;
    rec.maxAlternatives = 1;
    rec.onstart = () => setEscuchando(true);
    rec.onend = () => setEscuchando(false);
    rec.onerror = () => setEscuchando(false);
    rec.onresult = (event) => {
      let transcript = '';
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript + ' ';
      }
      onTextoRef.current(normalizarVoz(transcript));
    };
    rec.start();
  }, [lang]);

  return { escuchando, soportado: vozSoportada(), escuchar, detener };
}

export default useVoz;
