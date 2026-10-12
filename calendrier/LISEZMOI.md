# Calendrier moderne v3.0 — script Adobe Illustrator

`calendrier_moderne.jsx` génère un calendrier annuel moderne et entièrement personnalisable dans Adobe Illustrator (CS6 → 2026). Le script est écrit en ExtendScript (ES3).

## Installation
- **Utilisation ponctuelle :** *Fichier > Scripts > Autre script…* (Ctrl/Cmd + F12), puis choisissez `calendrier_moderne.jsx`.
- **Installation permanente :** copiez le fichier dans le dossier des scripts, puis redémarrez Illustrator :
  - Windows : `C:\Program Files\Adobe\Adobe Illustrator <version>\Presets\fr_FR\Scripts\`
  - macOS : `/Applications/Adobe Illustrator <version>/Presets/fr_FR/Scripts/`
  - (remplacez `fr_FR` par la langue de votre installation, par ex. `en_US`)  
  Le script apparaît alors dans *Fichier > Scripts*.

## La boîte de dialogue (6 onglets)

### Général
Année (2027 par défaut, 1583–9999), premier jour de la semaine (lundi/dimanche), langue des mois et jours (Français/English), affichage de l'année, nom du mois en majuscules.

### Thème & couleurs
- **21 thèmes prédéfinis :** Minuit, Pastel, Nature, Monochrome, Océan, Coucher de soleil, Sahara, Lavande, Néon, Corail, Forêt, Café, Bonbon, Glacier, Rétro 70s, Luxe noir & or, Terracotta, Menthe, Bordeaux, Cyber, Ardoise.
- **7 couleurs modifiables :** Fond, Titre, Texte, Accent, Week-end, En-tête jours, Décor. Saisissez un code hexadécimal (pastille mise à jour en direct) ou cliquez sur **Choisir…** pour ouvrir le sélecteur (`$.colorPicker`).
- Modifier une couleur active automatiquement le mode **« Personnalisé »**. Une bande d'aperçu montre les 7 couleurs.
- **Enregistrer / Supprimer / Importer / Exporter :** les thèmes enregistrés (marqués ★) sont stockés dans `Folder.userData/CalendrierModerne/themes.json` :
  - Windows : `%APPDATA%\CalendrierModerne\themes.json`
  - macOS : `~/Library/Application Support/CalendrierModerne/themes.json`
  ```json
  [ {"name": "Mon thème", "bg": "#141B3A", "title": "#FFFFFF", "text": "#E6E8F0",
     "accent": "#FF6B5E", "weekend": "#FF8A7A", "header": "#8C96BE", "decor": "#FF6B5E"} ]
  ```

### Mise en page
- **Mois par page :** 1 (12 pages), 2 (6 pages), 3 (4 pages), 4 (3 pages), 6 (2 pages) ou 12 (affiche unique). Le format change automatiquement (A4, A3 pour 6 mois, A2 pour 12 mois) ; vous pouvez ensuite le modifier.
- **Colonnes :** Automatique, 1, 2, 3, 4, 6 ou 12. Le nombre de lignes est calculé automatiquement.
- **Largeur de colonne** en mm (0 = auto ; la grille est alors centrée), **gouttières** horizontale et verticale en mm.
- **Titre de page** (grande année + « CALENDRIER ») lorsque la page contient plusieurs mois.
- **Style des mois :**
  - *Grille classique* (7 colonnes) ;
  - *Agenda – liste verticale* : un jour par ligne, avec le nom du jour et une ligne d'écriture ;
  - *Agenda – bande horizontale* : tous les jours sur une seule rangée, initiale du jour au-dessus.
- **Format** (A5, A4, A3, A2, A1, Letter, carré 210 ou 300 mm, ou personnalisé en mm), orientation, marges.
- **Zone de notes** facultative sous chaque mois (hauteur en % et titre réglables).

### Grille & cases
- **Style des cases :** aucun, cases, cases arrondies, cercles, soulignement ou points.
- Lignes de grille, ligne de séparation sous l'en-tête, numéros de semaine ISO 8601, jours des mois adjacents grisés.
- Mise en évidence des week-ends : pastille arrondie, cercle, colonne entière ou texte seulement.
- Rayon des coins (cartes des mois, cases, notes).

### Typographie
- Polices des titres et du texte, à saisir sous leur nom PostScript (ex. `Montserrat-Bold`). En cas d'absence, le script se rabat sur Arial-BoldMT / ArialMT / Helvetica.
- Alignement du titre (gauche, centre, droite) et tailles en points (0 = automatique).

### Décor
- **15 styles :** Cercles, Vagues, Blobs organiques, Lignes géométriques, Triangles, Hexagones, Confettis, Points / pois, Rayures diagonales, Zellige / arabesque (étoiles à 8 branches), Étoiles, Feuilles stylisées, Montagnes, Soleil / rayons, Bordure cadre. Le choix **Aucun** désactive le décor.
- **Style combiné :** un second style se superpose au premier.
- **Décor saisonnier automatique :** un décor différent pour chaque mois (hiver : étoiles et hexagones ; printemps : feuilles, pois et blobs ; été : soleil et vagues ; automne : montagnes, feuilles et rayures ; décembre : étoiles et confettis).
- **Appliquer à :** automatique (la page quand il y a un seul mois par page, sinon chaque carte de mois), la page, chaque mois, ou les deux.
- **Position :** haut, bas, coins ou tout.
- **Densité** (curseur de 1 à 10), **taille** (%), **opacité** (%), **couleur** (accent, décor ou couleurs aléatoires du thème).
- **Graine aléatoire :** une même graine reproduit exactement le même décor. Le bouton **Nouvelle graine** en tire une nouvelle.
- Barre d'accent au-dessus du titre, fond en dégradé.

## Organisation du document
- **Un calque par page :** « 01 - Janvier » (un mois par page), « Page 1 - Janvier à Mars », ou « Affiche 2027 ».
- **Trois sous-calques par page :**
  - **Fond :** fond de page et cartes des mois ;
  - **Décor :** un groupe masqué par zone (« Décor - Page 1 », « Décor - Janvier »…), avec un sous-groupe par style ;
  - **Contenu :** un groupe par mois, avec les sous-groupes *En-tête*, *Jours semaine*, *Cases*, *Jours*, *Lignes de grille*, *Numéros de semaine* et *Notes*.
- **Masques :** tout le décor est découpé (masque d'écrêtage) à la page ou à la carte du mois.
- **Plans de travail :** ils portent le nom du mois ou de la page.
- **Couleurs :** le document est en RVB ; pour l'impression : *Fichier > Mode colorimétrique du document > CMJN*.

## Remarques
- Années bissextiles, jours de la semaine et semaines ISO sont calculés par algorithme (calendrier grégorien) et vérifiés sur les années 1600 à 2399.
- Une densité élevée combinée à une petite taille (pois, hexagones, zellige) peut créer des dizaines de milliers d'objets : la génération est alors plus lente.
- Pour connaître le nom PostScript d'une police, essayez des noms comme `Poppins-SemiBold` ou consultez le gestionnaire de polices de votre système.
