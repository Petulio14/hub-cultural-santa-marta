/**
 * El cálculo del SUS — HU-36.
 *
 *   npm run probar
 *
 * El instrumento se puede verificar por construcción, y eso es lo que se
 * aprovecha aquí: hay tres respuestas cuyo puntaje se conoce sin calcular nada.
 * Si la alternancia positivo/negativo está mal puesta —que es el error clásico
 * de quien lo pasa a una hoja de cálculo— esos tres casos se caen a la vez.
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  CUANTOS_ITEMS,
  ITEMS,
  UMBRAL,
  puntajeSUS,
  resumirSUS,
  resumirTareas,
} from '../../herramientas/sus.js';

/** Impares en «muy de acuerdo», pares en «muy en desacuerdo»: el mejor posible. */
const PERFECTO = [5, 1, 5, 1, 5, 1, 5, 1, 5, 1];
/** Justo lo contrario. */
const PESIMO = [1, 5, 1, 5, 1, 5, 1, 5, 1, 5];
/** Todo en el punto medio de la escala. */
const NEUTRO = Array(10).fill(3);

describe('el instrumento', () => {
  it('tiene diez ítems', () => {
    assert.equal(ITEMS.length, CUANTOS_ITEMS);
  });

  /* La alternancia no es estética: es lo que obliga a leer cada frase en lugar
     de marcar una columna entera, y es de lo que depende el cálculo. */
  it('alterna una frase en positivo y una en negativo', () => {
    assert.match(ITEMS[0], /usaría esta plataforma con frecuencia/);
    assert.match(ITEMS[1], /innecesariamente compleja/);
    assert.match(ITEMS[2], /fácil de usar/);
    assert.match(ITEMS[3], /necesitaría el apoyo/);
  });
});

describe('puntajeSUS', () => {
  it('el mejor cuestionario posible da 100', () => {
    assert.equal(puntajeSUS(PERFECTO), 100);
  });

  it('el peor posible da 0', () => {
    assert.equal(puntajeSUS(PESIMO), 0);
  });

  it('todo en el punto medio da 50', () => {
    assert.equal(puntajeSUS(NEUTRO), 50);
  });

  /* Si alguien invirtiera la fórmula de los pares, este caso seguiría dando un
     número creíble y los tres de arriba ya no. */
  it('cada ítem vale 2,5 puntos', () => {
    const casi = [...PERFECTO];
    casi[0] = 4; // un punto menos en un ítem positivo
    assert.equal(puntajeSUS(casi), 97.5);

    const otro = [...PERFECTO];
    otro[1] = 2; // un punto peor en un ítem negativo
    assert.equal(puntajeSUS(otro), 97.5);
  });

  it('siempre cae entre 0 y 100', () => {
    for (const respuestas of [PERFECTO, PESIMO, NEUTRO, [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]]) {
      const p = puntajeSUS(respuestas);
      assert.ok(p >= 0 && p <= 100, `${p} se salió de la escala`);
    }
  });

  /* Cada ítem vale 2,5 puntos, así que rellenar el que falta con la media
     inventaría hasta dos puntos y medio de resultado. */
  it('un cuestionario incompleto no se estima: revienta', () => {
    assert.throws(() => puntajeSUS([5, 1, 5, 1, 5]), /son 10 respuestas y llegaron 5/);
    assert.throws(() => puntajeSUS([]), /llegaron 0/);
    assert.throws(() => puntajeSUS(null), /llegaron 0/);
  });

  it('una respuesta fuera de la escala también', () => {
    assert.throws(() => puntajeSUS([6, 1, 5, 1, 5, 1, 5, 1, 5, 1]), /la escala va de 1 a 5/);
    assert.throws(() => puntajeSUS([0, 1, 5, 1, 5, 1, 5, 1, 5, 1]), /la escala va de 1 a 5/);
    assert.throws(() => puntajeSUS([3.5, 1, 5, 1, 5, 1, 5, 1, 5, 1]), /la escala va de 1 a 5/);
  });
});

describe('resumirSUS', () => {
  it('promedia y dice si supera el umbral', () => {
    const r = resumirSUS([70, 80, 60, 90]);
    assert.equal(r.participantes, 4);
    assert.equal(r.promedio, 75);
    assert.equal(r.minimo, 60);
    assert.equal(r.maximo, 90);
    assert.equal(r.superaUmbral, true);
  });

  it('justo en el umbral lo supera', () => {
    assert.equal(resumirSUS([UMBRAL]).superaUmbral, true);
    assert.equal(resumirSUS([UMBRAL - 0.1]).superaUmbral, false);
  });

  it('sin sesiones no inventa un promedio', () => {
    const r = resumirSUS([]);
    assert.equal(r.participantes, 0);
    assert.equal(r.promedio, null);
    assert.equal(r.superaUmbral, false);
  });

  /* El instrumento da múltiplos de 2,5, así que más de un decimal en el
     promedio sería precisión que no está en los datos. */
  it('redondea el promedio a un decimal', () => {
    assert.equal(resumirSUS([70, 75, 77.5]).promedio, 74.2);
  });
});

describe('resumirTareas', () => {
  const sesiones = [
    { tareas: [
      { id: 'T1', completada: true, segundos: 40 },
      { id: 'T2', completada: false, segundos: 200 },
    ] },
    { tareas: [
      { id: 'T1', completada: true, segundos: 60 },
      { id: 'T2', completada: true, segundos: 150 },
    ] },
    { tareas: [
      { id: 'T1', completada: true, segundos: 50 },
      { id: 'T2', completada: false },
    ] },
  ];

  it('cuenta cuántos intentos se completaron', () => {
    const r = resumirTareas(sesiones);
    assert.equal(r.intentos, 6);
    assert.equal(r.completadas, 4);
    assert.equal(r.tasa, 66.7);
  });

  it('separa por tarea, que es donde se ve cuál cuesta', () => {
    const r = resumirTareas(sesiones);
    assert.equal(r.porTarea.T1.completadas, 3);
    assert.equal(r.porTarea.T2.completadas, 1);
  });

  /* La mediana y no el promedio: con ocho participantes, uno que se distraiga
     dos minutos mueve el promedio de una tarea de treinta segundos. */
  it('da la mediana del tiempo, no el promedio', () => {
    const r = resumirTareas(sesiones);
    assert.equal(r.porTarea.T1.medianaSegundos, 50);
  });

  it('una tarea sin tiempo anotado no rompe la mediana de las demás', () => {
    const r = resumirTareas(sesiones);
    assert.equal(r.porTarea.T2.medianaSegundos, 175);
  });

  it('sin sesiones no inventa una tasa', () => {
    const r = resumirTareas([]);
    assert.equal(r.intentos, 0);
    assert.equal(r.tasa, null);
  });
});
