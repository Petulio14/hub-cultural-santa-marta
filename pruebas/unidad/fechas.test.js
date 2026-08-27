/**
 * Fechas de una publicación — HU-21 · RF-05.
 *
 * La comprobación que importa está al final y se ejecuta **en otro proceso**.
 * Todo lo que hace «src/utils/fechas.js» gira alrededor de la diferencia entre
 * hora local y UTC, y una prueba que corre en la zona horaria de la máquina no
 * puede distinguir una implementación correcta de una escrita con
 * «toISOString()»: en UTC las dos dan lo mismo, y **la integración continua corre
 * en UTC**. Sería el mismo punto ciego de HU-10 —medir solo el caso que ya
 * funciona— con otro disfraz.
 *
 *   npm run probar
 */
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  desdeEntradaDeFecha,
  esFechaValida,
  mismoDia,
  paraEntradaDeFecha,
  periodoCoherente,
  textoDeLaHora,
  textoDelDia,
  textoDelPeriodo,
  yaTermino,
} from '../../src/utils/fechas.js';

describe('leer lo que escribe el control de fecha', () => {
  it('acepta la forma exacta de «datetime-local»', () => {
    const fecha = desdeEntradaDeFecha('2026-09-01T18:00');
    assert.equal(esFechaValida(fecha), true);
    assert.equal(fecha.getHours(), 18);
    assert.equal(fecha.getDate(), 1);
  });

  it('rechaza una fecha sin hora, que es la trampa de este archivo', () => {
    // «new Date('2026-09-01')» SÍ construye una fecha, pero interpretada en UTC:
    // en Santa Marta sería el 31 de agosto a las 19:00. Devolver null es lo que
    // impide que ese desplazamiento entre en el formulario.
    assert.equal(desdeEntradaDeFecha('2026-09-01'), null);
  });

  it('rechaza lo que no es una fecha', () => {
    assert.equal(desdeEntradaDeFecha(''), null);
    assert.equal(desdeEntradaDeFecha('mañana por la tarde'), null);
    assert.equal(desdeEntradaDeFecha(null), null);
    assert.equal(desdeEntradaDeFecha('2026-13-45T99:99'), null);
  });
});

describe('escribir en el control de fecha', () => {
  it('la medianoche se escribe como medianoche', () => {
    // Construida con los componentes locales, así que es medianoche en la zona
    // que sea. Con «toISOString» saldría otra hora en cuanto la zona no sea UTC.
    assert.equal(paraEntradaDeFecha(new Date(2026, 8, 1, 0, 0)), '2026-09-01T00:00');
  });

  it('completa los ceros de meses, días y horas', () => {
    assert.equal(paraEntradaDeFecha(new Date(2026, 0, 5, 9, 7)), '2026-01-05T09:07');
  });

  it('ida y vuelta sin perder nada', () => {
    const texto = '2026-12-31T23:59';
    assert.equal(paraEntradaDeFecha(desdeEntradaDeFecha(texto)), texto);
  });

  it('una fecha inválida no se escribe', () => {
    assert.equal(paraEntradaDeFecha(new Date('vaya')), '');
    assert.equal(paraEntradaDeFecha(null), '');
  });
});

describe('el orden de las dos fechas', () => {
  const inicio = new Date(2026, 8, 1, 18, 0);

  it('empezar antes de terminar es correcto', () => {
    assert.equal(periodoCoherente(inicio, new Date(2026, 8, 1, 21, 0)), true);
  });

  it('empezar y terminar a la vez también', () => {
    assert.equal(periodoCoherente(inicio, new Date(2026, 8, 1, 18, 0)), true);
  });

  it('terminar antes de empezar no', () => {
    assert.equal(periodoCoherente(inicio, new Date(2026, 8, 1, 17, 59)), false);
  });

  it('con una fecha ausente no hay periodo', () => {
    assert.equal(periodoCoherente(inicio, null), false);
    assert.equal(periodoCoherente(null, inicio), false);
  });
});

