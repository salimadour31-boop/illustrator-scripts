// Dispose la sélection en grille (colonnes, gouttières) - ES3
#target illustrator
(function () {
    try {
        if (app.documents.length === 0) { alert("Aucun document ouvert."); return; }
        var doc = app.activeDocument, sel = doc.selection;
        if (!sel || sel.length < 2) { alert("Sélectionnez au moins 2 objets."); return; }
        var w = new Window("dialog", "Grille");
        w.alignChildren = "left";
        var g1 = w.add("group"); g1.add("statictext", undefined, "Colonnes :"); var col = g1.add("edittext", undefined, "4"); col.characters = 4;
        var g2 = w.add("group"); g2.add("statictext", undefined, "Gouttière H (pt) :"); var gh = g2.add("edittext", undefined, "10"); gh.characters = 5;
        g2.add("statictext", undefined, "V (pt) :"); var gv = g2.add("edittext", undefined, "10"); gv.characters = 5;
        var cell = w.add("checkbox", undefined, "Cellules de taille égale (plus grand objet)"); cell.value = true;
        var b = w.add("group"); b.add("button", undefined, "OK", {name: "ok"}); b.add("button", undefined, "Annuler", {name: "cancel"});
        if (w.show() !== 1) return;
        var c = parseInt(col.text, 10); if (isNaN(c) || c < 1) c = 1;
        var dx = parseFloat(gh.text) || 0, dy = parseFloat(gv.text) || 0;
        var items = [], i, maxW = 0, maxH = 0;
        for (i = 0; i < sel.length; i++) items.push(sel[i]);
        // tri ordre de lecture : haut -> bas, gauche -> droite
        items.sort(function (a, b) { var d = b.visibleBounds[1] - a.visibleBounds[1]; return Math.abs(d) > 1 ? d : a.visibleBounds[0] - b.visibleBounds[0]; });
        for (i = 0; i < items.length; i++) { maxW = Math.max(maxW, items[i].width); maxH = Math.max(maxH, items[i].height); }
        var x0 = items[0].visibleBounds[0], y0 = items[0].visibleBounds[1];
        var x = x0, y = y0, rowH = 0;
        for (i = 0; i < items.length; i++) {
            if (i > 0 && i % c === 0) { x = x0; y -= (cell.value ? maxH : rowH) + dy; rowH = 0; }
            var vb = items[i].visibleBounds;
            items[i].translate(x - vb[0], y - vb[1]);
            x += (cell.value ? maxW : items[i].width) + dx;
            rowH = Math.max(rowH, items[i].height);
        }
    } catch (e) { alert("Erreur : " + e.message + " (ligne " + e.line + ")"); }
})();
