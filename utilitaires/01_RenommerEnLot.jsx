// Renommer en lot les objets sélectionnés ou les calques - ES3 / ExtendScript
#target illustrator
(function () {
    try {
        if (app.documents.length === 0) { alert("Aucun document ouvert."); return; }
        var doc = app.activeDocument;
        var w = new Window("dialog", "Renommer en lot");
        w.alignChildren = "fill";
        var cible = w.add("dropdownlist", undefined, ["Objets sélectionnés", "Tous les calques"]); cible.selection = 0;
        var g1 = w.add("group"); g1.add("statictext", undefined, "Nom de base :"); var nom = g1.add("edittext", undefined, "Objet"); nom.characters = 20;
        var g2 = w.add("group"); g2.add("statictext", undefined, "Début numéro :"); var deb = g2.add("edittext", undefined, "1"); deb.characters = 5;
        g2.add("statictext", undefined, "Chiffres :"); var pad = g2.add("edittext", undefined, "2"); pad.characters = 3;
        var g3 = w.add("group"); g3.add("statictext", undefined, "Rechercher :"); var rech = g3.add("edittext", undefined, ""); rech.characters = 10;
        g3.add("statictext", undefined, "Remplacer :"); var remp = g3.add("edittext", undefined, ""); remp.characters = 10;
        w.add("statictext", undefined, "(Si 'Rechercher' est rempli, seul le remplacement est appliqué)");
        var b = w.add("group"); b.add("button", undefined, "OK", {name: "ok"}); b.add("button", undefined, "Annuler", {name: "cancel"});
        if (w.show() !== 1) return;
        var items = [], i;
        if (cible.selection.index === 0) { for (i = 0; i < doc.selection.length; i++) items.push(doc.selection[i]); }
        else { for (i = 0; i < doc.layers.length; i++) items.push(doc.layers[i]); }
        if (items.length === 0) { alert("Rien à renommer."); return; }
        var n = parseInt(deb.text, 10); if (isNaN(n)) n = 1;
        var p = parseInt(pad.text, 10); if (isNaN(p)) p = 0;
        for (i = 0; i < items.length; i++) {
            if (rech.text !== "") {
                items[i].name = String(items[i].name).split(rech.text).join(remp.text);
            } else {
                var s = String(n + i); while (s.length < p) s = "0" + s;
                items[i].name = nom.text + s;
            }
        }
        alert(items.length + " élément(s) renommé(s).");
    } catch (e) { alert("Erreur : " + e.message + " (ligne " + e.line + ")"); }
})();
