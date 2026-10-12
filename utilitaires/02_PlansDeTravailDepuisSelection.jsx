// Crée un plan de travail ajusté à chaque objet sélectionné - ES3
#target illustrator
(function () {
    try {
        if (app.documents.length === 0) { alert("Aucun document ouvert."); return; }
        var doc = app.activeDocument, sel = doc.selection;
        if (!sel || sel.length === 0) { alert("Sélectionnez au moins un objet."); return; }
        var w = new Window("dialog", "Plans de travail depuis la sélection");
        w.alignChildren = "left";
        var g = w.add("group"); g.add("statictext", undefined, "Marge (pt) :"); var marge = g.add("edittext", undefined, "0"); marge.characters = 6;
        var visu = w.add("checkbox", undefined, "Utiliser les limites visibles (avec contour)"); visu.value = true;
        var nommer = w.add("checkbox", undefined, "Nommer le plan comme l'objet"); nommer.value = true;
        var b = w.add("group"); b.add("button", undefined, "OK", {name: "ok"}); b.add("button", undefined, "Annuler", {name: "cancel"});
        if (w.show() !== 1) return;
        var m = parseFloat(marge.text); if (isNaN(m)) m = 0;
        var count = 0, i;
        for (i = 0; i < sel.length; i++) {
            var bd = visu.value ? sel[i].visibleBounds : sel[i].geometricBounds; // [g, h, d, b]
            var r = [bd[0] - m, bd[1] + m, bd[2] + m, bd[3] - m];
            if (doc.artboards.length >= 1000) { alert("Limite de plans de travail atteinte."); break; }
            var ab = doc.artboards.add(r);
            if (nommer.value && sel[i].name) ab.name = sel[i].name;
            count++;
        }
        alert(count + " plan(s) de travail créé(s).");
    } catch (e) { alert("Erreur : " + e.message + " (ligne " + e.line + ")"); }
})();
