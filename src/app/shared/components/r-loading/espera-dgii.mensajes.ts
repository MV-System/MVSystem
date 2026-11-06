import { EtapaEspera } from './loading.service';

/**
 * Mensajes de la espera de la respuesta de la DGII (facturas con comprobante y notas de crédito).
 * Cambian con el tiempo y, en cada etapa, se elige uno al azar. Tono suave: se burla de la espera, nunca del usuario.
 * Para agregar o quitar mensajes basta editar las listas.
 */
export const ETAPAS_ESPERA_DGII: EtapaEspera[] = [
  {
    desde: 0,
    mensajes: [
      'Esperando respuesta de la DGII',
      'Consultando a la DGII, un momento…',
      'Enviando el comprobante a la DGII…'
    ]
  },
  {
    desde: 10,
    mensajes: [
      'Wao, qué lenta está la DGII hoy… 🐢',
      'La DGII está pensando… dale un momentico 🤔',
      'Seguimos esperando a la DGII, ¡ya casi! ⏳',
      'Tranquilo, que la DGII también necesita su tiempo 😅',
      'La DGII está leyendo cada línea con calma… 🧐'
    ]
  },
  {
    desde: 20,
    mensajes: [
      'Parece que se fueron de vacaciones… 🏖️',
      'La DGII salió por un cafecito ☕',
      'Alguien en la DGII se quedó dormido en el teclado 😴',
      'Más lento que la fila del banco un día de quincena 🏦',
      'La DGII fue a buscar el sello… 🔍'
    ]
  },
  {
    desde: 32,
    mensajes: [
      'Paciencia, que la DGII ya casi responde 🙏',
      'Sigue en proceso, gracias por esperar 💙',
      'Casi, casi… no cierres esta pantalla 🤞',
      'La DGII está tardando más de lo normal, seguimos esperando ⏱️'
    ]
  }
];

export const DETALLE_ESPERA_DGII = 'Por favor espere, esto puede tardar unos segundos…';
