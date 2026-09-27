import { Link } from 'react-router-dom';
import { CUANTAS_MAS_CONSULTADAS, useIndicadores } from '../../hooks/useIndicadores.js';
import { TOPE_DE_REGISTROS } from '../../services/indicadoresService.js';
import { textoDeFecha } from '../../utils/fechas.js';
import { ordenarCuenta, total } from '../../utils/indicadores.js';

/**
 * Los indicadores de uso del panel — HU-34 · RF-15.
 *
 * Tres bloques, uno por criterio de aceptación: las publicaciones por estado,
 * las publicaciones por categoría y las más consultadas.
 *
 * ## Los números vienen con su letra pequeña, y va en pantalla
 *
 * Un indicador que se interpreta mal hace más daño que no tenerlo: si el
 * administrador retira una categoría porque «casi no se consulta» y resulta que
 * el número estaba corto, la decisión fue mala con datos que parecían buenos.
 * Por eso lo que el número no dice está escrito **junto al número** y no en la
 * documentación:
 *
 * - **Las consultas son una cota inferior.** El registro se dispara y no se
 *   espera respuesta (docs/28 §6), así que cuenta lo que se pudo anotar.
 * - **Se calculan sobre los últimos registros**, no sobre todos, porque Firestore
 *   no sabe agrupar y agrupar es traérselos.
 * - **Desde cuándo cuentan.** Con un tope, «5 consultas» significa cinco desde
 *   una fecha, y esa fecha cambia según cuánto se use la plataforma.
 */
const ROTULO_DE_ESTADO = {
  pendiente: 'Pendientes de revisión',
  aprobado: 'Publicadas en el catálogo',
  devuelto: 'Devueltas al autor',
};

export default function Indicadores({ categorias, cargandoCategorias }) {
  const { indicadores, cargando, error, recargar } = useIndicadores(
    categorias.map((categoria) => categoria.id)
  );

  const nombres = Object.fromEntries(categorias.map((c) => [c.id, c.nombre]));

  return (
    <section className="indicadores" aria-labelledby="titulo-indicadores">
      <h2 id="titulo-indicadores">Indicadores de uso</h2>
      <p className="panel__intro">
        Cuánto hay publicado y qué se está mirando. Orientan qué categorías hacen falta y
        cuáles no tienen público, que es para lo que sirven.
      </p>

      <p className="indicadores__acciones">
        <button className="boton boton--secundario" type="button" onClick={recargar} disabled={cargando}>
          {cargando ? 'Leyendo…' : 'Volver a calcular'}
        </button>
      </p>

      {error && (
        <p className="panel__aviso panel__aviso--error" role="alert">
          {error}
        </p>
      )}

      {cargando && !indicadores && <p>Calculando los indicadores…</p>}

      {indicadores && (
        <>
          {/* ── Primer criterio, primera mitad ─────────────────────────── */}
          <h3>Publicaciones por estado</h3>
          <ul className="indicadores__cifras">
            {Object.entries(ROTULO_DE_ESTADO).map(([estado, rotulo]) => (
              <li key={estado} className="indicadores__cifra">
                <span className="indicadores__numero">{indicadores.porEstado[estado] ?? 0}</span>
                <span className="indicadores__rotulo">{rotulo}</span>
              </li>
            ))}
            <li className="indicadores__cifra indicadores__cifra--total">
              <span className="indicadores__numero">{total(indicadores.porEstado)}</span>
              <span className="indicadores__rotulo">En total</span>
            </li>
          </ul>

          {/* ── Primer criterio, segunda mitad ─────────────────────────── */}
          <h3>Publicaciones por categoría</h3>
          {cargandoCategorias ? (
            <p>Leyendo las categorías…</p>
          ) : total(indicadores.porCategoria) === 0 ? (
            <p className="panel__vacio">
              Todavía no hay ninguna publicación clasificada. En cuanto se publique la
              primera, aquí aparece el reparto por categoría.
            </p>
          ) : (
            <ul className="indicadores__barras">
              {ordenarCuenta(indicadores.porCategoria, nombres).map((fila) => (
                <li key={fila.clave} className="indicadores__barra">
                  <span className="indicadores__barra-nombre">{fila.etiqueta}</span>
                  {/* La barra es decoración: el número va escrito al lado, que es
                      lo que se lee y lo que anuncia un lector de pantalla. */}
                  <span
                    className="indicadores__barra-pista"
                    aria-hidden="true"
                    style={{
                      '--parte': `${Math.round(
                        (fila.cantidad / Math.max(1, total(indicadores.porCategoria))) * 100
                      )}%`,
                    }}
                  />
                  <span className="indicadores__barra-cifra">{fila.cantidad}</span>
                </li>
              ))}
            </ul>
          )}

          {/* ── Segundo criterio ───────────────────────────────────────── */}
          <h3>Las {CUANTAS_MAS_CONSULTADAS} más consultadas</h3>

          <p className="indicadores__letra-pequena">
            Se cuentan las fichas abiertas desde el catálogo, sobre los últimos{' '}
            <strong>{indicadores.registrosLeidos}</strong> registros
            {indicadores.registrosLeidos >= TOPE_DE_REGISTROS && ` (el tope es ${TOPE_DE_REGISTROS})`}
            {indicadores.desde && <> , desde el {textoDeFecha(indicadores.desde)}</>}. Del
            visitante no se guarda nada: ni quién es, ni desde dónde entró. Y{' '}
            <strong>son un mínimo</strong>: el registro se envía sin esperar respuesta para no
            hacer esperar a quien abre la ficha, así que las que no se pudieron anotar no
            están contadas.
          </p>

          {indicadores.masConsultadas.length === 0 ? (
            <p className="panel__vacio">
              Todavía no se ha abierto ninguna ficha del catálogo. El primer visitante que
              abra una aparecerá aquí.
            </p>
          ) : (
            <ol className="indicadores__ranking">
              {indicadores.masConsultadas.map((fila) => (
                <li key={fila.idEvento} className="indicadores__fila">
                  <span className="indicadores__consultas">{fila.consultas}</span>
                  <span className="indicadores__publicacion">
                    {fila.titulo ? (
                      <Link to={`/eventos/${fila.idEvento}`}>{fila.titulo}</Link>
                    ) : (
                      /* La publicación se eliminó y sus registros no se borraron
                         con ella. Se enseña igual: esconderla haría que el total
                         no cuadrara con lo que se ve. */
                      <span className="indicadores__borrada">
                        Publicación eliminada <code>{fila.idEvento}</code>
                      </span>
                    )}
                    {fila.categoria && (
                      <span className="indicadores__categoria">
                        {nombres[fila.categoria] ?? fila.categoria}
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ol>
          )}

          <p className="indicadores__letra-pequena">
            En el mismo periodo se registraron <strong>{indicadores.contactos}</strong>{' '}
            {indicadores.contactos === 1 ? 'contacto' : 'contactos'} con actores culturales.
            No se suman a las consultas: abrir una ficha y escribirle a quien la publicó no
            son lo mismo.
          </p>
        </>
      )}
    </section>
  );
}
