/**
 * Capa de datos del sitio. Toda la información proviene del documento
 * "MATERIAL DE ESTUDIO - LLENADO DE HIS Y FUA" (OGTI – MINSA, 2025), que reúne:
 *  - Procedimiento para el registro de actividades de salud del HIS MINSA
 *  - Directiva N° 002-2024-SIS/GREP-V.02 (FUA SIS)
 *  - Documento técnico de códigos por curso de vida (301-306)
 *  - Directiva N° 001-2025-SIS/GREP-V.01 (auditoría de seguros SIS)
 * Actualizar este archivo actualiza todo el sitio sin tocar la interfaz.
 */

/** Ruta base del sitio (subdirectorio de GitHub Pages) con barra final garantizada. */
export const base = `${(import.meta.env.BASE_URL ?? '/').replace(/\/$/, '')}/`;

export type IconName =
  | 'clipboard'
  | 'activity'
  | 'users'
  | 'shield'
  | 'file'
  | 'database'
  | 'layers'
  | 'calendar'
  | 'clock'
  | 'building'
  | 'map'
  | 'heart'
  | 'stethoscope'
  | 'syringe'
  | 'scale'
  | 'search'
  | 'link'
  | 'check'
  | 'alert'
  | 'book'
  | 'target'
  | 'image'
  | 'sun'
  | 'moon'
  | 'menu'
  | 'close'
  | 'chevron'
  | 'filter'
  | 'external'
  | 'baby'
  | 'gauge';

/* ------------------------------------------------------------------ */
/* Metadatos del sitio                                                 */
/* ------------------------------------------------------------------ */

export const site = {
  title: 'HIS MINSA & FUA SIS',
  longTitle: 'Registro de Actividades de Salud: HIS MINSA y FUA SIS',
  tagline: 'Guía interactiva de llenado de la Hoja HIS y del Formato Único de Atención',
  description:
    'Guía digital del procedimiento para el registro de actividades de salud del HIS MINSA y del Formato Único de Atención (FUA) del Seguro Integral de Salud: ítems 1-22 de la Hoja HIS, códigos de financiador y etnia, campos del FUA, códigos por curso de vida 301-306 y auditoría SIS 2025.',
  org: 'Oficina General de Tecnologías de la Información – Ministerio de Salud del Perú',
  year: '2025',
  repoUrl: 'https://github.com/jylmdev-cyber/ayuda-his-fuas',
  sourceDocument: 'MATERIAL DE ESTUDIO - LLENADO DE HIS Y FUA conv.pdf',
  bvsUrl: 'https://bvs.minsa.gob.pe/manuales-del-sistema-de-informacion-his/',
  locale: 'es_PE',
} as const;

export interface NavEntry {
  id: string;
  label: string;
}

export const nav: NavEntry[] = [
  { id: 'his', label: 'HIS MINSA' },
  { id: 'hoja', label: 'Hoja HIS' },
  { id: 'items', label: 'Ítems 1–22' },
  { id: 'codigos', label: 'Códigos' },
  { id: 'fua', label: 'FUA SIS' },
  { id: 'curso-vida', label: 'Curso de vida' },
  { id: 'auditoria', label: 'Auditoría' },
  { id: 'figuras', label: 'Figuras' },
];

/* ------------------------------------------------------------------ */
/* Métricas destacadas                                                 */
/* ------------------------------------------------------------------ */

export interface Metric {
  value: string;
  label: string;
  detail: string;
  icon: IconName;
}

export const metrics: Metric[] = [
  { value: '22', label: 'Ítems en la Hoja HIS', detail: 'Datos generales, del paciente y de la atención', icon: 'clipboard' },
  { value: '17', label: 'Campos del FUA', detail: 'Formato Único de Atención del asegurado SIS', icon: 'file' },
  { value: '5', label: 'Códigos curso de vida', detail: '301 a 305 según etapa de vida del asegurado', icon: 'users' },
  { value: '3', label: 'Modalidades de auditoría', detail: 'Automatizada, de pertinencia y presencial', icon: 'shield' },
  { value: '20', label: 'Hojas HIS por lote', detail: 'Máximo por lote de digitación y control', icon: 'layers' },
  { value: '2', label: 'Escenarios de registro', detail: 'En línea (tiempo real) y en físico (digitación)', icon: 'database' },
];

/* ------------------------------------------------------------------ */
/* Bloque 1: HIS MINSA                                                 */
/* ------------------------------------------------------------------ */

export interface Purpose {
  title: string;
  detail: string;
  icon: IconName;
}

export const his = {
  name: 'HIS MINSA',
  acronym: 'Health Information System (HIS)',
  definition:
    'El HIS MINSA es un sistema de información basado en una plataforma web que permite el registro de diagnósticos, procedimientos y otras actividades realizadas en consultorio externo y en actividades extramurales. Los datos recopilados permiten conocer las atenciones brindadas, la frecuencia de los diagnósticos y cómo evolucionan los indicadores de salud.',
  purposes: [
    { title: 'Control de servicios', detail: 'Llevar un control de los servicios prestados a los usuarios.', icon: 'activity' },
    { title: 'Estadísticas', detail: 'Obtener estadísticas de la producción de servicios de salud.', icon: 'gauge' },
    { title: 'Datos epidemiológicos', detail: 'Obtener datos epidemiológicos de la población atendida.', icon: 'database' },
    { title: 'Costos de atención', detail: 'Establecer los costos de la atención prestada a cada paciente.', icon: 'scale' },
    { title: 'Perfiles', detail: 'Elaborar perfiles a partir de la información registrada.', icon: 'book' },
  ] as Purpose[],
  scope: [
    'A todo el personal de salud que brinda atención en consulta ambulatoria en actividades de tipo preventivo promocional.',
    'Al personal de las Oficinas de Estadística de los Establecimientos de Salud, Microrredes, Redes de Salud, Gerencias y Direcciones Regionales de Salud.',
    'A los coordinadores y responsables encargados de la gestión de las Estrategias Sanitarias y Etapas de Vida.',
    'A todos los directivos, profesionales, médicos, personal asistencial, personal de estadística y otros con responsabilidad directamente vinculada con el Sistema de Información en Salud.',
  ],
  scenarios: [
    {
      id: 'linea',
      title: 'Escenario en línea',
      detail:
        'Se da en establecimientos de salud que cuentan con internet permanente y computadoras con conexión en red en las áreas de atención. El registro de cada actividad realizada con el paciente —diagnósticos, tratamientos, solicitudes y resultados de exámenes— se registra en tiempo real mediante la Hoja HIS y queda almacenado en el sistema HIS MINSA. Esta información se integra a la historia clínica del paciente y puede ser consultada por los prestadores de salud en cualquier momento.',
      icon: 'database' as IconName,
    },
    {
      id: 'fisico',
      title: 'Escenario en físico',
      detail:
        'Se da en establecimientos de salud sin acceso a internet o con conexión limitada. El registro se hace usando la Hoja HIS en papel. Una vez completados los registros de la atención de salud, las Hojas HIS se llevan al punto de digitación, donde se ingresan en el sistema HIS MINSA.',
      icon: 'file' as IconName,
    },
  ],
  instrument: {
    name: 'Registro Diario de Atención y Otras Actividades de Salud (Hoja HIS)',
    detail:
      'La Hoja HIS está diseñada en dos secciones principales: Datos Generales y Datos Específicos. Estas se distribuyen en casilleros numerados y descritos de manera detallada. En cada Hoja HIS se consignan los datos generales y es posible registrar hasta 22 ítems con información específica relacionada con la atención y/o actividad de salud.',
  },
  responsibility:
    'La responsabilidad de registrar la actividad en la Hoja HIS recae en la persona que brinda la atención de salud en el consultorio externo o lleva a cabo la actividad de salud extramural. Este registro debe realizarse de manera inmediata después de realizada la atención o actividad de salud correspondiente.',
  acopio: [
    'Es responsabilidad del personal de salud asistencial entregar las Hojas HIS de manera oportuna al responsable de estadística del establecimiento de salud.',
    'Es responsabilidad del personal de estadística del establecimiento digitar diariamente las Hojas HIS o derivarlas al punto de digitación más cercano, si no cuenta con las condiciones tecnológicas.',
    'Una vez digitadas, las Hojas HIS deben ser agrupadas en lotes según especialidad y devueltas al establecimiento de salud de origen en un plazo no superior a un mes o una vez finalizado el proceso de digitación y control de calidad.',
    'Cada establecimiento de salud es responsable de archivar las Hojas HIS en condiciones adecuadas, garantizando su conservación y cumpliendo las normas de archivo para evitar su deterioro.',
  ],
  quality:
    'El control de calidad del registro y codificación de las hojas HIS es realizado en primera instancia por el responsable de estadística del establecimiento, quien devolverá las hojas HIS erradas al personal de salud para la subsanación del dato errado.',
  sendDate:
    'El personal de salud asistencial entrega las Hojas HIS al término de la jornada, en forma diaria, al responsable de estadística del Establecimiento de Salud.',
  monitoring:
    'El responsable de estadística del Establecimiento de Salud coordina con el jefe del Establecimiento una reunión mensual para mostrar los errores de registro en las Hojas HIS encontrados en el mes y proponer soluciones de mejora.',
  usageRules: [
    { title: 'Uso individual', detail: 'Cada Hoja HIS es de uso exclusivo para una persona; una misma Hoja HIS no puede ser utilizada por dos personas.' },
    { title: 'Registro de múltiples atenciones', detail: 'Se pueden registrar atenciones y/o actividades de más de un día en una misma Hoja HIS, siempre que correspondan a la misma persona.' },
    { title: 'Uso por turno', detail: 'Se utiliza una Hoja HIS por turno. Es posible registrar atenciones de más de un día en una misma hoja, siempre que no correspondan a diferentes personas y estén dentro del mismo turno.' },
    { title: 'No se registran atenciones de diferentes meses', detail: 'No se deben registrar en una misma Hoja HIS atenciones correspondientes a distintos meses.' },
    { title: 'Fecha de la prestación', detail: 'Las atenciones y/o actividades deben registrarse en la Hoja HIS con la fecha en que se realice la prestación.' },
    { title: 'Consistencia con la Historia Clínica', detail: 'La información registrada en la Historia Clínica del paciente debe ser la misma que se registra en la Hoja HIS, incluyendo diagnóstico, actividad o procedimientos realizados. No puede registrarse un diagnóstico en la historia clínica y otro distinto en la Hoja HIS para un paciente atendido en la misma fecha.' },
  ],
  structure: [
    { term: 'Lote', def: 'Conjunto de Hojas HIS, con un máximo de 20 hojas por lote.' },
    { term: 'Página', def: 'Número correlativo de cada Hoja HIS dentro del lote.' },
    { term: 'Fecha de Procesamiento', def: 'Día en que se realiza el registro en el sistema HIS MINSA.' },
    { term: 'DNI del Digitador', def: 'Número de identificación del responsable de la digitación.' },
  ],
};

