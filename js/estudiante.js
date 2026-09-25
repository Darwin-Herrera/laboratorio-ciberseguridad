import {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  SESSION_SLUG
} from './config.js';


const formulario =
  document.querySelector('#formRegistro');

const mensaje =
  document.querySelector('#mensaje');

const contenido =
  document.querySelector('#contenido');


const headers = {

  'apikey': SUPABASE_ANON_KEY,

  'Authorization':
    `Bearer ${SUPABASE_ANON_KEY}`,

  'Content-Type':
    'application/json'
};


/* =========================================================
   MENSAJES
========================================================= */

function mostrarMensaje(
  texto,
  tipo = 'error'
) {

  if (!mensaje) return;

  mensaje.textContent = texto;

  mensaje.className =
    texto
      ? `mensaje ${tipo}`
      : 'mensaje';
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
      'No se encontró la sesión configurada.'
    );
  }


  return data[0];
}


/* =========================================================
   SESIÓN FINALIZADA
========================================================= */

function mostrarSesionFinalizada() {

  if (!contenido) return;


  contenido.innerHTML = `

    <div class="estado-final">

        <div class="estado-icono">
            ✓
        </div>

        <h1>
            Actividad finalizada
        </h1>

        <p>
            La sesión ya no está recibiendo registros.
            Espera las indicaciones del docente.
        </p>

    </div>

  `;
}


/* =========================================================
   REGISTRO EXITOSO
========================================================= */

function mostrarRegistroExitoso() {

  if (!contenido) return;


  contenido.innerHTML = `

    <div class="estado-final">

        <div class="estado-icono">
            ✓
        </div>

        <h1>
            Participación registrada
        </h1>

        <p>
            Tu registro fue recibido correctamente.
            Espera las indicaciones del docente.
        </p>

    </div>

  `;
}


/* =========================================================
   REGISTRAR PARTICIPACIÓN
========================================================= */

async function registrarParticipacion(event) {

  event.preventDefault();


  mostrarMensaje('');


  const boton =
    formulario.querySelector(
      'button[type="submit"]'
    );


  const campoCodigo =
    document.querySelector('#codigo');


  const campoCarrera =
    document.querySelector('#carrera');


  if (
    !campoCodigo ||
    !campoCarrera
  ) {

    mostrarMensaje(
      'No fue posible cargar correctamente el formulario.'
    );

    return;
  }


  const codigo =
    campoCodigo
      .value
      .trim()
      .toUpperCase();


  const carrera =
    campoCarrera.value;


  if (!codigo) {

    mostrarMensaje(
      'Ingresa el código indicado por el docente.'
    );

    campoCodigo.focus();

    return;
  }


  if (!carrera) {

    mostrarMensaje(
      'Selecciona tu carrera.'
    );

    campoCarrera.focus();

    return;
  }


  boton.disabled = true;

  boton.textContent =
    'Registrando...';


  try {

    /* COMPROBAR SESIÓN */

    const sesion =
      await obtenerSesion();


    if (!sesion.activa) {

      mostrarSesionFinalizada();

      return;
    }


    /* INSERTAR */

    const response =
      await fetch(
        `${SUPABASE_URL}/rest/v1/respuestas`,
        {

          method: 'POST',

          headers: {

            ...headers,

            'Prefer':
              'return=minimal'
          },

          body:
            JSON.stringify({

              sesion_id:
                sesion.id,

              codigo:
                codigo,

              carrera:
                carrera
            })
        }
      );


    if (!response.ok) {

      const texto =
        await response.text();


      let detalle =
        `No fue posible registrar la participación (${response.status}).`;


      if (texto) {

        try {

          const errorJson =
            JSON.parse(texto);


          detalle =
            errorJson.message ||
            errorJson.details ||
            detalle;

        }

        catch {

          detalle = texto;

        }
      }


      throw new Error(detalle);
    }


    /* TODO CORRECTO */

    mostrarRegistroExitoso();


    console.log(
      'Participación registrada:',
      {
        codigo,
        carrera,
        sesion_id: sesion.id
      }
    );

  }

  catch (error) {

    console.error(
      'Error al registrar:',
      error
    );


    mostrarMensaje(
      error.message ||
      'No fue posible completar el registro.'
    );

  }

  finally {

    if (
      boton &&
      document.body.contains(boton)
    ) {

      boton.disabled = false;

      boton.textContent =
        'Registrar participación';
    }
  }
}


/* =========================================================
   INICIO
========================================================= */

async function iniciar() {

  try {

    const sesion =
      await obtenerSesion();


    if (!sesion.activa) {

      mostrarSesionFinalizada();

      return;
    }


    if (!formulario) {

      throw new Error(
        'No se encontró el formulario.'
      );
    }


    formulario.addEventListener(
      'submit',
      registrarParticipacion
    );

  }

  catch (error) {

    console.error(
      'Error iniciando actividad:',
      error
    );


    mostrarMensaje(
      'No fue posible conectar con la actividad. Intenta nuevamente.'
    );
  }
}


iniciar();