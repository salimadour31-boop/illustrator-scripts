// Remplace les objets sélectionnés par un symbole ou par l'objet le plus haut de la sélection - ES3
#target illustrator
(function () {
    try {
        if (app.documents.length === 0) { alert("Aucun document ouvert."); return; }
        var doc = app.activeDocument, sel = doc.selection, i;
        if (!sel || sel.length === 0) { alert("Sélectionnez des objets."); return; }
        var noms = ["(Objet le plus haut de la sélection)"];
        for (i = 0; i < doc.symbols.length; i++) noms.push(doc.symbols[i].name);
        var w = new Window("dialog", "Remplacer les objets");
        w.alignChildren = "left";
        w.add("statictext", undefined, "Remplacer par :");
        var src = w.add("dropdownlist", undefined, noms); src.selection = 0;
        var taille = w.add("checkbox", undefined, "Adapter à la taille de chaque objet"); taille.value = false;
        var prop = w.add("checkbox", undefined, "Conserver les proportions"); prop.value = true;
        var suppr = w.add("checkbox", undefined, "Supprimer les originaux"); suppr.value = true;
        var b = w.add("group"); b.add("button", undefined, "OK", {name: "ok"}); b.add("button", undefined, "Annuler", {name: "cancel"});
        if (w.show() !== 1) return;
        var cibles = [], modele = null, sym = null;
        if (src.selection.index === 0) {
            if (sel.length < 2) { alert("Il faut au moins 2 objets : le modèle (au-dessus) + les cibles."); return; }
            modele = sel[0];
            for (i = 1; i < sel.length; i++) cibles.push(sel[i]);
        } else {
            sym = doc.symbols[src.selection.index - 1];
            for (i = 0; i < sel.length; i++) cibles.push(sel[i]);
        }
        for (i = 0; i < cibles.length; i++) {
            var t = cibles[i], gb = t.geometricBounds;
            var cx = (gb[0] + gb[2]) / 2, cy = (gb[1] + gb[3]) / 2;
            var n = sym ? t.layer.symbolItems.add(sym) : modele.duplicate(t, ElementPlacement.PLACEBEFORE);
            if (sym) n.move(t, ElementPlacement.PLACEBEFORE);
            if (taille.value && n.width > 0 && n.height > 0) {
                var sx = t.width / n.width * 100, sy = t.height / n.height * 100;
                if (prop.value) { sx = sy = Math.min(sx, sy); }
                n.resize(sx, sy);
            }
            var nb = n.geometricBounds;
            n.translate(cx - (nb[0] + nb[2]) / 2, cy - (nb[1] + nb[3]) / 2);
            if (suppr.value) t.remove();
        }
        alert(cibles.length + " objet(s) remplacé(s).");
    } catch (e) { alert("Erreur : " + e.message + " (ligne " + e.line + ")"); }
})();
