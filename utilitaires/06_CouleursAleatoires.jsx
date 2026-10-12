// Applique des couleurs aléatoires (nuances du groupe choisi ou codes HEX) aux objets sélectionnés - ES3
#target illustrator
(function () {
    try {
        if (app.documents.length === 0) { alert("Aucun document ouvert."); return; }
        var doc = app.activeDocument, sel = doc.selection, i;
        if (!sel || sel.length === 0) { alert("Sélectionnez des objets."); return; }
        var groupes = ["(Toutes les nuances)", "(Codes HEX ci-dessous)"];
        for (i = 0; i < doc.swatchGroups.length; i++) groupes.push(doc.swatchGroups[i].name);
        var w = new Window("dialog", "Couleurs aléatoires");
        w.alignChildren = "fill";
        w.add("statictext", undefined, "Source :");
        var src = w.add("dropdownlist", undefined, groupes); src.selection = 0;
        w.add("statictext", undefined, "Codes HEX (séparés par des virgules) :");
        var hex = w.add("edittext", undefined, "#E63946,#F1FAEE,#A8DADC,#457B9D,#1D3557");
        var cible = w.add("dropdownlist", undefined, ["Fond", "Contour", "Fond et contour"]); cible.selection = 0;
        var b = w.add("group"); b.add("button", undefined, "OK", {name: "ok"}); b.add("button", undefined, "Annuler", {name: "cancel"});
        if (w.show() !== 1) return;
        var couleurs = [], sw;
        function hexVersRVB(h) {
            h = h.replace(/^\s+|\s+$/g, "").replace("#", "");
            if (h.length === 3) h = h.charAt(0) + h.charAt(0) + h.charAt(1) + h.charAt(1) + h.charAt(2) + h.charAt(2);
            if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
            var c = new RGBColor(); c.red = parseInt(h.substr(0, 2), 16); c.green = parseInt(h.substr(2, 2), 16); c.blue = parseInt(h.substr(4, 2), 16); return c;
        }
        if (src.selection.index === 1) {
            var parts = hex.text.split(",");
            for (i = 0; i < parts.length; i++) { var c = hexVersRVB(parts[i]); if (c) couleurs.push(c); }
        } else {
            sw = src.selection.index === 0 ? doc.swatches : doc.swatchGroups[src.selection.index - 2].getAllSwatches();
            for (i = 0; i < sw.length; i++) {
                var t = sw[i].color.typename;
                if (t !== "NoColor" && t !== "RegistrationColor" && t !== "PatternColor") couleurs.push(sw[i].color);
            }
        }
        if (couleurs.length === 0) { alert("Aucune couleur utilisable."); return; }
        var n = 0;
        function appliquer(it) {
            if (it.typename === "GroupItem") { for (var j = 0; j < it.pageItems.length; j++) appliquer(it.pageItems[j]); return; }
            if (it.typename === "CompoundPathItem") { if (it.pathItems.length) appliquer(it.pathItems[0]); return; }
            if (it.typename !== "PathItem") return;
            var col = couleurs[Math.floor(Math.random() * couleurs.length)];
            if (cible.selection.index !== 1) { it.filled = true; it.fillColor = col; }
            if (cible.selection.index !== 0) { it.stroked = true; it.strokeColor = col; }
            n++;
        }
        for (i = 0; i < sel.length; i++) appliquer(sel[i]);
        alert(n + " tracé(s) colorié(s).");
    } catch (e) { alert("Erreur : " + e.message + " (ligne " + e.line + ")"); }
})();
