# AIMA Search Simulator - Santa Cruz

Este proyecto es un simulador visual interactivo que permite explorar algoritmos de búsqueda clásicos (A*, BFS, DFS) aplicados a la infraestructura vial de Santa Cruz de la Sierra, Bolivia.

##  Descripción
El simulador utiliza un grafo generado a partir de datos geográficos reales para visualizar cómo los agentes encuentran rutas óptimas o caminos entre dos puntos. Es una herramienta ideal para entender el comportamiento de algoritmos de inteligencia artificial.

##  Tecnologías Utilizadas
* **Frontend:** HTML5, CSS3, JavaScript (Vanilla).
* **Mapas:** [Leaflet.js](https://leafletjs.com/) para la renderización de mapas interactivos.
* **Backend/Data:** Python (con la librería `OSMnx`) para la extracción y procesamiento de datos de OpenStreetMap.
* **Algoritmos:** Implementación de estrategias de búsqueda (A*, Breadth-First Search, Depth-First Search).

##  Estructura del Proyecto
* `index.html`: Estructura principal de la interfaz y el mapa.
* `script.js`: Lógica de los algoritmos de búsqueda y control del mapa.
* `style.css`: Estilos para la interfaz oscura (dark mode).
* `generar_mapa.py`: Script de Python utilizado para extraer el grafo de calles de Santa Cruz y exportarlo a JSON.
* `santa_cruz.json`: Datos del grafo procesados (nodos, coordenadas y conexiones).

##  Cómo ejecutarlo
1. **Visualización:** Al ser una aplicación basada en web, simplemente abre el archivo `index.html` en tu navegador.
2. **Generación de datos:** Si deseas actualizar el área del mapa o extraer nuevos datos, asegúrate de tener instalado `osmnx` y ejecuta:
   ```bash
   python generar_mapa.py
