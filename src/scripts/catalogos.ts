import { base } from '../data/content';
import {
  cargarCatalogos,
  normalizar,
  FUENTES_ESTADO as FUENTES,
  type DatosCie,
  type DatosCpms,
  type FilaCie,
  type FilaCpms,
} from './catalogo-loader';

const FAVS = 'his-fua-favs';
const RECIENTES = 'his-fua-recientes';

const leerLista = (clave: string): string[] => {
  try {
    const valor = JSON.parse(localStorage.getItem(clave) ?? '{}');
    return Array.isArray(valor) ? valor : (valor[clave === FAVS ? 'cie10' : 'cie10'] ?? []);
  } catch {
    return [];
  }
};

const leerFavs = (catalogo: string): string[] => {
  try {
    const valor = JSON.parse(localStorage.getItem(FAVS) ?? '{}') as Record<string, string[]>;
    return valor[catalogo] ?? [];
  } catch {
    return [];
  }
};

const guardarFavs = (catalogo: string, lista: string[]) => {
  try {
    const valor = JSON.parse(localStorage.getItem(FAVS) ?? '{}') as Record<string, string[]>;
    valor[catalogo] = lista;
    localStorage.setItem(FAVS, JSON.stringify(valor));
  } catch {
    /* sin almacenamiento */
  }
};

const leerRecientes = (): string[] => leerLista(RECIENTES);
const pushReciente = (codigo: string) => {
  const lista = [codigo, ...leerRecientes().filter((c) => c !== codigo)].slice(0, 8);
  try {
    localStorage.setItem(RECIENTES, JSON.stringify(lista));
  } catch {
    /* sin almacenamiento */
  }
  return lista;
};

const escapeHtml = (valor: string): string =>
  valor.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string);

async function copiar(texto: string) {
  try {
    await navigator.clipboard.writeText(texto);
  } catch {
    /* portapapeles bloqueado */
  }
}

/* ------------------------------------------------------------------ */