/* ------------------------------------------------------------------ */
/* Ítems de la Hoja HIS (1-22)                                         */
/* ------------------------------------------------------------------ */

export type ItemGroup = 'general' | 'paciente' | 'atencion';

export interface HisItem {
  num: number;
  nombre: string;
  grupo: ItemGroup;
  resumen: string;
  reglas: string[];
  ejemplo?: string;
  tags: string[];
}

export const itemGroups: Record<ItemGroup, string> = {
  general: 'Datos generales',
  paciente: 'Datos del paciente',
  atencion: 'Datos de la atención',
};

export const patientFields: { nombre: string; regla: string }[] = [
  {
    nombre: 'Nombres y Apellidos del Paciente',
    regla: 'De acuerdo a su documento de identidad nacional o extranjero.',
  },
  {
    nombre: 'Fecha de Nacimiento (*)',
    regla:
      'Registro opcional. Se utiliza solamente en niños y adultos indocumentados peruanos o extranjeros, ya que la información se actualiza a través de la interoperabilidad con el RENIEC.',
  },
  {
    nombre: 'Fecha del último resultado de hemoglobina (Hb)',
    regla:
      'Solo se registra en niños menores de 5 años, adolescentes y gestantes. Se registra sin realizar el ajuste por altura. Es la fecha en que se entrega el resultado del análisis de hemoglobina; su utilidad radica en identificar el resultado en el tiempo y evitar su duplicidad si es registrado más de una vez por diferentes profesionales de salud.',
  },
  {
    nombre: 'Fecha de la Última Regla',
    regla:
      'Se registra solamente en gestantes. Permite determinar la edad gestacional y la fecha probable de parto. Si no se dispone de esta información, se debe registrar la fecha de la primera ecografía.',
  },
];

