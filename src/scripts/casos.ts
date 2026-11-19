import { casos, hojaBase } from '../data/casos';
import { nombresItems, refBase, validarValores, type Hallazgo, type ValoresHoja } from './reglas-his';

const MEJOR = 'his-fua-casos-mejor';

const escapeHtml = (value: string): string =>
  value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string);

let casoActual: number | null = null;
let valoresActuales: ValoresHoja = hojaBase;

const leerMejores = (): Record<string, string> => {
  try {
    return JSON.parse(localStorage.getItem(MEJOR) ?? '{}') as Record<string, string>;
  } catch {
    return {};
  }
};

const guardarMejor = (id: string, texto: string) => {
  const mejores = leerMejores();
  mejores[id] = texto;
  try {
    localStorage.setItem(MEJOR, JSON.stringify(mejores));
  } catch {
    /* sin almacenamiento */
  }
};

const v = (clave: string): string => (valoresActuales[clave] ?? '').trim();

function celdas(): Record<string, string> {
  return {
    '1': valoresActuales['sim-turno'] || '—',
    '2': v('sim-anio') || '—',
    '3': v('sim-mes') || '—',
    '4': v('sim-eess') || '—',
    '5': v('sim-upss') || '—',
    '6': v('sim-responsable') || '—',
    '7': v('sim-dia') || '—',
    '8': [v('sim-dni'), v('sim-hc'), v('sim-gest')].filter(Boolean).join(' · ') || '—',
    '9': v('sim-fin') || '—',
    '10': v('sim-etnia') || '—',
    '11': v('sim-distrito') || '—',
    '12': v('sim-cp') || '—',
    '13': v('sim-edad') ? `${v('sim-edad')} ${v('sim-edadud') || '?'}` : '—',
    '14': v('sim-sexo') === 'BLANK' ? '∅ (en blanco)' : v('sim-sexo') || '—',
    '15': [v('sim-pc') && `PC ${v('sim-pc')}`, v('sim-pab') && `Pab ${v('sim-pab')}`].filter(Boolean).join(' · ') || '—',
    '16':
      [v('sim-peso') && `Peso ${v('sim-peso')} kg`, v('sim-talla') && `Talla ${v('sim-talla')} cm`, v('sim-hb') && `Hb ${v('sim-hb')} g/dL`]
        .filter(Boolean)
        .join(' · ') || '—',
    '17': v('sim-cond17') || '—',
    '18': v('sim-cond18') || '—',
    '19': v('sim-dx') || '—',
    '20': v('sim-tipodx') || '—',
    '21': v('sim-lab') || '—',
    '22': v('sim-cie') || '—',
  };
}

function renderTarjetas() {
  const contenedor = document.getElementById('casos-cards');
  if (!contenedor) return;
  const mejores = leerMejores();
  contenedor.innerHTML = casos
    .map(
      (caso, i) => `
      <button type="button" data-caso="${i}" class="rounded-3xl border border-slate-200 bg-white p-6 text-left transition-all hover:-translate-y-1 hover:border-brand-400/70 hover:shadow-lg hover:shadow-brand-500/10 dark:border-night-700 dark:bg-night-800">
        <div class="flex items-start justify-between gap-3">
          <span class="font-display grid size-10 place-items-center rounded-xl bg-gradient-to-br from-brand-600 to-accent-500 text-sm font-bold text-white">${i + 1}</span>
          ${mejores[caso.id] ? `<span class="rounded-full bg-brand-500/15 px-3 py-1 text-[11px] font-bold text-brand-700 dark:text-brand-300">Mejor: ${escapeHtml(mejores[caso.id])}</span>` : ''}
        </div>
        <p class="font-display mt-4 text-base font-bold text-slate-900 dark:text-white">${escapeHtml(caso.titulo)}</p>
        <p class="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">${escapeHtml(caso.contexto)}</p>
      </button>`,
    )
    .join('');
  contenedor.querySelectorAll<HTMLButtonElement>('[data-caso]').forEach((boton) => {
    boton.addEventListener('click', () => seleccionar(Number(boton.dataset.caso)));
  });
}

