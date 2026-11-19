/**
 * Importador de catálogos oficiales MINSA → public/data/*.json
 *
 * Fuentes (REUNIS / files.minsa.gob.pe):
 *  - CIE-10 MINSA (Excel, hoja VOLUMEN VIGENTE)
 *  - RM 447-2024-MINSA Anexo 1 (códigos en adición) y Anexo 2 (cese de uso), en PDF
 *  - CPMS Anexo 1 (RM 550-2023-MINSA), Excel dentro de un ZIP
 *
 * Uso: npm run import:catalogos
 * Si los archivos de .fuentes/ no existen, se descargan automáticamente.
 */
import { createReadStream, existsSync, mkdirSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createInterface } from 'node:readline';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const XLSX = require('xlsx');

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const fuentes = path.join(raiz, '.fuentes');
const salida = path.join(raiz, 'public', 'data');
const HOY = '2026-11-19';

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

const DESCARGAS = {
  'cie10-minsa.xlsx': 'https://files.minsa.gob.pe/s/szimSEZTwFrQR25/download',
  'cie10-uso-rm447.pdf': 'https://files.minsa.gob.pe/s/KZfTNeDTx9fnSnM/download',
  'cie10-cese-rm447.pdf': 'https://files.minsa.gob.pe/s/d5jcnbaoGRNfFcd/download',
  'cpms.zip': 'https://files.minsa.gob.pe/s/dKEnmyJcG5HXCHK/download',
};

mkdirSync(fuentes, { recursive: true });
mkdirSync(salida, { recursive: true });

