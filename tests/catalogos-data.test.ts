import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const raiz = process.cwd();
const rutaCie = path.join(raiz, 'public', 'data', 'cie10.json');
const rutaCpms = path.join(raiz, 'public', 'data', 'cpms.json');
const rutaMeta = path.join(raiz, 'public', 'data', 'catalogos-meta.json');

const hayDatos = existsSync(rutaCie) && existsSync(rutaCpms);

type FilaCie = [string, string, string, number, number, string, number, number, number];
type FilaCpms = [string, string, number, number, number];

describe.skipIf(!hayDatos)('catálogos oficiales generados', () => {
  const cie = JSON.parse(readFileSync(rutaCie, 'utf8')) as {
    capitulos: string[];
    grupos: string[];
    estrategias: string[];
    items: FilaCie[];
  };
  const cpms = JSON.parse(readFileSync(rutaCpms, 'utf8')) as {
    grupos: string[];
    secciones: string[];
    items: FilaCpms[];
  };
  const meta = JSON.parse(readFileSync(rutaMeta, 'utf8')) as { conteos: Record<string, number> };

  it('el CIE-10 no tiene códigos duplicados', () => {
    const codigos = cie.items.map((i) => i[0]);
    expect(new Set(codigos).size).toBe(codigos.length);
  });

  it('los estados y niveles del CIE-10 son válidos', () => {
    for (const fila of cie.items) {
      expect([0, 1, 2]).toContain(fila[7]);
      expect(['c', 's', 'e']).toContain(fila[5]);
    }
  });

  it('los códigos OMS derivados tienen formato correcto', () => {
    for (const fila of cie.items) {
      if (!fila[1]) continue;
      expect(fila[1], fila[0]).toMatch(/^[A-Z]\d{2}(\.[0-9A-Z]{1,3})?$/);
    }
  });

  it('las máscaras de estrategia apuntan a estrategias existentes', () => {
    for (const fila of cie.items) {
      const bits = Math.log2(fila[6] || 1);
      void bits;
      for (let bit = 0; bit < 10; bit++) {
        if (fila[6] & (1 << bit)) expect(bit).toBeLessThan(cie.estrategias.length);
      }
    }
  });

  it('los conteos del meta coinciden con los datos', () => {
    expect(meta.conteos.cie10).toBe(cie.items.length);
    expect(meta.conteos.cie10Cesados).toBe(cie.items.filter((i) => i[7] === 1).length);
    expect(meta.conteos.cie10Adicion).toBe(cie.items.filter((i) => i[7] === 2).length);
    expect(meta.conteos.cpms).toBe(cpms.items.length);
  });

  it('los cesados provienen del Anexo 2 de la RM 447-2024', () => {
    const cesados = cie.items.filter((i) => i[7] === 1);
    expect(cesados.length).toBeGreaterThan(0);
    for (const fila of cesados) expect(fila[8]).toBeGreaterThanOrEqual(0);
  });

  it('el CPMS no tiene procedimientos duplicados y conserva su jerarquía', () => {
    const codigos = cpms.items.map((i) => i[0]);
    expect(new Set(codigos).size).toBe(codigos.length);
    for (const fila of cpms.items) {
      expect(fila[1].length).toBeGreaterThan(2);
      expect(fila[2]).toBeGreaterThanOrEqual(0);
      expect(fila[2]).toBeLessThan(cpms.grupos.length);
    }
  });
});
