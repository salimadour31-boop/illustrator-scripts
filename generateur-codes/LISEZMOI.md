# Générateur de codes vectoriels pour Adobe Illustrator — v2

`GenerateurCodes.jsx` est un script ExtendScript (ES3) qui génère des **QR codes et codes-barres 100 % vectoriels**
dans le document Illustrator actif (un document RVB est créé s'il n'y en a aucun).
Les encodeurs sont intégrés : **aucune connexion Internet, aucun plug-in**.

## Lancement
*Fichier > Scripts > Autre script…* → `GenerateurCodes.jsx` (ou copie dans `Presets/<langue>/Scripts` pour l'avoir dans le menu).

## Symbologies
| Type | Détails |
|---|---|
| QR Code | Versions 1-40, correction L/M/Q/H, mode numérique / alphanumérique / octets UTF-8 automatique, masque par pénalité minimale (ou forcé 0-7), version minimale, zone de silence (≥ 2, 4 conseillés) |
| EAN-13 / EAN-8 / UPC-A | Clé calculée si absente, vérifiée si fournie (l'erreur indique la clé attendue) |
| Code 128 | ASCII 0-127, jeux A/B/C automatiques, SHIFT, modulo 103 |
| Code 39 | 0-9 A-Z espace - . $ / + %, ratio 3:1 |
| ITF-14 | Clé GS1, barres de support optionnelles |

## Boîte de dialogue (7 onglets)
1. **Contenu** : type de code, modèles QR (Texte/URL, Wi-Fi `WIFI:T:WPA;S:…;P:…;;`, vCard, e-mail, téléphone, SMS, géolocalisation), options des codes-barres (hauteur, zone de silence, texte lisible, police, corps, barres de support).
2. **Thème & couleurs** : 22 thèmes (Classique, Minuit, Océan, Sahara, Néon, Luxe noir & or, Pastel, Nature, Corail, Lavande, Rétro, Cyber, Café, Bordeaux, Menthe, Terracotta, Glacier, Bonbon, Monochrome, Zellige, Ardoise, Soleil) avec **aperçu dessiné** et pastilles de couleur ;
   couleurs personnalisées : modules, fond, œil extérieur, œil intérieur, cadre, texte ; fond transparent ;
   **dégradé des modules** linéaire ou radial, 2 ou 3 couleurs, angle ;
   **thèmes personnalisés** : enregistrer / supprimer / importer / exporter au format JSON (stockés dans `Folder.userData/GenerateurCodes/themes.json`, c.-à-d. `%APPDATA%` sous Windows, `~/Library/Application Support` sous macOS).
   Le contrôle de contraste s'affiche en direct.
3. **Modules** : 11 styles — carrés, ronds, arrondis, losanges, étoiles, cœurs, gouttes, barres verticales, barres horizontales (connectées), liquide (connecté arrondi), petits points ; taille des modules 40-100 % ; correction, version, masque, zone de silence ; fusion en tracé composé (automatique avec un dégradé, pour qu'il soit continu).
4. **Yeux** : 8 styles pour l'œil extérieur et 8 pour l'œil intérieur, indépendants — carré, arrondi, cercle, feuille, goutte, coussin, pointu (biseauté), points. Feuille et goutte sont orientées vers le centre.
5. **Décor & cadre** : 10 cadres (aucun, simple, arrondi, bulle « Scannez-moi » avec flèche, ticket, badge, polaroïd, bannière haut, bannière bas, cercle) ;
   étiquette (texte, police, corps, position haut/bas ; `{texte}` = contenu du code) ;
   motifs de fond (cercles, points, zellige, vagues, confettis) avec opacité, dessinés **uniquement dans la marge**, jamais sous le QR ni dans sa zone de silence ;
   ombre portée (forme décalée, 28 % d'opacité) ; carte de fond arrondie (marge et rayon en mm).
6. **Logo** : aucun, zone vide seule, fichier (PNG/JPG placés liés ; SVG/AI/EPS/PDF importés en vectoriel) ou objet sélectionné (dupliqué) ;
   zone dégagée carrée ou ronde (% du côté), redimensionnement et centrage automatiques ; passage automatique en correction **H** (limites : 35 % en H, 20 % en Q, refus en L/M).
7. **Export / Lot** : taille du module ou largeur totale (mm) ; mode lot (liste collée ou CSV/TXT, 1re colonne, en-tête facultatif), grille colonnes/espacement ; **le thème, les styles, le cadre et le logo s'appliquent à chaque code** ; un groupe nommé par code (« QR version-niveau - contenu ») dans un groupe « Lot … » ; les lignes en erreur sont listées à la fin.

### Contrôles
- Avertissement (avec possibilité de continuer) si le contraste modules/yeux/couleurs du dégradé ↔ fond est **< 4:1** ou si les couleurs sont **inversées** (clair sur foncé), et si le texte d'étiquette est peu lisible sur le cadre.
- Toutes les erreurs de saisie sont signalées en français (couleurs, nombres, clés de contrôle, caractères interdits, données trop longues, logo incompatible, motif sans marge…).

### Structure du dessin
Dans chaque groupe : ombre, cadre (tracé composé avec la découpe), carte/fond, motif, modules (tracé composé, dégradé éventuel), groupe « Yeux », logo, étiquette.
Les trous (anneaux des yeux, cadres) utilisent le sens des tracés (règle de remplissage non nulle).

## Vérification (dossier `tests/`, `npm install && npm test`)
- `test.js` — encodeurs (inchangés depuis v1) : 1969 vérifications, 0 échec (536 QR décodés, 40 versions × 4 niveaux × 3 modes, comparaisons bit à bit avec JsBarcode et npm `qrcode`).
- `t2.js` — exécute `CG.Layout.qr` du script, rastérise les formes (courbes de Bézier, règle non nulle, dégradés, opacité ; le logo est simulé par un bloc gris foncé dans la zone dégagée) puis décode avec **jsQR** et **ZXing** :
  480 rendus (11 styles de modules × 8 styles d'yeux × 3 contenus, 8 × 8 combinaisons œil ext./int. × 2 contenus, 22 thèmes avec cadres/motifs/logos variés, 10 cadres × 6 motifs avec logo H 25 %, zones logo maximales) :
  **480/480 lus par ZXing, 306/480 par jsQR** ; échantillonnage du centre de chaque module : 0 module faux.
- `illmock.js` — exécute **le script complet** (dialogue ScriptUI et rendu) dans une simulation du modèle objet Illustrator, rastérise les tracés réellement créés et les décode ; vérifie aussi les alertes (contraste, inversion, clé EAN fausse, logo en M, motif sans marge, lot avec ligne invalide).
- `probe.js` — sensibilité des styles à la taille des modules (`probe_out.txt`).

### Styles moins fiables
jsQR, un décodeur assez strict, ne lit de façon sûre que les **carrés** (75 à 100 %), le style **liquide** (toutes tailles) et, à 100 %, **arrondis** et **gouttes**. Il échoue presque toujours sur **losanges, étoiles, cœurs, petits points** et les **ronds** réduits, et ne lit les barres que de façon aléatoire.
ZXing (le moteur utilisé par beaucoup d'applications Android) lit **tous** les styles à toutes les tailles testées.
Les styles d'yeux n'ont pas posé de problème (les yeux « points » sont renforcés par une croix pleine au centre).
Conseils : contraste élevé, taille ≥ 90 % pour les styles fantaisie, niveau Q ou H, impression d'au moins 2 cm, et **toujours tester avec plusieurs téléphones** avant impression.

**Important** : le script n'a pas été exécuté dans Illustrator lui-même ; il a été validé par analyse syntaxique ES3 (acorn, sans déclaration de fonction dans les blocs) et dans une simulation du modèle objet. Certaines API (dégradés, `rotate` du dégradé, `createFromFile`, polices) peuvent se comporter un peu différemment selon la version d'Illustrator.
