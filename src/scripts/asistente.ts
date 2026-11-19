import { codeTables, cursoVida, fua, type CursoVidaCode } from '../data/content';

interface Edad {
  anios: number;
  meses: number;
  dias: number;
}

const val = (id: string): string => (document.getElementById(id) as HTMLInputElement | HTMLSelectElement | null)?.value.trim() ?? '';

const escapeHtml = (value: string): string =>
  value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string);

function calcularEdad(nacimiento: Date, referencia: Date): Edad | null {
  if (Number.isNaN(nacimiento.getTime()) || Number.isNaN(referencia.getTime())) return null;
  if (nacimiento > referencia) return null;

  let anios = referencia.getFullYear() - nacimiento.getFullYear();
  let meses = referencia.getMonth() - nacimiento.getMonth();
  let dias = referencia.getDate() - nacimiento.getDate();
  if (dias < 0) {
    meses -= 1;
    dias += new Date(referencia.getFullYear(), referencia.getMonth(), 0).getDate();
  }
  if (meses < 0) {
    anios -= 1;
    meses += 12;
  }
  return { anios, meses, dias };
}

function sugerenciaItem13(edad: Edad): { valor: number; unidad: string; nota: string } {
  if (edad.anios === 0 && edad.meses === 0) return { valor: edad.dias, unidad: 'D', nota: 'Menor de un mes: registre la edad en días.' };
  if (edad.anios === 0) return { valor: edad.meses, unidad: 'M', nota: 'Menor de un año: registre la edad en meses.' };
  return { valor: edad.anios, unidad: 'A', nota: 'Un año o más: registre la edad en años cumplidos.' };
}

function codigoPorEdad(anios: number): CursoVidaCode | undefined {
  return cursoVida.codes.find((code) => anios >= code.edades.min && (code.edades.max === null || anios <= code.edades.max));
}

