// --- CONFIGURACIÓN DEL MAPA ---
const map = L.map('map', { zoomControl: false }).setView([-17.7833, -63.1821], 14);
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(map);

let nodes = {};
let startNode = null, endNode = null;
let exploracionGroup = L.layerGroup().addTo(map);
let rutaFinalGroup = L.layerGroup().addTo(map);

// Carga de datos con validación
fetch('santa_cruz.json')
    .then(r => r.json())
    .then(data => {
        nodes = data;
        console.log("Grafo cargado:", Object.keys(nodes).length, "nodos.");
    });

// Distancia Euclidiana (Heurística)
const dist = (id1, id2) => {
    if (!nodes[id1] || !nodes[id2]) return Infinity;
    return Math.hypot(nodes[id1].lat - nodes[id2].lat, nodes[id1].lng - nodes[id2].lng);
};

// --- INTERACCIÓN ---
map.on('click', (e) => {
    const ids = Object.keys(nodes);
    if (ids.length === 0) return;

    const closest = ids.reduce((a, b) => {
        const dA = Math.hypot(nodes[a].lat - e.latlng.lat, nodes[a].lng - e.latlng.lng);
        const dB = Math.hypot(nodes[b].lat - e.latlng.lat, nodes[b].lng - e.latlng.lng);
        return dA < dB ? a : b;
    });

    if (!startNode) {
        startNode = closest;
        L.circleMarker([nodes[startNode].lat, nodes[startNode].lng], {color:'#46b780', fillOpacity:1, radius:8}).addTo(map);
        document.getElementById('status').innerText = "Selecciona Destino";
    } else if (!endNode) {
        endNode = closest;
        L.circleMarker([nodes[endNode].lat, nodes[endNode].lng], {color:'#ff4d4d', fillOpacity:1, radius:8}).addTo(map);
        document.getElementById('status').innerText = "Listo para buscar";
    }
});

// --- ALGORITMO A* / BFS / DFS ---
async function ejecutarAIMA() {
    if (!startNode || !endNode) return;
    
    exploracionGroup.clearLayers();
    rutaFinalGroup.clearLayers();
    
    const tipo = document.getElementById('algo').value;
    const speed = 101 - parseInt(document.getElementById('speed').value);
    
    let frontier = [startNode];
    let explored = new Set();
    let prev = {}; // Diccionario de padres para reconstruir ruta
    let gScore = {}; // Costo real desde el inicio
    let fScore = {}; // gScore + hScore (heurística)
    
    Object.keys(nodes).forEach(id => { 
        gScore[id] = Infinity; 
        fScore[id] = Infinity; 
    });
    
    gScore[startNode] = 0;
    fScore[startNode] = dist(startNode, endNode);

    document.getElementById('status').innerText = "Buscando...";
    let found = false;

    while (frontier.length > 0) {
        let curr;

        // Selección según algoritmo
        if (tipo === 'bfs') {
            curr = frontier.shift();
        } else if (tipo === 'dfs') {
            curr = frontier.pop();
        } else {
            // A*, UCS, Greedy
            frontier.sort((a, b) => {
                const valA = tipo === 'astar' ? fScore[a] : (tipo === 'ucs' ? gScore[a] : dist(a, endNode));
                const valB = tipo === 'astar' ? fScore[b] : (tipo === 'ucs' ? gScore[b] : dist(b, endNode));
                return valA - valB;
            });
            curr = frontier.shift();
        }

        if (curr === endNode) { found = true; break; }
        
        explored.add(curr);
        document.getElementById('nodeCount').innerText = explored.size;

        // IMPORTANTE: nodes[curr].adj contiene números, los convertimos a String
        for (let neighborNum of nodes[curr].adj) {
            let neighbor = String(neighborNum); // CORRECCIÓN DE TIPOS

            if (explored.has(neighbor)) continue;

            let tentativeG = gScore[curr] + dist(curr, neighbor);

            if (tentativeG < gScore[neighbor]) {
                prev[neighbor] = curr;
                gScore[neighbor] = tentativeG;
                fScore[neighbor] = gScore[neighbor] + dist(neighbor, endNode);

                if (!frontier.includes(neighbor)) {
                    frontier.push(neighbor);
                    
                    // Dibujo de la exploración (Línea hacia el nuevo nodo)
                    L.polyline([[nodes[curr].lat, nodes[curr].lng], [nodes[neighbor].lat, nodes[neighbor].lng]], {
                        color: getColor(tipo), weight: 2, opacity: 0.4
                    }).addTo(exploracionGroup);

                    if (neighbor === endNode) { found = true; break; }
                }
            }
        }
        if (found) break;
        if (explored.size % 10 === 0) await new Promise(r => setTimeout(r, speed));
    }

    if (found) {
        document.getElementById('status').innerText = "Ruta encontrada";
        dibujarRutaFinal(prev);
    } else {
        document.getElementById('status').innerText = "No se encontró ruta";
    }
}

function dibujarRutaFinal(prevMap) {
    let currId = endNode;
    let pathCoords = [];
    
    // Recorrer hacia atrás
    while (currId) {
        pathCoords.push([nodes[currId].lat, nodes[currId].lng]);
        if (currId === startNode) break;
        currId = prevMap[currId];
    }

    if (pathCoords.length > 1) {
        const poly = L.polyline(pathCoords, { color: '#ff4d4d', weight: 6, opacity: 1 }).addTo(rutaFinalGroup);
        map.fitBounds(poly.getBounds(), { padding: [50, 50] });
    }
}

function getColor(t) {
    const c = { 'astar':'#46b780', 'ucs':'#9b59b6', 'greedy':'#e67e22', 'bfs':'#3498db', 'dfs':'#f1c40f' };
    return c[t] || '#fff';
}

document.getElementById('startBtn').onclick = ejecutarAIMA;