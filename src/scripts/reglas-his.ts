import { codeTables, hisItems } from '../data/content';

export type Nivel = 'error' | 'warning' | 'info';

export interface Hallazgo {
  nivel: Nivel;
  item: string;
  mensaje: string;
}

export type ValoresHoja = Record<string, string>;

const itemRef = (num: number): string => `Ítem ${num}`;

const PRECISION_01 = (value: string): boolean => {
  const n = Number(value.replace(',', '.'));
  return Number.isFinite(n) && Math.abs(Math.round(n * 10) - n * 10) < 1e-9;
};

const financiadorCodes = codeTables.find((t) => t.id === 'financiador')?.rows.map((r) => r.code) ?? [];

/**
 * Motor de reglas de la Hoja HIS. Recibe los valores del formulario
 * (claves `sim-*`) y devuelve los hallazgos del control de calidad.
 * Lo comparten el simulador de llenado y el validador por casos.
 */
export function validarValores(v: ValoresHoja): Hallazgo[] {
  const hallazgos: Hallazgo[] = [];
  const push = (nivel: Nivel, item: string, mensaje: string) => hallazgos.push({ nivel, item, mensaje });
  const val = (clave: string): string => (v[clave] ?? '').trim();

  const tipo = val('sim-tipoact');
  const esAtencion = tipo === 'atencion';
  const esApp = tipo === 'app';
  const esAaa = tipo === 'aaa';
  const sexoSel = val('sim-sexo');
  const sexoEnBlanco = sexoSel === 'BLANK';
  const sexo = sexoEnBlanco ? '' : sexoSel;
  const gest = val('sim-gest');
  const edadRaw = val('sim-edad');
  const edad = Number(edadRaw);
  const unidad = val('sim-edadud');
  const dni = val('sim-dni');
  const sinDocumento = /^(sin documento|cnv)$/i.test(dni);

  /* ---- Datos generales (ítems 1-6) ---- */
  if (!val('sim-turno')) {
    push('error', itemRef(1), 'Marque el turno con un aspa (M, T o N). Recuerde: una Hoja HIS por turno, nunca los tres turnos en una misma hoja.');
  }
  const anio = val('sim-anio');
  if (!/^\d{4}$/.test(anio)) push('error', itemRef(2), 'El año se registra con cuatro (4) dígitos.');
  else if (Number(anio) < 2000 || Number(anio) > 2035) push('warning', itemRef(2), 'Verifique el año consignado: está fuera del rango esperado.');
  const mes = val('sim-mes');
  if (!/^(0[1-9]|1[0-2])$/.test(mes)) push('error', itemRef(3), 'El mes se registra con dos (2) dígitos, de 01 a 12.');
  if (!val('sim-eess')) push('error', itemRef(4), 'Registre el nombre del establecimiento; su código debe estar activo en el RENIPRES.');
  if (!val('sim-upss')) push('error', itemRef(5), 'Registre la Unidad Productora de Servicios de Salud (UPSS).');
  const responsable = val('sim-responsable');
  if (!responsable) push('error', itemRef(6), 'Registre nombres y apellidos de quien brinda la atención.');
  else if (responsable.split(/\s+/).length < 2)
    push('warning', itemRef(6), 'Consigne los nombres completos, con registro claro y legible.');

  /* ---- Datos específicos del paciente ---- */
  if (!val('sim-paciente')) push('error', 'Paciente', 'Consigne nombres y apellidos del paciente según su documento de identidad.');
  if (val('sim-fecnac') && dni && !sinDocumento)
    push('warning', 'Paciente', 'La fecha de nacimiento (*) es opcional y solo se usa en pacientes indocumentados; con documento vigente la datos se actualizan vía RENIEC.');
  const fechb = val('sim-fechb');
  if (fechb) {
    const aplicaHb =
      (unidad === 'A' && edad < 5) || (unidad === 'A' && edad >= 10 && edad <= 19) || gest === 'gestante' || gest === 'puerpera';
    if (!aplicaHb && edadRaw)
      push('warning', 'Paciente', 'La fecha del último resultado de Hb solo se registra en menores de 5 años, adolescentes y gestantes.');
  }
  const fulr = val('sim-fulr');
  if (fulr && sexo === 'M') push('error', 'Paciente', 'La fecha de última regla se registra solamente en gestantes.');
  if (fulr && gest !== 'gestante' && sexo === 'F')
    push('warning', 'Paciente', 'Si consignó fecha de última regla, marque también la condición de gestante (ítem 8.3).');

  /* ---- Datos de la atención (ítems 7-22) ---- */
  const dia = val('sim-dia');
  if (!/^\d{1,2}$/.test(dia) || Number(dia) < 1 || Number(dia) > 31) {
    push('error', itemRef(7), 'Registre con números arábigos el día de la atención (01-31).');
  } else if (/^\d{4}$/.test(anio) && /^(0[1-9]|1[0-2])$/.test(mes)) {
    const fecha = new Date(Number(anio), Number(mes) - 1, Number(dia));
    if (fecha.getMonth() !== Number(mes) - 1) push('error', itemRef(7), 'El día no existe para el mes y año consignados.');
  }

  if (!dni) push('error', 'Ítem 8.1', 'Registre DNI, carné de extranjería/pasaporte, o provisionalmente "Sin documento" o CNV.');
  else if (!sinDocumento && !/^\d{8}$/.test(dni) && !/^[A-Z]\d{6,9}$/i.test(dni))
    push('warning', 'Ítem 8.1', 'El documento peruano tiene 8 dígitos; verifique el número consignado.');

  const hc = val('sim-hc');
  if (!hc) push('error', 'Ítem 8.2', 'Registre la Historia Clínica / Ficha familiar, o el código APP / AAA según el tipo de actividad.');
  else if (esApp && !/^APP\d+$/i.test(hc))
    push('error', 'Ítem 8.2', 'En una APP registre las siglas APP seguidas del código del grupo (ejemplo: APP140).');
  else if (esAaa && !/^AAA\d+$/i.test(hc))
    push('error', 'Ítem 8.2', 'En una AAA registre las siglas AAA seguidas del código del animal (ejemplo: AAA101).');
  else if (esAtencion && hc.includes('-') && !/^\d+-\d{2}$/.test(hc))
    push('warning', 'Ítem 8.2', 'La ficha familiar se registra como número de ficha, guion y número del integrante (ejemplo: 15251342-01).');

  if (gest && sexo === 'M') push('error', 'Ítem 8.3', 'La condición gestante / puérpera no aplica a personas de sexo masculino.');

  const fin = val('sim-fin');
  if (!fin) push('error', itemRef(9), 'Registre el código del financiador de la atención.');
  else if (['3', '4', '5', '6', '7', '8', '9'].includes(fin))
    push('warning', itemRef(9), `El código ${fin} solo se registra cuando existe convenio vigente entre instituciones.`);
  else if (fin === '2') push('info', itemRef(9), 'Financiador SIS: esta atención genera el Formato Único de Atención (FUA) correspondiente.');

  if (!val('sim-etnia'))
    push('warning', itemRef(10), 'Pregunte al paciente a qué etnia se considera pertenecer y registre el código (R.M. 975-2017/MINSA).');

  if (!val('sim-distrito')) push('error', itemRef(11), 'Registre el distrito de procedencia (residencia de los últimos 06 meses).');

  if (!edadRaw) push('error', itemRef(13), 'Registre la edad en valores enteros con su identificador (D, M o A).');
  else if (!Number.isInteger(edad) || edad < 0) push('error', itemRef(13), 'La edad se registra en valores numéricos enteros.');
  else if (unidad === 'D' && edad > 365) push('warning', itemRef(13), 'Con más de 365 días, registre la edad en meses o años.');
  else if (unidad === 'M' && edad > 23) push('warning', itemRef(13), 'Con más de 23 meses, registre la edad en años.');
  if (!unidad) push('error', itemRef(13), 'Indique el tipo de edad: días (D), meses (M) o años (A).');

  if (esAtencion && !sexoSel) push('error', itemRef(14), 'En una atención marque M o F según el sexo de la persona atendida.');
  if (esAtencion && sexoEnBlanco) push('error', itemRef(14), 'En una atención el sexo no puede dejarse en blanco con línea oblicua.');
  if (!esAtencion && sexo) push('error', itemRef(14), 'En APP y AAA el sexo se deja en blanco con una línea oblicua.');

  for (const [id, num, min, max, unidadTxt] of [
    ['sim-pc', 15, 15, 75, 'cm'],
    ['sim-pab', 15, 30, 200, 'cm'],
  ] as const) {
    const valor = val(id);
    if (!valor) continue;
    if (!PRECISION_01(valor)) push('error', itemRef(num), `Registre la medida en ${unidadTxt} con una aproximación de 0.1 ${unidadTxt}.`);
    else if (Number(valor) < min || Number(valor) > max) push('warning', itemRef(num), `Valor de ${unidadTxt} fuera del rango plausible; verifique la medición.`);
  }

  for (const [id, num, min, max, unidadTxt] of [
    ['sim-peso', 16, 0.5, 250, 'kg'],
    ['sim-talla', 16, 30, 220, 'cm'],
    ['sim-hb', 16, 4, 25, 'g/dL'],
  ] as const) {
    const valor = val(id);
    if (!valor) continue;
    if (!PRECISION_01(valor)) push('error', itemRef(num), `Registre el valor con una aproximación de 0.1 ${unidadTxt}.`);
    else if (Number(valor) < min || Number(valor) > max) push('warning', itemRef(num), `Valor en ${unidadTxt} fuera del rango plausible; verifique la medición.`);
  }
  if (val('sim-hb') && !fechb)
    push('warning', itemRef(16), 'Si registra hemoglobina, consigne la fecha de entrega del resultado para evitar duplicidad.');

  if (esAtencion) {
    if (!val('sim-cond17')) push('error', itemRef(17), 'Marque N, C o R según la condición de atención en el establecimiento.');
    if (!val('sim-cond18')) push('error', itemRef(18), 'Marque N, C o R según la condición de atención en el servicio.');
  }

  const dx = val('sim-dx');
  if (!dx) push('error', itemRef(19), 'Registre el diagnóstico, motivo de consulta, procedimiento o actividad de salud.');
  else if (dx.length < 5) push('warning', itemRef(19), 'Describa el diagnóstico sin abreviaturas.');
  if (dx && !val('sim-tipodx')) push('error', itemRef(20), 'Marque el tipo de diagnóstico (P, D o R) del diagnóstico consignado.');

  const lab = val('sim-lab');
  if ((esApp || esAaa) && !lab)
    push('warning', itemRef(21), `En ${esApp ? 'una APP' : 'una AAA'} registre en VALOR LAB ${esApp ? 'el número de participantes' : 'la cantidad de animales'}.`);
  if (lab && !/^\d+$/.test(lab)) push('warning', itemRef(21), 'VALOR LAB se registra con valores numéricos (dosis, sesiones, participantes, animales).');

  const cie = val('sim-cie').toUpperCase();
  if (esAtencion && !cie) push('error', itemRef(22), 'Registre el código CIE-10 del diagnóstico y/o el código CPT/CPMS del procedimiento.');
  if (cie && !/^[A-Z]\d{2}([.,]?[0-9X]{1,3})?$/.test(cie) && !/^\d{5}([.,]\d{2})?$/.test(cie))
    push('error', itemRef(22), 'Formato no válido: use CIE-10 (ejemplo: Z35.9 o Z3591) o CPMS/CPT (ejemplo: 59401.06).');

  if (!financiadorCodes.includes(fin) && fin) push('error', itemRef(9), 'Código de financiador inexistente en la tabla oficial.');

  return hallazgos;
}

/** Referencia de ítem normalizada para comparar auditorías ('Ítem 8.1' → 'Ítem 8'). */
export const refBase = (item: string): string => {
  const m = /^Ítem (\d+)/.exec(item);
  return m ? `Ítem ${m[1]}` : item;
};

export const nombresItems = (): { ref: string; nombre: string }[] => [
  { ref: 'Paciente', nombre: 'Datos específicos del paciente' },
  ...hisItems.map((i) => ({ ref: `Ítem ${i.num}`, nombre: i.nombre })),
];
