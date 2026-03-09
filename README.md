# pupusas.beta

## Descripción
Una aplicación web minimalista diseñada para tomar pedidos de pupusas de forma rápida, organizar órdenes por persona y calcular subtotales y totales automáticamente. 

## Objetivo
Eliminar la complejidad de tomar órdenes compartidas en papel o aplicaciones de mensajería, ofreciendo una interfaz limpia (modo oscuro OLED) y rápida que funcione completamente offline en cualquier dispositivo.

## Tecnologías (Tech Stack)
- **HTML5** (Estructura semántica)
- **CSS3 Vanilla** (Módulos separados, variables CSS, animaciones sin dependencias)
- **JavaScript Moderno** (ES6+, sin compiladores ni frameworks pesados)
- **Web Storage API** (`localStorage` para persistencia de datos)

## Estructura del Proyecto
```text
pupusas-app/
├── README.md
├── .gitignore
└── src/
    ├── index.html
    ├── css/
    │   ├── variables.css
    │   ├── base.css
    │   ├── components.css
    │   └── utilities.css
    └── js/
        └── main.js
```

## Instalación
El proyecto no requiere procesos de compilación (build steps) ni dependencias externas (Node.js/NPM).

1. Clona el repositorio:
   ```bash
   git clone https://github.com/iKennedy55/pupasapp.git
   ```
2. No es necesario instalar nada más.

## Uso
1. Navega a la carpeta `src/`.
2. Abre el archivo `index.html` haciendo doble clic para cargarlo directamente en tu navegador web preferido.
3. Comienza creando una "Nueva Orden", establece la cantidad de personas y selecciona las especialidades de pupusas para cada una.
4. Usa el área de ajustes (ícono superior derecho) para editar o agregar especialidades y sus precios.

## Notas y Limitaciones
- **Persistencia de Datos:** Toda la información (órdenes guardadas, especialidades customizadas) se guarda localmente en el navegador usando `localStorage`. Si borras los datos de navegación o usas modo incógnito, perderás esta información.
- **Sincronización:** Debido a su naturaleza *Client-Side offline*, no hay cuentas de usuario ni sincronización en la nube entre diferentes dispositivos.
- **Ejecución Local:** La app está diseñada para funcionar mediante el protocolo `file://` (doble clic) para máxima simplicidad.
