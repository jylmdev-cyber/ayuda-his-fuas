import { codeTables, cursoVida, fua, hisItems, studyFacts } from '../data/content';

interface Card {
  id: string;
  tag: string;
  front: string;
  back: string;
}

interface Pregunta {
  texto: string;
  opciones: string[];
  correcta: number;
  explicacion: string;
}

const KNOWN_KEY = 'his-fua-study-known';
const BEST_KEY = 'his-fua-quiz-best';

const barajar = <T,>(lista: T[]): T[] => {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
};

const leerSet = (clave: string): Set<string> => {
  try {
    return new Set(JSON.parse(localStorage.getItem(clave) ?? '[]') as string[]);
  } catch {
    return new Set();
  }
};

const guardarSet = (clave: string, valor: Set<string>) => localStorage.setItem(clave, JSON.stringify([...valor]));

/* ------------------------------------------------------------------ */
/* Mazo de flashcards derivado de content.ts                           */
/* ------------------------------------------------------------------ */

function construirMazo(): Card[] {
  const cards: Card[] = [];

  for (const item of hisItems) {
    cards.push({ id: `item-${item.num}`, tag: 'Hoja HIS', front: `Ítem ${item.num} de la Hoja HIS`, back: `${item.nombre}. ${item.resumen}` });
  }
  for (const table of codeTables) {
    for (const row of table.rows) {
      cards.push({
        id: `cod-${table.id}-${row.code}`,
        tag: 'Códigos',
        front: `${table.titulo} (${table.itemRef}): código ${row.code}`,
        back: row.note ? `${row.label}. ${row.note}` : row.label,
      });
    }
  }
  for (const code of cursoVida.codes) {
    cards.push({ id: `cv-${code.codigo}`, tag: 'Curso de vida', front: `COD. PRESTA. ${code.codigo}`, back: `${code.nombre} (${code.rango}).` });
  }
  for (const field of fua.fields) {
    cards.push({ id: `fua-${field.num}`, tag: 'FUA', front: `Campo ${field.num} del FUA`, back: field.nombre });
  }
  for (const [i, fact] of studyFacts.entries()) {
    cards.push({ id: `fact-${i}`, tag: fact.tag, front: fact.front, back: fact.back });
  }
  return cards;
}

/* ------------------------------------------------------------------ */
/* Generación de preguntas de quiz                                     */
/* ------------------------------------------------------------------ */

function opcionesConCorrecta(correcta: string, distractores: string[]): { opciones: string[]; correcta: number } {
  const otras = barajar(sinDuplicados(distractores)).slice(0, 3);
  const opciones = barajar([correcta, ...otras]);
  return { opciones, correcta: opciones.indexOf(correcta) };
}

function sinDuplicados(lista: string[]): string[] {
  return [...new Set(lista.filter((x) => x && x.length > 0))];
}

function generarPreguntas(): Pregunta[] {
  const preguntas: Pregunta[] = [];

  for (const table of codeTables) {
    for (const row of table.rows) {
      const distractores = table.rows.filter((r) => r.code !== row.code).map((r) => r.label);
      if (distractores.length < 3) continue;
      const { opciones, correcta } = opcionesConCorrecta(row.label, distractores);
      preguntas.push({
        texto: `En ${table.itemRef} (${table.titulo}), ¿qué corresponde al código ${row.code}?`,
        opciones,
        correcta,
        explicacion: `${row.code} = ${row.label}.${row.note ? ` ${row.note}` : ''}`,
      });
    }
  }

  for (const item of hisItems) {
    const distractores = hisItems.filter((i) => i.num !== item.num).map((i) => i.nombre);
    const { opciones, correcta } = opcionesConCorrecta(item.nombre, distractores);
    preguntas.push({
      texto: `¿Qué se registra en el ítem ${item.num} de la Hoja HIS?`,
      opciones,
      correcta,
      explicacion: item.resumen,
    });
  }

  for (const edad of [2, 9, 14, 21, 35, 52, 68]) {
    const code = cursoVida.codes.find((c) => edad >= c.edades.min && (c.edades.max === null || edad <= c.edades.max));
    if (!code) continue;
    const { opciones, correcta } = opcionesConCorrecta(code.codigo, cursoVida.codes.filter((c) => c.codigo !== code.codigo).map((c) => c.codigo));
    preguntas.push({
      texto: `Una persona de ${edad} años recibe una atención integral asegurada por el SIS. ¿Qué código se registra en COD. PRESTA.?`,
      opciones,
      correcta,
      explicacion: `${code.codigo} — ${code.nombre} (${code.rango}).`,
    });
  }

  const reglas = hisItems.filter((i) => i.reglas.some((r) => r.length > 50));
  for (const item of reglas) {
    const regla = item.reglas.find((r) => r.length > 50);
    if (!regla) continue;
    preguntas.push({
      texto: `Verdadero o falso: «Ítem ${item.num} (${item.nombre}): ${regla}»`,
      opciones: ['Verdadero', 'Falso'],
      correcta: 0,
      explicacion: regla,
    });
    const otro = hisItems.find((i) => i.num !== item.num && i.reglas.some((r) => r.length > 50));
    const reglaAjena = otro?.reglas.find((r) => r.length > 50);
    if (otro && reglaAjena) {
      preguntas.push({
        texto: `Verdadero o falso: «Ítem ${item.num} (${item.nombre}): ${reglaAjena}»`,
        opciones: ['Verdadero', 'Falso'],
        correcta: 1,
        explicacion: `Esa regla corresponde al ítem ${otro.num} (${otro.nombre}). La regla del ítem ${item.num} es: ${regla}`,
      });
    }
  }

  for (const fact of studyFacts) {
    preguntas.push({
      texto: fact.front,
      opciones: [fact.back, ...barajar(studyFacts.filter((f) => f.front !== fact.front).map((f) => f.back)).slice(0, 3)],
      correcta: 0,
      explicacion: fact.back,
    });
  }

  return barajar(preguntas);
}

