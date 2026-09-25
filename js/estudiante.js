import {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  SESSION_SLUG
} from './config.js';

const formulario = document.querySelector('#formRegistro');
const mensaje = document.querySelector('#mensaje');
const contenido = document.querySelector('#contenido');

const headers = {
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json'
};

/* =========================================================
   MOSTRAR MENSAJES
========================================================= */

function mostrarMensaje(texto, tipo = 'error') {
  if (!mensaje) return;

  mensaje.textContent = texto;
  mensaje.className = texto
    ? `mensaje ${tipo}`
    : 'mensaje';
}


/* =========================================================
   OBTENER SESIÓN ACTUAL
========================================================= */

async function obtenerSesion() {

  const url =
    `${SUPABASE_URL}/rest/v1/sesiones` +
    `?slug=eq.${encodeURIComponent(SESSION_SLUG)}` +
    `&select=id,nombre,activa`;

  const response = await fetch(url, {
    method: 'GET',
    headers
  });

  if (!response.ok) {

    const texto = await response.text();

    throw new Error(
      texto ||
      `No fue posible consultar la sesión (${response.status}).`
    );
  }

  const data = await response.json();

  if (!data || data.length === 0) {
    throw new Error(
      'No se encontró la sesión configurada.'
    );
  }

  return data[0];
}


/* =========================================================
   MOSTRAR SESIÓN FINALIZADA
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


  /* ---------------------------------------------------------
     VALIDAR ELEMENTOS
  --------------------------------------------------------- */

  if (!campoCodigo || !campoCarrera) {

    mostrarMensaje(
      'No fue posible cargar correctamente el formulario.'
    );

    return;
  }


  /* ---------------------------------------------------------
     OBTENER DATOS
  --------------------------------------------------------- */

  const codigo =
    campoCodigo.value
      .trim()
      .toUpperCase();

  const carrera =
    campoCarrera.value;


  /* ---------------------------------------------------------
     VALIDACIONES
  --------------------------------------------------------- */

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


  /* ---------------------------------------------------------
     BLOQUEAR BOTÓN MIENTRAS GUARDA
  --------------------------------------------------------- */

  if (boton) {

    boton.disabled = true;
    boton.textContent = 'Registrando...';

  }


  try {

    /* =====================================================
       1. COMPROBAR QUE LA SESIÓN SIGUE ACTIVA
    ===================================================== */

    const sesion =
      await obtenerSesion();


    if (!sesion.activa) {

      mostrarSesionFinalizada();

      return;
    }


    /* =====================================================
       2. INSERTAR PARTICIPACIÓN
    ===================================================== */

    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/respuestas`,
      {

        method: 'POST',

        headers: {

          ...headers,

          /*
            IMPORTANTE:

            Supabase no necesita devolver la fila insertada.

            Con return=minimal obtenemos una respuesta
            exitosa sin cuerpo JSON.

            Por eso NO ejecutamos response.json()
            después del INSERT.
          */

          'Prefer': 'return=minimal'
        },

        body: JSON.stringify({

          sesion_id: sesion.id,

          codigo: codigo,

          carrera: carrera

        })
      }
    );


    /* =====================================================
       3. COMPROBAR RESPUESTA
    ===================================================== */

    if (!response.ok) {

      const texto =
        await response.text();

      let detalle =
        `No fue posible registrar la participación (${response.status}).`;


      /*
        Si Supabase devuelve información adicional
        intentamos mostrar un mensaje útil.
      */

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


      console.error(
        'Error Supabase:',
        response.status,
        texto
      );


      throw new Error(detalle);
    }


    /* =====================================================
       4. REGISTRO CORRECTO
    ===================================================== */

    if (contenido) {

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


    console.log(
      'Participación registrada correctamente:',
      {
        codigo,
        carrera,
        sesion_id: sesion.id
      }
    );

  }

  catch (error) {

    console.error(
      'Error al registrar participación:',
      error
    );


    mostrarMensaje(
      error.message ||
      'No fue posible completar el registro.'
    );

  }

  finally {

    /*
      Si el formulario continúa visible,
      habilitamos nuevamente el botón.

      Si el registro fue correcto, el contenido
      ya fue reemplazado por la confirmación.
    */

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
   INICIAR APLICACIÓN
========================================================= */

async function iniciar() {

  try {

    const sesion =
      await obtenerSesion();


    /* -------------------------------------------------------
       SESIÓN CERRADA
    ------------------------------------------------------- */

    if (!sesion.activa) {

      mostrarSesionFinalizada();

      return;
    }


    /* -------------------------------------------------------
       SESIÓN ACTIVA
    ------------------------------------------------------- */

    if (!formulario) {

      throw new Error(
        'No se encontró el formulario de registro.'
      );
    }


    formulario.addEventListener(
      'submit',
      registrarParticipacion
    );

  }

  catch (error) {

    console.error(
      'Error al iniciar la actividad:',
      error
    );


    mostrarMensaje(
      'No fue posible conectar con la actividad. Intenta nuevamente.'
    );
  }
}


/* =========================================================
   EJECUTAR
========================================================= */

iniciar();