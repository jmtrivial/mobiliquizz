# mobiliquizz

Un quizz pour reconnaître les villes suivant leurs infrastructures de mobilité. Source d'inspiration: [ce tweet de Appéré Yveline](https://twitter.com/PourkwoiPaww/status/1484915052251693056?s=20).

L'outil est encore en cours de développement, accessible à l'adresse https://jmtrivial.github.io/mobiliquizz/web/

## Comment ça fonctionne

À chaque connexion, une ville est tirée au sort parmi les villes du pays, en privilégiant les villes à grand nombre d'habitants. 
Les données cartographiques de la ville dédiée à la mobilité cyclable depuis OpenStreetMap sont récupérées puis affichées à l'utilisateur, sans autre contexte que la forme de ces tracés.
L'utilisateur doit alors deviner le nom de la ville.

Le jeu propose trois niveaux:

* Niveau facile: les 10 plus grandes villes de France
* Niveau intermédiaire: les 50 plus grandes villes de France
* Niveau difficile: les villes de moins de 50 000 habitants

## Variations possibles

* proposer de choisir la pays
* afficher le nombre d'habitants de la ville pour aider, ou sa surface
* proposer 4 solutions (à la manière de **qui veut gagner des millions**) pour un mode facile

## Ingrédients de l'implémentation

* le fichier de la [population légale 2019](https://www.insee.fr/fr/statistiques/6011070?sommaire=6011075) publiée par l'INSEE où il faudra ensuite convertir le code de la commune en quelque chose d'exploitable dans OSM
* utiliser un tirage aléatoire pondéré en fonction du nombre d'habitants.

## Ressources et liens

Pour inspiration: 

* les [tags utilisés par CyclOSM](https://github.com/cyclosm/cyclosm-cartocss-style/blob/master/taginfo.json)
* une [requête overpass turbo](https://gist.github.com/CharlesNepote/9806b459d5f7ee671681e55b35cb0a81) assez élaborée

On aurait pu utiliser (mais en fait y'a plus simple):

* les [API Wikidata](https://www.wikidata.org/wiki/Wikidata:Data_access)
* la [liste des communes françaises de plus de 20000 habitants](https://www.wikidata.org/wiki/Q16967178) (ou [cet item](https://www.wikidata.org/wiki/Q2723600) ?). Mais ça ne retourne rien ?
* une requête SPARQL pour récupérer toutes les communes et avoir leur nombre d'habitants. Mais est-ce bien documenté?
