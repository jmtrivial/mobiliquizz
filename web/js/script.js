// nombre de bonnes réponses avant de monter d'un niveau
nb_correct_avant_changement = 3;
// nombre de mauvaises réponses avant de descendre d'un niveau
nb_erreur_avant_changement = 3;


function get_max_number(jsondata) {
    return jsondata.reduce((max, p) => p[1] > max ? p[1] : max, jsondata[0][1]);
}

function select_city(jsondata) {    
    const max_value = get_max_number(jsondata);
    const r_value = Math.random() * max_value;
    
    for (let i = 0; i < jsondata.length; ++i) {
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

function get_dir_name() {
    var parts = window.location.pathname.split("/");
    if (parts[parts.length - 1].indexOf('.') > -1) {
        return parts.slice(0, -1).join("/")
    }
    return window.location.pathname;
}


function get_data_set_interface_question(city, niveau, question, courant) {
    const request = new XMLHttpRequest();
    const url = get_dir_name() + "/data/" + city + "/niveau" + niveau + "-question" + courant + ".json";
    request.open('GET', url, true);
    request.setRequestHeader('Content-type', 'application/json');   
    
    request.addEventListener("load", function() {

        const idProcess = window.idProcess;
        const response = JSON.parse(request.response);
        const elements = response.elements;
        const nodes = get_nodes(elements);
        
        var color = "#f2d055";
        if (courant == 2)
            color = "#ab933c";
        else if (courant == 3)
            color = "#f62afd";

        // create polylines
        for(var i = 0; i != elements.length; ++i) {
            latlng = [];
            if (elements[i].type == "way") {
                for(var j = 0; j != elements[i].nodes.length; ++j) {
                    latlng.push(nodes[elements[i].nodes[j]]);
                }
                layer = L.polyline(latlng, { color: color });
            }
            else if (elements[i].type == "node") {
                latlng = [elements[i], elements[i]];
                layer = L.polyline(latlng, { color: color });
            }
            window.layers.push(layer);
        }
        
        if (courant == 1 || window.use_previous) {
            window.layergroup = L.featureGroup(window.layers).addTo(window.mmap).bringToBack();
            if (courant == 1)
                window.mmap.fitBounds(window.layergroup.getBounds());
        }
        else
            get_data_set_interface_question(city, niveau, question, courant - 1);
    });
    request.send();

}

function get_data_set_interface(city, niveau, question) {
    if (!window.mmap) {
        window.mmap = L.map('map');
    }
    else {
        if (!window.use_previous) {
            window.mmap.eachLayer(function(layer) {
                if (!!layer.toGeoJSON) {
                    window.mmap.removeLayer(layer);
                }
            });
        }
    }
    window.layers = [];

    get_data_set_interface_question(city, niveau, question, question);
}

function set_niveau_affiche(numero) {
    const niveaux = document.querySelectorAll("#niveaux span");
    niveaux.forEach(function(niveau) {
        niveau.classList.remove("selected");
    });

    const niveauxSel = document.querySelectorAll("#niveaux #niveau" + numero);
    niveauxSel.forEach(function(niveau) {
        niveau.classList.add("selected");
    });
}

function set_indice_affiche(indice) {
    const niveaux = document.querySelectorAll("#indices p");
    niveaux.forEach(function(niveau) {
        niveau.classList.remove("selected");
    });

    const niveauxSel = document.querySelectorAll("#indices #indice" + indice);
    niveauxSel.forEach(function(niveau) {
        niveau.classList.add("selected");
    });

}

function display_next_question() {
    // TODO: s'il y a dans l'adresse un paramètre de ville, on l'utilise et on reset l'url
    afficher_entete_jeu();
    window.ville = select_city(window.jsondata);
    window.use_previous = false;
    get_data_set_interface(window.ville, window.niveau, window.indice);
}

function set_indice(indice) {
    window.indice = indice;
    set_indice_affiche(indice);
}

function init_question(indice) {
    set_indice(indice);
    display_next_question();
}



function init_niveau(jsondata, numero) {

    window.nb_correct_dans_niveau = 0;
    window.nb_erreur_dans_niveau = 0;
    window.jsondata = jsondata;

    window.niveau = numero;
    set_niveau_affiche(numero);
    
    // TODO: s'il y a dans l'adresse un paramètre d'indice, on l'utilise et on reset l'url

    init_question(1);
}

function charger_niveau(numero) {
    if (window.niveau == numero)
        init_niveau(window.jsondata, numero);
    else {
        fetch('data/france-niveau' + numero + '.json')
            .then(response => {
            return response.json();
            })
            .then(jsondata => init_niveau(jsondata, numero));
    }
}

function cacher_toutes_entetes() {
    const question = document.getElementById("question");
    question.style.display = "none";

    const reponses = document.querySelectorAll("#head .reponse");
    reponses.forEach(function(entry) {
        entry.style.display = "none";
    });

}

function afficher_entete_jeu() {
    cacher_toutes_entetes();
    const question = document.getElementById("question");
    question.style.display = "block";
    document.getElementById("oui").focus();
}

function set_ville_response() {
    const reponses = document.querySelectorAll(".reponse-ville");
    reponses.forEach(function(entry) {
        entry.innerHTML = window.ville;
    });
}

function afficher_reponse_non() {
    cacher_toutes_entetes();

    set_ville_response();

    const reponsenon = document.getElementById("reponse_non_solution");
    reponsenon.style.display = "block";
}

function affichage_non() {
    if (window.indice != 3) {
        set_indice(window.indice + 1);
        window.use_previous = true;
        get_data_set_interface(window.ville, window.niveau, window.indice);
    }
    else {
        afficher_reponse_non();
    }
}

function affichage_oui() {
    cacher_toutes_entetes();

    const proposition = document.getElementById("proposition");
    proposition.value = "";

    const formulaire = document.getElementById("formulaire_oui");
    formulaire.style.display = "block";

    proposition.focus();
    proposition.select();

}

function simplifier_nom(nom) {
    return nom.toLowerCase().trim().replace(/[\t-]/g, " ").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function afficher_oui_correct() {
    cacher_toutes_entetes();
    const formulaire = document.getElementById("formulaire_oui_correct");
    formulaire.style.display = "block";

    window.nb_correct_dans_niveau += 1;
    window.nb_erreur_dans_niveau = 0;

    const msg = document.getElementById("nb_bonnes_reponses");
    if (window.nb_correct_dans_niveau == 1) {
        msg.innerHTML = "Une bonne réponse, c'est un bon début !";
    }
    else {
        txt = window.nb_correct_dans_niveau + " bonnes réponses";
        if (window.niveau == 3)
            msg.innerHTML = txt + ", impressionnant !";
        else if (window.nb_correct_dans_niveau == nb_correct_avant_changement)
        msg.innerHTML = txt + ", on passe au niveau suivant.";
        else if (window.nb_correct_dans_niveau == nb_correct_avant_changement - 1)
            msg.innerHTML = txt + ", plus qu'une bonne réponse et on passe au niveau suivant.";
        else
            msg.innerHTML = txt + ", on ne lâche rien.";
    }

    document.getElementById("continuer_correct").focus();
}

function afficher_oui_erreur() {
    cacher_toutes_entetes();
    const formulaire = document.getElementById("formulaire_oui_erreur");
    formulaire.style.display = "block";

    window.nb_erreur_dans_niveau += 1;

    const msg = document.getElementById("nb_mauvaises_reponses");
    if (window.nb_erreur_dans_niveau == 1) {
        msg.innerHTML = "Attention, première erreur !";
    }
    else {
        txt = window.nb_erreur_dans_niveau + " erreurs consécutives";
        if (window.niveau == 1)
            msg.innerHTML = txt + ", ça fait beaucoup";
        else if (window.nb_erreur_dans_niveau == nb_erreur_avant_changement)
        msg.innerHTML = txt + ", on revient au niveau précédent.";
        else if (window.nb_erreur_dans_niveau == nb_erreur_avant_changement - 1)
            msg.innerHTML = txt + ", encore une et on revient au niveau précédent.";
        else
            msg.innerHTML = txt + ", attention...";
    }


    document.getElementById("continuer_erreur").focus();

}

function verifier_reponse() {
    const proposition = document.getElementById("proposition");
    const reponse = proposition.value;

    set_ville_response();
    if (simplifier_nom(reponse) == simplifier_nom(window.ville)) {
        afficher_oui_correct();
    }
    else {
        afficher_oui_erreur();
    }
}

function nouvelle_partie() {
    charger_niveau(window.niveau - 1);
}

function continuer_partie_correct() {
    if (window.nb_correct_dans_niveau == nb_correct_avant_changement && window.niveau != 3) {
        charger_niveau(window.niveau + 1);
    }
    else {
        init_question(1);
    }
}

function continuer_partie_erreur() {
    if (window.nb_erreur_dans_niveau == nb_erreur_avant_changement && window.niveau != 1) {
        window.niveau -= 1;
        charger_niveau(window.niveau);
    }
    else {
        init_question(1);
    }
}

window.onload = function(){
    const oui = document.getElementById("oui");
    oui.onclick = affichage_oui;
    const non = document.getElementById("non");
    non.onclick = affichage_non;
    
    const rejouer = document.getElementById("rejouer");
    rejouer.onclick = nouvelle_partie;
    const continuer_correct = document.getElementById("continuer_correct");
    continuer_correct.onclick = continuer_partie_correct;
    const continuer_erreur = document.getElementById("continuer_erreur");
    continuer_erreur.onclick = continuer_partie_erreur;
    
    const proposer = document.getElementById("proposer");
    proposer.onclick = verifier_reponse;

    // TODO: s'il y a dans l'adresse un paramètre de niveau, on l'utilise et on reset l'url
    charger_niveau(1);
}
