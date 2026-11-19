import type { ValoresHoja } from '../scripts/reglas-his';

export interface Caso {
  id: string;
  titulo: string;
  contexto: string;
  valores: Partial<ValoresHoja>;
}

/** Hoja base válida sobre la que se siembran los errores de cada caso. */
export const hojaBase: ValoresHoja = {
  'sim-turno': 'M',
  'sim-anio': '2026',
  'sim-mes': '02',
  'sim-eess': 'C.S. BELLAVISTA',
  'sim-upss': 'MEDICINA GENERAL',
  'sim-responsable': 'CASTRO MARIA ELENA',
  'sim-paciente': 'MAMANI GALLEGOS LUISA EMILIA',
  'sim-fecnac': '',
  'sim-fechb': '',
  'sim-fulr': '',
  'sim-dia': '15',
  'sim-tipoact': 'atencion',
  'sim-dni': '25531200',
  'sim-hc': '2670',
  'sim-gest': '',
  'sim-fin': '2',
  'sim-etnia': '58',
  'sim-distrito': 'VILLA EL SALVADOR',
  'sim-cp': '',
  'sim-edad': '25',
  'sim-edadud': 'A',
  'sim-sexo': 'F',
  'sim-pc': '',
  'sim-pab': '',
  'sim-peso': '66.1',
  'sim-talla': '163.2',
  'sim-hb': '',
  'sim-cond17': 'C',
  'sim-cond18': 'C',
  'sim-dx': 'Supervisión de embarazo con riesgo de 8 semanas',
  'sim-tipodx': 'P',
  'sim-lab': '1',
  'sim-cie': 'Z3591',
};

export const casos: Caso[] = [
  {
    id: 'consulta-sis',
    titulo: 'Consulta externa con SIS: hoja observada',
    contexto:
      'Hoja HIS de una atención de consulta externa financiada por el SIS, digitada por un rotario nuevo. El responsable de estadística la devuelve con observaciones. Audítela antes de ver el resultado.',
    valores: {
      'sim-mes': '2',
      'sim-sexo': 'BLANK',
      'sim-hb': '11.15',
      'sim-cond17': '',
      'sim-dx': 'HTA',
      'sim-cie': 'HTA',
      'sim-etnia': '',
    },
  },
  {
    id: 'app-colegio',
    titulo: 'APP en institución educativa',
    contexto:
      'Actividad preventivo promocional de lavado de manos en un colegio. La hoja se registró como si fuera una atención individual. Detecte qué casilleros contradicen las reglas de las APP.',
    valores: {
      'sim-tipoact': 'app',
      'sim-sexo': 'F',
      'sim-hc': '2670',
      'sim-lab': '',
      'sim-dia': '30',
      'sim-responsable': 'QUISPE',
      'sim-dx': 'Sesión educativa de lavado de manos',
      'sim-cie': '',
      'sim-cond17': '',
      'sim-cond18': '',
    },
  },
  {
    id: 'datos-gestante',
    titulo: 'Datos de gestante en paciente masculino',
    contexto:
      'Atención de un paciente varón adulto en la que se consignaron casilleros exclusivos de gestantes y una medida antropométrica con precisión incorrecta. Revise la coherencia entre sexo, condición y fechas.',
    valores: {
      'sim-sexo': 'M',
      'sim-gest': 'gestante',
      'sim-fulr': '2026-01-10',
      'sim-fecnac': '1990-05-05',
      'sim-pc': '34.55',
      'sim-dx': 'Control de presión arterial',
      'sim-cie': 'I10X',
    },
  },
  {
    id: 'aaa-rabia',
    titulo: 'Actividad en animales y financiador de convenio',
    contexto:
      'Campaña de vacunación antirrábica canina (AAA). La hoja omite la identificación del responsable de la actividad y usa un mes inexistente. Verifique también el financiador declarado.',
    valores: {
      'sim-tipoact': 'aaa',
      'sim-hc': 'AAA101',
      'sim-sexo': 'BLANK',
      'sim-lab': '12',
      'sim-fin': '7',
      'sim-mes': '13',
      'sim-dni': '',
      'sim-dx': 'Campaña de vacunación antirrábica canina',
      'sim-cie': '',
      'sim-cond17': '',
      'sim-cond18': '',
      'sim-etnia': '',
    },
  },
];
