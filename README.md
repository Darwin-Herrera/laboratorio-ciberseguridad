# Laboratorio Semana 3 — Informática Aplicada

Simulación educativa controlada de ingeniería social. El sitio **no solicita ni almacena datos personales reales**.

## 1. Crear Supabase
1. Cree un proyecto nuevo en Supabase.
2. Abra **SQL Editor**.
3. Copie y ejecute `supabase/setup.sql` completo.
4. En **Project Settings > API**, copie `Project URL` y la clave `anon/public`.
5. Abra `js/config.js` y reemplace los dos valores indicados.

> No coloque `service_role` en GitHub ni en el navegador. Este proyecto solo usa la clave anon/public y RLS.

## 2. Probar antes de publicar
En Supabase ejecute:

```sql
update public.sesiones set activa=true where slug='semana-3-2026';
```

Abra `index.html` mediante un servidor local (por ejemplo Live Server de VS Code). Registre un código ficticio como `A01` y revise `profesor.html`.

## 3. Publicar en GitHub Pages
Suba la carpeta completa a un repositorio. En GitHub active **Settings > Pages > Deploy from a branch**, rama `main`, carpeta `/root`.

La URL principal será la que debe convertir en QR. `profesor.html` muestra los resultados ficticios.

## 4. Antes de la clase
Limpie pruebas anteriores:

```sql
delete from public.respuestas
where sesion_id=(select id from public.sesiones where slug='semana-3-2026');
```

Abra la sesión:

```sql
update public.sesiones set activa=true where slug='semana-3-2026';
```

Proyecte el QR durante aproximadamente 3 minutos. Los estudiantes deben utilizar únicamente códigos ficticios asignados por usted.

## 5. Cerrar y revelar
Ejecute:

```sql
update public.sesiones set activa=false where slug='semana-3-2026';
```

Luego proyecte `profesor.html` y discuta autoridad, contexto, urgencia, confianza y verificación.

## Seguridad del laboratorio
- No solicite nombres, correos, contraseñas, teléfonos, identidad, tarjetas ni datos privados.
- No capture IP, geolocalización, cookies ni identificadores de dispositivo.
- No use logotipos/pantallas de autenticación para inducir a entregar credenciales.
- `profesor.html` es deliberadamente un panel de demostración con datos ficticios. La política SELECT pública existe solo por ese motivo.
- Si posteriormente desea almacenar información real, debe cambiar el diseño y usar autenticación/roles adecuados.
