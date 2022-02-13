#!/usr/bin/env python3
# coding: utf-8

import json
import os
import requests

# territoire de référence
territoire = "France"

# dossier de sortie
dir_sortie = "../web/data"

def telecharge_donnees(query, dossier_ville, nom_niveau, nom_question):
    server = "https://overpass.kumi.systems/api/interpreter"
    url = server + "?data=" + query
    r = requests.get(url, allow_redirects=True)
    fichier_question1 = dossier_ville + os.path.sep + nom_niveau + "-" + nom_question + ".json"
    with open(fichier_question1, 'wb') as f:
        f.write(r.content)

def prepare_donnees(nom_niveau):
    dossier, script = os.path.split(os.path.abspath(__file__))
    dossier_data = os.path.abspath(dossier  + os.path.sep + dir_sortie)
    fichier = dossier_data + os.path.sep + territoire.lower() + "-" + nom_niveau + ".json"
    with open(fichier, 'r') as outfile:
        data = json.load(outfile)
        # pour chaque ville
        for entry in data:
            ville = entry[0]
            print("Récupération des données de", ville)
            # créer le dossier s'il n'existe pas
            dossier_ville = dossier_data + os.path.sep + ville
            if not os.path.exists(dossier_ville):
                os.makedirs(dossier_ville)
            # récupérer les données (question 1)
            print(" - question 1")
            query_question1 = "[out:json][timeout:60];(area[\"name\"=\"" + ville + "\"][\"admin_level\"=\"8\"][\"ref:INSEE\"];\
                            way[\"highway\"=\"cycleway\"](area);\
                            way[\"cycleway:right\"=\"track\"](area);\
                            way[\"cycleway:left\"=\"track\"](area); \
                            way[\"cycleway:both\"=\"track\"](area); \
                            way[\"cycleway\"=\"track\"](area););out body;>;out skel qt;"
            telecharge_donnees(query_question1, dossier_ville, nom_niveau, "question1")
            # récupérer les données (question 2)
            print(" - question 2")
            query_question2 = "[out:json][timeout:60];(area[\"name\"=\"" + ville + "\"][\"admin_level\"=\"8\"][\"ref:INSEE\"];\
                            way[\"cycleway:right\"=\"lane\"](area);\
                            way[\"cycleway:left\"=\"lane\"](area); \
                            way[\"cycleway:both\"=\"lane\"](area); \
                            way[\"cycleway\"=\"lane\"](area););out body;>;out skel qt;"
            telecharge_donnees(query_question2, dossier_ville , nom_niveau, "question2")

            # récupérer les données (question 3)
            print(" - question 3")
            # Commenté: une approche qui récupère les voies de bus. Bon, ça donne trop d'indices, parce que des bus
            # passent par quasi toutes les rues
            #query_question3 = "[out:json][timeout:60];area[\"name\"=\"" + ville + "\"][\"admin_level\"=\"8\"][\"ref:INSEE\"]->.city;\
            #            relation[\"type\"=\"route\"][\"route\"~\"^(bus|subway|tram)$\"](area.city);->.routes; \
            #            way(r.routes)(area.city)->.ways; \
            #            (.ways;); out body; >; out skel qt;"
            query_question3 = "[out:json][timeout:60];area[\"name\"=\"" + ville + "\"][\"admin_level\"=\"8\"][\"ref:INSEE\"];\
                                (node[\"highway\"=\"bus_stop\"](area); \
                                node[\"railway\"=\"^(tram_stop|subway_entrance)$\"](area);) \
                                ;out body;>;out skel qt;"
            telecharge_donnees(query_question3, dossier_ville , nom_niveau, "question3")


print("Préparation des données")

prepare_donnees("niveau1")

prepare_donnees("niveau2")

prepare_donnees("niveau3")