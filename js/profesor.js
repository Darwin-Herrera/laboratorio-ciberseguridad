import {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  SESSION_SLUG
} from './config.js';


/* =========================================================
   ELEMENTOS
========================================================= */

const estado =
  document.querySelector('#estado');

const total =
  document.querySelector('#total');

const actualizacion =
  document.querySelector('#actualizacion');

const carreras =
  document.querySelector('#carreras');

const filas =
  document.querySelector('#filas');

const btnActualizar =
  document.querySelector('#actualizar');

const btnReiniciar =
  document.querySelector('#btnReiniciar');

const mensajePanel =
  document.querySelector('#mensajePanel');


/* =========================================================
   HEADERS
========================================================= */

const headers = {

  'apikey':
    SUPABASE_ANON_KEY,

  'Authorization':
    `Bearer ${SUPABASE_ANON_KEY}`,

  'Content-Type':
    'application/json'
};


/* =========================================================
   MENSAJES
========================================================= */

function mostrarMensajePanel(
  texto,
  tipo = 'ok'
) {

  if (!mensajePanel) return;


  mensajePanel.textContent =
    texto;


  mensajePanel.className =
    texto
      ? `mensaje-panel ${tipo}`
      : 'mensaje-panel';
}


/* =========================================================
   OBTENER SESIÓN
========================================================= */

async function obtenerSesion() {

  const url =
    `${SUPABASE_URL}/rest/v1/sesiones` +
    `?slug=eq.${encodeURIComponent(SESSION_SLUG)}` +
    `&select=id,nombre,activa` +
    `&limit=1`;


  const response =
    await fetch(
      url,
      {
        method: 'GET',
        headers
      }
    );


  if (!response.ok) {

    const texto =
      await response.text();


    throw new Error(
      texto ||
      `No fue posible consultar la sesión (${response.status}).`
    );
  }


  const data =
    await response.json();


  if (
    !data ||
    data.length === 0
  ) {

    throw new Error(
      'No se encontró la sesión.'
    );
  }


  return data[0];
}


/* =========================================================
   OBTENER RESPUESTAS
========================================================= */

async function obtenerRespuestas(
  sesionId
) {

  const url =
    `${SUPABASE_URL}/rest/v1/respuestas` +
    `?sesion_id=eq.${sesionId}` +
    `&select=id,codigo,carrera,created_at` +
    `&order=created_at.desc`;


  const response =
    await fetch(
      url,
      {
        method: 'GET',
        headers
      }
    );


  if (!response.ok) {

    const texto =
      await response.text();


    throw new Error(
      texto ||
      `No fue posible consultar las respuestas (${response.status}).`
    );
  }


  return await response.json();
}


/* =========================================================
   ESTADO
========================================================= */

function pintarEstado(
  sesion
) {

  if (!estado) return;


  if (sesion.activa) {

    estado.textContent =
      '● ACTIVA';

    estado.className =
      'estado-activo';

  }

  else {

    estado.textContent =
      '● CERRADA';

    estado.className =
      'estado-cerrado';
  }
}


/* =========================================================
   ESCAPAR HTML
========================================================= */

function escaparHTML(valor) {

  return String(valor ?? '')

    .replaceAll(
      '&',
      '&amp;'
    )

    .replaceAll(
      '<',
      '&lt;'
    )

    .replaceAll(
      '>',
      '&gt;'
    )

    .replaceAll(
      '"',
      '&quot;'
    )

    .replaceAll(
      "'",
      '&#039;'
    );
}


/* =========================================================
   CARRERAS
========================================================= */

function pintarCarreras(
  respuestas
) {

  if (!carreras) return;


  carreras.innerHTML = '';


  if (!respuestas.length) {

    carreras.innerHTML = `

      <div class="sin-registros">

        Aún no hay participaciones registradas.

      </div>

    `;

    return;
  }


  const conteo = {};


  respuestas.forEach(
    registro => {

      const nombre =
        registro.carrera ||
        'Sin especificar';


      conteo[nombre] =
        (conteo[nombre] || 0) + 1;
    }
  );


  const datos =
    Object.entries(conteo)
      .sort(
        (a, b) =>
          b[1] - a[1]
      );


  const maximo =
    Math.max(
      ...datos.map(
        item => item[1]
      )
    );


  datos.forEach(
    ([nombre, cantidad]) => {

      const porcentaje =
        maximo > 0
          ? (cantidad / maximo) * 100
          : 0;


      const fila =
        document.createElement('div');


      fila.className =
        'bar-row';


      fila.innerHTML = `

        <strong class="bar-label">

          ${escaparHTML(nombre)}

        </strong>


        <div class="bar-track">

          <div
            class="bar-fill"
            style="width:${porcentaje}%"
          ></div>

        </div>


        <span class="bar-value">

          ${cantidad}

        </span>

      `;


      carreras.appendChild(fila);
    }
  );
}


