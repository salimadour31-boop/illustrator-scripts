// Numérotation automatique des blocs de texte sélectionnés ou création de numéros sur les objets - ES3
#target illustrator
(function () {
    try {
        if (app.documents.length === 0) { alert("Aucun document ouvert."); return; }
        var doc = app.activeDocument, sel = doc.selection, i;
        if (!sel || sel.length === 0) { alert("Sélectionnez des textes ou des objets."); return; }
        var w = new Window("dialog", "Numérotation automatique");
        w.alignChildren = "left";
        var mode = w.add("dropdownlist", undefined, ["Remplacer le contenu des textes sélectionnés", "Ajouter un numéro au centre de chaque objet"]); mode.selection = 0;
        var g1 = w.add("group"); g1.add("statictext", undefined, "Départ :"); var dep = g1.add("edittext", undefined, "1"); dep.characters = 5;
        g1.add("statictext", undefined, "Pas :"); var pas = g1.add("edittext", undefined, "1"); pas.characters = 4;
        g1.add("statictext", undefined, "Chiffres :"); var pad = g1.add("edittext", undefined, "1"); pad.characters = 3;
        var g2 = w.add("group"); g2.add("statictext", undefined, "Préfixe :"); var pre = g2.add("edittext", undefined, ""); pre.characters = 8;
        g2.add("statictext", undefined, "Suffixe :"); var suf = g2.add("edittext", undefined, ""); suf.characters = 8;
        var ordre = w.add("dropdownlist", undefined, ["Ordre : lignes (gauche→droite, haut→bas)", "Ordre : colonnes (haut→bas, gauche→droite)", "Ordre : empilement"]); ordre.selection = 0;
        var b = w.add("group"); b.add("button", undefined, "OK", {name: "ok"}); b.add("button", undefined, "Annuler", {name: "cancel"});
        if (w.show() !== 1) return;
        var items = [];
        for (i = 0; i < sel.length; i++) if (mode.selection.index === 1 || sel[i].typename === "TextFrame") items.push(sel[i]);
        if (items.length === 0) { alert("Aucun bloc de texte dans la sélection."); return; }
        if (ordre.selection.index === 0) items.sort(function (a, b) { var d = b.top - a.top; return Math.abs(d) > 2 ? d : a.left - b.left; });
        if (ordre.selection.index === 1) items.sort(function (a, b) { var d = a.left - b.left; return Math.abs(d) > 2 ? d : b.top - a.top; });
        var n = parseFloat(dep.text) || 0, st = parseFloat(pas.text) || 1, p = parseInt(pad.text, 10) || 0;
        for (i = 0; i < items.length; i++) {
            var s = String(n + i * st); while (s.length < p) s = "0" + s;
            var txt = pre.text + s + suf.text;
            if (mode.selection.index === 0) { items[i].contents = txt; }
            else {
                var gb = items[i].geometricBounds;
                var tf = items[i].layer.textFrames.add(); tf.contents = txt;
                tf.textRange.paragraphAttributes.justification = Justification.CENTER;
                tf.translate((gb[0] + gb[2]) / 2 - (tf.left + tf.width / 2), (gb[1] + gb[3]) / 2 - (tf.top - tf.height / 2));
            }
        }
        alert(items.length + " numéro(s) appliqué(s).");
    } catch (e) { alert("Erreur : " + e.message + " (ligne " + e.line + ")"); }
})();
