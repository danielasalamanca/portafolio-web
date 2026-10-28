# Portafolio web · Daniela Salamanca Ríos

Sitio personal de diseño gráfico: editorial, branding, ilustración, packaging, digital, animación y tipografía.

🌐 **[danielasalamanca.cl](https://danielasalamanca.cl)**

## Stack

Sitio estático hecho a mano, sin framework, sin build y sin dependencias de npm.

- HTML, CSS y JavaScript vanilla
- Tipografías: [Adobe Fonts (Typekit)](https://fonts.adobe.com) y Google Fonts (Lexend Deca, Bricolage Grotesque)
- Íconos de la estela del inicio: [Phosphor Icons](https://phosphoricons.com) (MIT, ver `img/iconos/LICENSE.txt`)
- Imágenes en `.webp`, y algunos videos `.mp4`
- Hosting estático con dominio propio (archivo `CNAME`)

## Secciones

| Página | Archivo | Descripción |
| --- | --- | --- |
| Inicio | `index.html` | Intro animada, la palabra "Portafolio" con letras que caen y cambian de color al pasar el cursor, estela de íconos que deja el cursor y a "Dani", un personaje que reacciona (saluda, se sorprende, celebra, se duerme). |
| Trabajos | `proyectos/trabajos.html` | Mosaico con orden aleatorio en cada carga, categorías por color y vista de detalle de cada trabajo. |
| Sobre mí | `proyectos/about.html` | Presentación personal. |
| Contacto | `proyectos/contacto.html` | Datos de contacto. |
| Proyectos | `proyectos/*.html` | Una página por proyecto (`30udp`, `aaa`, `gsd`, `municipal`, `paae`, `plaquettes`, etc.). `proyecto-base.html` sirve de plantilla. |

`index2.html` solo redirige a `index.html`, e `index-anterior.html` guarda el inicio anterior. Igual con `proyectos/trabajos2.html` (redirige a `trabajos.html`) y `proyectos/trabajos-anterior.html` (listado anterior).

## Estructura

```
.
├── index.html            # Inicio
├── inicio2.css / .js     # Estilos y lógica del inicio (letras, estela, Dani)
├── trabajos2.css / .js   # Mosaico y detalle de trabajos v2
├── styles.css            # Estilos compartidos (header, páginas de proyecto, etc.)
├── script.js             # Intro, typewriter, física con Matter.js y utilidades
├── proyectos/            # Páginas de trabajos, sobre mí, contacto y cada proyecto
├── img/                  # Imágenes y videos de los proyectos
│   ├── inicio2/          # SVG de las letras del inicio y poses de Dani
│   └── iconos/           # Íconos SVG de la estela
├── CNAME                 # Dominio personalizado
└── .claude/launch.json   # Configuración del servidor local para previsualizar
```

## Correr en local

Basta con un servidor estático. Con Python (viene en macOS):

```bash
python3 -m http.server 8765
```

Luego abrir <http://localhost:8765>.

> Conviene usar un servidor y no abrir el HTML con doble clic: el inicio carga los SVG con `fetch`, que no funciona con `file://`.

## Cómo agregar un trabajo nuevo

1. Subir las imágenes (`.webp`) o videos a `img/`.
2. Crear la página del proyecto en `proyectos/` a partir de `proyecto-base.html`.
3. Agregar una tarjeta `.obra` en `proyectos/trabajos.html` con sus `data-*`:
   - `data-cats`: categorías separadas por espacio (`branding`, `editorial`, `ilustracion`, `packaging`, `digital`, `animacion`, `tipografia`)
   - `data-proporcion`: proporción de la imagen de portada
   - `data-media`: imágenes o videos del detalle, separados por coma
   - `data-año`: año del trabajo

## Notas

- Las animaciones respetan `prefers-reduced-motion`.
- Los CSS y JS se enlazan con `?v=...` para forzar que el navegador cargue la versión nueva. Si cambias un archivo, actualiza ese número en el HTML.
- Todos los textos del sitio están en español.

## Publicación

Cada push a `main` actualiza el sitio. El dominio `danielasalamanca.cl` está definido en `CNAME`.

© Daniela Salamanca Ríos. Todos los derechos reservados sobre los trabajos y las imágenes.
