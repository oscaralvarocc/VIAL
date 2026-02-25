import osmnx as ox
import json

# Centro: Catedral de Santa Cruz
centro = (-17.7833, -63.1821)
print("Descargando mapa... esto puede tardar un minuto.")
# Aumentamos a 4000m para tener más calles como en el video
G = ox.graph_from_point(centro, dist=4000, network_type='drive')

nodes_data = {}
for node, data in G.nodes(data=True):
    nodes_data[node] = {
        "lat": data['y'],
        "lng": data['x'],
        "adj": list(G.neighbors(node))
    }

with open('santa_cruz.json', 'w') as f:
    json.dump(nodes_data, f)

print("✅ 'santa_cruz.json' generado.")