export const hisItems: HisItem[] = [
  {
    num: 1,
    nombre: 'Turno (mañana, tarde y noche)',
    grupo: 'general',
    resumen: 'Marque con un aspa ("X") sobre la opción correspondiente para indicar el turno en el que se brindó la atención de salud.',
    reglas: [
      'En caso de realizar atenciones en los tres turnos (mañana, tarde y noche), deberá utilizar una Hoja HIS por cada turno.',
      'No se pueden registrar en una misma Hoja HIS las atenciones de los tres turnos, aunque hayan sido realizadas por el mismo personal de salud.',
    ],
    tags: ['turno', 'cabecera'],
  },
  {
    num: 2,
    nombre: 'Año',
    grupo: 'general',
    resumen: 'Registre el año en que se brindó la atención de salud y/o se desarrolló la actividad de salud.',
    reglas: ['Utilice cuatro (4) dígitos.'],
    ejemplo: '2026',
    tags: ['fecha'],
  },
  {
    num: 3,
    nombre: 'Mes',
    grupo: 'general',
    resumen: 'Registre el mes en que se brindó la atención de salud y/o se desarrolló la actividad de salud.',
    reglas: ['Utilice dos (2) dígitos.'],
    ejemplo: '02',
    tags: ['fecha'],
  },
  {
    num: 4,
    nombre: 'Nombre del Establecimiento de Salud',
    grupo: 'general',
    resumen: 'Registre el nombre del establecimiento de salud donde se realizó la atención de salud.',
    reglas: [
      'Cada establecimiento tiene un código de identificación registrado en las Instituciones Prestadoras de Servicios de Salud (IPRESS).',
      'El código relaciona el ámbito geográfico (departamento, provincia y distrito) y administrativo (DIRESA/GERESA/DIRIS) del establecimiento.',
      'Dicho código debe encontrarse activo en el RENIPRES para que se registre la información.',
    ],
    ejemplo: 'C.S. Bellavista',
    tags: ['ipress', 'renipres', 'establecimiento'],
  },
  {
    num: 5,
    nombre: 'Unidad Productora de Servicios de Salud (UPSS)',
    grupo: 'general',
    resumen: 'Registre el nombre de la UPSS.',
    reglas: [
      'La UPSS es una relación organizada de las denominaciones y códigos estándar de los servicios de atención de salud directa y de soporte que se brindan en los establecimientos de salud.',
    ],
    ejemplo: 'Medicina General',
    tags: ['upss', 'servicio'],
  },
  {
    num: 6,
    nombre: 'Nombre del Responsable de la Atención de Salud',
    grupo: 'general',
    resumen: 'Registre los nombres y apellidos de la persona que realiza la prestación de salud.',
    reglas: [
      'El registro debe ser claro y legible, asegurándose de incluir los nombres completos.',
      'Es responsabilidad de cada prestador entregar esta información al personal u oficina de estadística de su establecimiento para que en el punto de digitación se ingresen los datos al sistema.',
      'Sin el registro previo en el módulo "Personal de Salud" del HIS MINSA no podrá digitarse ningún registro de atención del personal pendiente de ingreso.',
    ],
    ejemplo: 'DNI 25531200 — Castro',
    tags: ['personal', 'profesional'],
  },
  {
    num: 7,
    nombre: 'Día de la Atención de Salud',
    grupo: 'atencion',
    resumen: 'En el casillero correspondiente, registre con números arábigos el día en que se realiza la atención de salud.',
    reglas: ['Se consigna el día de la prestación, no el día de digitación.'],
    tags: ['fecha'],
  },
  {
    num: 8,
    nombre: 'Documento de Identidad, Historia Clínica y Ficha Familiar',
    grupo: 'atencion',
    resumen: 'Identificación del paciente o del grupo humano donde se realiza la actividad.',
    reglas: [
      '8.1 Documento de Identidad: registre el número de DNI si es peruano, o Carné de Extranjería, Pasaporte o Documento de Identidad Extranjero si es extranjero. También se puede registrar provisionalmente "Sin documento" o CNV.',
      '8.2.a En una Atención de Salud: registre el número de la Historia Clínica o Ficha Familiar. Si es Ficha Familiar, registre el número asignado a la ficha seguido de un guion y el número del integrante del hogar.',
      '8.2.b En una Actividad Preventivo Promocional (APP): registre las siglas APP seguidas del código que identifica el lugar, institución o grupo humano organizado (colegios, municipalidades, clubes de madres, vaso de leche, niños, adultos, gestantes, autoridades, etc.).',
      '8.2.c En una Actividad en Animales (AAA): registre las siglas AAA seguidas del código que identifica el tipo de animal.',
      '8.3 Gestante y Puérpera: registre en la casilla correspondiente la palabra gestante o puérpera, según sea el caso.',
    ],
    ejemplo: 'HC/Ficha: 15251342-01 · APP140 (actividad con niños) · AAA101',
    tags: ['dni', 'historia clinica', 'ficha familiar', 'app', 'aaa', 'gestante'],
  },
  {
    num: 9,
    nombre: 'Financiador de Salud',
    grupo: 'atencion',
    resumen: 'Registre el código que corresponda al tipo de financiador que subvenciona la atención de salud del paciente.',
    reglas: [
      'La prestación puede ser cubierta por uno o más financiadores.',
      'Código 1 = USUARIO: la atención ha sido cubierta por el propio paciente (usuario pagante).',
      'Código 2 = SIS: pacientes asegurados por el Seguro Integral de Salud; se genera el Formato Único de Atención (FUA) correspondiente.',
      'Los códigos 3, 4, 5, 6, 7, 8 y 9 deben registrarse únicamente cuando exista un convenio entre instituciones.',
      'Código 10 = OTROS: exoneraciones "gratuitas" relacionadas con actividades realizadas por las estrategias sanitarias.',
      'Código 11 = EXONERADO: exoneraciones gestionadas por la asistenta social del establecimiento de salud.',
    ],
    tags: ['financiador', 'sis', 'essalud', 'soat'],
  },
  {
    num: 10,
    nombre: 'Pertenencia Étnica',
    grupo: 'atencion',
    resumen: 'Reconocimiento que una persona hace de un conjunto de características socioeconómicas y culturales que considera propias (idioma, cosmovisión, formas de producción, relaciones de parentesco, entre otras).',
    reglas: [
      'El registro comienza cuando el personal de salud pregunta al paciente a qué etnia se siente o considera pertenecer.',
      'Se registra el grupo étnico según el código correspondiente de la R.M. N° 975-2017/MINSA, que aprueba la Directiva Administrativa N° 240-MINSA/2017/INS.',
      'Su propósito es facilitar el registro sistemático de las poblaciones étnicas para conocer su perfil epidemiológico y reducir los indicadores de morbilidad.',
    ],
    ejemplo: '58 = Mestizo · 60 = Otro (migrantes extranjeros)',
    tags: ['etnia', 'interculturalidad'],
  },
  {
    num: 11,
    nombre: 'Distrito de Procedencia del Paciente',
    grupo: 'atencion',
    resumen: 'Distrito de residencia del paciente en los últimos 06 meses.',
    reglas: [
      'En una Atención: el distrito del domicilio actual del paciente en el momento de la atención.',
      'Se considera residente de un distrito cuando tenga permanencia estable a partir de los 06 meses.',
      'En una APP: el distrito donde está ubicada la institución o el grupo humano organizado donde se realiza la actividad.',
      'Si el distrito no corresponde al ámbito geográfico del departamento, registre el distrito y el nombre del departamento para una adecuada ubicación.',
    ],
    ejemplo: 'Acora · Sacas',
    tags: ['ubigeo', 'domicilio'],
  },
  {
    num: 12,
    nombre: 'Centro Poblado',
    grupo: 'atencion',
    resumen: 'Si cuenta con el dato, registre el nombre del Centro Poblado de residencia del paciente.',
    reglas: ['Campo condicionado a la disponibilidad del dato.'],
    ejemplo: 'Villa El Salvador · Estrellita de Belén',
    tags: ['ubigeo'],
  },
  {
    num: 13,
    nombre: 'Edad',
    grupo: 'atencion',
    resumen: 'Registre en valores numéricos y enteros, seguido del identificador del tipo de edad.',
    reglas: ['El identificador del tipo de edad puede ser días (D), meses (M) o años (A) de la persona atendida.'],
    ejemplo: '25 A',
    tags: ['edad'],
  },
  {
    num: 14,
    nombre: 'Sexo',
    grupo: 'atencion',
    resumen: 'Sexo de la persona atendida.',
    reglas: [
      'En una Atención: marque "X" en M si es de sexo masculino o F si es de sexo femenino.',
      'En Actividades Preventivo Promocionales (APP) y Actividades en Animales (AAA): deje en blanco y trace una línea oblicua.',
    ],
    tags: ['sexo'],
  },
  {
    num: 15,
    nombre: 'Perímetro Cefálico y Perímetro Abdominal',
    grupo: 'atencion',
    resumen: 'Medidas antropométricas expresadas normalmente en centímetros (cm).',
    reglas: [
      'Perímetro Cefálico: medida de la cabeza en su parte más ancha, de tal forma que el borde inferior de la cinta métrica pase por el arco superciliar a la altura de las cejas, sobre el pabellón auricular y por la prominencia occipital.',
      'Perímetro Abdominal: medida de la circunferencia abdominal que se realiza para determinar el riesgo de enfermedades no transmisibles.',
      'Lea y registre el valor de la medida con una aproximación de 0.1 cm.',
    ],
    tags: ['antropometria', 'pc', 'pab'],
  },
  {
    num: 16,
    nombre: 'Evaluación Antropométrica y Hemoglobina',
    grupo: 'atencion',
    resumen: 'Peso, talla, hemoglobina y fecha de hemoglobina.',
    reglas: [
      'Peso: valoración del estado nutricional; se expresa en kilogramos (kg) con aproximación de 0.1 kg.',
      'Talla: longitud o estatura para evaluación del crecimiento y estado nutricional; se expresa en centímetros (cm) con aproximación de 0.1 cm.',
      'Hemoglobina: principal proteína de transporte de oxígeno; se expresa en gramos por decilitro (g/dL) con aproximación de 0.1 g/dL.',
      'Fecha de Hemoglobina: fecha de entrega del resultado de laboratorio; permite identificar el resultado en el tiempo y evita la duplicidad.',
    ],
    ejemplo: 'Peso 66.10 kg · Talla 163.2 cm · Hb 11.1 g/dL',
    tags: ['peso', 'talla', 'hemoglobina', 'nutricion'],
  },
  {
    num: 17,
    nombre: 'Establecimiento',
    grupo: 'atencion',
    resumen: 'Condición de atención de la persona respecto al establecimiento de salud: Nuevo (N), Continuador (C) o Reingreso (R).',
    reglas: [
      'Nuevo (N): persona que por primera vez en su vida acude a solicitar atención de salud al establecimiento.',
      'Continuador (C): persona que acude a atenderse en el establecimiento por segunda o más veces en el año.',
      'Reingreso (R): persona que acude por primera vez en el año al establecimiento, pero que ya había sido atendida anteriormente, en años anteriores.',
    ],
    tags: ['nuevos', 'atendidos', 'ncr'],
  },
  {
    num: 18,
    nombre: 'Servicio',
    grupo: 'atencion',
    resumen: 'Condición de atención de la persona respecto al servicio: Nuevo (N), Continuador (C) o Reingreso (R).',
    reglas: [
      'Nuevo (N): persona que por primera vez en su vida acude a solicitar atención de salud en el servicio.',
      'Continuador (C): persona que acude a atenderse en el servicio por segunda o más veces en el año.',
      'Reingreso (R): persona que acude por primera vez en el año al servicio, pero que ya había sido atendida anteriormente en el servicio, en años anteriores.',
    ],
    tags: ['nuevos', 'atendidos', 'ncr'],
  },
  {
    num: 19,
    nombre: 'Diagnóstico, motivo de consulta, procedimiento y actividades de salud',
    grupo: 'atencion',
    resumen: 'Descripción del diagnóstico motivo de consulta y/o actividad de salud realizada.',
    reglas: [
      'Se registra la denominación del diagnóstico, procedimiento o actividad de salud.',
      'En el FUA, el diagnóstico se escribe sin abreviaturas y con el CIE-10 que corresponda.',
    ],
    ejemplo: 'Supervisión de embarazo con riesgo de 8 semanas · Plan de parto · Dosaje de hemoglobina con hemoglobinómetro',
    tags: ['diagnostico', 'motivo de consulta'],
  },
  {
    num: 20,
    nombre: 'Tipo de Diagnóstico',
    grupo: 'atencion',
    resumen: 'Casilleros P, D y R para clasificar el diagnóstico consignado en el ítem 19.',
    reglas: ['Marque la casilla P, D o R según corresponda al diagnóstico registrado.'],
    tags: ['diagnostico', 'tipo'],
  },
  {
    num: 21,
    nombre: 'Valor de Lab (VALOR LAB)',
    grupo: 'atencion',
    resumen: 'Casillero llenado por el personal asistencial; su uso está sujeto a las consideraciones específicas de cada estrategia.',
    reglas: [
      'Número de dosis de vacunas y controles de tratamiento (gestantes, niños, etc.).',
      'Número de sesiones en actividades profilácticas.',
      'Insumos de Planificación Familiar.',
      'Número de participantes en actividades de capacitación, sesiones educativas o sesiones demostrativas.',
      'Actividades de seguimiento (controles, número de visitas).',
      'En actividades en animales, se registra la cantidad de animales.',
      'Incluye otras consideraciones especificadas en el desarrollo de las actividades de las diferentes estrategias sanitarias nacionales y etapas de vida.',
    ],
    tags: ['lab', 'vacunas', 'sesiones'],
  },
  {
    num: 22,
    nombre: 'Código CIE-10 / CPT (CPMSS)',
    grupo: 'atencion',
    resumen: 'Codificación del diagnóstico y del procedimiento realizado.',
    reglas: [
      'CIE-10: Clasificación Internacional de Enfermedades; permite registrar signos, síntomas, hallazgos anormales, quejas y circunstancias de tipo social que ocupan el lugar de los diagnósticos en los registros de salud.',
      'CPT / Catálogo Sectorial de Procedimientos de Salud: relación ordenada de las denominaciones y códigos de las identificaciones estándar, basado en la codificación y clasificación Current Procedural Terminology.',
    ],
    ejemplo: 'Z3591 · 59401.06 · 85018.01',
    tags: ['cie10', 'cpt', 'cpmss', 'codificacion'],
  },
];

