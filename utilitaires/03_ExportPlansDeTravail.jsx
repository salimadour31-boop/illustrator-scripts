// Export en lot des plans de travail en PNG (plusieurs échelles), SVG, PDF - ES3
#target illustrator
(function () {
    try {
        if (app.documents.length === 0) { alert("Aucun document ouvert."); return; }
        var doc = app.activeDocument;
        var w = new Window("dialog", "Export des plans de travail");
        w.alignChildren = "left";
        var png = w.add("checkbox", undefined, "PNG"); png.value = true;
        var g = w.add("group"); g.add("statictext", undefined, "Échelles PNG (%) :"); var ech = g.add("edittext", undefined, "100,200,300"); ech.characters = 15;
        var transp = w.add("checkbox", undefined, "Fond transparent"); transp.value = true;
        var svg = w.add("checkbox", undefined, "SVG");
        var pdf = w.add("checkbox", undefined, "PDF (un fichier par plan)");
        var b = w.add("group"); b.add("button", undefined, "OK", {name: "ok"}); b.add("button", undefined, "Annuler", {name: "cancel"});
        if (w.show() !== 1) return;
        var dossier = Folder.selectDialog("Choisir le dossier d'export");
        if (!dossier) return;
        var echelles = ech.text.split(","), i, k, n = 0;
        function propre(s) { return String(s).replace(/[\\\/:\*\?"<>\|]/g, "_"); }
        for (i = 0; i < doc.artboards.length; i++) {
            doc.artboards.setActiveArtboardIndex(i);
            var base = dossier.fsName + "/" + propre(doc.artboards[i].name);
            if (png.value) {
                for (k = 0; k < echelles.length; k++) {
                    var s = parseFloat(echelles[k]); if (isNaN(s) || s <= 0) continue;
                    var o = new ExportOptionsPNG24();
                    o.artBoardClipping = true; o.transparency = transp.value; o.antiAliasing = true;
                    o.horizontalScale = s; o.verticalScale = s;
                    doc.exportFile(new File(base + (s === 100 ? "" : "@" + (s / 100) + "x") + ".png"), ExportType.PNG24, o); n++;
                }
            }
            if (svg.value) {
                var os = new ExportOptionsSVG(); os.embedRasterImages = true; os.artboardRange = String(i + 1);
                doc.exportFile(new File(base + ".svg"), ExportType.SVG, os); n++;
            }
            if (pdf.value) {
                var op = new PDFSaveOptions(); op.artboardRange = String(i + 1); op.preserveEditability = false;
                doc.saveAs(new File(base + ".pdf"), op); n++;
            }
        }
        alert(n + " fichier(s) exporté(s) dans :\n" + dossier.fsName + (pdf.value ? "\n\nAttention : après l'export PDF, le document actif pointe vers le dernier PDF. Réenregistrez votre .ai si besoin." : ""));
    } catch (e) { alert("Erreur : " + e.message + " (ligne " + e.line + ")"); }
})();