/* =========================================================
   REGISTROS
========================================================= */

function pintarRegistros(
  respuestas
) {

  if (!filas) return;


  filas.innerHTML = '';


  if (!respuestas.length) {

    filas.innerHTML = `

      <tr>

        <td
          colspan="3"
          class="sin-registros"
        >

          No existen registros
          en esta sesión.

        </td>

      </tr>

    `;

    return;
  }


  respuestas.forEach(
    registro => {

      const tr =
        document.createElement('tr');


      const fecha =
        new Date(
          registro.created_at
        );


      const hora =
        fecha.toLocaleTimeString(
          'es-HN',
          {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          }
        );


      tr.innerHTML = `

        <td>
          ${escaparHTML(registro.codigo)}
        </td>

        <td>
          ${escaparHTML(registro.carrera)}
        </td>

        <td>
          ${hora}
        </td>

      `;


      filas.appendChild(tr);
    }
  );
}


/* =========================================================
   CARGAR PANEL
========================================================= */

async function cargarDatos() {

  try {

    mostrarMensajePanel('');


    if (btnActualizar) {

      btnActualizar.disabled = true;

      btnActualizar.textContent =
        '↻ Actualizando...';
    }


    const sesion =
      await obtenerSesion();


    pintarEstado(sesion);


    const respuestas =
      await obtenerRespuestas(
        sesion.id
      );


    if (total) {

      total.textContent =
        respuestas.length;
    }


    pintarCarreras(
      respuestas
    );


    pintarRegistros(
      respuestas
    );


    if (actualizacion) {

      actualizacion.textContent =
        new Date()
          .toLocaleTimeString(
            'es-HN',
            {
              hour:
                '2-digit',

              minute:
                '2-digit'
            }
          );
    }

  }

  catch (error) {

    console.error(
      'Error cargando panel:',
      error
    );


    mostrarMensajePanel(
      error.message ||
      'No fue posible actualizar el panel.',
      'error'
    );

  }

  finally {

    if (btnActualizar) {

      btnActualizar.disabled = false;

      btnActualizar.textContent =
        '↻ Actualizar resultados';
    }
  }
}


/* =========================================================
   REINICIAR PRÁCTICA
========================================================= */

async function reiniciarPractica() {

  const confirmar =
    window.confirm(

      '¿Deseas reiniciar la práctica?\n\n' +

      'Se eliminarán TODOS los registros ' +

      'de participación de esta sesión.\n\n' +

      'Esta acción no se puede deshacer.'
    );


  if (!confirmar) return;


  try {

    mostrarMensajePanel('');


    btnReiniciar.disabled = true;

    btnReiniciar.textContent =
      'Reiniciando...';


    const response =
      await fetch(

        `${SUPABASE_URL}/rest/v1/rpc/reiniciar_simulacion`,

        {

          method: 'POST',

          headers,

          body:
            JSON.stringify({

              p_slug:
                SESSION_SLUG
            })
        }
      );


    if (!response.ok) {

      const texto =
        await response.text();


      let detalle =
        'No fue posible reiniciar la práctica.';


      if (texto) {

        try {

          const json =
            JSON.parse(texto);


          detalle =
            json.message ||
            json.details ||
            detalle;

        }

        catch {

          detalle =
            texto;
        }
      }


      throw new Error(
        detalle
      );
    }


    const texto =
      await response.text();


    let eliminados = 0;


    if (texto) {

      try {

        eliminados =
          Number(
            JSON.parse(texto)
          );

      }

      catch {

        eliminados = 0;
      }
    }


    mostrarMensajePanel(

      `Práctica reiniciada correctamente. ` +

      `Se eliminaron ${eliminados} registros.`,

      'ok'
    );


    await cargarDatos();

  }

  catch (error) {

    console.error(
      'Error reiniciando:',
      error
    );


    mostrarMensajePanel(
      error.message ||
      'No fue posible reiniciar la práctica.',
      'error'
    );


    window.alert(

      'No fue posible reiniciar la práctica.\n\n' +

      (error.message || '')
    );

  }

  finally {

    if (btnReiniciar) {

      btnReiniciar.disabled = false;

      btnReiniciar.textContent =
        '🗑 Reiniciar práctica';
    }
  }
}


/* =========================================================
   EVENTOS
========================================================= */

if (btnActualizar) {

  btnActualizar.addEventListener(
    'click',
    cargarDatos
  );
}


if (btnReiniciar) {

  btnReiniciar.addEventListener(
    'click',
    reiniciarPractica
  );
}


/* =========================================================
   INICIO
========================================================= */

cargarDatos();


/* =========================================================
   ACTUALIZACIÓN AUTOMÁTICA

   Cada 5 segundos.
========================================================= */

setInterval(
  cargarDatos,
  5000
);