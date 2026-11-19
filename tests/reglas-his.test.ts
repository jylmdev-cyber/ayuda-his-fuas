import { describe, expect, it } from 'vitest';
import { refBase, validarValores, type Hallazgo, type ValoresHoja } from '../src/scripts/reglas-his';
import { hojaBase } from '../src/data/casos';

const validar = (overrides: Partial<ValoresHoja> = {}): Hallazgo[] => validarValores({ ...hojaBase, ...overrides });
const refsDe = (hallazgos: Hallazgo[], nivel: Hallazgo['nivel']): string[] =>
  [...new Set(hallazgos.filter((h) => h.nivel === nivel).map((h) => refBase(h.item)))];

describe('motor de reglas de la Hoja HIS', () => {
  it('acepta una hoja base correctamente llenada', () => {
    expect(validar().filter((h) => h.nivel === 'error')).toEqual([]);
  });

  it('ítem 1: exige turno marcado', () => {
    expect(refsDe(validar({ 'sim-turno': '' }), 'error')).toContain('Ítem 1');
  });

  it('ítem 2: año con cuatro dígitos', () => {
    expect(refsDe(validar({ 'sim-anio': '26' }), 'error')).toContain('Ítem 2');
    expect(refsDe(validar({ 'sim-anio': '2026' }), 'error')).not.toContain('Ítem 2');
  });

  it('ítem 3: mes con dos dígitos entre 01 y 12', () => {
    expect(refsDe(validar({ 'sim-mes': '2' }), 'error')).toContain('Ítem 3');
    expect(refsDe(validar({ 'sim-mes': '13' }), 'error')).toContain('Ítem 3');
  });

  it('ítem 7: rechaza días inexistentes para el mes', () => {
    expect(refsDe(validar({ 'sim-dia': '30' }), 'error')).toContain('Ítem 7');
    expect(refsDe(validar({ 'sim-dia': '15' }), 'error')).not.toContain('Ítem 7');
  });

  it('ítem 8: formatos de historia clínica, APP y AAA', () => {
    expect(refsDe(validar({ 'sim-tipoact': 'app', 'sim-hc': '2670' }), 'error')).toContain('Ítem 8');
    expect(refsDe(validar({ 'sim-tipoact': 'app', 'sim-hc': 'APP140' }), 'error')).not.toContain('Ítem 8');
    expect(refsDe(validar({ 'sim-tipoact': 'aaa', 'sim-hc': 'AAA101' }), 'error')).not.toContain('Ítem 8');
    expect(refsDe(validar({ 'sim-hc': '15251342-01' }), 'error')).not.toContain('Ítem 8');
  });

  it('ítem 9: convenios avisan y SIS informa que genera FUA', () => {
    expect(refsDe(validar({ 'sim-fin': '5' }), 'warning')).toContain('Ítem 9');
    const conSis = validar({ 'sim-fin': '2' });
    expect(conSis.some((h) => h.nivel === 'info' && h.mensaje.includes('FUA'))).toBe(true);
  });

  it('ítem 14: sexo obligatorio en atención y en blanco en APP/AAA', () => {
    expect(refsDe(validar({ 'sim-sexo': 'BLANK' }), 'error')).toContain('Ítem 14');
    expect(refsDe(validar({ 'sim-tipoact': 'app', 'sim-sexo': 'F' }), 'error')).toContain('Ítem 14');
    expect(refsDe(validar({ 'sim-tipoact': 'app', 'sim-sexo': 'BLANK' }), 'error')).not.toContain('Ítem 14');
  });

  it('ítem 16: precisión de 0.1 acepta 66.10 y rechaza 11.15', () => {
    expect(refsDe(validar({ 'sim-hb': '11.15' }), 'error')).toContain('Ítem 16');
    expect(refsDe(validar({ 'sim-peso': '66.10' }), 'error')).not.toContain('Ítem 16');
  });

  it('ítem 22: acepta CIE-10 con y sin punto y CPMS, rechaza texto libre', () => {
    for (const codigo of ['Z3591', 'Z35.9', '59401.06', 'I10X', 'A09X0', 'Z30051']) {
      expect(refsDe(validar({ 'sim-cie': codigo }), 'error'), codigo).not.toContain('Ítem 22');
    }
    expect(refsDe(validar({ 'sim-cie': 'XYZ' }), 'error')).toContain('Ítem 22');
  });

  it('coherencia de gestante: condición y fecha de última regla', () => {
    expect(refsDe(validar({ 'sim-sexo': 'M', 'sim-gest': 'gestante' }), 'error')).toContain('Ítem 8');
    expect(refsDe(validar({ 'sim-sexo': 'M', 'sim-fulr': '2026-01-10' }), 'error')).toContain('Paciente');
  });

  it('normaliza referencias de subítems al ítem padre', () => {
    expect(refBase('Ítem 8.2')).toBe('Ítem 8');
    expect(refBase('Paciente')).toBe('Paciente');
  });
});