/* ------------------------------------------------------------------ */
/* Flashcards                                                          */
/* ------------------------------------------------------------------ */

interface EstadoFlash {
  mazo: Card[];
  deck: string;
  indice: number;
  volteada: boolean;
  conocidas: Set<string>;
}

const estado: EstadoFlash = { mazo: construirMazo(), deck: 'todos', indice: 0, volteada: false, conocidas: leerSet(KNOWN_KEY) };

const deckActual = (): Card[] => (estado.deck === 'todos' ? estado.mazo : estado.mazo.filter((c) => c.tag === estado.deck));

function renderFlash() {
  const cartas = deckActual();
  const card = cartas[estado.indice];
  const frente = document.getElementById('fc-front');
  const dorso = document.getElementById('fc-back');
  const flip = document.getElementById('fc-card');
  const contador = document.getElementById('fc-count');
  const barra = document.getElementById('fc-bar');
  const tagEl = document.getElementById('fc-tag');
  if (!frente || !dorso || !flip || !contador || !barra || !tagEl) return;

  if (!card) {
    frente.textContent = 'Sin tarjetas en este mazo.';
    dorso.textContent = '';
    return;
  }

  estado.volteada = false;
  flip.classList.remove('flipped');
  frente.textContent = card.front;
  dorso.textContent = card.back;
  tagEl.textContent = card.tag;
  contador.textContent = `Tarjeta ${estado.indice + 1} de ${cartas.length}`;

  const conocidasEnDeck = cartas.filter((c) => estado.conocidas.has(c.id)).length;
  const pct = cartas.length ? Math.round((conocidasEnDeck / cartas.length) * 100) : 0;
  barra.style.width = `${pct}%`;
  const progreso = document.getElementById('fc-progress');
  if (progreso) progreso.textContent = `${conocidasEnDeck}/${cartas.length} dominadas (${pct} %)`;

  const knowBtn = document.getElementById('fc-know');
  if (knowBtn) knowBtn.textContent = estado.conocidas.has(card.id) ? 'Dominada ✓' : 'La sabía';
}

function moverFlash(paso: number) {
  const cartas = deckActual();
  if (!cartas.length) return;
  estado.indice = (estado.indice + paso + cartas.length) % cartas.length;
  renderFlash();
}

/* ------------------------------------------------------------------ */
/* Quiz                                                                */
/* ------------------------------------------------------------------ */

interface EstadoQuiz {
  preguntas: Pregunta[];
  indice: number;
  aciertos: number;
  respondida: boolean;
}

const quiz: EstadoQuiz = { preguntas: [], indice: 0, aciertos: 0, respondida: false };

function renderQuizInicio() {
  const root = document.getElementById('qz-root');
  if (!root) return;
  const mejor = localStorage.getItem(BEST_KEY);
  root.innerHTML = `
    <div class="rounded-3xl border border-slate-200 bg-white p-10 text-center dark:border-night-700 dark:bg-night-800">
      <p class="font-display text-2xl font-extrabold text-slate-900 dark:text-white">Quiz de normativa HIS y FUA</p>
      <p class="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">
        Diez preguntas generadas desde el contenido del documento: códigos de financiador y etnia, ítems de la Hoja HIS,
        códigos por curso de vida y reglas de verdadero o falso. Cada respuesta incluye su explicación.
      </p>
      ${mejorHtml(mejor)}
      <button id="qz-start" type="button" class="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-accent-500 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 transition-all hover:-translate-y-0.5">
        Comenzar quiz
      </button>
    </div>`;
  document.getElementById('qz-start')?.addEventListener('click', () => {
    quiz.preguntas = barajar(generarPreguntas()).slice(0, 10);
    quiz.indice = 0;
    quiz.aciertos = 0;
    renderQuizPregunta();
  });
}

