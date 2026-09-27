/**
 * Los cálculos de los indicadores de uso — HU-34 · RF-15.
 *
 * Funciones puras sobre listas corrientes: sin React, sin Firebase y sin
 * navegador, así que se comprueban con «npm run probar». El servicio de al lado
 * se encarga de traer los datos; aquí solo se cuentan.
 *
 * ## Por qué se cuenta en memoria y no en el servidor
 *
 * Firestore no tiene «GROUP BY». Sabe contar cuántos documentos cumplen una
 * condición —«getCountFromServer», que es lo que usan los dos primeros
 * indicadores— pero no sabe agrupar por el valor de un campo y devolver el
 * recuento de cada grupo. Para saber qué publicaciones se consultan más hay que
 * traerse los registros de consulta y agruparlos aquí.
 *
 * Eso tiene un techo, y está puesto: «listarConsultas» del servicio pide como
 * mucho «TOPE_DE_REGISTROS». Un indicador que se calcula sobre los últimos N
 * registros y lo dice es honesto; uno que se traiga la colección entera deja de
 * funcionar el día que crezca, y lo hace sin avisar.
 */

/**
 * Cuántas veces aparece cada valor de una clave.
 *
 * Devuelve un objeto llano y no un «Map» porque quien lo recibe es una vista de
 * React, que lo va a recorrer para pintarlo.
 */
export function contarPor(registros, clave) {
  const cuenta = {};
  for (const registro of registros ?? []) {
    const valor = registro?.[clave];
    if (valor === undefined || valor === null || valor === '') continue;
    cuenta[valor] = (cuenta[valor] ?? 0) + 1;
  }
  return cuenta;
}

/**
 * Las publicaciones más consultadas — segundo criterio de aceptación.
 *
 * Recibe los registros de «interacciones» tal como vienen y devuelve, de más a
 * menos, los que más veces aparecen con «tipo: consulta».
 *
 * **Los contactos no se cuentan aquí.** Son de HU-29 y viven en la misma
 * colección, pero «consultar» y «contactar» no son lo mismo: una publicación con
 * muchas consultas y ningún contacto dice algo distinto de una con pocas
 * consultas y varios contactos, y sumarlas borraría justo esa diferencia. El
 * servicio los trae por separado.
 *
 * El desempate es por identificador y no por el orden en que llegaron. Dos
 * publicaciones con el mismo número de consultas tienen que salir siempre en el
 * mismo orden: si no, la tabla del panel se reordena sola entre dos recargas que
 * no cambiaron nada, y eso se lee como que el indicador no es de fiar.
 */
export function masConsultadas(interacciones, limite = 10) {
  const consultas = (interacciones ?? []).filter((i) => i?.tipo === 'consulta');
  const cuenta = contarPor(consultas, 'idEvento');

  return Object.entries(cuenta)
    .map(([idEvento, consultas_]) => ({ idEvento, consultas: consultas_ }))
    .sort((a, b) => b.consultas - a.consultas || a.idEvento.localeCompare(b.idEvento))
    .slice(0, Math.max(0, limite));
}

/**
 * Pega a cada fila el título de su publicación.
 *
 * Separado de «masConsultadas» a propósito: aquella cuenta y esta nombra, y son
 * dos cosas que fallan por motivos distintos. Una publicación puede tener
 * consultas y haberse eliminado después —HU-23 permite retirarla y los registros
 * de interacción no se borran con ella—, así que aquí hay que decidir qué se
 * enseña cuando el título no existe. Se enseña que ya no existe: esconder la
 * fila haría que los números del panel no cuadraran con los del listado.
 */
export function conTitulo(filas, publicacionesPorId) {
  const indice = publicacionesPorId ?? {};
  return (filas ?? []).map((fila) => ({
    ...fila,
    titulo: indice[fila.idEvento]?.titulo ?? null,
    categoria: indice[fila.idEvento]?.categoria ?? null,
  }));
}

/**
 * El total de una cuenta por clave. Es el mismo número que da contar los
 * registros de entrada, y se calcula aparte para poder enseñarlo junto a la
 * tabla sin que la vista tenga que sumar.
 */
export function total(cuenta) {
  return Object.values(cuenta ?? {}).reduce((suma, n) => suma + n, 0);
}

/**
 * Ordena una cuenta para pintarla: de más a menos, y por nombre cuando empatan,
 * por lo mismo que «masConsultadas».
 *
 * «etiquetas» traduce la clave a lo que lee una persona —el identificador de una
 * categoría a su nombre—. Lo que no esté en la tabla sale con su clave, que es
 * fea pero cierta: una categoría desactivada después de clasificar publicaciones
 * sigue teniendo publicaciones que contar (docs/16 §3).
 */
export function ordenarCuenta(cuenta, etiquetas = {}) {
  return Object.entries(cuenta ?? {})
    .map(([clave, cantidad]) => ({ clave, cantidad, etiqueta: etiquetas[clave] ?? clave }))
    .sort((a, b) => b.cantidad - a.cantidad || a.etiqueta.localeCompare(b.etiqueta, 'es'));
}