/** Datos del módulo "Personal de Salud" del HIS MINSA (requisito del ítem 6). */
export const personalModule = {
  note: 'Todo el personal que brinde atención directa a los pacientes en la consulta externa del establecimiento de salud debe ser ingresado en el módulo de "Personal de Salud" del sistema HIS MINSA.',
  groups: [
    {
      title: 'Datos Personales',
      fields: ['Tipo de Documento de Identidad', 'Número de Documento de Identidad', 'Nombres', 'Apellido Paterno', 'Apellido Materno', 'Sexo', 'Fecha de nacimiento', 'País'],
    },
    {
      title: 'Datos Profesionales',
      fields: ['Profesión', 'Colegio', 'Número de Colegiatura'],
    },
    {
      title: 'Datos Laborales',
      fields: ['Estado laboral', 'Fecha de alta', 'Condición laboral'],
    },
  ],
};

/* ------------------------------------------------------------------ */
/* Tablas de códigos                                                   */
/* ------------------------------------------------------------------ */

export interface CodeRow {
  code: string;
  label: string;
  note?: string;
}

export interface CodeTable {
  id: string;
  titulo: string;
  itemRef: string;
  fuente?: string;
  nota?: string;
  rows: CodeRow[];
}

export const codeTables: CodeTable[] = [
  {
    id: 'financiador',
    titulo: 'Financiador de Salud',
    itemRef: 'Ítem 9',
    nota: 'Los códigos 7, 8 y 9 se registran únicamente cuando exista convenio entre instituciones.',
    rows: [
      { code: '1', label: 'Usuario', note: 'Atención cubierta por el propio paciente (usuario pagante).' },
      { code: '2', label: 'Seguro Integral (SIS)', note: 'Genera el Formato Único de Atención (FUA) correspondiente.' },
      { code: '3', label: 'EsSalud' },
      { code: '4', label: 'SOAT' },
      { code: '5', label: 'Sanidad FAP' },
      { code: '6', label: 'Sanidad Naval' },
      { code: '10', label: 'Otros', note: 'Exoneraciones "gratuitas" de actividades de estrategias sanitarias.' },
      { code: '11', label: 'Exonerado', note: 'Exoneraciones gestionadas por la asistenta social del establecimiento.' },
    ],
  },
  {
    id: 'etnia',
    titulo: 'Pertenencia Étnica',
    itemRef: 'Ítem 10',
    fuente: 'R.M. N° 975-2017/MINSA · D.A. N° 240-MINSA/2017/INS',
    nota: 'El material de estudio ilustra los códigos 58 y 60; la tabla completa de autopertenencia figura en el Anexo N° 2 de la directiva citada.',
    rows: [
      { code: '58', label: 'Mestizo' },
      { code: '60', label: 'Otro', note: 'Migrantes extranjeros.' },
    ],
  },
  {
    id: 'ncr',
    titulo: 'Condición de atención N / C / R',
    itemRef: 'Ítems 17 y 18',
    nota: 'Se aplica por separado al establecimiento (ítem 17) y al servicio (ítem 18).',
    rows: [
      { code: 'N', label: 'Nuevo', note: 'Primera vez en su vida que acude a solicitar atención (al establecimiento o al servicio).' },
      { code: 'C', label: 'Continuador', note: 'Acude a atenderse por segunda o más veces en el año.' },
      { code: 'R', label: 'Reingreso', note: 'Primera vez en el año, pero ya había sido atendido en años anteriores.' },
    ],
  },
];

export const productionFormulas = {
  intro: 'Según el lugar donde se realiza la actividad se generan distintos registros de producción:',
  intramural: {
    title: 'Intramural',
    detail: 'Son todas las actividades realizadas dentro del establecimiento de salud.',
    registro: 'Se genera el registro de ATENDIDOS y ATENCIONES.',
    formulas: ['Atenciones = (N + C + R)', 'Atendidos = (N + R)'],
  },
  extramural: {
    title: 'Extramural',
    detail:
      'Son todas aquellas actividades realizadas fuera del establecimiento de salud: visitas domiciliarias, sesiones demostrativas, sesiones educativas, consejería, y cuando la actividad se cumple de manera virtual (telemedicina).',
    registro: 'En este registro se genera solo ATENCIONES.',
    formulas: ['Atenciones = (C + C)'],
  },
};

/* ------------------------------------------------------------------ */
/* Bloque 2: FUA SIS — Directiva N° 002-2024-SIS/GREP-V.02             */
/* ------------------------------------------------------------------ */