export async function initCatalogos() {
  const estado = document.getElementById('cat-estado');
  let cie: DatosCie | null = null;
  let cpms: DatosCpms | null = null;

  try {
    const cargado = await cargarCatalogos();
    cie = cargado.cie;
    cpms = cargado.cpms;
    if (estado) estado.textContent = `${cie.filas.length.toLocaleString('es-PE')} códigos CIE-10 y ${cpms.filas.length.toLocaleString('es-PE')} procedimientos CPMS cargados (consulta local, funciona sin conexión tras la primera carga).`;
  } catch (error) {
    if (estado) estado.textContent = `No se pudieron cargar los catálogos: ${(error as Error).message}`;
    return;
  }

  const datosCie = cie as DatosCie;
  const datosCpms = cpms as DatosCpms;

  /* ---- ficha detallada compartida ---- */
  const dialogo = document.getElementById('cat-dialog') as HTMLDialogElement | null;
  const abrirFicha = (html: string, codigo: string) => {
    const cuerpo = document.getElementById('cat-dialog-body');
    if (!cuerpo || !dialogo) return;
    cuerpo.innerHTML = html;
    pushReciente(codigo);
    pintarRecientes();
    dialogo.showModal();
  };

  const fichaCie = (fila: FilaCie): string => `
    <div class="flex flex-wrap items-center gap-2">
      <span class="font-mono text-2xl font-extrabold text-brand-700 dark:text-brand-300">${escapeHtml(fila.codigo)}</span>
      ${fila.oms ? `<span class="rounded-full bg-slate-100 px-3 py-1 font-mono text-xs text-slate-600 dark:bg-night-900 dark:text-slate-300">OMS: ${escapeHtml(fila.oms)}</span>` : ''}
      <span class="rounded-full px-3 py-1 text-[11px] font-bold ${fila.estado === 1 ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300' : 'bg-brand-500/15 text-brand-700 dark:text-brand-300'}">
        ${fila.estado === 1 ? 'Cese de uso' : fila.estado === 2 ? 'Vigente (adición RM 447)' : 'Vigente'}
      </span>
    </div>
    <p class="mt-3 text-sm font-semibold text-slate-900 dark:text-white">${escapeHtml(fila.desc)}</p>
    <dl class="mt-4 grid gap-3 text-xs sm:grid-cols-2">
      <div><dt class="font-bold text-slate-500 uppercase">Capítulo</dt><dd class="mt-0.5 text-slate-700 dark:text-slate-300">${escapeHtml(fila.capitulo || '—')}</dd></div>
      <div><dt class="font-bold text-slate-500 uppercase">Grupo</dt><dd class="mt-0.5 text-slate-700 dark:text-slate-300">${escapeHtml(fila.grupo || '—')}</dd></div>
      <div><dt class="font-bold text-slate-500 uppercase">Nivel</dt><dd class="mt-0.5 text-slate-700 dark:text-slate-300">${escapeHtml(fila.nivel)}</dd></div>
      <div><dt class="font-bold text-slate-500 uppercase">Estrategias sanitarias</dt><dd class="mt-0.5 text-slate-700 dark:text-slate-300">${escapeHtml(fila.estrategias.join(', ') || '—')}</dd></div>
      <div class="sm:col-span-2"><dt class="font-bold text-slate-500 uppercase">Fuente</dt><dd class="mt-0.5 text-slate-700 dark:text-slate-300">${escapeHtml(FUENTES[fila.estado])}${fila.ref ? ` · ${escapeHtml(fila.ref)}` : ''}</dd></div>
    </dl>
    <a href="${base}simulador/?cie=${encodeURIComponent(fila.codigo)}" class="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-accent-500 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-brand-500/25">
      Usar en el simulador de la Hoja HIS
    </a>`;

  const fichaCpms = (fila: FilaCpms): string => `
    <div class="flex flex-wrap items-center gap-2">
      <span class="font-mono text-2xl font-extrabold text-accent-600 dark:text-accent-300">${escapeHtml(fila.codigo)}</span>
      <span class="rounded-full bg-brand-500/15 px-3 py-1 text-[11px] font-bold text-brand-700 dark:text-brand-300">Procedimiento CPMS</span>
    </div>
    <p class="mt-3 text-sm font-semibold text-slate-900 dark:text-white">${escapeHtml(fila.denom)}</p>
    <dl class="mt-4 grid gap-3 text-xs sm:grid-cols-3">
      <div><dt class="font-bold text-slate-500 uppercase">Grupo</dt><dd class="mt-0.5 text-slate-700 dark:text-slate-300">${escapeHtml(fila.grupo)}</dd></div>
      <div><dt class="font-bold text-slate-500 uppercase">Sección</dt><dd class="mt-0.5 text-slate-700 dark:text-slate-300">${escapeHtml(fila.seccion)}</dd></div>
      <div><dt class="font-bold text-slate-500 uppercase">Subsección</dt><dd class="mt-0.5 text-slate-700 dark:text-slate-300">${escapeHtml(fila.subseccion)}</dd></div>
      <div class="sm:col-span-3"><dt class="font-bold text-slate-500 uppercase">Fuente</dt><dd class="mt-0.5 text-slate-700 dark:text-slate-300">CPMS Anexo 1 (RM 550-2023-MINSA)</dd></div>
    </dl>
    <a href="${base}simulador/?cpms=${encodeURIComponent(fila.codigo)}" class="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-accent-500 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-brand-500/25">
      Usar en el simulador de la Hoja HIS
    </a>`;

  /* ---- favoritos y recientes ---- */
  const pintarRecientes = () => {
    const contenedor = document.getElementById('cat-recientes');
    if (!contenedor) return;
    const lista = leerRecientes();
    contenedor.innerHTML = lista.length
      ? `<p class="text-[10px] font-bold tracking-widest text-slate-500 uppercase">Consultas recientes</p>
         <div class="mt-1.5 flex flex-wrap gap-1.5">${lista
           .map(
             (codigo) =>
               `<button type="button" data-reciente="${escapeHtml(codigo)}" class="rounded-full border border-slate-200 px-3 py-1 font-mono text-[11px] text-slate-600 hover:border-brand-400 hover:text-brand-700 dark:border-night-600 dark:text-slate-300">${escapeHtml(codigo)}</button>`,
           )
           .join('')}</div>`
      : '';
  };
  pintarRecientes();

  document.getElementById('cat-recientes')?.addEventListener('click', (evento) => {
    const boton = (evento.target as HTMLElement).closest('[data-reciente]');
    if (!boton) return;
    const codigo = boton.getAttribute('data-reciente') ?? '';
    const fila = datosCie.filas.find((f) => f.codigo === codigo);
    if (fila) abrirFicha(fichaCie(fila), codigo);
    else {
      const proc = datosCpms.filas.find((f) => f.codigo === codigo);
      if (proc) abrirFicha(fichaCpms(proc), codigo);
    }
  });

  /* ---- explorador CIE-10 ---- */
  let limiteCie = 120;
  let soloFavsCie = false;
  const favsCie = new Set(leerFavs('cie10'));

  const selectCap = document.getElementById('cie-cap') as HTMLSelectElement | null;
  if (selectCap) {
    selectCap.innerHTML =
      '<option value="">Todos los capítulos</option>' +
      datosCie.capitulos.map((c, i) => `<option value="${i}">${escapeHtml(c)}</option>`).join('');
  }
  const selectEst = document.getElementById('cie-est') as HTMLSelectElement | null;
  if (selectEst) {
    selectEst.innerHTML =
      '<option value="">Todas las estrategias</option>' +
      datosCie.estrategias.map((e) => `<option value="${escapeHtml(e)}">${escapeHtml(e)}</option>`).join('');
  }

  const filtrarCie = (): FilaCie[] => {
    const consulta = normalizar((document.getElementById('cie-q') as HTMLInputElement | null)?.value.trim() ?? '');
    const cap = selectCap?.value ?? '';
    const est = selectEst?.value ?? '';
    const estadoSel = document.querySelector<HTMLInputElement>('input[name="cie-estado"]:checked')?.value ?? 'todos';
    const capitulosIdx = new Set(datosCie.capitulos.map((_, i) => String(i)));
    void capitulosIdx;
    return datosCie.filas.filter((fila, i) => {
      if (soloFavsCie && !favsCie.has(fila.codigo)) return false;
      if (cap !== '' && fila.capitulo !== datosCie.capitulos[Number(cap)]) return false;
      if (est && !fila.estrategias.includes(est)) return false;
      if (estadoSel === 'vigente' && fila.estado === 1) return false;
      if (estadoSel === 'cesado' && fila.estado !== 1) return false;
      if (estadoSel === 'adicion' && fila.estado !== 2) return false;
      if (consulta && !datosCie.indice[i].includes(consulta)) return false;
      return true;
    });
  };

  const pintarCie = () => {
    const lista = document.getElementById('cie-lista');
    const conteo = document.getElementById('cie-conteo');
    if (!lista || !conteo) return;
    const filas = filtrarCie();
    conteo.textContent = `${filas.length.toLocaleString('es-PE')} resultados`;
    lista.innerHTML = filas
      .slice(0, limiteCie)
      .map(
        (fila) => `
        <li class="flex flex-wrap items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition-colors hover:border-brand-400/70 dark:border-night-700 dark:bg-night-800">
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-2">
              <span class="font-mono text-base font-extrabold text-brand-700 dark:text-brand-300">${escapeHtml(fila.codigo)}</span>
              ${fila.oms ? `<span class="font-mono text-[11px] text-slate-400">OMS ${escapeHtml(fila.oms)}</span>` : ''}
              ${fila.estado === 1 ? '<span class="rounded-full bg-rose-500/15 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:text-rose-300">CESE DE USO</span>' : ''}
              ${fila.estado === 2 ? '<span class="rounded-full bg-accent-500/15 px-2 py-0.5 text-[10px] font-bold text-accent-700 dark:text-accent-300">ADICIÓN RM 447</span>' : ''}
            </div>
            <p class="mt-1 text-sm text-slate-700 dark:text-slate-200">${escapeHtml(fila.desc)}</p>
            <p class="mt-1 text-[11px] text-slate-400 dark:text-slate-500">${escapeHtml(fila.capitulo || fila.grupo || fila.nivel)}${fila.estrategias.length ? ` · ${escapeHtml(fila.estrategias.join(', '))}` : ''}</p>
          </div>
          <div class="flex shrink-0 gap-1.5">
            <button type="button" data-fav-cie="${escapeHtml(fila.codigo)}" class="grid size-8 place-items-center rounded-lg border border-slate-200 text-slate-400 hover:text-amber-500 dark:border-night-600 ${favsCie.has(fila.codigo) ? 'text-amber-500' : ''}" aria-label="Alternar favorito">★</button>
            <button type="button" data-copiar="${escapeHtml(fila.codigo)}" class="grid size-8 place-items-center rounded-lg border border-slate-200 text-slate-400 hover:text-brand-600 dark:border-night-600" aria-label="Copiar código">⧉</button>
            <button type="button" data-ver-cie="${escapeHtml(fila.codigo)}" class="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-brand-400 hover:text-brand-700 dark:border-night-600 dark:text-slate-300">Ver</button>
          </div>
        </li>`,
      )
      .join('');
    const mas = document.getElementById('cie-mas');
    if (mas) mas.classList.toggle('hidden', filas.length <= limiteCie);
  };

  /* ---- explorador CPMS ---- */
  let limiteCpms = 120;
  const filtrarCpms = (): FilaCpms[] => {
    const consulta = normalizar((document.getElementById('cpms-q') as HTMLInputElement | null)?.value.trim() ?? '');
    const grupo = (document.getElementById('cpms-grupo') as HTMLSelectElement | null)?.value ?? '';
    const seccion = (document.getElementById('cpms-seccion') as HTMLSelectElement | null)?.value ?? '';
    return datosCpms.filas.filter((fila, i) => {
      if (grupo && fila.grupo !== grupo) return false;
      if (seccion && fila.seccion !== seccion) return false;
      if (consulta && !datosCpms.indice[i].includes(consulta)) return false;
      return true;
    });
  };

  const pintarCpms = () => {
    const lista = document.getElementById('cpms-lista');
    const conteo = document.getElementById('cpms-conteo');
    if (!lista || !conteo) return;
    const filas = filtrarCpms();
    conteo.textContent = `${filas.length.toLocaleString('es-PE')} resultados`;
    lista.innerHTML = filas
      .slice(0, limiteCpms)
      .map(
        (fila) => `
        <li class="flex flex-wrap items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition-colors hover:border-accent-400/70 dark:border-night-700 dark:bg-night-800">
          <div class="min-w-0 flex-1">
            <span class="font-mono text-base font-extrabold text-accent-600 dark:text-accent-300">${escapeHtml(fila.codigo)}</span>
            <p class="mt-1 text-sm text-slate-700 dark:text-slate-200">${escapeHtml(fila.denom)}</p>
            <p class="mt-1 text-[11px] text-slate-400 dark:text-slate-500">${escapeHtml([fila.grupo, fila.seccion, fila.subseccion].filter(Boolean).join(' › '))}</p>
          </div>
          <div class="flex shrink-0 gap-1.5">
            <button type="button" data-copiar="${escapeHtml(fila.codigo)}" class="grid size-8 place-items-center rounded-lg border border-slate-200 text-slate-400 hover:text-brand-600 dark:border-night-600" aria-label="Copiar código">⧉</button>
            <button type="button" data-ver-cpms="${escapeHtml(fila.codigo)}" class="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-accent-400 hover:text-accent-600 dark:border-night-600 dark:text-slate-300">Ver</button>
          </div>
        </li>`,
      )
      .join('');
    const mas = document.getElementById('cpms-mas');
    if (mas) mas.classList.toggle('hidden', filas.length <= limiteCpms);
  };

  const selectGrupoCpms = document.getElementById('cpms-grupo') as HTMLSelectElement | null;
  const selectSeccionCpms = document.getElementById('cpms-seccion') as HTMLSelectElement | null;
  if (selectGrupoCpms) {
    const grupos = [...new Set(datosCpms.filas.map((f) => f.grupo))].filter(Boolean);
    selectGrupoCpms.innerHTML = '<option value="">Todos los grupos</option>' + grupos.map((g) => `<option value="${escapeHtml(g)}">${escapeHtml(g)}</option>`).join('');
  }
  if (selectSeccionCpms) {
    const secciones = [...new Set(datosCpms.filas.map((f) => f.seccion))].filter(Boolean);
    selectSeccionCpms.innerHTML = '<option value="">Todas las secciones</option>' + secciones.map((s) => `<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`).join('');
  }

  /* ---- búsqueda unificada ---- */
  const pintarUnificada = () => {
    const lista = document.getElementById('uni-lista');
    const conteo = document.getElementById('uni-conteo');
    if (!lista || !conteo) return;
    const consulta = normalizar((document.getElementById('uni-q') as HTMLInputElement | null)?.value.trim() ?? '');
    if (consulta.length < 2) {
      lista.innerHTML = '<li class="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-night-600">Escribe al menos dos caracteres para buscar en ambos catálogos a la vez.</li>';
      conteo.textContent = '';
      return;
    }
    const cieHits = datosCie.filas.filter((_, i) => datosCie.indice[i].includes(consulta)).slice(0, 40);
    const cpmsHits = datosCpms.filas.filter((_, i) => datosCpms.indice[i].includes(consulta)).slice(0, 40);
    conteo.textContent = `${cieHits.length} diagnósticos y ${cpmsHits.length} procedimientos (primeros 40 de cada catálogo)`;
    lista.innerHTML =
      cieHits
        .map(
          (fila) => `
          <li class="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-night-700 dark:bg-night-800">
            <span class="rounded-full bg-brand-500/15 px-2.5 py-1 text-[10px] font-bold text-brand-700 dark:text-brand-300">CIE-10</span>
            <div class="min-w-0 flex-1">
              <span class="font-mono text-sm font-extrabold text-brand-700 dark:text-brand-300">${escapeHtml(fila.codigo)}</span>
              <p class="text-sm text-slate-700 dark:text-slate-200">${escapeHtml(fila.desc)}</p>
            </div>
            <button type="button" data-ver-cie="${escapeHtml(fila.codigo)}" class="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:border-night-600 dark:text-slate-300">Ver</button>
          </li>`,
        )
        .join('') +
      cpmsHits
        .map(
          (fila) => `
          <li class="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-night-700 dark:bg-night-800">
            <span class="rounded-full bg-accent-500/15 px-2.5 py-1 text-[10px] font-bold text-accent-700 dark:text-accent-300">CPMS</span>
            <div class="min-w-0 flex-1">
              <span class="font-mono text-sm font-extrabold text-accent-600 dark:text-accent-300">${escapeHtml(fila.codigo)}</span>
              <p class="text-sm text-slate-700 dark:text-slate-200">${escapeHtml(fila.denom)}</p>
            </div>
            <button type="button" data-ver-cpms="${escapeHtml(fila.codigo)}" class="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:border-night-600 dark:text-slate-300">Ver</button>
          </li>`,
        )
        .join('');
  };

  /* ---- eventos ---- */
  const alCambiarCie = () => {
    limiteCie = 120;
    pintarCie();
  };
  document.getElementById('cie-q')?.addEventListener('input', alCambiarCie);
  selectCap?.addEventListener('change', alCambiarCie);
  selectEst?.addEventListener('change', alCambiarCie);
  document.querySelectorAll('input[name="cie-estado"]').forEach((radio) => radio.addEventListener('change', alCambiarCie));
  document.getElementById('cie-favs')?.addEventListener('click', () => {
    soloFavsCie = !soloFavsCie;
    document.getElementById('cie-favs')?.classList.toggle('bg-amber-500/15', soloFavsCie);
    document.getElementById('cie-favs')?.classList.toggle('text-amber-700', soloFavsCie);
    alCambiarCie();
  });
  document.getElementById('cie-mas')?.addEventListener('click', () => {
    limiteCie += 200;
    pintarCie();
  });
  document.getElementById('cpms-q')?.addEventListener('input', () => {
    limiteCpms = 120;
    pintarCpms();
  });
  selectGrupoCpms?.addEventListener('change', () => {
    limiteCpms = 120;
    pintarCpms();
  });
  selectSeccionCpms?.addEventListener('change', () => {
    limiteCpms = 120;
    pintarCpms();
  });
  document.getElementById('cpms-mas')?.addEventListener('click', () => {
    limiteCpms += 200;
    pintarCpms();
  });
  document.getElementById('uni-q')?.addEventListener('input', pintarUnificada);

  document.addEventListener('click', (evento) => {
    const objetivo = evento.target as HTMLElement;
    const copiar = objetivo.closest('[data-copiar]');
    if (copiar) {
      void copiar(copiar.getAttribute('data-copiar') ?? '');
      copiar.textContent = '✓';
      setTimeout(() => (copiar.textContent = '⧉'), 1200);
      return;
    }
    const fav = objetivo.closest('[data-fav-cie]');
    if (fav) {
      const codigo = fav.getAttribute('data-fav-cie') ?? '';
      if (favsCie.has(codigo)) favsCie.delete(codigo);
      else favsCie.add(codigo);
      guardarFavs('cie10', [...favsCie]);
      pintarCie();
      return;
    }
    const verCie = objetivo.closest('[data-ver-cie]');
    if (verCie) {
      const fila = datosCie.filas.find((f) => f.codigo === verCie.getAttribute('data-ver-cie'));
      if (fila) abrirFicha(fichaCie(fila), fila.codigo);
      return;
    }
    const verCpms = objetivo.closest('[data-ver-cpms]');
    if (verCpms) {
      const fila = datosCpms.filas.find((f) => f.codigo === verCpms.getAttribute('data-ver-cpms'));
      if (fila) abrirFicha(fichaCpms(fila), fila.codigo);
    }
  });

  document.getElementById('cat-dialog-close')?.addEventListener('click', () => dialogo?.close());
  dialogo?.addEventListener('click', (evento) => {
    if (evento.target === dialogo) dialogo.close();
  });
  document.getElementById('cat-dialog-copy')?.addEventListener('click', () => {
    const codigo = document.querySelector('#cat-dialog-body span.font-mono')?.textContent ?? '';
    if (codigo) void copiar(codigo);
  });

  /* ---- pestañas ---- */
  document.querySelectorAll<HTMLButtonElement>('[data-cat-tab]').forEach((boton) => {
    boton.addEventListener('click', () => {
      const id = boton.dataset.catTab;
      document.querySelectorAll('[data-cat-tab]').forEach((b) => {
        const activo = b === boton;
        b.setAttribute('aria-selected', String(activo));
        b.classList.toggle('bg-white', activo);
        b.classList.toggle('text-brand-700', activo);
        b.classList.toggle('shadow-sm', activo);
        b.classList.toggle('dark:bg-night-700', activo);
        b.classList.toggle('dark:text-brand-300', activo);
      });
      document.querySelectorAll('[data-cat-panel]').forEach((p) => {
        p.classList.toggle('hidden', (p as HTMLElement).dataset.catPanel !== id);
      });
    });
  });

  pintarCie();
  pintarCpms();
  pintarUnificada();
}
