import { simExample } from '../data/content';
import { validarValores, type Hallazgo, type ValoresHoja } from './reglas-his';
import { buscarCie, buscarCpms, cargarCatalogos, type DatosCie, type DatosCpms } from './catalogo-loader';

const el = (id: string): HTMLInputElement | HTMLSelectElement | null =>
  document.getElementById(id) as HTMLInputElement | HTMLSelectElement | null;

const val = (id: string): string => (el(id)?.value ?? '').trim();

const radio = (name: string): string =>
  document.querySelector<HTMLInputElement>(`input[name="${name}"]:checked`)?.value ?? '';

const escapeHtml = (value: string): string =>
  value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string);

const CLAVES = [
  'sim-anio', 'sim-mes', 'sim-eess', 'sim-upss', 'sim-responsable', 'sim-paciente', 'sim-fecnac', 'sim-fechb',
  'sim-fulr', 'sim-dia', 'sim-tipoact', 'sim-dni', 'sim-hc', 'sim-gest', 'sim-fin', 'sim-etnia', 'sim-distrito',
  'sim-cp', 'sim-edad', 'sim-edadud', 'sim-sexo', 'sim-pc', 'sim-pab', 'sim-peso', 'sim-talla', 'sim-hb',
  'sim-cond17', 'sim-cond18', 'sim-dx', 'sim-tipodx', 'sim-lab', 'sim-cie',
];

function collect(): ValoresHoja {
  const valores: ValoresHoja = { 'sim-turno': radio('sim-turno') };
  for (const clave of CLAVES) valores[clave] = val(clave);
  return valores;
}

function estadoCampos(): Record<string, string> {
  return {
    '1': radio('sim-turno') || '—',
    '2': val('sim-anio') || '—',
    '3': val('sim-mes') || '—',
    '4': val('sim-eess') || '—',
    '5': val('sim-upss') || '—',
    '6': val('sim-responsable') || '—',
    '7': val('sim-dia') || '—',
    '8': [val('sim-dni'), val('sim-hc'), val('sim-gest')].filter(Boolean).join(' · ') || '—',
    '9': val('sim-fin') || '—',
    '10': val('sim-etnia') || '—',
    '11': val('sim-distrito') || '—',
    '12': val('sim-cp') || '—',
    '13': val('sim-edad') ? `${val('sim-edad')} ${val('sim-edadud') || '?'}` : '—',
    '14': val('sim-sexo') === 'BLANK' ? '∅' : val('sim-sexo') || '—',
    '15': [val('sim-pc') && `PC ${val('sim-pc')}`, val('sim-pab') && `Pab ${val('sim-pab')}`].filter(Boolean).join(' · ') || '—',
    '16':
      [val('sim-peso') && `Peso ${val('sim-peso')} kg`, val('sim-talla') && `Talla ${val('sim-talla')} cm`, val('sim-hb') && `Hb ${val('sim-hb')} g/dL`]
        .filter(Boolean)
        .join(' · ') || '—',
    '17': val('sim-cond17') || '—',
    '18': val('sim-cond18') || '—',
    '19': val('sim-dx') || '—',
    '20': val('sim-tipodx') || '—',
    '21': val('sim-lab') || '—',
    '22': val('sim-cie') || '—',
  };
}

function renderPreview() {
  const target = document.getElementById('sim-preview');
  if (!target) return;
  const valores = estadoCampos();
  const paciente = val('sim-paciente') || '—';
  const tipoLabel =
    { atencion: 'Atención de salud', app: 'Actividad Preventivo Promocional (APP)', aaa: 'Actividad en Animales (AAA)' }[
      val('sim-tipoact') as 'atencion' | 'app' | 'aaa'
    ] ?? '—';

  target.innerHTML = `
    <div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
      ${['1', '2', '3', '4', '5', '6']
        .map(
          (n) => `
        <div class="rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-night-600 dark:bg-night-900">
          <p class="text-[10px] font-bold tracking-widest text-brand-600 uppercase dark:text-brand-400">${n}</p>
          <p class="truncate text-xs font-medium text-slate-700 dark:text-slate-200" title="${escapeHtml(valores[n])}">${escapeHtml(valores[n])}</p>
        </div>`,
        )
        .join('')}
    </div>
    <div class="mt-3 rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-night-600 dark:bg-night-900">
      <p class="text-[10px] font-bold tracking-widest text-brand-600 uppercase dark:text-brand-400">Paciente · ${escapeHtml(tipoLabel)}</p>
      <p class="truncate text-xs font-medium text-slate-700 dark:text-slate-200">${escapeHtml(paciente)}</p>
    </div>
    <div class="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-8">
      ${Object.entries(valores)
        .slice(6)
        .map(
          ([n, v]) => `
        <div class="rounded-lg border border-slate-200 bg-white px-2 py-1.5 dark:border-night-600 dark:bg-night-900">
          <p class="text-[10px] font-bold text-brand-600 dark:text-brand-400">${n}</p>
          <p class="truncate text-[11px] font-medium text-slate-700 dark:text-slate-200" title="${escapeHtml(v)}">${escapeHtml(v)}</p>
        </div>`,
        )
        .join('')}
    </div>`;
}