export const fua = {
  norma: 'Directiva N° 002-2024-SIS/GREP-V.02',
  titulo: 'Directiva para el registro de la información de las prestaciones otorgadas a los asegurados del Seguro Integral de Salud (SIS) en el Formato Único de Atención (FUA)',
  vigencia: 'Vigente desde el 01 de junio del 2024 · Modificación en noviembre 2024',
  finalidad: 'Mejorar el registro de la información de las prestaciones otorgadas a los asegurados del SIS, en el Formato Único de Atención (FUA).',
  objetivo:
    'Estandarizar y regular el proceso de registros de datos, de las prestaciones de salud y administrativas, en el Formato Único de Atención (FUA).',
  definitions: [
    {
      term: 'Asegurado',
      def: 'Toda persona residente en el país que esté bajo la cobertura financiera en alguno de los regímenes de financiamiento de las IAFAS SIS.',
    },
    {
      term: 'Representante del asegurado SIS',
      def: 'Es la persona con capacidad de ejercicio que actúa a nombre del asegurado SIS.',
    },
    {
      term: 'Formato Único de Atención (FUA)',
      def: 'Es el instrumento en el que se registran y acreditan, en físico o en medio magnético, los datos requeridos por el SIS sobre las prestaciones asistenciales y/o administrativas, como los del asegurado que la recibe. Se utiliza como fuente de información para los registros informáticos del SIS, así como para los procesos de validación prestacional y financiera. El FUA tiene carácter de DECLARACIÓN JURADA.',
    },
    {
      term: 'Prestaciones de salud',
      def: 'Son atenciones de salud otorgadas a los asegurados SIS en las IPRESS de acuerdo a su categoría y cartera de servicios. Pueden ser prestaciones promocionales, preventivas, recuperativas, paliativas y de rehabilitación; se desarrollan en forma intramural y extramural.',
    },
  ],
  rules: [
    'Los datos de la prestación de salud son registrados y firmados por el personal de salud que brindó la atención, según corresponde.',
    'Los datos de productos farmacéuticos e insumos deben ser registrados y firmados por el responsable de farmacia o la que haga sus veces. El registro de la cantidad prescrita y entregada es de carácter obligatorio.',
    'En caso de apoyo al diagnóstico, los datos son registrados y firmados por el responsable que corresponda. El registro de la cantidad de procedimientos médicos es de carácter obligatorio.',
    'Para el FUA físico que registra prestaciones de salud, debe contar con la firma y huella digital del asegurado, en señal de conformidad.',
    'En caso de que el paciente no pueda colocar su huella digital, debe firmar el representante del asegurado, quien debe consignar adicionalmente sus nombres y apellidos completos y el número de su documento de identificación.',
    'Se registra solo una (01) prestación por FUA. El llenado de los espacios debe asegurar legibilidad.',
    'El FUA físico será digitado en los aplicativos informáticos del SIS, de acuerdo a los criterios de oportunidad acordados con el SIS.',
    'Para los procesos de supervisión, control y auditoría que realice el SIS, se darán por rechazados los registros que por sus características no sustenten su autenticidad.',
    'La IPRESS debe asegurar la incorporación del FUA físico en la historia clínica del asegurado SIS, para efectos de procesos de control u otros que el SIS realice.',
  ],
  fields: [
    { num: 1, nombre: 'De la numeración del FUA', detalle: 'Es el número que identificará la atención brindada por la IPRESS y debe estar preimpreso en el FUA. El segundo campo corresponde al lote.' },
    { num: 2, nombre: 'De la Institución Prestadora de Servicios de Salud (IPRESS)', detalle: 'Código RENIPRESS de la IPRESS, nombre de la IPRESS que realiza la atención, personal que atiende, lugar de atención (intramural / extramural), tipo de atención (ambulatoria, referencia, emergencia) y referencia realizada por.' },
    { num: 3, nombre: 'Del asegurado / usuario', detalle: 'Identificación (TDI y N° de documento), código del asegurado SIS (DIRESA/otros y número), asegurado de otras IAFAS, apellidos y nombres, sexo, salud materna (gestante / puérpera), fechas (probable de parto, nacimiento, fallecimiento), N° de historia clínica y etnia.' },
    { num: 4, nombre: 'De la atención', detalle: 'Fecha de atención (día, mes, año), hora en formato de 24 horas, UPS y código de prestación (COD. PRESTA), donde se consigna el código por curso de vida cuando corresponda.' },
    { num: 5, nombre: 'Concepto prestacional', detalle: 'Atención directa y demás conceptos de la prestación registrada.' },
    { num: 6, nombre: 'Del destino del asegurado / usuario', detalle: 'Alta, cita, hospitalización, emergencia, consulta externa, apoyo al diagnóstico, contra referido, fallecido o corte administrativo.' },
    { num: 7, nombre: 'Se refiere / contrarrefiere a', detalle: 'Código RENIPRESS de la IPRESS, nombre de la IPRESS a la que se refiere / contrarrefiere y N° de hoja de refer / contrarr.' },
    { num: 8, nombre: 'Actividades preventivas y otros', detalle: 'Peso (kg), talla (cm), presión arterial (mmHg), IMC (kg/m2), perímetro abdominal; de la gestante (CPN, edad gestacional, altura uterina, parto vertical, control puerperio); del recién nacido (edad gestacional, APGAR 1° y 5°, corte tardío de cordón); actividades de gestante/RN/niño/adolescente/joven y adulto (RN prematuro, bajo peso al nacer, enfermedad congénita, TAP/EEDP o TEPSI, consejería nutricional, consejería integral, evaluación integral); adulto mayor (VACAM, tamizaje de salud mental); tamizaje de patologías crónicas (Hb glicosilada, dosaje de albúmina en orina, depuración de creatinina).' },
    { num: 9, nombre: 'Vacunas (N° de dosis)', detalle: 'BCG, DPT, APO, ASA, SPR, SR, HVB, influenza, parotiditis, rubéola, rotavirus, DT adulto, IPV, pentavalente, antiamarílica, antineumocócica, antitetánica, VPH, otra vacuna, completas para la edad (410) y grupo de riesgo HVB.' },
    { num: 10, nombre: 'Diagnósticos', detalle: 'Hasta cinco diagnósticos con descripción sin abreviaturas, tipo de diagnóstico (P/D/R) y código CIE-10, tanto de ingreso como de egreso.' },
    { num: 11, nombre: 'Nombre del responsable de la atención', detalle: 'N° de DNI, nombre del responsable de la atención y N° de colegiatura; código del responsable (médico, farmacéutico, cirujano dentista, biólogo, obstetra, enfermera, trabajadora social, psicóloga, tecnólogo médico, nutrición, técnico en enfermería, otro), especialidad, N° RNE y condición de egresado.' },
    { num: 12, nombre: 'Productos farmacéuticos / medicamentos', detalle: 'Código SISMED, nombre, forma farmacéutica, concentración y cantidades; sujeto a topes de medicamentos según forma de presentación (RC 06).' },
    { num: 13, nombre: 'Dispositivos médicos / productos sanitarios', detalle: 'Registro de los dispositivos médicos y productos sanitarios entregados.' },
    { num: 14, nombre: 'Procedimientos / diagnóstico por imágenes / laboratorio', detalle: 'Registro de procedimientos médicos, imágenes y laboratorio; la cantidad de procedimientos es obligatoria.' },
    { num: 15, nombre: 'Subcomponente prestacional (procedimiento)', detalle: 'Detalle del subcomponente del procedimiento registrado.' },
    { num: 16, nombre: 'Observaciones', detalle: 'Anotaciones adicionales que sustenten el registro.' },
    { num: 17, nombre: 'Firmas y sello del profesional / firma y huella del asegurado', detalle: 'Firma y sello del responsable de la atención en el anverso del FUA; firma y huella digital del asegurado o, de no ser posible, del representante con nombres, apellidos y documento de identificación.' },
  ],
  destinationOptions: ['Alta', 'Cita', 'Hospitalización', 'Emergencia', 'Consulta externa', 'Apoyo al diagnóstico', 'Contra referido', 'Fallecido', 'Corte administrativo'],
  responsibleCodes: ['Médico', 'Farmacéutico', 'Cirujano dentista', 'Biólogo', 'Obstetra', 'Enfermera', 'Trabajadora social', 'Psicóloga', 'Tecnólogo médico', 'Nutrición', 'Técnico en enfermería', 'Otro'],
  callouts: [
    'Marcado con aspa "X" en los recuadros que corresponda.',
    'La hora de atención se registra en formato de 24 horas.',
    'Registrar el código prestacional según curso de vida en el campo COD. PRESTA.',
    'RC 04: marcar el destino del asegurado según corresponda.',
    'RC 06: topes de medicamentos según forma de presentación.',
    'RC 14: registrar las actividades preventivas.',
    'En el ítem "Dx" deberá escribirse el número que corresponde al diagnóstico (1, 2, 3, etc.).',
    'Diagnóstico sin abreviatura; registrar tipo de diagnóstico y CIE-10 según corresponda.',
  ],
};

/* ------------------------------------------------------------------ */
/* Bloque 3: Códigos por curso de vida (301-306)                       */
/* ------------------------------------------------------------------ */

export interface CursoVidaCode {
  codigo: string;
  nombre: string;
  rango: string;
  edades: { min: number; max: number | null };
}