async function asegurar(nombre) {
  const destino = path.join(fuentes, nombre);
  if (existsSync(destino) && statSync(destino).size > 0) return destino;
  const url = DESCARGAS[nombre];
  console.log(`Descargando ${nombre}…`);
  const respuesta = await fetch(url, { headers: { 'User-Agent': UA, Accept: '*/*' } });
  if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status} al descargar ${url}`);
  const buffer = Buffer.from(await respuesta.arrayBuffer());
  writeFileSync(destino, buffer);
  return destino;
}

function pdfATexto(pdf, txt) {
  if (existsSync(txt) && statSync(txt).size > 0) return txt;
  execFileSync('pdftotext', ['-enc', 'UTF-8', '-layout', pdf, txt], { stdio: 'inherit' });
  return txt;
}

async function leerLineas(archivo) {
  const lineas = [];
  const rl = createInterface({ input: createReadStream(archivo, 'utf8'), crlfDelay: Infinity });
  for await (const linea of rl) lineas.push(linea);
  return lineas;
}

/* ------------------------------------------------------------------ */
/* Estrategias sanitarias (clasificación de consulta por rangos CIE-10) */
/* ------------------------------------------------------------------ */

function estrategiasDe(codigo) {
  const out = new Set();
  if (/^[AB]/.test(codigo)) out.add('Enfermedades transmisibles');
  if (/^O/.test(codigo) || /^Z3[4-7]/.test(codigo)) out.add('Obstetricia');
  if (/^F/.test(codigo)) out.add('Salud mental');
  if (/^[EI]/.test(codigo) || /^J4/.test(codigo)) out.add('Enfermedades crónicas');
  if (/^[PQ]/.test(codigo) || codigo.startsWith('Z001')) out.add('CRED y niño');
  if (/^Z2[3-7]/.test(codigo)) out.add('Inmunizaciones');
  return [...out];
}

const omsDe = (codigo) => {
  if (/^\d/.test(codigo)) return undefined;
  if (codigo.length === 3) return codigo;
  if (codigo.length === 4) return codigo[3] === 'X' ? codigo.slice(0, 3) : `${codigo.slice(0, 3)}.${codigo[3]}`;
  if (codigo.length >= 5) return `${codigo.slice(0, 3)}.${codigo.slice(3)}`;
  return undefined;
};

const normalizarCodigo = (crudo) => {
  let codigo = crudo.trim().toUpperCase();
  // Las fuentes sustituyen letras por dígitos: I→1 y O→0 al inicio del código.
  if (/^1\d{3}/.test(codigo)) codigo = `I${codigo.slice(1)}`;
  else if (/^0\d{3}/.test(codigo)) codigo = `O${codigo.slice(1)}`;
  // Dentro del código la letra O nunca es legítima (los dígitos van tras la
  // letra de capítulo): se restauran los ceros, conservando la X de extensión.
  codigo = codigo[0] + codigo.slice(1).replace(/O/g, '0');
  return codigo;
};

/* ------------------------------------------------------------------ */
/* CIE-10                                                              */
/* ------------------------------------------------------------------ */

function parsearCie10(archivoExcel) {
  const wb = XLSX.readFile(archivoExcel);
  const filas = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, defval: '' });

  const registros = new Map();
  let capitulo = '';
  let grupo = '';

  for (const fila of filas) {
    const texto = String(fila[0] ?? '').trim();
    if (!texto) continue;

    const mCap = /^CAPITULO\s+([IVXLCX]+)\s*:\s*(.+)$/i.exec(texto);
    if (mCap) {
      capitulo = `Capítulo ${mCap[1]}: ${mCap[2].trim()}`;
      grupo = '';
      continue;
    }
    const mGrup = /^\(([A-Z]\d{2})\s*-\s*([A-Z]\d{2})\)\s*(.+)$/.exec(texto);
    if (mGrup) {
      grupo = `(${mGrup[1]}-${mGrup[2]}) ${mGrup[3].trim()}`;
      continue;
    }
    const mHoja = /^([A-Z0-9]{3,6})\s*-\s*(.+)$/.exec(texto);
    if (!mHoja) continue;

    const codigo = normalizarCodigo(mHoja[1]);
    if (!/^[A-Z][0-9X]+$/.test(codigo)) continue; // descarta títulos y filas sin código CIE
    const descripcion = mHoja[2].trim().replace(/\s+/g, ' ');
    if (registros.has(codigo)) continue;

    registros.set(codigo, {
      codigoMinsa: codigo,
      codigoOMS: omsDe(codigo),
      descripcion,
      capitulo,
      grupo,
      nivel: codigo.length <= 3 ? 'categoria' : codigo.length === 4 ? 'subcategoria' : 'extension',
      estrategias: estrategiasDe(codigo),
      estado: 'vigente',
      fuente: 'Catálogo CIE-10 MINSA (REUNIS, hoja VOLUMEN VIGENTE)',
      fechaVerificacion: HOY,
    });
  }
  return registros;
}

async function aplicarRemanentes(registros, txtUso, txtCese) {
  const cesados = new Set();
  for (const linea of await leerLineas(txtCese)) {
    const m = /^\s*([A-Z0-9]{3,6})\s*-\s*([A-ZÁÉÍÓÚÑ(].*)$/.exec(linea);
    if (!m) continue;
    const codigo = normalizarCodigo(m[1]);
    if (!/^[A-Z][0-9X]+$/.test(codigo)) continue;
    cesados.add(codigo);
    const previo = registros.get(codigo);
    if (previo) {
      previo.estado = 'cesado';
      previo.referenciaNormativa = 'RM 447-2024-MINSA, Anexo 2 (cese de uso)';
    } else {
      registros.set(codigo, {
        codigoMinsa: codigo,
        codigoOMS: omsDe(codigo),
        descripcion: m[2].trim().replace(/\s+/g, ' '),
        capitulo: '',
        grupo: '',
        nivel: codigo.length <= 3 ? 'categoria' : codigo.length === 4 ? 'subcategoria' : 'extension',
        estrategias: estrategiasDe(codigo),
        estado: 'cesado',
        fuente: 'RM 447-2024-MINSA, Anexo 2 (cese de uso)',
        referenciaNormativa: 'RM 447-2024-MINSA',
        fechaVerificacion: HOY,
      });
    }
  }

  let incorporados = 0;
  for (const linea of await leerLineas(txtUso)) {
    const m = /^\s*([A-Z0-9]{4,6})\s*-\s*([A-ZÁÉÍÓÚÑ(].*)$/.exec(linea);
    if (!m) continue;
    const codigo = normalizarCodigo(m[1]);
    if (!/^[A-Z][0-9X]+$/.test(codigo)) continue;
    if (registros.has(codigo) || cesados.has(codigo)) continue;
    registros.set(codigo, {
      codigoMinsa: codigo,
      codigoOMS: omsDe(codigo),
      descripcion: m[2].trim().replace(/\s+/g, ' '),
      capitulo: '',
      grupo: '',
      nivel: 'extension',
      estrategias: estrategiasDe(codigo),
      estado: 'vigente',
      fuente: 'RM 447-2024-MINSA, Anexo 1 (códigos en adición)',
      referenciaNormativa: 'RM 447-2024-MINSA',
      fechaVerificacion: HOY,
    });
    incorporados += 1;
  }
  return { cesados: cesados.size, incorporados };
}

/* ------------------------------------------------------------------ */
/* CPMS                                                                */
/* ------------------------------------------------------------------ */

function parsearCpms(archivoExcel) {
  const wb = XLSX.readFile(archivoExcel);
  const filas = XLSX.utils.sheet_to_json(wb.Sheets['ANEXO 1'] ?? wb.Sheets[wb.SheetNames[0]], {
    header: 1,
    defval: '',
  });
  const procedimientos = [];
  // El Excel usa celdas combinadas: grupo/sección/subsección solo aparecen
  // en la primera fila de cada bloque, hay que arrastrarlas hacia abajo.
  let grupo = '';
  let seccion = '';
  let subseccion = '';
  for (const fila of filas.slice(2)) {
    const codigo = String(fila[7] ?? '').trim();
    const denominacion = String(fila[8] ?? '').trim();
    if (String(fila[2] ?? '').trim()) grupo = String(fila[2]).trim();
    if (String(fila[4] ?? '').trim()) seccion = String(fila[4]).trim();
    if (String(fila[6] ?? '').trim()) subseccion = String(fila[6]).trim();
    if (!codigo || !denominacion || !/^[A-Z]?\d{4,5}$/.test(codigo)) continue;
    procedimientos.push({
      codigo,
      denominacion: denominacion.replace(/\s+/g, ' '),
      grupo,
      seccion,
      subseccion,
      fuente: 'CPMS Anexo 1 (RM 550-2023-MINSA)',
      fechaVerificacion: HOY,
    });
  }
  return procedimientos;
}

function localizarCpmsExcel() {
  const directo = path.join(fuentes, 'cpms-anexo1.xlsx');
  if (existsSync(directo)) return directo;
  const zip = path.join(fuentes, 'cpms.zip');
  const extraido = path.join(fuentes, 'cpms_extracted');
  if (!existsSync(extraido)) {
    mkdirSync(extraido, { recursive: true });
    execFileSync('unzip', ['-o', '-q', zip, '-d', extraido], { stdio: 'inherit' });
  }
  const buscar = (dir) => {
    for (const entrada of readdirSync(dir, { withFileTypes: true })) {
      const completo = path.join(dir, entrada.name);
      if (entrada.isDirectory()) {
        const hallado = buscar(completo);
        if (hallado) return hallado;
      } else if (entrada.name.endsWith('.xlsx')) {
        return completo;
      }
    }
    return null;
  };
  const hallado = buscar(extraido);
  if (!hallado) throw new Error('No se encontró el xlsx del CPMS dentro del ZIP');
  return hallado;
}

/* ------------------------------------------------------------------ */

const excelCie = await asegurar('cie10-minsa.xlsx');
const pdfUso = await asegurar('cie10-uso-rm447.pdf');
const pdfCese = await asegurar('cie10-cese-rm447.pdf');
await asegurar('cpms.zip');

const txtUso = pdfATexto(pdfUso, path.join(fuentes, 'uso.txt'));
const txtCese = pdfATexto(pdfCese, path.join(fuentes, 'cese.txt'));

const registros = parsearCie10(excelCie);
const remanentes = await aplicarRemanentes(registros, txtUso, txtCese);
const cie10Ordenado = [...registros.values()].sort((a, b) => a.codigoMinsa.localeCompare(b.codigoMinsa));

const cpms = parsearCpms(localizarCpmsExcel());

/* ------------------------------------------------------------------ */
/* Compactación: tablas de cadenas + máscaras de bits                  */
/* ------------------------------------------------------------------ */

const ESTRATEGIAS = [
  'Enfermedades transmisibles',
  'Obstetricia',
  'Salud mental',
  'Enfermedades crónicas',
  'CRED y niño',
  'Inmunizaciones',
];

class Tabla {
  constructor() {
    this.valores = [];
    this.indice = new Map();
  }
  de(valor) {
    if (!valor) return -1;
    if (!this.indice.has(valor)) {
      this.indice.set(valor, this.valores.length);
      this.valores.push(valor);
    }
    return this.indice.get(valor);
  }
}

const capitulos = new Tabla();
const grupos = new Tabla();
const referencias = new Tabla();

const cie10 = cie10Ordenado.map((registro) => {
  let mascara = 0;
  registro.estrategias.forEach((estrategia) => {
    const posicion = ESTRATEGIAS.indexOf(estrategia);
    if (posicion >= 0) mascara |= 1 << posicion;
  });
  return [
    registro.codigoMinsa,
    registro.codigoOMS ?? '',
    registro.descripcion,
    capitulos.de(registro.capitulo),
    grupos.de(registro.grupo),
    registro.nivel[0],
    mascara,
    registro.estado === 'cesado' ? 1 : registro.fuente.includes('Anexo 1') ? 2 : 0,
    referencias.de(registro.referenciaNormativa),
  ];
});

const gruposCpms = new Tabla();
const secciones = new Tabla();
const subsecciones = new Tabla();
const cpmsCompacto = cpms.map((p) => [
  p.codigo,
  p.denominacion,
  gruposCpms.de(p.grupo),
  secciones.de(p.seccion),
  subsecciones.de(p.subseccion),
]);

const meta = {
  generado: HOY,
  fuentes: [
    'REUNIS – CIE-10 MINSA (Excel, VOLUMEN VIGENTE): https://www.minsa.gob.pe/reunis/index.asp?op=3',
    'RM 447-2024-MINSA Anexo 1 (uso) y Anexo 2 (cese de uso)',
    'CPMS Anexo 1 – RM 550-2023-MINSA',
  ],
  conteos: {
    cie10: cie10.length,
    cie10Vigentes: cie10.filter((c) => c[7] === 0).length,
    cie10Cesados: cie10.filter((c) => c[7] === 1).length,
    cie10Adicion: cie10.filter((c) => c[7] === 2).length,
    rm447Cese: remanentes.cesados,
    rm447Adicion: remanentes.incorporados,
    cpms: cpmsCompacto.length,
  },
};

writeFileSync(
  path.join(salida, 'cie10.json'),
  JSON.stringify({
    v: 1,
    estrategias: ESTRATEGIAS,
    capitulos: capitulos.valores,
    grupos: grupos.valores,
    referencias: referencias.valores,
    items: cie10,
  }),
);
writeFileSync(
  path.join(salida, 'cpms.json'),
  JSON.stringify({
    v: 1,
    grupos: gruposCpms.valores,
    secciones: secciones.valores,
    subsecciones: subsecciones.valores,
    items: cpmsCompacto,
  }),
);
writeFileSync(path.join(salida, 'catalogos-meta.json'), JSON.stringify(meta, null, 2));

console.log('Catálogos generados:', JSON.stringify(meta.conteos, null, 2));
