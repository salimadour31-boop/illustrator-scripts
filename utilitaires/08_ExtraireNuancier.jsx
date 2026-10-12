// Extrait les couleurs utilisées (sélection ou document) dans un nouveau groupe de nuances - ES3
#target illustrator
(function () {
    try {
        if (app.documents.length === 0) { alert("Aucun document ouvert."); return; }
        var doc = app.activeDocument, i;
        var w = new Window("dialog", "Extraire le nuancier");
        w.alignChildren = "left";
        var port = w.add("dropdownlist", undefined, ["Sélection", "Tout le document"]); port.selection = doc.selection.length ? 0 : 1;
        var g = w.add("group"); g.add("statictext", undefined, "Nom du groupe :"); var nom = g.add("edittext", undefined, "Couleurs utilisées"); nom.characters = 18;
        var leg = w.add("checkbox", undefined, "Dessiner une légende (carrés + codes)"); leg.value = false;
        var b = w.add("group"); b.add("button", undefined, "OK", {name: "ok"}); b.add("button", undefined, "Annuler", {name: "cancel"});
        if (w.show() !== 1) return;
        var vues = {}, liste = [];
        function cle(c) {
            switch (c.typename) {
                case "RGBColor": return "RVB " + Math.round(c.red) + "," + Math.round(c.green) + "," + Math.round(c.blue);
                case "CMYKColor": return "CMJN " + Math.round(c.cyan) + "," + Math.round(c.magenta) + "," + Math.round(c.yellow) + "," + Math.round(c.black);
                case "GrayColor": return "Gris " + Math.round(c.gray);
                case "SpotColor": return "Ton direct " + c.spot.name;
                default: return null;
            }
        }
        function ajout(c) { if (!c) return; var k = cle(c); if (k && !vues[k]) { vues[k] = true; liste.push({k: k, c: c}); } }
        function scan(it) {
            var t = it.typename, j;
            if (t === "GroupItem") { for (j = 0; j < it.pageItems.length; j++) scan(it.pageItems[j]); }
            else if (t === "CompoundPathItem") { for (j = 0; j < it.pathItems.length; j++) scan(it.pathItems[j]); }
            else if (t === "PathItem") { if (it.filled) ajout(it.fillColor); if (it.stroked) ajout(it.strokeColor); }
            else if (t === "TextFrame") { try { ajout(it.textRange.characterAttributes.fillColor); } catch (x) {} }
        }
        var src = port.selection.index === 0 ? doc.selection : doc.pageItems;
        for (i = 0; i < src.length; i++) scan(src[i]);
        if (liste.length === 0) { alert("Aucune couleur trouvée."); return; }
        var grp = doc.swatchGroups.add(); grp.name = nom.text;
        for (i = 0; i < liste.length; i++) {
            if (liste[i].c.typename === "SpotColor") { grp.addSpot(liste[i].c.spot); continue; }
            var sw = doc.swatches.add(); sw.name = liste[i].k; sw.color = liste[i].c; grp.addSwatch(sw);
        }
        if (leg.value) {
            var ab = doc.artboards[doc.artboards.getActiveArtboardIndex()].artboardRect;
            var lay = doc.layers.add(); lay.name = "Légende couleurs";
            for (i = 0; i < liste.length; i++) {
                var r = lay.pathItems.rectangle(ab[3] - 20 - i * 30, ab[2] + 20, 24, 24);
                r.fillColor = liste[i].c; r.stroked = false;
                var tf = lay.textFrames.pointText([ab[2] + 52, ab[3] - 37 - i * 30]); tf.contents = liste[i].k;
            }
        }
        alert(liste.length + " couleur(s) ajoutée(s) au groupe « " + nom.text + " ».");
    } catch (e) { alert("Erreur : " + e.message + " (ligne " + e.line + ")"); }
})();