export const cursoVida = {
  titulo: 'Códigos prestacionales por curso de vida',
  finalidad:
    'Contribuir a la optimización del registro prestacional en el Formato Único de Atención (FUA) del primer nivel de atención, promoviendo la consolidación de las atenciones integrales por curso de vida en un único registro por atención, mediante la incorporación de los códigos 301-306, en relación con el Modelo de Cuidado Integral de Salud por Curso de Vida.',
  ambito:
    'El presente Documento Técnico es de aplicación en las Instituciones Prestadoras de Servicios de Salud (DIRESA), Gerencias Regionales de Salud (GERESA), Direcciones de Redes Integradas de Salud (DIRIS) o las instancias que hagan sus veces, siempre que cuenten con convenio vigente suscrito con el SIS.',
  codes: [
    { codigo: '301', nombre: 'Cuidado Integral de Salud del Niño', rango: 'Etapa de niño', edades: { min: 0, max: 11 } },
    { codigo: '302', nombre: 'Cuidado Integral de Salud del Adolescente', rango: '12 a 17 años (RC 01)', edades: { min: 12, max: 17 } },
    { codigo: '303', nombre: 'Cuidado Integral de Salud del Joven', rango: '18 a 29 años', edades: { min: 18, max: 29 } },
    { codigo: '304', nombre: 'Cuidado Integral de Salud del Adulto', rango: '30 a 59 años', edades: { min: 30, max: 59 } },
    { codigo: '305', nombre: 'Cuidado Integral de Salud del Adulto Mayor', rango: '60 años a más', edades: { min: 60, max: null } },
  ] as CursoVidaCode[],
  rangeNote:
    'El documento enmarca los códigos modulares en el rango 301-306; las fichas de registro y ejemplos del material detallan los códigos 301 a 305.',
  rules: [
    {
      title: 'Invariabilidad de la estructura del FUA',
      detail: 'La implementación de los códigos modulares por curso de vida (301-306) no implica modificación alguna en la estructura, campos o diseño del Formato Único de Atención.',
    },
    {
      title: 'Lineamientos para el registro del código',
      detail: 'Los códigos por curso de vida deberán registrarse en la sección "DE LA ATENCIÓN", específicamente en el campo CODIGO DE PRESTACION (COD. PRESTA.). Este registro identifica la atención integral realizada bajo el enfoque de curso de vida, consolidando en un solo código las intervenciones efectuadas dentro de la misma atención.',
    },
    {
      title: 'Responsabilidad profesional: firma y sello en el anverso del FUA',
      detail: 'Cada FUA debe ser firmado y sellado por el responsable de la atención. El personal de salud que firma asume responsabilidad técnica, legal y administrativa sobre la veracidad y consistencia del registro.',
    },
    {
      title: 'Régimen de coexistencia y uso concurrente de códigos prestacionales',
      detail: 'La incorporación de los códigos modulares por curso de vida no deroga, sustituye ni limita la vigencia de los códigos prestacionales previamente existentes.',
    },
    {
      title: 'Exclusión de registro fragmentado',
      detail: 'Cuando una prestación de salud sea consignada mediante un código prestacional por curso de vida, queda excluida la posibilidad de registrar simultáneamente esas mismas atenciones mediante códigos fragmentados en otros FUA.',
    },
  ],
};

/* ------------------------------------------------------------------ */
/* Bloque 4: Auditoría de seguros — Directiva N° 001-2025-SIS/GREP-V.01 */
/* ------------------------------------------------------------------ */

export const auditoria = {
  norma: 'Directiva N° 001-2025-SIS/GREP-V.01',
  titulo: 'Directiva que regula la auditoría de seguros de las prestaciones de salud brindadas por las IPRESS que cuentan con convenio o contrato con el Seguro Integral de Salud (SIS)',
  vigencia: 'Vigente desde el 01 de octubre del año 2025',
  finalidad:
    'Garantizar que las prestaciones de salud brindadas a los asegurados del Seguro Integral de Salud cumplan con las condiciones de calidad de los servicios de salud, en el marco de los convenios o contratos suscritos; así como, prevenir la ocurrencia de prestaciones indebidas.',
  objetivoGeneral:
    'Establecer las disposiciones para la ejecución de la auditoría de seguros que realiza el Seguro Integral de Salud a las IPRESS públicas, privadas o mixtas, en el marco de los convenios o contratos suscritos, que permita verificar el correcto cumplimiento de las obligaciones referidas a las prestaciones de salud otorgadas a los asegurados del Seguro Integral de Salud.',
  procesos: [
    { nombre: 'Auditoría Automatizada', detail: 'Implementar y normar el proceso de auditoría automatizada de las prestaciones registradas.' },
    { nombre: 'Auditoría de Pertinencia', detail: 'Implementar y normar el proceso de auditoría de pertinencia de las prestaciones.' },
    { nombre: 'Auditoría Presencial', detail: 'Implementar y normar el proceso de auditoría presencial en las IPRESS.' },
  ],
  ambito:
    'La presente directiva es de cumplimiento obligatorio para todos los órganos del pliego del Seguro Integral de Salud a nivel nacional y para las Instituciones Prestadoras de Servicios de Salud (IPRESS) públicas, privadas o mixtas en lo que corresponda, en el marco de los convenios o contratos vigentes suscritos con el SIS.',
  derogadas: [
    'Directiva Administrativa N° 001-2016-SIS/GREP-V.03, que establece el proceso de control presencial posterior de las prestaciones de salud financiadas por el SIS y sus anexos, aprobada por R.J. N° 006-2016/SIS.',
    'Directiva que establece el procedimiento de levantamiento de observaciones de los Formatos Únicos de Atención en el proceso de evaluación automática del SIS, aprobada por R.J. N° 231-2022-SIS/J.',
    'Directiva N° 003-2023-SIS/GREP-V.03, que regula el control prestacional electrónico del SIS y sus anexos, aprobada por R.J. N° 049-2023/SIS/J.',
  ],
};

/* ------------------------------------------------------------------ */
/* Flujo del dato (línea de tiempo)                                    */
/* ------------------------------------------------------------------ */

export const dataFlow: { title: string; detail: string; when: string; icon: IconName }[] = [
  { title: 'Registro inmediato', detail: 'El profesional que brinda la atención registra la actividad en la Hoja HIS apenas concluye la prestación.', when: 'Inmediato', icon: 'clipboard' },
  { title: 'Entrega diaria', detail: 'El personal asistencial entrega las Hojas HIS al término de la jornada al responsable de estadística del establecimiento.', when: 'Diario', icon: 'clock' },
  { title: 'Digitación', detail: 'Estadística digita diariamente las hojas o las deriva al punto de digitación más cercano si no cuenta con condiciones tecnológicas.', when: 'Diario', icon: 'database' },
  { title: 'Control de calidad', detail: 'El responsable de estadística valida registro y codificación; devuelve las hojas erradas para subsanación del dato.', when: 'Continuo', icon: 'check' },
  { title: 'Lotes y devolución', detail: 'Las hojas digitadas se agrupan en lotes según especialidad (máx. 20 hojas) y retornan al establecimiento de origen.', when: '≤ 1 mes', icon: 'layers' },
  { title: 'Monitoreo mensual', detail: 'Reunión mensual entre estadística y jefatura para revisar errores de registro y proponer mejoras.', when: 'Mensual', icon: 'target' },
  { title: 'Archivo', detail: 'El establecimiento archiva las Hojas HIS en condiciones adecuadas, cumpliendo las normas de archivo.', when: 'Permanente', icon: 'building' },
];

/* ------------------------------------------------------------------ */
/* Figuras extraídas del documento                                     */
/* ------------------------------------------------------------------ */

export interface Figure {
  src: string;
  alt: string;
  caption: string;
  tag: string;
}

export const figures: Figure[] = [
  {
    src: 'img/hoja-his-cabecera.jpg',
    alt: 'Cabecera de la Hoja HIS con lote, página, fecha de procesamiento, DNI del digitador, turno y datos generales',
    caption: 'Cabecera de la Hoja HIS: lote, página, fecha de procesamiento, DNI del digitador, turno (M/T/N) e ítems 2 a 6.',
    tag: 'Hoja HIS',
  },
  {
    src: 'img/hoja-his-items.jpg',
    alt: 'Sección de datos específicos de la Hoja HIS con los ítems 7 a 22 y ejemplo de llenado',
    caption: 'Datos específicos de la atención: ítems 7 a 22 con ejemplo de llenado (diagnóstico, tipo de diagnóstico, valor de lab y código CIE/CPMSS).',
    tag: 'Hoja HIS',
  },
  {
    src: 'img/financiador-codigos.jpg',
    alt: 'Tabla de códigos del ítem 9 financiador de salud',
    caption: 'Ítem 9 — Financiador de Salud: códigos 1 a 6, 10 y 11.',
    tag: 'Códigos',
  },
  {
    src: 'img/ncr-establecimiento-servicio.jpg',
    alt: 'Definiciones de nuevo, continuador y reingreso para establecimiento y servicio',
    caption: 'Ítems 17 y 18 — Nuevo (N), Continuador (C) y Reingreso (R) en el establecimiento y en el servicio.',
    tag: 'Códigos',
  },
  {
    src: 'img/fua-ejemplo-1.jpg',
    alt: 'Primera parte del FUA llenado con código prestacional 303 y datos del asegurado',
    caption: 'FUA llenado (1/2): IPRESS, identificación del asegurado, fecha y hora de atención, y código prestacional por curso de vida.',
    tag: 'FUA',
  },
  {
    src: 'img/fua-ejemplo-2.jpg',
    alt: 'Segunda parte del FUA con actividades preventivas, vacunas, diagnósticos y firmas',
    caption: 'FUA llenado (2/2): actividades preventivas y otros, vacunas, diagnósticos con CIE-10, responsable de la atención y firmas.',
    tag: 'FUA',
  },
];

