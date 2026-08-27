import { useCallback, useEffect, useState } from 'react';

/**
 * Una cola de aprobación del panel de administración — HU-18, HU-20.
 *
 * Los perfiles de actores y los hubs esperan aprobación exactamente igual: se
 * lee lo pendiente, se decide, se recarga y se deja escrito qué pasó. Lo único
 * que cambia entre las dos colas es **qué se lista** y **cómo se llama lo que se
 * aprueba**, así que eso es lo que se recibe por parámetro.
 *
 * Nació con la segunda cola. La primera vivía dentro de su componente, y
 * duplicarla habría dejado dos copias del mismo «try / recargar / finally» que
 * se separan a la primera corrección que solo se aplique a una.
 *
 * **La tercera cola sí cabía.** HU-24 dejó escrita la duda —la moderación de
 * publicaciones escribe además en «moderaciones»— y la respuesta resultó ser que
 * eso no es asunto de este gancho: lo que aquí ocurre es «leer, decidir,
 * recargar, decir qué pasó», y es idéntico en las tres. Lo que la tercera
 * necesitaba era **un dato más que viaja con la decisión** —la observación
 * escrita—, y eso es un tercer argumento opcional, no una copia del gancho.
 *
 * Las dos colas anteriores llaman a «cambiarEstado(id, estado)» y no reciben ese
 * tercer argumento porque nunca se lo pasan. Es una fuga pequeña y consciente:
 * la alternativa era un cuarto archivo casi igual, que es donde de verdad se
 * pierden las correcciones.
 *
 * Los tres argumentos tienen que ser **estables entre renderizados** —funciones
 * importadas y un objeto definido fuera del componente—, porque «recargar»
 * depende de ellos y vive dentro de un efecto. Pasarlos como literales en línea
 * volvería a leer la cola sin parar.
 *
 * @param listar          función que devuelve lo pendiente
 * @param cambiarEstado   (id, estado, extra?) => Promise
 * @param mensajes        { alPublicar(elemento), alRetirar(elemento), alFallarLectura }
 */
export function useColaDeAprobacion({ listar, cambiarEstado, mensajes }) {
  const [pendientes, setPendientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [aviso, setAviso] = useState(null);
  const [ocupada, setOcupada] = useState(false);

  const recargar = useCallback(async () => {
    setCargando(true);
    try {
      setPendientes(await listar());
      setError(null);
    } catch (fallo) {
      setError(fallo?.message ?? mensajes.alFallarLectura);
    } finally {
      setCargando(false);
    }
  }, [listar, mensajes.alFallarLectura]);

  useEffect(() => {
    recargar();
  }, [recargar]);

  const decidir = useCallback(
    async (elemento, estado, extra) => {
      setOcupada(true);
      setAviso(null);
      try {
        await cambiarEstado(elemento.id, estado, extra);
        await recargar();
        setAviso({
          tipo: 'exito',
          texto:
            estado === 'aprobado' ? mensajes.alPublicar(elemento) : mensajes.alRetirar(elemento),
        });
      } catch (fallo) {
        setAviso({
          tipo: 'error',
          texto: fallo?.message ?? 'No se pudo cambiar el estado. Inténtalo de nuevo.',
        });
      } finally {
        setOcupada(false);
      }
    },
    [cambiarEstado, recargar, mensajes]
  );

  return { pendientes, cargando, error, aviso, ocupada, decidir, recargar };
}
