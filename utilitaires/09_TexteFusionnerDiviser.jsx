// Fusionne plusieurs blocs de texte en un seul, ou divise un bloc en un bloc par ligne/paragraphe - ES3
#target illustrator
(function () {
    try {
        if (app.documents.length === 0) { alert("Aucun document ouvert."); return; }
        var doc = app.activeDocument, sel = doc.selection, i, tfs = [];
        for (i = 0; i < sel.length; i++) if (sel[i].typename === "TextFrame") tfs.push(sel[i]);
        if (tfs.length === 0) { alert("Sélectionnez des blocs de texte."); return; }
        var w = new Window("dialog", "Texte : fusionner / diviser");
        w.alignChildren = "left";
        var mode = w.add("dropdownlist", undefined, ["Fusionner les blocs", "Diviser en paragraphes"]); mode.selection = tfs.length > 1 ? 0 : 1;
        var g = w.add("group"); g.add("statictext", undefined, "Séparateur (fusion) :");
        var sep = g.add("dropdownlist", undefined, ["Retour à la ligne", "Espace", "Aucun"]); sep.selection = 0;
        var g2 = w.add("group"); g2.add("statictext", undefined, "Interligne division (pt, 0 = auto) :"); var il = g2.add("edittext", undefined, "0"); il.characters = 5;
        var b = w.add("group"); b.add("button", undefined, "OK", {name: "ok"}); b.add("button", undefined, "Annuler", {name: "cancel"});
        if (w.show() !== 1) return;
        if (mode.selection.index === 0) {
            if (tfs.length < 2) { alert("Sélectionnez au moins 2 blocs."); return; }
            tfs.sort(function (a, b) { var d = b.top - a.top; return Math.abs(d) > 2 ? d : a.left - b.left; });
            var s = ["\r", " ", ""][sep.selection.index], dest = tfs[0];
            for (i = 1; i < tfs.length; i++) {
                if (s !== "") dest.textRange.insertionPoints[dest.textRange.insertionPoints.length - 1].characters.add(s);
                tfs[i].textRange.duplicate(dest.textRange.insertionPoints[dest.textRange.insertionPoints.length - 1]);
                tfs[i].remove();
            }
            alert("Blocs fusionnés.");
        } else {
            var total = 0;
            for (i = 0; i < tfs.length; i++) {
                var tf = tfs[i], paras = tf.paragraphs, n = paras.length, y = tf.top, x = tf.left;
                var lead = parseFloat(il.text) || 0, k;
                for (k = 0; k < n; k++) {
                    if (paras[k].contents === "") continue;
                    var nt = tf.layer.textFrames.pointText([x, 0]);
                    paras[k].duplicate(nt.textRange.insertionPoints[0]);
                    nt.contents = nt.contents.replace(/[\r\n]+$/, "");
                    nt.top = y; nt.left = x;
                    y -= lead > 0 ? lead : nt.height;
                    total++;
                }
                tf.remove();
            }
            alert(total + " bloc(s) créé(s).");
        }
    } catch (e) { alert("Erreur : " + e.message + " (ligne " + e.line + ")"); }
})();