/* ------------------------------------------------------------------ */
/* Simulador de llenado: ejemplo precargado (tomado del material)      */
/* ------------------------------------------------------------------ */

export const simExample: Record<string, string> = {
  'sim-turno': 'M',
  'sim-anio': '2026',
  'sim-mes': '02',
  'sim-eess': 'C.S. BELLAVISTA',
  'sim-upss': 'MEDICINA GENERAL',
  'sim-responsable': 'CASTRO MARIA ELENA',
  'sim-paciente': 'MAMANI GALLEGOS LUISA EMILIA',
  'sim-fecnac': '',
  'sim-fechb': '2025-11-02',
  'sim-fulr': '2025-06-10',
  'sim-dia': '15',
  'sim-tipoact': 'atencion',
  'sim-dni': '25531200',
  'sim-hc': '2670',
  'sim-gest': 'gestante',
  'sim-fin': '2',
  'sim-etnia': '58',
  'sim-distrito': 'VILLA EL SALVADOR',
  'sim-cp': 'ESTRELLITA DE BELEN',
  'sim-edad': '25',
  'sim-edadud': 'A',
  'sim-sexo': 'F',
  'sim-pc': '',
  'sim-pab': '',
  'sim-peso': '66.1',
  'sim-talla': '163.2',
  'sim-hb': '11.1',
  'sim-cond17': 'C',
  'sim-cond18': 'C',
  'sim-dx': 'Supervisión de embarazo con riesgo de 8 semanas',
  'sim-tipodx': 'P',
  'sim-lab': '1',
  'sim-cie': 'Z3591',
};

/* ------------------------------------------------------------------ */
/* Glosario y comparativa HIS vs FUA                                   */
/* ------------------------------------------------------------------ */

export interface GlosarioEntry {
  termino: string;
  definicion: string;
  ver?: string;
}

export const glosario: GlosarioEntry[] = [
  { termino: 'AAA', definicion: 'Actividad en Animales: actividad de salud realizada en animales a nivel comunitario (por ejemplo, campañas de vacunación antirrábica). En la Hoja HIS se identifica con el código AAA seguido del tipo de animal.', ver: '#items' },
  { termino: 'APP', definicion: 'Actividad Preventivo Promocional: actividad dirigida a grupos humanos organizados (colegios, clubes de madres, vaso de leche, etc.). En la Hoja HIS se identifica con las siglas APP seguidas del código del grupo.', ver: '#items' },
  { termino: 'Asegurado SIS', definicion: 'Toda persona residente en el país que está bajo la cobertura financiera en alguno de los regímenes de financiamiento de las IAFAS SIS.', ver: '#fua' },
  { termino: 'CIE-10', definicion: 'Clasificación Internacional de Enfermedades, décima revisión: permite registrar signos, síntomas, hallazgos anormales, quejas y circunstancias sociales que ocupan el lugar de los diagnósticos. En el ítem 22 se usa la versión MINSA.', ver: '#codigos' },
  { termino: 'CNV', definicion: 'Certificado de Nacido Vivo: registro que puede consignarse provisionalmente como identificación cuando el recién nacido aún no tiene documento.', ver: '#items' },
  { termino: 'CPMS / CPT', definicion: 'Catálogo Sectorial de Procedimientos de Salud: relación ordenada de denominaciones y códigos estándar de procedimientos, basado en la codificación Current Procedural Terminology.', ver: '#codigos' },
  { termino: 'DIRESA / GERESA / DIRIS', definicion: 'Direcciones Regionales de Salud, Gerencias Regionales de Salud y Direcciones de Redes Integradas de Salud: instancias administrativas a las que se adscribe el código de cada establecimiento.', ver: '#his' },
  { termino: 'Establecimiento de salud (EESS)', definicion: 'Institución Prestadora de Servicios de Salud con código de identificación registrado y activo en el RENIPRES, que relaciona su ámbito geográfico y administrativo.', ver: '#items' },
  { termino: 'Ficha Familiar', definicion: 'Instrumento de registro del hogar; en la Hoja HIS se consigna su número seguido de un guion y el número del integrante (ejemplo: 15251342-01).', ver: '#items' },
  { termino: 'FUA', definicion: 'Formato Único de Atención: instrumento en el que se registran y acreditan, en físico o medio magnético, los datos de las prestaciones otorgadas a asegurados SIS. Tiene carácter de declaración jurada.', ver: '#fua' },
  { termino: 'Historia Clínica', definicion: 'Registro clínico del paciente; la información de la Hoja HIS y del FUA debe ser consistente con ella, incluido el diagnóstico de la misma fecha.', ver: '#hoja' },
  { termino: 'HIS MINSA', definicion: 'Sistema de información basado en una plataforma web para el registro de diagnósticos, procedimientos y otras actividades de consultorio externo y extramurales.', ver: '#his' },
  { termino: 'Hoja HIS', definicion: 'Registro Diario de Atención y Otras Actividades de Salud: instrumento de recojo de datos con dos secciones (datos generales y específicos) y hasta 22 ítems por hoja.', ver: '#hoja' },
  { termino: 'IAFAS SIS', definicion: 'Instituciones Administradoras de Fondos de Aseguramiento en Salud del SIS: regímenes de financiamiento bajo los cuales una persona es asegurada.', ver: '#fua' },
  { termino: 'IPRESS', definicion: 'Institución Prestadora de Servicios de Salud: entidad donde se brinda la atención y que registra su código en el RENIPRES.', ver: '#items' },
  { termino: 'Lote', definicion: 'Conjunto de Hojas HIS digitadas, con un máximo de 20 hojas, agrupadas según especialidad para su control de calidad y devolución.', ver: '#hoja' },
  { termino: 'N / C / R', definicion: 'Nuevo, Continuador y Reingreso: condición de atención de la persona respecto al establecimiento (ítem 17) y al servicio (ítem 18).', ver: '#codigos' },
  { termino: 'P / D / R', definicion: 'Casilleros del tipo de diagnóstico (ítem 20 de la Hoja HIS y campo de diagnósticos del FUA) que clasifican cada diagnóstico consignado.', ver: '#codigos' },
  { termino: 'Punto de digitación', definicion: 'Lugar donde se ingresan al sistema HIS MINSA las Hojas HIS registradas en físico cuando el establecimiento no cuenta con condiciones tecnológicas.', ver: '#hoja' },
  { termino: 'RENIEC', definicion: 'Registro Nacional de Identificación y Estado Civil: fuente de interoperabilidad que actualiza los datos del paciente documentado, por lo que la fecha de nacimiento (*) es opcional.', ver: '#hoja' },
  { termino: 'RENIPRES', definicion: 'Registro Nacional de IPRESS: el código del establecimiento debe estar activo en este registro para que se acepte la información registrada.', ver: '#items' },
  { termino: 'Representante del asegurado SIS', definicion: 'Persona con capacidad de ejercicio que actúa a nombre del asegurado; firma el FUA cuando el paciente no puede colocar su huella digital.', ver: '#fua' },
  { termino: 'SIS', definicion: 'Seguro Integral de Salud: financiador código 2 en la Hoja HIS; su cobertura genera el Formato Único de Atención correspondiente.', ver: '#fua' },
  { termino: 'UPSS', definicion: 'Unidad Productora de Servicios de Salud: relación organizada de denominaciones y códigos estándar de los servicios de atención directa y de soporte (ítem 5).', ver: '#items' },
  { termino: 'VALOR LAB', definicion: 'Casillero del ítem 21 llenado por el personal asistencial: dosis de vacunas, sesiones profilácticas, insumos de planificación familiar, participantes, visitas de seguimiento o cantidad de animales.', ver: '#items' },
  { termino: 'Declaración jurada', definicion: 'Carácter legal del FUA: quien lo suscribe asume la veracidad de los datos ante los procesos de validación prestacional y financiera del SIS.', ver: '#fua' },
];

export interface ComparativaRow {
  aspecto: string;
  his: string;
  fua: string;
}

