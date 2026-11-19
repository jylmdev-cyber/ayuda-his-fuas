import { describe, expect, it } from 'vitest';
import {
  codeTables,
  comparativa,
  cursoVida,
  fua,
  glosario,
  hisItems,
  puntosContacto,
  searchIndex,
  simExample,
  studyFacts,
} from '../src/data/content';
import { casos, hojaBase } from '../src/data/casos';
import { validarValores } from '../src/scripts/reglas-his';

describe('contenido de la guía', () => {
  it('la Hoja HIS conserva sus 22 ítems numerados y únicos', () => {
    expect(hisItems).toHaveLength(22);
    expect(hisItems.map((i) => i.num)).toEqual(Array.from({ length: 22 }, (_, i) => i + 1));
  });

  it('la tabla de financiador incluye los códigos clave del documento', () => {
    const codes = codeTables.find((t) => t.id === 'financiador')?.rows.map((r) => r.code) ?? [];
    for (const esperado of ['1', '2', '3', '4', '5', '6', '10', '11']) {
      expect(codes).toContain(esperado);
    }
  });

  it('los códigos por curso de vida cubren toda la vida sin traslapes', () => {
    expect(cursoVida.codes).toHaveLength(5);
    const rangos = cursoVida.codes.map((c) => c.edades);
    expect(rangos[0].min).toBe(0);
    for (let i = 1; i < rangos.length; i++) {
      expect(rangos[i].min).toBe((rangos[i - 1].max ?? 0) + 1);
    }
    expect(rangos[rangos.length - 1].max).toBeNull();
  });

  it('el FUA mantiene sus 17 campos numerados', () => {
    expect(fua.fields).toHaveLength(17);
    expect(fua.fields.map((f) => f.num)).toEqual(Array.from({ length: 17 }, (_, i) => i + 1));
  });

  it('el buscador global tiene entradas de todos los bloques', () => {
    expect(searchIndex.length).toBeGreaterThan(60);
    const tipos = new Set(searchIndex.map((e) => e.kind));
    for (const tipo of ['Ítem Hoja HIS', 'Campo FUA', 'Código', 'Norma']) expect(tipos.has(tipo)).toBe(true);
  });

  it('las tarjetas de estudio tienen anverso y reverso', () => {
    for (const fact of studyFacts) {
      expect(fact.front.length).toBeGreaterThan(10);
      expect(fact.back.length).toBeGreaterThan(10);
    }
  });

  it('el glosario no repite términos y todos tienen definición', () => {
    const terminos = glosario.map((g) => g.termino);
    expect(new Set(terminos).size).toBe(terminos.length);
    for (const entrada of glosario) expect(entrada.definicion.length).toBeGreaterThan(20);
  });

  it('la comparativa HIS vs FUA cubre los aspectos clave', () => {
    expect(comparativa.length).toBeGreaterThanOrEqual(10);
    for (const fila of comparativa) {
      expect(fila.his.length).toBeGreaterThan(20);
      expect(fila.fua.length).toBeGreaterThan(20);
    }
    expect(puntosContacto.length).toBeGreaterThanOrEqual(4);
  });
});

describe('coherencia entre datos y motor de reglas', () => {
  it('el ejemplo precargado del material es una hoja válida', () => {
    const hallazgos = validarValores(simExample);
    expect(hallazgos.filter((h) => h.nivel === 'error')).toEqual([]);
  });

  it('cada caso de auditoría tiene errores sembrados detectables', () => {
    for (const caso of casos) {
      const hallazgos = validarValores({ ...hojaBase, ...caso.valores });
      expect(hallazgos.filter((h) => h.nivel === 'error').length, caso.id).toBeGreaterThanOrEqual(2);
    }
  });
});
