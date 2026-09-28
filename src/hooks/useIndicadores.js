import { useCallback, useEffect, useRef, useState } from 'react';
import {
  contarPorCategoria,
  contarPorEstado,
  leerPublicacionesPorId,
  listarInteraccionesRecientes,
} from '../services/indicadoresService.js';
import { mensajeDe } from '../utils/errores.js';
import { conTitulo, contarPor, masConsultadas } from '../utils/indicadores.js';

/** Cuántas publicaciones enseña la tabla de las más consultadas. */
export const CUANTAS_MAS_CONSULTADAS = 10;

/**
 * Los tres indicadores del panel — HU-34 · RF-15.
 *
 * Recibe los identificadores de categoría en lugar de leerlos: el panel ya tiene
 * esa lista cargada para su propia tabla y volver a pedirla sería leer dos veces
 * lo mismo en la misma página.
 *
 * ## Las cuatro lecturas, y por qué van en ese orden
 *
 * Los recuentos por estado, los recuentos por categoría y los registros de
 * interacción **no dependen entre sí**, así que salen a la vez. Lo que sí
 * depende es la quinta: para poner el título a las publicaciones más consultadas
 * hay que saber antes cuáles son, y eso solo se sabe después de agrupar los
 * registros. Encadenarlas todas habría sumado las cuatro esperas una detrás de
 * otra para nada.
 *
 * ## No se recarga solo
 *
 * Un panel de indicadores que se refresca cada pocos segundos cuesta lecturas de
 * Firestore cada pocos segundos, y nadie mira un número tanto rato. Se lee al
 * abrir y hay un botón para volver a leer.
 */
export function useIndicadores(identificadoresDeCategoria) {
  const [indicadores, setIndicadores] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Si el panel se cerró mientras las cuatro lecturas iban por la red, lo que
  // vuelva no se escribe. Es un «ref» y lo consulta «leer» antes de cada
  // «setState»: una bandera local del efecto no serviría de nada, porque la
  // función que escribe no la ve.
  const montado = useRef(true);
  useEffect(() => {
    montado.current = true;
    return () => {
      montado.current = false;
    };
  }, []);

  // La lista llega nueva en cada renderizado del panel, así que lo que entra en
  // las dependencias es su contenido y no su identidad: sin esto el efecto se
  // volvería a ejecutar en cada pintada.
  const claves = (identificadoresDeCategoria ?? []).join(',');

  const leer = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const categorias = claves === '' ? [] : claves.split(',');

      const [porEstado, porCategoria, interacciones] = await Promise.all([
        contarPorEstado(),
        contarPorCategoria(categorias),
        listarInteraccionesRecientes(),
      ]);

      const ranking = masConsultadas(interacciones, CUANTAS_MAS_CONSULTADAS);
      const publicaciones = await leerPublicacionesPorId(ranking.map((f) => f.idEvento));

      if (!montado.current) return;
      setIndicadores({
        porEstado,
        porCategoria,
        masConsultadas: conTitulo(ranking, publicaciones),
        // Los contactos son de HU-29 y se cuentan aparte: son la otra mitad de
        // lo que dice la colección, y el panel los enseña como total.
        contactos: contarPor(
          interacciones.filter((i) => i.tipo === 'contacto'),
          'tipo'
        ).contacto ?? 0,
        registrosLeidos: interacciones.length,
        // La más antigua de las que se leyeron: es lo que dice desde cuándo
        // cuentan los números de esta pantalla.
        desde: interacciones.at(-1)?.fecha ?? null,
      });
    } catch (fallo) {
      if (!montado.current) return;
      setError(mensajeDe(fallo, 'No se pudieron leer los indicadores. Revisa la conexión.'));
    } finally {
      if (montado.current) setCargando(false);
    }
  }, [claves]);

  useEffect(() => {
    leer();
  }, [leer]);

  return { indicadores, cargando, error, recargar: leer };
}
