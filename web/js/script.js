function get_max_number(jsondata) {
    return jsondata.reduce((max, p) => p[1] > max ? p[1] : max, jsondata[0][1]);
}

function select_city(jsondata) {
    // TODO: utiliser l'URL pour permettre le copier/coller
    // des énigmes:
    // - si l'url contient un nombre, on l'utilise et on n'en
    //   tire pas un nouveau au hasard.
    // - si l'url ne contient pas de nombre, on en tire un au
    //   sort et on change l'url
    
    const max_value = get_max_number(jsondata);
    const r_value = Math.random() * max_value;
    
    for (let i = 0; i < jsondata.length - 1; ++i) {
        if (jsondata[i][1] >= r_value) {
            return jsondata[i][0];
        }
    }
}

function get_nodes(elements) {
    var result = {};

    for(var i = 0; i != elements.length; ++i) {
        if (elements[i].type == "node") {
            result[elements[i].id] = new L.LatLng(elements[i].lat, elements[i].lon);
        }
    }

    return result;
}


function get_data_set_interface(city) {
    
    // solution sans nominatim, sans doute pas parfaite
    const query = "[out:json][timeout:25];(area[\"name\"=\"" + city + "\"];way[\"highway\"=\"cycleway\"](area););out body;>;out skel qt;";
    const server = "https://overpass.kumi.systems/api/interpreter";

    const request = new XMLHttpRequest();
    
    console.log(server + "?data=" + encodeURIComponent(query));
    request.open('GET', server + "?data=" + encodeURIComponent(query), true);
    request.setRequestHeader('Content-type', 'application/json');   
    
    request.addEventListener("load", function() {

        const idProcess = window.idProcess;
        const response = JSON.parse(request.response);
        const elements = response.elements;
        const nodes = get_nodes(elements);
        
        window.map = L.map('map');
        window.layers = [];
        
        // create polylines
        for(var i = 0; i != elements.length; ++i) {
            if (elements[i].type == "way") {
                latlng = [];
                for(var j = 0; j != elements[i].nodes.length; ++j) {
                    latlng.push(nodes[elements[i].nodes[j]]);
                }
                layer = L.polyline(latlng, { color: "#f2d055" });
                window.layers.push(layer);
            }
        }
        
        window.layergroup = L.featureGroup(window.layers).addTo(window.map);
        window.map.fitBounds(window.layergroup.getBounds());
    });
    request.send();

}



window.onload = function(){
    fetch('data/france-50000.json')
        .then(response => {
        return response.json();
        })
        .then(jsondata => get_data_set_interface(select_city(jsondata)));
}
