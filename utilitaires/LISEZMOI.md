# Scripts Illustrator (originaux, en français)

> ⚠️ Ces scripts ont été écrits et vérifiés syntaxiquement (ES3), mais **n'ont pas encore été testés dans Illustrator**. Faites un essai sur une copie de votre fichier. Ctrl+Z (Cmd+Z) annule généralement l'action.

## Installation
- **Utilisation ponctuelle** : Fichier > Scripts > Autre script… (Ctrl+F12) puis choisir le `.jsx`.
- **Installation permanente** : copier les `.jsx` dans le dossier Scripts d'Illustrator puis redémarrer :
  - Windows : `C:\Program Files\Adobe\Adobe Illustrator <version>\Presets\fr_FR\Scripts\`
  - macOS : `/Applications/Adobe Illustrator <version>/Presets.localized/fr_FR/Scripts/`
  Les scripts apparaissent alors dans Fichier > Scripts.
- Astuce : enregistrez un script dans une **Action** (menu du panneau Actions > Insérer une commande de menu… > Fichier > Scripts) pour lui associer un raccourci F-touche.

## Les scripts
| Fichier | Utilisation |
|---|---|
| 01_RenommerEnLot.jsx | Sélectionnez des objets (ou choisissez « Tous les calques »). Nom de base + numéro (départ, nombre de chiffres), ou rechercher/remplacer dans les noms. |
| 02_PlansDeTravailDepuisSelection.jsx | Sélectionnez des objets : un plan de travail est créé autour de chacun, avec marge optionnelle et nom de l'objet. |
| 03_ExportPlansDeTravail.jsx | Exporte chaque plan de travail en PNG (plusieurs échelles, ex. 100,200,300 → `nom.png`, `nom@2x.png`…), SVG et/ou PDF. Choisissez le dossier. Après un export PDF, le document actif devient le PDF : rouvrez/réenregistrez votre .ai. |
| 04_GrilleSelection.jsx | Sélectionnez ≥2 objets : ils sont rangés en grille (nb de colonnes, gouttières H/V, cellules égales ou non), à partir de l'objet en haut à gauche. |
| 05_RemplacerObjets.jsx | Remplace les objets sélectionnés par un symbole du document, ou par l'objet placé au premier plan de la sélection. Option : adapter la taille, garder les proportions, supprimer les originaux. |
| 06_CouleursAleatoires.jsx | Colore aléatoirement les tracés sélectionnés (fond/contour) depuis toutes les nuances, un groupe de nuances, ou une liste de codes HEX. |
| 07_Numerotation.jsx | Numérote les textes sélectionnés (départ, pas, zéros, préfixe/suffixe, ordre lignes/colonnes) ou ajoute un numéro au centre de chaque objet. |
| 08_ExtraireNuancier.jsx | Récupère les couleurs utilisées (sélection ou document) dans un nouveau groupe de nuances, avec légende optionnelle à droite du plan de travail. |
| 09_TexteFusionnerDiviser.jsx | Fusionne plusieurs blocs de texte (ordre de lecture, séparateur au choix) ou divise un bloc en un texte de point par paragraphe. |

Voir aussi `RECHERCHE.md` pour les scripts populaires de la communauté (Sergey Osokin, Alexander Ladygin, John Wundes, Hiroyuki Sato…).