function seleccionar(indice: number) {
  casoActual = indice;
  const caso = casos[indice];
  valoresActuales = { ...hojaBase, ...caso.valores };

  const panel = document.getElementById('caso-panel');
  const contexto = document.getElementById('caso-contexto');
  const titulo = document.getElementById('caso-titulo');
  const hoja = document.getElementById('caso-hoja');
  const check = document.getElementById('caso-check');
  const resultado = document.getElementById('caso-result');
  if (!panel || !contexto || !titulo || !hoja || !check || !resultado) return;

  panel.classList.remove('hidden');
  titulo.textContent = `Caso ${indice + 1}: ${caso.titulo}`;
  contexto.textContent = caso.contexto;
  resultado.innerHTML = '';

  const celdasHoja = celdas();
  const tipoLabel =
    { atencion: 'Atención de salud', app: 'Actividad Preventivo Promocional (APP)', aaa: 'Actividad en Animales (AAA)' }[
      v('sim-tipoact') as 'atencion' | 'app' | 'aaa'
    ] ?? '—';
  hoja.innerHTML = `
    <p class="mb-3 flex flex-wrap gap-2 text-[11px] font-bold tracking-wide uppercase">
      <span class="rounded-full bg-brand-500/15 px-3 py-1 text-brand-700 dark:text-brand-300">${escapeHtml(tipoLabel)}</span>
      <span class="rounded-full bg-accent-500/15 px-3 py-1 text-accent-700 dark:text-accent-300">Turno ${escapeHtml(v('sim-turno') || '—')}</span>
      <span class="rounded-full bg-slate-200 px-3 py-1 text-slate-600 dark:bg-night-800 dark:text-slate-300">Financiador ${escapeHtml(v('sim-fin') || '—')}</span>
    </p>
    <div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
      ${['1', '2', '3', '4', '5', '6']
        .map(
          (n) => `
        <div class="rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-night-600 dark:bg-night-900">
          <p class="text-[10px] font-bold tracking-widest text-brand-600 uppercase dark:text-brand-400">Ítem ${n}</p>
          <p class="text-xs font-medium break-words text-slate-700 dark:text-slate-200">${escapeHtml(celdasHoja[n])}</p>
        </div>`,
        )
        .join('')}
    </div>
    <div class="mt-3 rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-night-600 dark:bg-night-900">
      <p class="text-[10px] font-bold tracking-widest text-brand-600 uppercase dark:text-brand-400">Paciente</p>
      <p class="text-xs font-medium text-slate-700 dark:text-slate-200">${escapeHtml(v('sim-paciente') || '—')}${v('sim-fulr') ? ` · FUR ${escapeHtml(v('sim-fulr'))}` : ''}${v('sim-fecnac') ? ` · Nac. ${escapeHtml(v('sim-fecnac'))}` : ''}</p>
    </div>
    <div class="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
      ${Object.entries(celdasHoja)
        .slice(6)
        .map(
          ([n, valor]) => `
        <div class="rounded-lg border border-slate-200 bg-white px-2 py-1.5 dark:border-night-600 dark:bg-night-900">
          <p class="text-[10px] font-bold text-brand-600 dark:text-brand-400">Ítem ${n}</p>
          <p class="text-[11px] font-medium break-words text-slate-700 dark:text-slate-200">${escapeHtml(valor)}</p>
        </div>`,
        )
        .join('')}
    </div>`;

  check.innerHTML = nombresItems()
    .map(
      (item) => `
      <label class="flex cursor-pointer items-center gap-2.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 transition-colors has-checked:border-rose-500 has-checked:bg-rose-500/10 has-checked:text-rose-700 dark:border-night-600 dark:text-slate-200 dark:has-checked:text-rose-300">
        <input type="checkbox" data-marca-ref="${escapeHtml(item.ref)}" class="size-3.5 accent-rose-600" />
        <span class="font-mono font-bold text-brand-700 dark:text-brand-300">${escapeHtml(item.ref)}</span>
        <span class="truncate">${escapeHtml(item.nombre)}</span>
      </label>`,
    )
    .join('');

  panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function verificar() {
  const resultado = document.getElementById('caso-result');
  if (!resultado || casoActual === null) return;

  const hallazgos = validarValores(valoresActuales);
  const auditables = hallazgos.filter((h) => h.nivel !== 'info');
  const objetivos = [...new Set(auditables.map((h) => refBase(h.item)))];
  const marcados = [
    ...document.querySelectorAll<HTMLInputElement>('[data-marca-ref]:checked'),
  ].map((c) => c.getAttribute('data-marca-ref') ?? '');

  const detectados = objetivos.filter((ref) => marcados.includes(ref));
  const omitidos = objetivos.filter((ref) => !marcados.includes(ref));
  const falsosPositivos = marcados.filter((ref) => !objetivos.includes(ref));

  const caso = casos[casoActual];
  guardarMejor(caso.id, `${detectados.length}/${objetivos.length}`);
  renderTarjetas();

  const mensajePorRef = new Map<string, Hallazgo[]>();
  for (const h of auditables) {
    const ref = refBase(h.item);
    mensajePorRef.set(ref, [...(mensajePorRef.get(ref) ?? []), h]);
  }

  const bloque = (ref: string, estado: 'detectado' | 'omitido' | 'falso') => {
    const lista = mensajePorRef.get(ref) ?? [];
    const color =
      estado === 'detectado'
        ? 'border-brand-500/40 bg-brand-500/10 text-brand-800 dark:text-brand-200'
        : estado === 'omitido'
          ? 'border-rose-500/40 bg-rose-500/10 text-rose-800 dark:text-rose-200'
          : 'border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-200';
    const etiqueta = estado === 'detectado' ? 'Detectado' : estado === 'omitido' ? 'Pasó por alto' : 'Falso positivo';
    const contenido =
      lista.length > 0
        ? lista.map((h) => `<p class="mt-1 text-xs leading-relaxed">${escapeHtml(h.mensaje)}</p>`).join('')
        : '<p class="mt-1 text-xs leading-relaxed">Este casillero cumple las reglas del documento.</p>';
    return `
      <li class="rounded-xl border px-4 py-3 ${color}">
        <p class="text-[10px] font-bold tracking-widest uppercase">${etiqueta} · ${escapeHtml(ref)}</p>
        ${contenido}
      </li>`;
  };

  const notas = hallazgos.filter((h) => h.nivel === 'info');
  resultado.innerHTML = `
    <div class="rounded-2xl border border-slate-200 bg-white p-6 text-center dark:border-night-700 dark:bg-night-800">
      <p class="font-display text-4xl font-extrabold text-brand-600 dark:text-brand-300">${detectados.length}/${objetivos.length}</p>
      <p class="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
        hallazgos detectados · ${omitidos.length} pasados por alto · ${falsosPositivos.length} falsos positivos
      </p>
      <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">
        ${omitidos.length === 0 && falsosPositivos.length === 0 ? 'Auditoría perfecta: identificó todos los hallazgos sin marcar casilleros correctos.' : 'Revise debajo cada casillero con su regla normativa.'}
      </p>
    </div>
    <ul class="mt-4 space-y-2.5">
      ${detectados.map((ref) => bloque(ref, 'detectado')).join('')}
      ${omitidos.map((ref) => bloque(ref, 'omitido')).join('')}
      ${falsosPositivos.map((ref) => bloque(ref, 'falso')).join('')}
    </ul>
    ${
      notas.length
        ? `<p class="mt-4 rounded-xl border border-accent-500/40 bg-accent-500/10 px-4 py-3 text-xs text-accent-800 dark:text-accent-200">${notas
            .map((n) => escapeHtml(n.mensaje))
            .join(' · ')}</p>`
        : ''
    }
    <div class="mt-5 flex flex-wrap justify-center gap-3">
      <button id="caso-siguiente" type="button" class="rounded-xl bg-gradient-to-r from-brand-600 to-accent-500 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-500/25 transition-transform hover:-translate-y-0.5">
        Siguiente caso
      </button>
      <button id="caso-reintentar" type="button" class="rounded-xl border border-slate-300 px-6 py-2.5 text-sm font-semibold text-slate-700 hover:border-brand-400 hover:text-brand-700 dark:border-night-600 dark:text-slate-200">
        Reintentar este caso
      </button>
    </div>`;

  document.getElementById('caso-siguiente')?.addEventListener('click', () => {
    seleccionar(((casoActual ?? 0) + 1) % casos.length);
  });
  document.getElementById('caso-reintentar')?.addEventListener('click', () => {
    seleccionar(casoActual ?? 0);
  });
  resultado.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

export function initCasos() {
  const contenedor = document.getElementById('casos-cards');
  if (!contenedor) return;
  renderTarjetas();
  document.getElementById('caso-verificar')?.addEventListener('click', verificar);
}
