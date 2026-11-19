import { base } from '../data/content';

export interface FilaCie {
  codigo: string;
  oms: string;
  desc: string;
  capitulo: string;
  grupo: string;
  nivel: string;
  estrategias: string[];
  estado: 0 | 1 | 2;
  ref: string;
}

export interface FilaCpms {
  codigo: string;
  denom: string;
  grupo: string;
  seccion: string;
  subseccion: string;
}

export interface DatosCie {
  estrategias: string[];
  capitulos: string[];
  grupos: string[];
  referencias: string[];
  filas: FilaCie[];
  indice: string[];
}

export interface DatosCpms {
  filas: FilaCpms[];
  indice: string[];
}

const CACHE = 'his-fua-cat-v4';

const NIVELES: Record<string, string> = { c: 'Categoría', s: 'Subcategoría', e: 'Extensión MINSA' };

export const FUENTES_ESTADO: Record<number, string> = {
  0: 'Catálogo CIE-10 MINSA (REUNIS, VOLUMEN VIGENTE)',
  1: 'RM 447-2024-MINSA, Anexo 2 (cese de uso)',
  2: 'RM 447-2024-MINSA, Anexo 1 (códigos en adición)',
};

export const normalizar = (valor: string): string =>
  valor
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

async function obtenerJson(nombre: string): Promise<unknown> {
  const clave = `${CACHE}:${nombre}`;
  try {
    const enCache = localStorage.getItem(clave);
    if (enCache) return JSON.parse(enCache);
  } catch {
    /* almacenamiento no disponible */
  }
  const respuesta = await fetch(`${base}data/${nombre}.json`);
  if (!respuesta.ok) throw new Error(`No se pudo descargar ${nombre}.json`);
  const texto = await respuesta.text();
  try {
    localStorage.setItem(clave, texto);
  } catch {
    /* cuota excedida: se sigue sin caché */
  }
  return JSON.parse(texto);
}

function expandirCie(crudo: unknown): DatosCie {
  const d = crudo as {
    estrategias: string[];
    capitulos: string[];
    grupos: string[];
    referencias: string[];
    items: [string, string, string, number, number, string, number, number, number][];
  };
  const filas: FilaCie[] = d.items.map((i) => ({
    codigo: i[0],
    oms: i[1],
    desc: i[2],
    capitulo: i[3] >= 0 ? d.capitulos[i[3]] : '',
    grupo: i[4] >= 0 ? d.grupos[i[4]] : '',
    nivel: NIVELES[i[5]] ?? i[5],
    estrategias: d.estrategias.filter((_, bit) => (i[6] & (1 << bit)) !== 0),
    estado: i[7] as 0 | 1 | 2,
    ref: i[8] >= 0 ? d.referencias[i[8]] : '',
  }));
  return {
    estrategias: d.estrategias,
    capitulos: d.capitulos,
    grupos: d.grupos,
    referencias: d.referencias,
    filas,
    indice: filas.map((f) => normalizar(`${f.codigo} ${f.oms} ${f.desc} ${f.estrategias.join(' ')}`)),
  };
}

function expandirCpms(crudo: unknown): DatosCpms {
  const d = crudo as {
    grupos: string[];
    secciones: string[];
    subsecciones: string[];
    items: [string, string, number, number, number][];
  };
  const filas: FilaCpms[] = d.items.map((i) => ({
    codigo: i[0],
    denom: i[1],
    grupo: i[2] >= 0 ? d.grupos[i[2]] : '',
    seccion: i[3] >= 0 ? d.secciones[i[3]] : '',
    subseccion: i[4] >= 0 ? d.subsecciones[i[4]] : '',
  }));
  return { filas, indice: filas.map((f) => normalizar(`${f.codigo} ${f.denom} ${f.grupo} ${f.seccion}`)) };
}

export async function cargarCatalogos(): Promise<{ cie: DatosCie; cpms: DatosCpms }> {
  const [jsonCie, jsonCpms] = await Promise.all([obtenerJson('cie10'), obtenerJson('cpms')]);
  return { cie: expandirCie(jsonCie), cpms: expandirCpms(jsonCpms) };
}

export const buscarCie = (datos: DatosCie, consulta: string, limite = 40): FilaCie[] => {
  const q = normalizar(consulta.trim());
  if (q.length < 2) return [];
  const resultados: FilaCie[] = [];
  for (let i = 0; i < datos.filas.length && resultados.length < limite; i++) {
    if (datos.indice[i].includes(q)) resultados.push(datos.filas[i]);
  }
  return resultados;
};

export const buscarCpms = (datos: DatosCpms, consulta: string, limite = 40): FilaCpms[] => {
  const q = normalizar(consulta.trim());
  if (q.length < 2) return [];
  const resultados: FilaCpms[] = [];
  for (let i = 0; i < datos.filas.length && resultados.length < limite; i++) {
    if (datos.indice[i].includes(q)) resultados.push(datos.filas[i]);
  }
  return resultados;
};