const mejorHtml = (mejor: string | null): string =>
  mejor
    ? `<p class="mt-4 text-xs font-semibold tracking-wide text-brand-700 uppercase dark:text-brand-300">Mejor puntaje: ${mejor}/10</p>`
    : '';

function renderQuizPregunta() {
  const root = document.getElementById('qz-root');
  if (!root) return;
  const pregunta = quiz.preguntas[quiz.indice];
  quiz.respondida = false;
  root.innerHTML = `
    <div class="rounded-3xl border border-slate-200 bg-white p-8 dark:border-night-700 dark:bg-night-800">
      <div class="flex items-center justify-between gap-4">
        <p class="text-xs font-bold tracking-widest text-slate-500 uppercase dark:text-slate-400">Pregunta ${quiz.indice + 1} de ${quiz.preguntas.length}</p>
        <p class="text-xs font-semibold text-brand-700 dark:text-brand-300">Aciertos: ${quiz.aciertos}</p>
      </div>
      <div class="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-night-700">
        <div class="h-full rounded-full bg-gradient-to-r from-brand-500 to-accent-500 transition-all" style="width:${(quiz.indice / quiz.preguntas.length) * 100}%"></div>
      </div>
      <p class="mt-5 text-base leading-relaxed font-semibold text-slate-900 dark:text-white">${pregunta.texto}</p>
      <div class="mt-5 grid gap-2.5">
        ${pregunta.opciones
          .map(
            (opcion, i) => `
          <button type="button" data-qz-opt="${i}" class="rounded-xl border border-slate-200 px-4 py-3 text-left text-sm text-slate-700 transition-colors hover:border-brand-400 hover:bg-brand-500/10 dark:border-night-600 dark:text-slate-200">
            ${opcion}
          </button>`,
          )
          .join('')}
      </div>
      <div id="qz-feedback" class="mt-4 hidden"></div>
    </div>`;

  root.querySelectorAll<HTMLButtonElement>('[data-qz-opt]').forEach((boton) => {
    boton.addEventListener('click', () => responder(Number(boton.dataset.qzOpt), boton));
  });
}

function responder(eleccion: number, boton: HTMLButtonElement) {
  if (quiz.respondida) return;
  quiz.respondida = true;
  const pregunta = quiz.preguntas[quiz.indice];
  const correcto = eleccion === pregunta.correcta;
  if (correcto) quiz.aciertos += 1;

  const root = document.getElementById('qz-root');
  root?.querySelectorAll<HTMLButtonElement>('[data-qz-opt]').forEach((b, i) => {
    b.disabled = true;
    b.classList.remove('hover:border-brand-400', 'hover:bg-brand-500/10');
    if (i === pregunta.correcta) b.classList.add('border-brand-500', 'bg-brand-500/15', 'text-brand-800', 'dark:text-brand-200');
    else if (i === eleccion) b.classList.add('border-rose-500', 'bg-rose-500/10', 'text-rose-800', 'dark:text-rose-200');
    else b.classList.add('opacity-60');
  });
  void boton;

  const feedback = document.getElementById('qz-feedback');
  if (feedback) {
    feedback.className = `mt-4 rounded-xl border px-4 py-3 text-sm ${
      correcto
        ? 'border-brand-500/40 bg-brand-500/10 text-brand-800 dark:text-brand-200'
        : 'border-rose-500/40 bg-rose-500/10 text-rose-800 dark:text-rose-200'
    }`;
    feedback.innerHTML = `<p class="font-semibold">${correcto ? 'Correcto.' : 'Incorrecto.'}</p><p class="mt-1 text-xs leading-relaxed">${pregunta.explicacion}</p>
      <button id="qz-next" type="button" class="mt-3 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white dark:bg-white dark:text-slate-900">
        ${quiz.indice + 1 < quiz.preguntas.length ? 'Siguiente pregunta' : 'Ver resultado'}
      </button>`;
    document.getElementById('qz-next')?.addEventListener('click', () => {
      if (quiz.indice + 1 < quiz.preguntas.length) {
        quiz.indice += 1;
        renderQuizPregunta();
      } else {
        renderQuizFinal();
      }
    });
  }
}