export const comparativa: ComparativaRow[] = [
  { aspecto: 'Propósito', his: 'Registrar todas las atenciones y actividades de salud del establecimiento, sin importar el financiador.', fua: 'Registrar y acreditar las prestaciones otorgadas a asegurados SIS para la validación prestacional y financiera.' },
  { aspecto: 'Norma / fuente', his: 'Procedimiento de registro HIS MINSA — Documento Técnico 2025 de la OGTI.', fua: 'Directiva N° 002-2024-SIS/GREP-V.02, vigente desde el 01/06/2024.' },
  { aspecto: 'Cuándo se usa', his: 'En toda atención de consulta externa, APP y AAA, con cualquier financiador.', fua: 'Solo cuando el financiador es 2 (SIS); se registra una (01) prestación por FUA.' },
  { aspecto: 'Estructura', his: 'Datos generales y específicos: hasta 22 ítems por fila de atención.', fua: '17 campos, desde la numeración de la IPRESS hasta firmas y huella.' },
  { aspecto: 'Quién registra', his: 'El profesional que brinda la atención, de manera inmediata tras la actividad.', fua: 'El profesional que brindó la atención; farmacia firma productos farmacéuticos; apoyo al diagnóstico, su responsable.' },
  { aspecto: 'Firma y conformidad', his: 'Firma y sello del responsable HIS MINSA en la cabecera de la hoja.', fua: 'Firma y sello del profesional más firma y huella del asegurado o de su representante.' },
  { aspecto: 'Valor legal', his: 'Instrumento de recojo de datos para estadística, epidemiología y costos.', fua: 'Declaración jurada y fuente de los registros informáticos del SIS.' },
  { aspecto: 'Digitación y devolución', his: 'Digitación diaria en el establecimiento o punto de digitación; lotes de hasta 20 hojas devueltos en ≤ 1 mes.', fua: 'Digitación en los aplicativos del SIS según criterios de oportunidad acordados; se incorpora a la historia clínica.' },
  { aspecto: 'Control de calidad', his: 'Estadística del establecimiento devuelve las hojas erradas para subsanación.', fua: 'Supervisión, control y auditoría del SIS: se rechazan registros que no sustenten autenticidad.' },
  { aspecto: 'Códigos característicos', his: 'Ítems 17/18 (N-C-R), ítem 21 (VALOR LAB) e ítem 22 (CIE-10 / CPMS).', fua: 'COD. PRESTA con códigos por curso de vida 301-306 y CIE-10 en diagnósticos.' },
];

export const puntosContacto: string[] = [
  'El financiador código 2 (SIS) consignado en el ítem 9 de la Hoja HIS es el que genera el FUA correspondiente.',
  'Ambos instrumentos se incorporan a la historia clínica del paciente o asegurado.',
  'El diagnóstico de la Hoja HIS, el del FUA y el de la historia clínica deben ser consistentes para una misma fecha.',
  'La condición N/C/R se registra en los ítems 17 y 18 de la hoja, mientras que el código por curso de vida consolida la atención integral en el FUA.',
];

/* ------------------------------------------------------------------ */
/* Modo estudio: hechos para flashcards y quiz                         */
/* ------------------------------------------------------------------ */

export interface StudyFact {
  front: string;
  back: string;
  tag: string;
}

export const studyFacts: StudyFact[] = [
  { front: '¿Cuántas hojas HIS admite como máximo un lote de digitación?', back: '20 hojas por lote, agrupadas según especialidad.', tag: 'Hoja HIS' },
  { front: '¿Cuál es el nombre oficial de la Hoja HIS?', back: 'Registro Diario de Atención y Otras Actividades de Salud.', tag: 'Hoja HIS' },
  { front: '¿Cuándo entrega el personal asistencial las Hojas HIS al responsable de estadística?', back: 'Al término de la jornada, en forma diaria.', tag: 'Hoja HIS' },
  { front: '¿Cuál es el plazo máximo de devolución de las hojas digitadas al establecimiento de origen?', back: 'No superior a un mes, o una vez finalizado el proceso de digitación y control de calidad.', tag: 'Hoja HIS' },
  { front: '¿Cada cuánto se realiza la reunión de monitoreo de errores de registro?', back: 'Mensualmente, entre el responsable de estadística y el jefe del establecimiento.', tag: 'Hoja HIS' },
  { front: '¿Qué significa UPSS?', back: 'Unidad Productora de Servicios de Salud: relación organizada de denominaciones y códigos estándar de los servicios de atención directa y de soporte.', tag: 'Hoja HIS' },
  { front: '¿Qué carácter tiene el FUA?', back: 'Carácter de declaración jurada (Directiva N° 002-2024-SIS/GREP-V.02).', tag: 'FUA' },
  { front: '¿Cuántas prestaciones se registran por FUA?', back: 'Solo una (01) prestación por FUA, con llenado legible.', tag: 'FUA' },
  { front: '¿Quién registra y firma los datos de productos farmacéuticos e insumos en el FUA?', back: 'El responsable de farmacia o quien haga sus veces; la cantidad prescrita y entregada es obligatoria.', tag: 'FUA' },
  { front: '¿Vigencia de la Directiva N° 002-2024-SIS/GREP-V.02?', back: 'Desde el 01 de junio del 2024, con modificación en noviembre de 2024.', tag: 'Normativa' },
  { front: '¿Vigencia de la Directiva N° 001-2025-SIS/GREP-V.01?', back: 'Desde el 01 de octubre del año 2025.', tag: 'Normativa' },
  { front: '¿Qué procesos de auditoría norma la Directiva N° 001-2025-SIS/GREP-V.01?', back: 'Auditoría automatizada, auditoría de pertinencia y auditoría presencial.', tag: 'Normativa' },
  { front: '¿Dónde se registra el código por curso de vida en el FUA?', back: 'En la sección "DE LA ATENCIÓN", campo COD. PRESTA.', tag: 'Curso de vida' },
  { front: '¿Qué ocurre si una prestación se consigna con un código por curso de vida?', back: 'Queda excluida la posibilidad de registrar simultáneamente esas mismas atenciones mediante códigos fragmentados en otros FUA.', tag: 'Curso de vida' },
];

/* ------------------------------------------------------------------ */
/* Índice plano para el buscador global                                */
/* ------------------------------------------------------------------ */

export interface SearchEntry {
  title: string;
  kind: 'Ítem Hoja HIS' | 'Campo FUA' | 'Código' | 'Norma' | 'Sección';
  anchor: string;
  text: string;
}

export const searchIndex: SearchEntry[] = [
  ...hisItems.map((it): SearchEntry => ({
    title: `Ítem ${it.num} — ${it.nombre}`,
    kind: 'Ítem Hoja HIS',
    anchor: `#item-${it.num}`,
    text: `${it.resumen} ${it.reglas.join(' ')} ${it.tags.join(' ')}`,
  })),
  ...fua.fields.map((f): SearchEntry => ({
    title: `FUA ${f.num} — ${f.nombre}`,
    kind: 'Campo FUA',
    anchor: '#fua',
    text: f.detalle,
  })),
  ...codeTables.flatMap((t): SearchEntry[] =>
    t.rows.map((r): SearchEntry => ({
      title: `${t.titulo}: ${r.code} = ${r.label}`,
      kind: 'Código',
      anchor: '#codigos',
      text: `${r.note ?? ''} ${t.itemRef}`,
    })),
  ),
  ...cursoVida.codes.map((c): SearchEntry => ({
    title: `${c.codigo} — ${c.nombre}`,
    kind: 'Código',
    anchor: '#curso-vida',
    text: `${c.rango} código prestacional curso de vida`,
  })),
  { title: 'Directiva N° 002-2024-SIS/GREP-V.02 (FUA)', kind: 'Norma', anchor: '#fua', text: `${fua.finalidad} ${fua.vigencia}` },
  { title: 'Directiva N° 001-2025-SIS/GREP-V.01 (Auditoría)', kind: 'Norma', anchor: '#auditoria', text: `${auditoria.finalidad} ${auditoria.vigencia}` },
  { title: 'Escenarios de registro: en línea y en físico', kind: 'Sección', anchor: '#his', text: his.scenarios.map((s) => s.detail).join(' ') },
  { title: 'Uso correcto de la Hoja HIS', kind: 'Sección', anchor: '#hoja', text: his.usageRules.map((u) => `${u.title} ${u.detail}`).join(' ') },
  { title: 'Producción: intramural y extramural', kind: 'Sección', anchor: '#codigos', text: `${productionFormulas.intramural.detail} ${productionFormulas.extramural.detail}` },
];