function renderResultados(hallazgos: Hallazgo[]) {
  const lista = document.getElementById('sim-results');
  const veredicto = document.getElementById('sim-verdict');
  const conteo = document.getElementById('sim-counts');
  if (!lista || !veredicto || !conteo) return;

  const errores = hallazgos.filter((h) => h.nivel === 'error').length;
  const avisos = hallazgos.filter((h) => h.nivel === 'warning').length;
  const infos = hallazgos.filter((h) => h.nivel === 'info').length;
  conteo.textContent = `Errores: ${errores} · Observaciones: ${avisos} · Notas: ${infos}`;

  const lleno = Boolean(val('sim-paciente') || val('sim-dni') || val('sim-dx'));
  if (!lleno) {
    veredicto.className =
      'rounded-2xl border border-slate-300 bg-slate-100 px-5 py-4 text-sm font-semibold text-slate-600 dark:border-night-600 dark:bg-night-800 dark:text-slate-300';
    veredicto.textContent = 'Complete la hoja para obtener el veredicto del control de calidad.';
  } else if (errores > 0) {
    veredicto.className =
      'rounded-2xl border border-rose-500/40 bg-rose-500/10 px-5 py-4 text-sm font-semibold text-rose-700 dark:text-rose-300';
    veredicto.textContent = 'Hoja observada: el control de calidad la devuelve al personal de salud para subsanar el dato errado.';
  } else if (avisos > 0) {
    veredicto.className =
      'rounded-2xl border border-amber-500/40 bg-amber-500/10 px-5 py-4 text-sm font-semibold text-amber-800 dark:text-amber-200';
    veredicto.textContent = 'Hoja digitable con observaciones: revise los avisos antes de enviarla a digitación.';
  } else {
    veredicto.className =
      'rounded-2xl border border-brand-500/40 bg-brand-500/10 px-5 py-4 text-sm font-semibold text-brand-700 dark:text-brand-300';
    veredicto.textContent = 'Hoja válida: lista para digitación en el sistema HIS MINSA.';
  }

  const icono = { error: '✕', warning: '!', info: 'i' } as const;
  const color = {
    error: 'border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-300',
    warning: 'border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-200',
    info: 'border-accent-500/40 bg-accent-500/10 text-accent-700 dark:text-accent-300',
  } as const;

  lista.innerHTML =
    hallazgos.length === 0
      ? '<li class="rounded-xl border border-brand-500/40 bg-brand-500/10 px-4 py-3 text-xs text-brand-700 dark:text-brand-300">Sin hallazgos: el registro cumple las reglas del documento.</li>'
      : hallazgos
          .map(
            (h) => `
          <li class="rounded-xl border px-4 py-3 ${color[h.nivel]}">
            <p class="text-[10px] font-bold tracking-widest uppercase">${icono[h.nivel]} ${escapeHtml(h.item)}</p>
            <p class="mt-1 text-xs leading-relaxed">${escapeHtml(h.mensaje)}</p>
          </li>`,
          )
          .join('');
}

function ejecutar() {
  renderResultados(validarValores(collect()));
  renderPreview();
}

function aplicarValores(valores: Record<string, string>) {
  for (const [id, value] of Object.entries(valores)) {
    const campo = el(id);
    if (campo instanceof HTMLSelectElement || (campo instanceof HTMLInputElement && campo.type !== 'radio')) {
      campo.value = value;
    }
  }
  const turno = valores['sim-turno'];
  if (turno) {
    const radioTurno = document.querySelector<HTMLInputElement>(`input[name="sim-turno"][value="${turno}"]`);
    if (radioTurno) radioTurno.checked = true;
  }
}

/* ------------------------------------------------------------------ */
/* Buscador de códigos CIE-10 / CPMS para el ítem 22                    */
/* ------------------------------------------------------------------ */

let catalogos: { cie: DatosCie; cpms: DatosCpms } | null = null;
let cargaPrometida: Promise<{ cie: DatosCie; cpms: DatosCpms }> | null = null;

async function asegurarCatalogos() {
  if (catalogos) return catalogos;
  if (!cargaPrometida) {
    cargaPrometida = cargarCatalogos().then((c) => {
      catalogos = c;
      return c;
    });
  }
  return cargaPrometida;
}