describe('cómo se escribe cuándo ocurre', () => {
  it('la hora va en veinticuatro y sin «a las»', () => {
    // «toLocaleTimeString» en español antepone «a las», y componiendo con eso
    // salía «1 de septiembre de 2026 a las 18:00 a 21:30», que no se puede leer.
    assert.equal(textoDeLaHora(new Date(2026, 8, 1, 18, 0)), '18:00');
    assert.equal(textoDeLaHora(new Date(2026, 8, 1, 9, 5)), '09:05');
    assert.equal(textoDeLaHora(new Date(2026, 8, 1, 0, 0)), '00:00');
  });

  it('el día lleva mes en palabra y año', () => {
    const texto = textoDelDia(new Date(2026, 8, 1, 18, 0));
    assert.match(texto, /septiembre/);
    assert.match(texto, /2026/);
  });

  it('el mismo día no repite la fecha', () => {
    const texto = textoDelPeriodo(new Date(2026, 8, 1, 18, 0), new Date(2026, 8, 1, 21, 30));
    assert.match(texto, /, de 18:00 a 21:30$/);
    assert.equal(texto.includes('—'), false);
  });

  it('días distintos escriben las dos fechas', () => {
    const texto = textoDelPeriodo(new Date(2026, 8, 1, 18, 0), new Date(2026, 8, 3, 21, 30));
    assert.equal(texto.includes('—'), true);
  });

  it('la misma hora en días distintos no se confunde con un solo día', () => {
    // Sin comparar año, mes y día por separado, dos fechas con la misma hora
    // podrían tomarse por el mismo día. Este es el caso que lo comprueba.
    const texto = textoDelPeriodo(new Date(2026, 8, 1, 18, 0), new Date(2026, 9, 1, 18, 0));
    assert.equal(texto.includes('—'), true);
  });

  it('el mismo día del mes en años distintos tampoco', () => {
    assert.equal(mismoDia(new Date(2026, 8, 1, 18, 0), new Date(2027, 8, 1, 18, 0)), false);
    assert.equal(mismoDia(new Date(2026, 8, 1, 0, 1), new Date(2026, 8, 1, 23, 59)), true);
  });

  it('sin fecha de fin se escribe solo el inicio', () => {
    const texto = textoDelPeriodo(new Date(2026, 8, 1, 18, 0), null);
    assert.equal(texto.includes('—'), false);
    assert.equal(texto.length > 0, true);
  });
});

describe('si ya terminó', () => {
  const ahora = new Date(2026, 8, 15, 12, 0);

  it('lo de la semana pasada terminó', () => {
    assert.equal(yaTermino(new Date(2026, 8, 8, 12, 0), ahora), true);
  });

  it('lo de la semana que viene no', () => {
    assert.equal(yaTermino(new Date(2026, 8, 22, 12, 0), ahora), false);
  });

  it('sin fecha de fin no se puede decir que terminó', () => {
    assert.equal(yaTermino(null, ahora), false);
  });
});

/**
 * La comprobación en otra zona horaria.
 *
 * Se ejecuta un proceso aparte con «TZ=America/Bogota» —UTC−5, la de Santa
 * Marta, sin cambio de hora en todo el año— porque «process.env.TZ» ya no surte
 * efecto una vez que este proceso ha empezado.
 *
 * Si «paraEntradaDeFecha» se escribiera con «toISOString().slice(0, 16)», estos
 * dos casos darían «2026-09-01T05:00» y «2026-09-02T00:00»: la medianoche se
 * iría a las cinco de la mañana y el evento de las siete de la tarde saltaría al
 * día siguiente. En UTC los dos pasarían igualmente, que es justo el motivo de
 * ejecutarlos fuera.
 */
describe('en la zona horaria de Santa Marta (UTC−5)', () => {
  const modulo = new URL('../../src/utils/fechas.js', import.meta.url).href;

  const enBogota = (expresion) =>
    execFileSync(
      process.execPath,
      [
        '--input-type=module',
        '-e',
        `const f = await import(${JSON.stringify(modulo)});\n` +
          `process.stdout.write(String(${expresion}));`,
      ],
      { env: { ...process.env, TZ: 'America/Bogota' }, encoding: 'utf8' }
    );

  it('la medianoche local sigue siendo medianoche', () => {
    assert.equal(
      enBogota('f.paraEntradaDeFecha(new Date(2026, 8, 1, 0, 0))'),
      '2026-09-01T00:00'
    );
  });

  it('las siete de la tarde no saltan al día siguiente', () => {
    // A las 19:00 en UTC−5 ya es el día siguiente en UTC. Es la hora a la que
    // empieza media agenda cultural de la ciudad.
    assert.equal(
      enBogota('f.paraEntradaDeFecha(new Date(2026, 8, 1, 19, 0))'),
      '2026-09-01T19:00'
    );
  });

  it('ida y vuelta desde el control tampoco se mueve', () => {
    assert.equal(
      enBogota("f.paraEntradaDeFecha(f.desdeEntradaDeFecha('2026-09-01T19:00'))"),
      '2026-09-01T19:00'
    );
  });
});