function renderQuizFinal() {
  const root = document.getElementById('qz-root');
  if (!root) return;
  const puntaje = quiz.aciertos;
  const mejorPrevio = Number(localStorage.getItem(BEST_KEY) ?? 0);
  if (puntaje > mejorPrevio) localStorage.setItem(BEST_KEY, String(puntaje));
  const mensaje =
    puntaje >= 9 ? 'Dominio excelente del material.' : puntaje >= 6 ? 'Buen dominio: repase las tarjetas marcadas para repasar.' : 'Repase los bloques de la guía y vuelva a intentarlo.';
  root.innerHTML = `
    <div class="rounded-3xl border border-slate-200 bg-white p-10 text-center dark:border-night-700 dark:bg-night-800">
      <p class="font-display text-5xl font-extrabold text-brand-600 dark:text-brand-300">${puntaje}/10</p>
      <p class="mt-3 text-sm font-semibold text-slate-800 dark:text-slate-100">${mensaje}</p>
      <p class="mt-2 text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">Mejor puntaje: ${Math.max(mejorPrevio, puntaje)}/10</p>
      <button id="qz-retry" type="button" class="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-accent-500 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 transition-all hover:-translate-y-0.5">
        Reintentar con otras preguntas
      </button>
    </div>`;
  document.getElementById('qz-retry')?.addEventListener('click', () => {
    quiz.preguntas = barajar(generarPreguntas()).slice(0, 10);
    quiz.indice = 0;
    quiz.aciertos = 0;
    renderQuizPregunta();
  });
}

/* ------------------------------------------------------------------ */
/* Inicialización                                                      */
/* ------------------------------------------------------------------ */

export function initEstudio() {
  const form = document.getElementById('estudio-form');
  if (!form) return;

  /* Pestañas */
  document.querySelectorAll<HTMLButtonElement>('[data-est-tab]').forEach((boton) => {
    boton.addEventListener('click', () => {
      const id = boton.dataset.estTab;
      document.querySelectorAll('[data-est-tab]').forEach((b) => {
        const activo = b === boton;
        b.setAttribute('aria-selected', String(activo));
        b.classList.toggle('bg-white', activo);
        b.classList.toggle('text-brand-700', activo);
        b.classList.toggle('shadow-sm', activo);
        b.classList.toggle('dark:bg-night-700', activo);
        b.classList.toggle('dark:text-brand-300', activo);
      });
      document.querySelectorAll('[data-est-panel]').forEach((p) => {
        p.classList.toggle('hidden', (p as HTMLElement).dataset.estPanel !== id);
      });
      if (id === 'quiz' && !quiz.preguntas.length) renderQuizInicio();
    });
  });

  /* Flashcards */
  const deckSelect = document.getElementById('fc-deck') as HTMLSelectElement | null;
  if (deckSelect) {
    deckSelect.addEventListener('change', () => {
      estado.deck = deckSelect.value;
      estado.indice = 0;
      renderFlash();
    });
  }
  document.getElementById('fc-shuffle')?.addEventListener('click', () => {
    estado.mazo = barajar(estado.mazo);
    estado.indice = 0;
    renderFlash();
  });
  document.getElementById('fc-reset')?.addEventListener('click', () => {
    estado.conocidas = new Set();
    guardarSet(KNOWN_KEY, estado.conocidas);
    renderFlash();
  });
  document.getElementById('fc-prev')?.addEventListener('click', () => moverFlash(-1));
  document.getElementById('fc-next')?.addEventListener('click', () => moverFlash(1));
  document.getElementById('fc-card')?.addEventListener('click', () => {
    estado.volteada = !estado.volteada;
    document.getElementById('fc-card')?.classList.toggle('flipped', estado.volteada);
  });
  document.getElementById('fc-know')?.addEventListener('click', () => {
    const card = deckActual()[estado.indice];
    if (!card) return;
    estado.conocidas.add(card.id);
    guardarSet(KNOWN_KEY, estado.conocidas);
    moverFlash(1);
  });
  document.getElementById('fc-review')?.addEventListener('click', () => {
    const card = deckActual()[estado.indice];
    if (!card) return;
    estado.conocidas.delete(card.id);
    guardarSet(KNOWN_KEY, estado.conocidas);
    moverFlash(1);
  });

  document.addEventListener('keydown', (event) => {
    const panelFlash = document.querySelector('[data-est-panel="flash"]');
    if (!panelFlash || panelFlash.classList.contains('hidden')) return;
    if (event.key === 'ArrowRight') moverFlash(1);
    if (event.key === 'ArrowLeft') moverFlash(-1);
    if (event.key === ' ' || event.key === 'Enter') {
      if ((event.target as HTMLElement).tagName === 'BUTTON' || (event.target as HTMLElement).tagName === 'SELECT') return;
      event.preventDefault();
      estado.volteada = !estado.volteada;
      document.getElementById('fc-card')?.classList.toggle('flipped', estado.volteada);
    }
  });

  renderFlash();
  renderQuizInicio();
}