async function pintarBusquedaCodigo(consulta: string) {
  const lista = document.getElementById('sim-code-lista');
  const estado = document.getElementById('sim-code-estado');
  if (!lista) return;
  if (consulta.trim().length < 2) {
    lista.innerHTML = '';
    if (estado) estado.textContent = 'Escriba al menos dos caracteres para buscar en los catálogos oficiales.';
    return;
  }
  if (estado) estado.textContent = 'Buscando en los catálogos oficiales…';
  try {
    const datos = await asegurarCatalogos();
    const cie = buscarCie(datos.cie, consulta, 6);
    const cpms = buscarCpms(datos.cpms, consulta, 6);
    if (estado) estado.textContent = `${cie.length} diagnósticos y ${cpms.length} procedimientos.`;
    lista.innerHTML =
      cie
        .map(
          (fila) => `
        <li><button type="button" data-sel-cie="${escapeHtml(fila.codigo)}" data-sel-desc="${escapeHtml(fila.desc)}" class="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-left hover:border-brand-400 hover:bg-brand-500/10 dark:border-night-600">
          <span class="font-mono text-sm font-extrabold text-brand-700 dark:text-brand-300">${escapeHtml(fila.codigo)}</span>
          <span class="ml-2 rounded-full bg-brand-500/15 px-2 py-0.5 text-[10px] font-bold text-brand-700 dark:text-brand-300">CIE-10</span>
          ${fila.estado === 1 ? '<span class="ml-1 rounded-full bg-rose-500/15 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:text-rose-300">CESE</span>' : ''}
          <p class="mt-0.5 text-xs text-slate-600 dark:text-slate-300">${escapeHtml(fila.desc)}</p>
        </button></li>`,
        )
        .join('') +
      cpms
        .map(
          (fila) => `
        <li><button type="button" data-sel-cie="${escapeHtml(fila.codigo)}" class="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-left hover:border-accent-400 hover:bg-accent-500/10 dark:border-night-600">
          <span class="font-mono text-sm font-extrabold text-accent-600 dark:text-accent-300">${escapeHtml(fila.codigo)}</span>
          <span class="ml-2 rounded-full bg-accent-500/15 px-2 py-0.5 text-[10px] font-bold text-accent-700 dark:text-accent-300">CPMS</span>
          <p class="mt-0.5 text-xs text-slate-600 dark:text-slate-300">${escapeHtml(fila.denom)}</p>
        </button></li>`,
        )
        .join('');
  } catch {
    if (estado) estado.textContent = 'No se pudieron cargar los catálogos; verifique su conexión.';
  }
}

function initBuscadorCodigos() {
  const dialogo = document.getElementById('sim-code-dialog') as HTMLDialogElement | null;
  const input = document.getElementById('sim-code-q') as HTMLInputElement | null;
  document.getElementById('sim-buscar-codigo')?.addEventListener('click', () => {
    dialogo?.showModal();
    if (input) {
      input.value = '';
      void pintarBusquedaCodigo('');
      input.focus();
    }
  });
  input?.addEventListener('input', () => void pintarBusquedaCodigo(input.value));
  document.getElementById('sim-code-close')?.addEventListener('click', () => dialogo?.close());
  dialogo?.addEventListener('click', (evento) => {
    if (evento.target === dialogo) dialogo.close();
  });
  document.getElementById('sim-code-lista')?.addEventListener('click', (evento) => {
    const boton = (evento.target as HTMLElement).closest('[data-sel-cie]');
    if (!boton) return;
    const codigo = boton.getAttribute('data-sel-cie') ?? '';
    const descripcion = boton.getAttribute('data-sel-desc');
    const campoCie = el('sim-cie');
    if (campoCie) campoCie.value = codigo;
    if (descripcion) {
      const campoDx = el('sim-dx');
      if (campoDx && !campoDx.value.trim()) campoDx.value = descripcion;
    }
    dialogo?.close();
    ejecutar();
  });
}

/* ------------------------------------------------------------------ */

export function initSimulador() {
  const form = document.getElementById('sim-form');
  if (!form) return;

  const params = new URLSearchParams(window.location.search);
  const cie = params.get('cie');
  const cpms = params.get('cpms');
  if (cie) {
    const campo = el('sim-cie');
    if (campo) campo.value = cie.toUpperCase();
  } else if (cpms) {
    const campo = el('sim-cie');
    if (campo) campo.value = cpms.toUpperCase();
  }

  form.addEventListener('input', ejecutar);
  form.addEventListener('change', ejecutar);

  document.getElementById('sim-btn-ejemplo')?.addEventListener('click', () => {
    aplicarValores(simExample);
    ejecutar();
  });

  document.getElementById('sim-btn-limpiar')?.addEventListener('click', () => {
    (form as HTMLFormElement).reset();
    ejecutar();
  });

  initBuscadorCodigos();
  ejecutar();
}
