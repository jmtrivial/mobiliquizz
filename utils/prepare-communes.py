#!/usr/bin/env python3
# coding: utf-8

import requests
import tempfile
from zipfile import ZipFile
import csv
import os
import re
from itertools import accumulate
import json
import math

# Paramètre du script: taille des communes à garder
min_population = 50000

# territoire de référence
territoire = "France"

# dossier de sortie
dir_sortie = "../web/data"

# opendata population légale 2019
url = "https://www.insee.fr/fr/statistiques/fichier/6011070/ensemble.zip"
r = requests.get(url, allow_redirects=True)

# téléchargement comme un fichier temporaire
print("téléchargement des données population")
zfile = tempfile.NamedTemporaryFile(suffix = "zip")
zfile.write(r.content)



filename_communes = "donnees_communes.csv"
filename_metadonnees = "metadonnees_communes.csv"



data = []
with tempfile.TemporaryDirectory() as tmpdirname:
    with ZipFile(zfile.name, 'r') as zipObj:
        # récupération de la liste des communes de plus de min_population habitants
        print("extraction du fichier de données des communes")
        zipObj.extract(member = filename_communes, path = tmpdirname, pwd=None)
        col_population = 5  # colonnes à considérer
        col_commune = 2
        with open(tmpdirname + os.path.sep + filename_communes, newline='') as csvfile:
            linereader = csv.reader(csvfile, delimiter=';', quotechar='|')
            first=True
            for row in linereader:
                if first:
                    first = False
                else:
                    data.append([row[col_commune], int(row[col_population])])

        # récupération des noms des communes
        print("extraction du fichier des noms de communes")
        zipObj.extract(member = filename_metadonnees, path = tmpdirname, pwd=None)
        print("chargement du fichier")
        col_meta_commune = 2 # colonnes à considérer
        col_meta_nom = 3
        nom = {}
        with open(tmpdirname + os.path.sep + filename_metadonnees, newline='') as csvfile:
            linereader = csv.reader(csvfile, delimiter=';', quotechar='|')
            first=True
            for row in linereader:
                if first:
                    first = False
                else:
                    nom[row[col_meta_commune]] = row[col_meta_nom]
                    
        data = [[nom[d[0]]] + d[1:] for d in data]

print("fusion des arrondissements")
# fusion des communes avec arrondissements
def fusion_arrondissements(data, nom):
    recherche = re.compile(nom + " [0-9]+e[r]* Arrondissement")
    dedans = [ d for d in data if recherche.match(d[0]) ]
    dehors = [ d for d in data if not recherche.match(d[0]) ]
    
    return [ [nom, sum([d[1] for d in dedans]) ]] + dehors

data = fusion_arrondissements(data, "Paris")
data = fusion_arrondissements(data, "Marseille")

print("filtrage des données")
# filtrage des communes suivant leur taille (on ne garde que les plus grosses)
data = [ d for d in data if d[1] >= min_population ]

# on applique un log pour réduire l'influence des grandes villes dans le tirage au sort
data = [ [d[0], d[1] ** (8/10)] for d in data]

# ajout de la somme cummulée
cumul = list(accumulate([d[1] for d in data]))
data = [[d[0] + ", " + territoire, c] for d, c in zip(data, cumul)]


dossier, script = os.path.split(os.path.abspath(__file__))
dossier_data = os.path.abspath(dossier  + os.path.sep + dir_sortie)
# création du dossier cible
if not os.path.exists(dossier_data):
    os.makedirs(dossier_data)

# écriture dans un fichier json
sortie_complete = dossier_data + os.path.sep + territoire.lower() + "-" + str(min_population) + ".json"
print("écriture du résultat dans le fichier", sortie_complete)

with open(sortie_complete, 'w') as outfile:
    json.dump(data, outfile)




