# Scripts Adobe Illustrator

Collection de scripts ExtendScript (`.jsx`) pour Adobe Illustrator.

## Contenu

### `calendrier/`
- **calendrier_moderne.jsx** — génère des calendriers au design moderne (mois / année) directement dans le document. Voir `calendrier/LISEZMOI.md`.

### `generateur-codes/`
- **GenerateurCodes.jsx** — générateur de QR codes et de codes-barres vectoriels (formats 1D courants comme Code 128, EAN…). Voir `generateur-codes/LISEZMOI.md`.
- `tests/` — tests automatisés Node.js (décodage des codes générés). Lancer `npm install` puis `npm test` dans ce dossier.

### `utilitaires/`
| Script | Rôle |
|---|---|
| 01_RenommerEnLot.jsx | Renommer des objets / calques en lot |
| 02_PlansDeTravailDepuisSelection.jsx | Créer des plans de travail à partir de la sélection |
| 03_ExportPlansDeTravail.jsx | Exporter les plans de travail |
| 04_GrilleSelection.jsx | Disposer la sélection en grille |
| 05_RemplacerObjets.jsx | Remplacer des objets par un autre |
| 06_CouleursAleatoires.jsx | Appliquer des couleurs aléatoires |
| 07_Numerotation.jsx | Numéroter des objets |
| 08_ExtraireNuancier.jsx | Extraire les couleurs vers le nuancier |
| 09_TexteFusionnerDiviser.jsx | Fusionner / diviser des blocs de texte |

Détails dans `utilitaires/LISEZMOI.md` (et `RECHERCHE.md` pour les notes de recherche).

## Installation

- **Ponctuelle** : dans Illustrator, *Fichier > Scripts > Autre script…* puis choisir le fichier `.jsx`.
- **Permanente** : copier les `.jsx` dans le dossier `Presets/<langue>/Scripts` d'Illustrator (ex. Windows : `C:\Program Files\Adobe\Adobe Illustrator <version>\Presets\fr_FR\Scripts` ; macOS : `/Applications/Adobe Illustrator <version>/Presets.localized/fr_FR/Scripts`), puis redémarrer Illustrator. Les scripts apparaissent dans *Fichier > Scripts*.

## Remarques

Les scripts sont écrits en ExtendScript (ES3). Ils ont été validés par des vérifications automatisées, mais doivent être essayés dans Illustrator avant un usage en production (travaillez sur une copie de vos fichiers).

## Licence

MIT — voir `LICENSE`.