function render() {
  const contenedor = document.getElementById('as-result');
  if (!contenedor) return;

  const nacRaw = val('as-fechanac');
  const atenRaw = val('as-fechatencion') || new Date().toISOString().slice(0, 10);
  const tipo = val('as-tipo') || 'atencion';
  const fin = val('as-fin');
  const gestante = (document.getElementById('as-gestante') as HTMLInputElement | null)?.checked ?? false;

  const tipoLabel = { atencion: 'Atención de salud', app: 'APP', aaa: 'AAA' }[tipo as 'atencion' | 'app' | 'aaa'];

  if (!nacRaw) {
    contenedor.innerHTML = `
      <div class="rounded-2xl border border-slate-300 bg-slate-100 px-5 py-4 text-sm font-semibold text-slate-600 dark:border-night-600 dark:bg-night-800 dark:text-slate-300">
        Indique la fecha de nacimiento del asegurado para calcular la edad y el código por curso de vida.
      </div>`;
    return;
  }

  const nacimiento = new Date(`${nacRaw}T00:00:00`);
  const atencion = new Date(`${atenRaw}T00:00:00`);
  const edad = calcularEdad(nacimiento, atencion);

  if (!edad) {
    contenedor.innerHTML = `
      <div class="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-5 py-4 text-sm font-semibold text-rose-700 dark:text-rose-300">
        La fecha de nacimiento no puede ser posterior a la fecha de atención (ítem 7: se registra la fecha de la prestación).
      </div>`;
    return;
  }

  const item13 = sugerenciaItem13(edad);
  const codigo = codigoPorEdad(edad.anios);
  const generaFua = fin === '2';
  const hbAplica = edad.anios < 5 || (edad.anios >= 10 && edad.anios <= 19) || gestante;

  const edadTexto = [
    edad.anios > 0 ? `${edad.anios} años` : '',
    edad.meses > 0 ? `${edad.meses} meses` : '',
    edad.anios === 0 ? `${edad.dias} días` : '',
  ]
    .filter(Boolean)
    .join(', ');

  const timeline = cursoVida.codes
    .map((code) => {
      const activo = generaFua && codigo?.codigo === code.codigo;
      return `
      <div class="flex-1 rounded-xl border px-3 py-2.5 text-center transition-all ${
        activo
          ? 'border-brand-500 bg-gradient-to-br from-brand-600 to-accent-500 text-white shadow-lg shadow-brand-500/30'
          : 'border-slate-200 bg-white text-slate-500 dark:border-night-600 dark:bg-night-900 dark:text-slate-400'
      }">
        <p class="font-display text-lg font-extrabold">${code.codigo}</p>
        <p class="text-[10px] font-semibold tracking-wide uppercase">${escapeHtml(code.rango)}</p>
      </div>`;
    })
    .join('');

  const checklist: { texto: string; nivel: 'regla' | 'nota' | 'aviso' }[] = [];
  if (generaFua && codigo) {
    checklist.push({
      texto: `Registre el código ${codigo.codigo} en la sección "DE LA ATENCIÓN" del FUA, campo COD. PRESTA.: consolida en un solo código todas las intervenciones de esta atención.`,
      nivel: 'regla',
    });
    checklist.push({
      texto: 'El FUA debe llevar firma y sello del responsable de la atención en el anverso; quien firma asume responsabilidad técnica, legal y administrativa.',
      nivel: 'regla',
    });
    checklist.push({
      texto: `Exclusión: al consignar ${codigo.codigo}, no registre simultáneamente esas mismas atenciones con códigos fragmentados en otros FUA.`,
      nivel: 'regla',
    });
    checklist.push({
      texto: 'Coexistencia: el código por curso de vida no deroga ni limita los códigos prestacionales previamente existentes.',
      nivel: 'regla',
    });
    checklist.push({
      texto: 'El FUA físico requiere firma y huella digital del asegurado; si no puede, firma del representante con nombres, apellidos y documento.',
      nivel: 'regla',
    });
    checklist.push({ texto: 'Se registra solo una (01) prestación por FUA, con llenado legible.', nivel: 'regla' });
  } else if (!generaFua) {
    const financiadorLabel = codeTables.find((t) => t.id === 'financiador')?.rows.find((r) => r.code === fin)?.label;
    checklist.push({
      texto: fin
        ? `El financiador ${fin} (${financiadorLabel ?? 'convenio'}) no genera FUA: el código por curso de vida es un campo del FUA y no aplica a esta atención.`
        : 'Seleccione el financiador: el código por curso de vida solo aplica cuando la atención genera FUA (financiador 2 = SIS).',
      nivel: 'aviso',
    });
  }

  checklist.push({
    texto: `Hoja HIS, ítem 13: registre la edad como "${item13.valor} ${item13.unidad}" (${item13.nota}).`,
    nivel: 'nota',
  });
  checklist.push({
    texto:
      tipo === 'atencion'
        ? 'Hoja HIS, ítem 14: marque M o F según el sexo de la persona atendida.'
        : `Hoja HIS, ítem 14: en ${tipoLabel} el sexo se deja en blanco con línea oblicua; ítem 21 (VALOR LAB): registre ${tipo === 'app' ? 'el número de participantes' : 'la cantidad de animales'}.`,
    nivel: 'nota',
  });
  if (hbAplica) {
    checklist.push({
      texto: 'Aplica registrar la fecha del último resultado de hemoglobina (menores de 5 años, adolescentes o gestante), sin ajuste por altura.',
      nivel: 'nota',
    });
  }
  if (gestante) {
    checklist.push({
      texto: 'Gestante: registre la fecha de última regla (o de la primera ecografía) y la condición en el ítem 8.3.',
      nivel: 'nota',
    });
  }

  const icono = { regla: '✓', nota: 'i', aviso: '!' } as const;
  const color = {
    regla: 'border-brand-500/40 bg-brand-500/10 text-brand-800 dark:text-brand-200',
    nota: 'border-accent-500/40 bg-accent-500/10 text-accent-800 dark:text-accent-200',
    aviso: 'border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-200',
  } as const;

  contenedor.innerHTML = `
    <div class="grid gap-4 sm:grid-cols-2">
      <div class="rounded-2xl border border-slate-200 bg-white p-5 dark:border-night-600 dark:bg-night-900">
        <p class="text-[10px] font-bold tracking-widest text-slate-500 uppercase dark:text-slate-400">Edad a la fecha de atención</p>
        <p class="font-display mt-1 text-xl font-extrabold text-slate-900 dark:text-white">${escapeHtml(edadTexto)}</p>
        <p class="mt-2 text-xs text-slate-500 dark:text-slate-400">Ítem 13 sugerido: <code class="rounded bg-slate-100 px-1.5 py-0.5 font-mono font-bold text-brand-700 dark:bg-night-800 dark:text-brand-300">${item13.valor} ${item13.unidad}</code></p>
      </div>
      <div class="rounded-2xl border p-5 ${generaFua && codigo ? 'border-brand-500/50 bg-brand-500/10' : 'border-amber-500/40 bg-amber-500/10'}">
        <p class="text-[10px] font-bold tracking-widest text-slate-500 uppercase dark:text-slate-400">Código prestacional sugerido (COD. PRESTA.)</p>
        ${
          generaFua && codigo
            ? `<p class="font-display mt-1 text-3xl font-extrabold text-brand-700 dark:text-brand-300">${codigo.codigo}</p>
               <p class="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">${escapeHtml(codigo.nombre)}</p>
               <p class="text-xs text-slate-600 dark:text-slate-300">${escapeHtml(codigo.rango)}</p>`
            : `<p class="font-display mt-1 text-xl font-extrabold text-amber-800 dark:text-amber-200">No aplica</p>
               <p class="mt-1 text-xs leading-relaxed text-amber-800 dark:text-amber-200">La atención no genera FUA con el financiador seleccionado.</p>`
        }
      </div>
    </div>

    <div class="mt-4">
      <p class="mb-2 text-[10px] font-bold tracking-widest text-slate-500 uppercase dark:text-slate-400">Modelo de cuidado integral por curso de vida</p>
      <div class="flex flex-col gap-2 sm:flex-row">${timeline}</div>
      <p class="mt-2 text-[11px] text-slate-500 dark:text-slate-400">${escapeHtml(cursoVida.rangeNote)}</p>
    </div>

    <ul class="mt-4 space-y-2.5">
      ${checklist
        .map(
          (item) => `
        <li class="rounded-xl border px-4 py-3 ${color[item.nivel]}">
          <p class="text-[10px] font-bold tracking-widest uppercase">${icono[item.nivel]} ${item.nivel === 'regla' ? 'Regla FUA' : item.nivel === 'nota' ? 'Hoja HIS' : 'Aviso'}</p>
          <p class="mt-1 text-xs leading-relaxed">${escapeHtml(item.texto)}</p>
        </li>`,
        )
        .join('')}
    </ul>

    <p class="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[11px] leading-relaxed text-slate-500 dark:border-night-700 dark:bg-night-800 dark:text-slate-400">
      ${escapeHtml(fua.norma)} · ${escapeHtml(cursoVida.titulo)}. Herramienta de estudio: no reemplaza al aplicativo del SIS.
    </p>`;
}

export function initAsistente() {
  const form = document.getElementById('as-form');
  if (!form) return;

  const fechaAtencion = document.getElementById('as-fechatencion') as HTMLInputElement | null;
  if (fechaAtencion && !fechaAtencion.value) fechaAtencion.value = new Date().toISOString().slice(0, 10);

  form.addEventListener('input', render);
  form.addEventListener('change', render);
  render();
}
