// calendrier_moderne.jsx — Générateur de calendrier moderne et personnalisable (v3) pour Adobe Illustrator
// ExtendScript (ES3) — Fichier > Scripts > Autre script...
#target illustrator

(function () {
    var MM = 2.834645669; // points par mm
    var VERSION = "3.0";

    // =====================================================================
    // Données
    // =====================================================================
    var MONTHS = {
        FR: ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"],
        EN: ["January","February","March","April","May","June","July","August","September","October","November","December"]
    };
    var DAYS = { // index 0 = dimanche
        FR: ["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"],
        EN: ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]
    };

    // Clés de couleur et libellés
    var CKEYS = ["bg","title","text","accent","weekend","header","decor"];
    var CLABELS = ["Fond","Titre","Texte","Accent","Week-end","En-tête jours","Décor"];

    // Préréglages : bg, title, text, accent, weekend, header, decor
    var PRESETS = [
        ["Minuit",            "141B3A","FFFFFF","E6E8F0","FF6B5E","FF8A7A","8C96BE","FF6B5E"],
        ["Pastel",            "FDF8F4","5A4E6E","5F5F75","F080A0","E57399","A69CB8","AFCBF0"],
        ["Nature",            "F4F7EE","223A28","34503A","4C8C4A","6BA33F","7A9178","BED796"],
        ["Monochrome",        "FFFFFF","111111","222222","000000","777777","999999","D6D6D6"],
        ["Océan",             "EAF6FB","0B3C5D","1D4E6E","1B98E0","0E7FC0","5C8AA8","9ED8F0"],
        ["Coucher de soleil", "FFF4EC","5B1A3A","4A2B3A","FF7B54","E8505B","B07A8A","FFB26B"],
        ["Sahara",            "F7EEDD","6B3E1F","5A4632","D98E32","C0602B","A08766","EAC891"],
        ["Lavande",           "F5F1FB","4B3A73","50456A","9B7FD1","8A63C9","9C92B4","D6C8F0"],
        ["Néon",              "0D0D17","F8F8FF","DADAF0","39FF14","FF2BD6","7A7AA0","00E5FF"],
        ["Corail",            "FFF5F2","7A2E2E","5A3A3A","FF6F61","F2545B","B48A86","FFC2B4"],
        ["Forêt",             "1E2D24","EAF2E3","D3DFCB","8FBF6E","C9A66B","8CA38F","3E5C46"],
        ["Café",              "F3EBE1","3E2A1F","4A3A30","8B5E3C","A0522D","9C8676","D2B48C"],
        ["Bonbon",            "FFF0F7","D6336C","6D4C5E","FF66B3","9B5DE5","C39BB0","00BBF9"],
        ["Glacier",           "F0F8FC","1F3B57","34506A","4FB3D9","2A8FBD","8AA7BC","CDEBF7"],
        ["Rétro 70s",         "F6E7C8","4A2C16","5C3A1E","E07A1F","C4451C","A68457","F2B134"],
        ["Luxe noir & or",    "0E0E0E","D4AF37","E8E2D0","D4AF37","F0D57A","8C8270","3A3220"],
        ["Terracotta",        "F6EDE6","7A3420","5A3B30","C8553D","A63D2A","A88B7D","E8B4A0"],
        ["Menthe",            "EFFAF5","1E5245","2F5E52","3EB489","2A9D74","7FA89A","BDEBD6"],
        ["Bordeaux",          "FAF3F3","5E0B1E","4A2A30","8E1B3A","B0273F","A88890","E3C1C8"],
        ["Cyber",             "0A0F1F","00F0FF","C8D3F5","FF00A0","FCEE0A","5F6C9A","2B1F5C"],
        ["Ardoise",           "2B303A","FFFFFF","D8DDE6","F2C14E","F78154","8892A6","3C4352"]
    ];
    var CUSTOM_NAME = "Personnalisé";

    // Formats papier (mm, portrait)
    var PAPERS = [
        ["A5 (148 × 210)", 148, 210], ["A4 (210 × 297)", 210, 297], ["A3 (297 × 420)", 297, 420],
        ["A2 (420 × 594)", 420, 594], ["A1 (594 × 841)", 594, 841], ["Letter (216 × 279)", 215.9, 279.4],
        ["Carré 210 × 210", 210, 210], ["Carré 300 × 300", 300, 300], ["Personnalisé (mm)", 0, 0]
    ];

    // =====================================================================
    // Calcul des dates (calendrier grégorien proleptique)
    // =====================================================================
    function isLeap(y) { return (y % 4 === 0 && y % 100 !== 0) || (y % 400 === 0); }
    function daysInMonth(y, m) { // m = 0..11
        var d = [31, isLeap(y) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        return d[m];
    }
    // Nombre de jours depuis le 1970-01-01 ; m = 1..12
    function daysFromCivil(y, m, d) {
        y -= (m <= 2) ? 1 : 0;
        var era = Math.floor(y / 400);
        var yoe = y - era * 400;
        var mp = (m + 9) % 12;
        var doy = Math.floor((153 * mp + 2) / 5) + d - 1;
        var doe = yoe * 365 + Math.floor(yoe / 4) - Math.floor(yoe / 100) + doy;
        return era * 146097 + doe - 719468;
    }
    function civilFromDays(z) {
        z += 719468;
        var era = Math.floor(z / 146097);
        var doe = z - era * 146097;
        var yoe = Math.floor((doe - Math.floor(doe / 1460) + Math.floor(doe / 36524) - Math.floor(doe / 146096)) / 365);
        var y = yoe + era * 400;
        var doy = doe - (365 * yoe + Math.floor(yoe / 4) - Math.floor(yoe / 100));
        var mp = Math.floor((5 * doy + 2) / 153);
        var d = doy - Math.floor((153 * mp + 2) / 5) + 1;
        var m = (mp < 10) ? mp + 3 : mp - 9;
        return [y + (m <= 2 ? 1 : 0), m, d];
    }
    function dowSerial(s) { return (((s % 7) + 7) % 7 + 4) % 7; } // 0 = dimanche
    function dayOfWeek(y, m, d) { return dowSerial(daysFromCivil(y, m + 1, d)); } // m = 0..11
    function isoWeek(s) {
        var dw = (dowSerial(s) + 6) % 7; // lundi = 0
        var th = s - dw + 3;             // jeudi de la même semaine
        var yy = civilFromDays(th)[0];
        return Math.floor((th - daysFromCivil(yy, 1, 1)) / 7) + 1;
    }

    // =====================================================================
    // Couleurs
    // =====================================================================
    function normHex(s) {
        s = String(s).replace(/^\s+|\s+$/g, "").replace(/^#/, "");
        if (/^[0-9a-fA-F]{3}$/.test(s)) s = s.charAt(0) + s.charAt(0) + s.charAt(1) + s.charAt(1) + s.charAt(2) + s.charAt(2);
        if (!/^[0-9a-fA-F]{6}$/.test(s)) return null;
        return s.toUpperCase();
    }
    function hexToRgb(h) { h = normHex(h) || "000000"; return [parseInt(h.substr(0, 2), 16), parseInt(h.substr(2, 2), 16), parseInt(h.substr(4, 2), 16)]; }
    function pad2(n) { var s = n.toString(16).toUpperCase(); return s.length < 2 ? "0" + s : s; }
    function intToHex(n) { return pad2((n >> 16) & 255) + pad2((n >> 8) & 255) + pad2(n & 255); }
    function mix(a, b, t) { return [Math.round(a[0] + (b[0] - a[0]) * t), Math.round(a[1] + (b[1] - a[1]) * t), Math.round(a[2] + (b[2] - a[2]) * t)]; }
    function rgb(a) { var c = new RGBColor(); c.red = a[0]; c.green = a[1]; c.blue = a[2]; return c; }
    function presetToTheme(p) { var t = { name: p[0], c: {} }; for (var i = 0; i < CKEYS.length; i++) t.c[CKEYS[i]] = p[i + 1]; return t; }

    // =====================================================================
    // Thèmes enregistrés (Folder.userData/CalendrierModerne/themes.json)
    // =====================================================================
    function themeFile() {
        var f = new Folder(Folder.userData + "/CalendrierModerne");
        if (!f.exists) f.create();
        return new File(f.fsName + "/themes.json");
    }
    function jsonStr(s) { return '"' + String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"') + '"'; }
    function serializeThemes(list) {
        var out = [];
        for (var i = 0; i < list.length; i++) {
            var parts = [];
            for (var k = 0; k < CKEYS.length; k++) parts.push(jsonStr(CKEYS[k]) + ": " + jsonStr("#" + list[i].c[CKEYS[k]]));
            out.push("  {" + jsonStr("name") + ": " + jsonStr(list[i].name) + ", " + parts.join(", ") + "}");
        }
        return "[\n" + out.join(",\n") + "\n]\n";
    }
    function parseThemes(txt) {
        var res = [], data;
        try { data = eval("(" + txt + ")"); } catch (e) { return res; }
        if (!data || typeof data.length !== "number") return res;
        for (var i = 0; i < data.length; i++) {
            var d = data[i]; if (!d || !d.name) continue;
            var t = { name: String(d.name), c: {}, saved: true }, ok = true;
            for (var k = 0; k < CKEYS.length; k++) { var h = normHex(d[CKEYS[k]]); if (!h) { ok = false; break; } t.c[CKEYS[k]] = h; }
            if (ok) res.push(t);
        }
        return res;
    }
    function readFile(f) { if (!f.exists) return ""; f.encoding = "UTF-8"; f.open("r"); var s = f.read(); f.close(); return s; }
    function writeFile(f, s) { f.encoding = "UTF-8"; f.open("w"); f.write(s); f.close(); }
    function loadSaved() { try { return parseThemes(readFile(themeFile())); } catch (e) { return []; } }
    function storeSaved(list) { try { writeFile(themeFile(), serializeThemes(list)); return true; } catch (e) { alert("Impossible d'enregistrer : " + e.message); return false; } }

    // =====================================================================
    // Décors : styles, saisons
    // =====================================================================
    var DECOS = ["Cercles", "Vagues", "Blobs organiques", "Lignes géométriques", "Triangles", "Hexagones",
                 "Confettis", "Points / pois", "Rayures diagonales", "Zellige / arabesque", "Étoiles",
                 "Feuilles stylisées", "Montagnes", "Soleil / rayons", "Bordure cadre", "Aucun"];
    var DECO_NONE = 15;
    // Décor saisonnier automatique (index de DECOS) par mois
    var SEASON = [[10, 7], [5, 10], [11, 2], [7, 11], [2, 6], [13, 1], [1, 13], [13, 4], [12, 11], [11, 8], [12, 3], [10, 6]];
    var PER_PAGE = [1, 2, 3, 4, 6, 12];
    var COLS = [0, 1, 2, 3, 4, 6, 12]; // 0 = auto

    // =====================================================================
    // Boîte de dialogue
    // =====================================================================
    function num(et, def) { var v = parseFloat(String(et.text).replace(",", ".")); return isNaN(v) ? def : v; }
    function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }

    function showDialog() {
        var saved = loadSaved();
        var allThemes = [];
        var w = new Window("dialog", "Calendrier moderne " + VERSION);
        w.orientation = "column"; w.alignChildren = "fill";

        var tp = w.add("tabbedpanel"); tp.alignChildren = "fill"; tp.preferredSize.width = 560;
        function tab(name) { var t = tp.add("tab", undefined, name); t.alignChildren = "left"; t.margins = 14; t.spacing = 7; return t; }
        function row(parent, lbl, wdt) { var g = parent.add("group"); var s = g.add("statictext", undefined, lbl); s.preferredSize.width = wdt || 190; return g; }
        function numField(parent, lbl, def, unit) { var g = row(parent, lbl); var e = g.add("edittext", undefined, String(def)); e.characters = 6; if (unit) g.add("statictext", undefined, unit); return e; }
        function dd(parent, lbl, items, sel) { var d = row(parent, lbl).add("dropdownlist", undefined, items); d.selection = sel || 0; return d; }

        // ----- Général -----
        var tG = tab("Général");
        var eYear = numField(tG, "Année :", 2027);
        var dStart = dd(tG, "Premier jour de la semaine :", ["Lundi", "Dimanche"]);
        var dLang = dd(tG, "Langue (mois et jours) :", ["Français", "English"]);
        var cbYear = tG.add("checkbox", undefined, "Afficher l'année sous le nom du mois"); cbYear.value = true;
        var cbUpper = tG.add("checkbox", undefined, "Nom du mois en MAJUSCULES"); cbUpper.value = true;

        // ----- Thème & couleurs -----
        var tT = tab("Thème & couleurs");
        var dTheme = row(tT, "Thème :", 80).add("dropdownlist"); dTheme.preferredSize.width = 240;
        var gBtn = tT.add("group");
        var bSave = gBtn.add("button", undefined, "Enregistrer le thème…");
        var bDel = gBtn.add("button", undefined, "Supprimer");
        var bImp = gBtn.add("button", undefined, "Importer…");
        var bExp = gBtn.add("button", undefined, "Exporter…");
        var pC = tT.add("panel", undefined, "Couleurs (hexadécimal) — modifier une valeur active « Personnalisé »");
        pC.alignChildren = "left"; pC.margins = 12;
        var fields = {}, swatches = {}, suppress = false, previewSw = [], i;

        function paintSwatch(sw, hex) {
            var c = hexToRgb(hex);
            sw.col = [c[0] / 255, c[1] / 255, c[2] / 255, 1];
            try { sw.hide(); sw.show(); } catch (e) {}
        }
        function makeSwatch(parent, wdt, hgt) {
            var sw = parent.add("group"); sw.preferredSize = [wdt, hgt]; sw.col = [0, 0, 0, 1];
            sw.onDraw = function () {
                var g = this.graphics;
                g.rectPath(0, 0, this.size[0], this.size[1]);
                g.fillPath(g.newBrush(g.BrushType.SOLID_COLOR, this.col));
                g.strokePath(g.newPen(g.PenType.SOLID_COLOR, [0.5, 0.5, 0.5, 1], 1));
            };
            return sw;
        }
        function refreshPreview() { for (var k = 0; k < CKEYS.length; k++) paintSwatch(previewSw[k], fields[CKEYS[k]].text); }
        for (i = 0; i < CKEYS.length; i++) {
            (function (key, label) {
                var g = row(pC, label + " :", 110);
                var et = g.add("edittext", undefined, "#000000"); et.characters = 9;
                var sw = makeSwatch(g, 40, 18);
                var bp = g.add("button", undefined, "Choisir…"); bp.preferredSize.width = 80;
                fields[key] = et; swatches[key] = sw;
                et.onChanging = function () {
                    var h = normHex(et.text);
                    if (h) { paintSwatch(sw, h); refreshPreview(); if (!suppress) selectCustom(); }
                };
                et.onChange = function () { var h = normHex(et.text); if (!h) { alert("Code hexadécimal invalide : " + et.text); et.text = "#000000"; } else et.text = "#" + h; et.onChanging(); };
                bp.onClick = function () {
                    if (typeof $.colorPicker !== "function") { alert("Sélecteur de couleur indisponible : saisissez un code hexadécimal."); return; }
                    var cur = parseInt(normHex(et.text) || "000000", 16), r = -1;
                    try { r = $.colorPicker(cur); } catch (e) { r = -1; }
                    if (r >= 0) { et.text = "#" + intToHex(r); et.onChanging(); }
                };
            })(CKEYS[i], CLABELS[i]);
        }
        var pP = tT.add("panel", undefined, "Aperçu du thème"); pP.orientation = "row"; pP.margins = 12;
        for (i = 0; i < CKEYS.length; i++) previewSw.push(makeSwatch(pP, 58, 32));

        function currentColors() { var c = {}; for (var k = 0; k < CKEYS.length; k++) c[CKEYS[k]] = normHex(fields[CKEYS[k]].text) || "000000"; return c; }
        function buildThemeList(selName) {
            allThemes = [];
            for (var k = 0; k < PRESETS.length; k++) allThemes.push(presetToTheme(PRESETS[k]));
            for (k = 0; k < saved.length; k++) allThemes.push(saved[k]);
            allThemes.push({ name: CUSTOM_NAME, custom: true });
            dTheme.removeAll();
            var sel = 0;
            for (k = 0; k < allThemes.length; k++) {
                dTheme.add("item", (allThemes[k].saved ? "★ " : "") + allThemes[k].name);
                if (selName && allThemes[k].name === selName && !allThemes[k].custom) sel = k;
            }
            suppress = true; dTheme.selection = sel; suppress = false;
            applyThemeSel();
        }
        function selectCustom() { suppress = true; dTheme.selection = allThemes.length - 1; suppress = false; bDel.enabled = false; }
        function applyThemeSel() {
            if (!dTheme.selection) return;
            var t = allThemes[dTheme.selection.index];
            bDel.enabled = !!t.saved;
            if (t.custom) return;
            suppress = true;
            for (var k = 0; k < CKEYS.length; k++) { fields[CKEYS[k]].text = "#" + t.c[CKEYS[k]]; paintSwatch(swatches[CKEYS[k]], t.c[CKEYS[k]]); }
            refreshPreview();
            suppress = false;
        }
        dTheme.onChange = function () { if (!suppress) applyThemeSel(); };
        bSave.onClick = function () {
            var n = prompt("Nom du thème personnalisé :", "Mon thème");
            if (!n) return;
            n = String(n).replace(/^\s+|\s+$/g, ""); if (!n) return;
            var t = { name: n, c: currentColors(), saved: true }, replaced = false;
            for (var k = 0; k < saved.length; k++) if (saved[k].name === n) { saved[k] = t; replaced = true; }
            if (!replaced) saved.push(t);
            if (storeSaved(saved)) buildThemeList(n);
        };
        bDel.onClick = function () {
            var t = allThemes[dTheme.selection.index]; if (!t.saved) return;
            if (!confirm("Supprimer le thème « " + t.name + " » ?")) return;
            var nl = []; for (var k = 0; k < saved.length; k++) if (saved[k].name !== t.name) nl.push(saved[k]);
            saved = nl; storeSaved(saved); buildThemeList(null);
        };
        bImp.onClick = function () {
            var f = File.openDialog("Importer des thèmes (JSON)", "*.json"); if (!f) return;
            var list = parseThemes(readFile(f));
            if (!list.length) { alert("Aucun thème valide dans ce fichier."); return; }
            for (var a = 0; a < list.length; a++) {
                var rep = false;
                for (var b = 0; b < saved.length; b++) if (saved[b].name === list[a].name) { saved[b] = list[a]; rep = true; }
                if (!rep) saved.push(list[a]);
            }
            storeSaved(saved); buildThemeList(list[0].name);
            alert(list.length + " thème(s) importé(s).");
        };
        bExp.onClick = function () {
            var t = { name: dTheme.selection ? allThemes[dTheme.selection.index].name : CUSTOM_NAME, c: currentColors() };
            var f = File.saveDialog("Exporter le thème", "*.json"); if (!f) return;
            if (!/\.json$/i.test(f.name)) f = new File(f.fsName + ".json");
            writeFile(f, serializeThemes([t]));
        };

        // ----- Mise en page -----
        var tL = tab("Mise en page");
        var dPer = dd(tL, "Mois par page :", ["1 (12 pages)", "2 (6 pages)", "3 (4 pages)", "4 (3 pages)", "6 (2 pages)", "12 (affiche unique)"]);
        var dCols = dd(tL, "Colonnes :", ["Automatique", "1", "2", "3", "4", "6", "12"]);
        tL.add("statictext", undefined, "(les lignes sont calculées automatiquement)");
        var eColW = numField(tL, "Largeur de colonne :", 0, "mm (0 = auto)");
        var eGutH = numField(tL, "Gouttière horizontale :", 10, "mm");
        var eGutV = numField(tL, "Gouttière verticale :", 10, "mm");
        var cbPageTitle = tL.add("checkbox", undefined, "Titre de page (année) quand plusieurs mois par page"); cbPageTitle.value = true;
        var dStyle = dd(tL, "Style des mois :", ["Grille classique", "Agenda – liste verticale", "Agenda – bande horizontale"]);
        var pn = []; for (i = 0; i < PAPERS.length; i++) pn.push(PAPERS[i][0]);
        var dPaper = dd(tL, "Format :", pn, 1);
        var gCu = row(tL, "Format perso (L × H mm) :");
        var eCW = gCu.add("edittext", undefined, "200"); eCW.characters = 6; gCu.add("statictext", undefined, "×");
        var eCH = gCu.add("edittext", undefined, "200"); eCH.characters = 6;
        var dOri = dd(tL, "Orientation :", ["Portrait", "Paysage"]);
        var eMar = numField(tL, "Marges :", 12, "mm");
        var cbNotes = tL.add("checkbox", undefined, "Zone de notes sous chaque mois");
        var gN = row(tL, "Hauteur notes (% du mois) :");
        var eNotesH = gN.add("edittext", undefined, "18"); eNotesH.characters = 5;
        gN.add("statictext", undefined, "Titre :"); var eNotesT = gN.add("edittext", undefined, "Notes"); eNotesT.characters = 12;
        function updLay() { gCu.enabled = (dPaper.selection.index === PAPERS.length - 1); gN.enabled = cbNotes.value; }
        dPaper.onChange = updLay; cbNotes.onClick = updLay;
        dPer.onChange = function () {
            var n = PER_PAGE[dPer.selection.index];
            if (dPaper.selection.index !== PAPERS.length - 1) dPaper.selection = (n === 12) ? 3 : (n === 6 ? 2 : 1);
            updLay();
        };

        // ----- Grille & cases -----
        var tC = tab("Grille & cases");
        var dCell = dd(tC, "Style des cases :", ["Aucun", "Cases", "Cases arrondies", "Cercles", "Soulignement", "Points"]);
        var cbLines = tC.add("checkbox", undefined, "Lignes de grille");
        var cbSep = tC.add("checkbox", undefined, "Ligne de séparation sous l'en-tête des jours"); cbSep.value = true;
        var cbWeekNum = tC.add("checkbox", undefined, "Numéros de semaine (ISO 8601)");
        var cbAdj = tC.add("checkbox", undefined, "Jours des mois adjacents (grisés)");
        var cbWE = tC.add("checkbox", undefined, "Mettre en évidence les week-ends"); cbWE.value = true;
        var dWEs = dd(tC, "Forme de mise en évidence :", ["Pastille arrondie", "Cercle", "Colonne entière", "Texte seulement"]);
        var eRad = numField(tC, "Rayon des coins :", 4, "mm");
        cbWE.onClick = function () { dWEs.enabled = cbWE.value; };

        // ----- Typographie -----
        var tY = tab("Typographie");
        var eFontB = row(tY, "Police titres (PostScript) :").add("edittext", undefined, "Montserrat-Bold"); eFontB.characters = 24;
        var eFontR = row(tY, "Police texte (PostScript) :").add("edittext", undefined, "Montserrat-Regular"); eFontR.characters = 24;
        tY.add("statictext", undefined, "Repli automatique : Arial-BoldMT / ArialMT / Helvetica si la police est absente.");
        var dAlign = dd(tY, "Alignement du titre :", ["Gauche", "Centre", "Droite"]);
        tY.add("statictext", undefined, "Tailles en points (0 = automatique) :");
        var eTS = numField(tY, "Titre du mois :", 0, "pt");
        var eYS = numField(tY, "Année :", 0, "pt");
        var eHS = numField(tY, "En-tête des jours :", 0, "pt");
        var eDS = numField(tY, "Numéros des jours :", 0, "pt");

        // ----- Décor -----
        var tD = tab("Décor");
        var dDeco = dd(tD, "Style principal :", DECOS, 0);
        var dDeco2 = dd(tD, "Style combiné (2e) :", DECOS, DECO_NONE);
        var cbSeason = tD.add("checkbox", undefined, "Décor saisonnier automatique (remplace les styles ci-dessus)");
        var dScope = dd(tD, "Appliquer le décor à :", ["Automatique", "La page", "Chaque mois", "Page et mois"]);
        var dPos = dd(tD, "Position :", ["Haut", "Bas", "Coins", "Tout"], 3);
        var gDen = row(tD, "Densité (1–10) :");
        var sDen = gDen.add("slider", undefined, 5, 1, 10); sDen.preferredSize.width = 160;
        var tDen = gDen.add("statictext", undefined, "5"); tDen.characters = 3;
        sDen.onChanging = function () { sDen.value = Math.round(sDen.value); tDen.text = String(sDen.value); };
        var eSize = numField(tD, "Taille :", 100, "%");
        var eOpa = numField(tD, "Opacité :", 60, "%");
        var dCSrc = dd(tD, "Couleur du décor :", ["Accent", "Décor", "Aléatoire (couleurs du thème)"], 1);
        var gSeed = row(tD, "Graine aléatoire :");
        var eSeed = gSeed.add("edittext", undefined, "2027"); eSeed.characters = 8;
        var bSeed = gSeed.add("button", undefined, "Nouvelle graine");
        bSeed.onClick = function () { eSeed.text = String(Math.floor(Math.random() * 99999) + 1); };
        var cbBar = tD.add("checkbox", undefined, "Barre d'accent au-dessus du titre"); cbBar.value = true;
        var cbGrad = tD.add("checkbox", undefined, "Fond en dégradé (fond → teinte d'accent)");
        cbSeason.onClick = function () { dDeco.enabled = dDeco2.enabled = !cbSeason.value; };

        var gb = w.add("group"); gb.alignment = "right";
        gb.add("button", undefined, "Annuler", { name: "cancel" });
        gb.add("button", undefined, "Générer", { name: "ok" });

        buildThemeList("Minuit");
        updLay();
        tp.selection = 0;
        if (w.show() !== 1) return null;

        var y = parseInt(eYear.text, 10);
        if (isNaN(y) || y < 1583 || y > 9999) { alert("Année invalide (1583–9999)."); return null; }
        var pi = dPaper.selection.index, pw, ph;
        if (pi === PAPERS.length - 1) { pw = num(eCW, 200); ph = num(eCH, 200); } else { pw = PAPERS[pi][1]; ph = PAPERS[pi][2]; }
        if (pw < 50 || ph < 50 || pw > 5000 || ph > 5000) { alert("Format invalide (50 à 5000 mm)."); return null; }

        return buildOptions({
            year: y, mondayFirst: dStart.selection.index === 0, lang: dLang.selection.index === 0 ? "FR" : "EN",
            showYear: cbYear.value, upper: cbUpper.value,
            themeName: allThemes[dTheme.selection.index].name, colors: currentColors(),
            perPage: PER_PAGE[dPer.selection.index], cols: COLS[dCols.selection.index],
            colW: num(eColW, 0), gutH: num(eGutH, 10), gutV: num(eGutV, 10), pageTitle: cbPageTitle.value,
            monthStyle: dStyle.selection.index, pwMM: pw, phMM: ph, landscape: dOri.selection.index === 1,
            marginMM: num(eMar, 12), notes: cbNotes.value, notesPct: num(eNotesH, 18), notesTitle: eNotesT.text,
            cellStyle: dCell.selection.index, gridLines: cbLines.value, sep: cbSep.value,
            weekNum: cbWeekNum.value, adjacent: cbAdj.value, weHi: cbWE.value, weStyle: dWEs.selection.index,
            radiusMM: num(eRad, 4),
            fontBold: eFontB.text, fontReg: eFontR.text, align: ["L", "C", "R"][dAlign.selection.index],
            sTitle: num(eTS, 0), sYear: num(eYS, 0), sHead: num(eHS, 0), sDay: num(eDS, 0),
            deco: dDeco.selection.index, deco2: dDeco2.selection.index, seasonal: cbSeason.value,
            decoScope: dScope.selection.index, decoPos: dPos.selection.index, density: Math.round(sDen.value),
            decoSizePct: num(eSize, 100), decoOpacity: num(eOpa, 60), colorSrc: dCSrc.selection.index,
            seed: parseInt(eSeed.text, 10) || 1, bar: cbBar.value, gradient: cbGrad.value
        });
    }

    // Normalise les options (unités, couleurs, bornes)
    function buildOptions(p) {
        var o = {}, k;
        for (k in p) if (p.hasOwnProperty(k)) o[k] = p[k];
        var pw = Math.min(p.pwMM, p.phMM), ph = Math.max(p.pwMM, p.phMM);
        if (p.landscape) { var t = pw; pw = ph; ph = t; }
        o.pw = pw * MM; o.ph = ph * MM;
        o.margin = Math.max(0, p.marginMM) * MM;
        o.gutH = Math.max(0, p.gutH) * MM; o.gutV = Math.max(0, p.gutV) * MM; o.colW = Math.max(0, p.colW) * MM;
        o.radius = Math.max(0, p.radiusMM) * MM;
        o.notesPct = clamp(p.notesPct, 5, 50) / 100;
        o.density = clamp(p.density, 1, 10);
        o.decoSize = clamp(p.decoSizePct, 10, 400) / 100;
        o.decoOpacity = clamp(p.decoOpacity, 0, 100);
        var C = {};
        for (k = 0; k < CKEYS.length; k++) C[CKEYS[k]] = hexToRgb(p.colors[CKEYS[k]]);
        C.card = mix(C.bg, C.text, 0.06);
        C.muted = mix(C.text, C.bg, 0.6);
        C.grad = mix(C.bg, C.accent, 0.22);
        o.C = C;
        return o;
    }

    // =====================================================================
    // Primitives de dessin
    // =====================================================================
    function findFont(names) {
        for (var i = 0; i < names.length; i++) {
            if (!names[i]) continue;
            try { var f = app.textFonts.getByName(names[i]); if (f) return f; } catch (e) {}
        }
        return app.textFonts[0];
    }
    function rect(parent, top, left, w, h, col, name, radius) {
        var r = (radius && radius > 0) ? parent.pathItems.roundedRectangle(top, left, w, h, radius, radius)
                                       : parent.pathItems.rectangle(top, left, w, h);
        r.filled = true; r.fillColor = rgb(col); r.stroked = false; if (name) r.name = name;
        return r;
    }
    function strokeOnly(item, col, wdt) { item.filled = false; item.stroked = true; item.strokeColor = rgb(col); item.strokeWidth = wdt; return item; }
    function circle(parent, cx, cy, r, col, name) {
        var e = parent.pathItems.ellipse(cy + r, cx - r, 2 * r, 2 * r);
        e.filled = true; e.fillColor = rgb(col); e.stroked = false; if (name) e.name = name;
        return e;
    }
    function line(parent, x1, y1, x2, y2, col, wdt, name) {
        var p = parent.pathItems.add(); p.setEntirePath([[x1, y1], [x2, y2]]);
        p.filled = false; p.stroked = true; p.strokeColor = rgb(col); p.strokeWidth = wdt; if (name) p.name = name;
        return p;
    }
    function poly(parent, pts, col, name, outline) {
        var p = parent.pathItems.add(); p.setEntirePath(pts); p.closed = true;
        if (outline) strokeOnly(p, col, outline); else { p.filled = true; p.fillColor = rgb(col); p.stroked = false; }
        if (name) p.name = name;
        return p;
    }
    function regPts(cx, cy, r, n, rot) {
        var pts = []; for (var i = 0; i < n; i++) { var a = rot + i * 2 * Math.PI / n; pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } return pts;
    }
    function starPts(cx, cy, r1, r2, n, rot) {
        var pts = []; for (var i = 0; i < 2 * n; i++) { var a = rot + i * Math.PI / n, r = (i % 2) ? r2 : r1; pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } return pts;
    }
    function txt(parent, s, x, baselineY, size, font, col, align, name) {
        var t = parent.textFrames.pointText([x, baselineY]);
        t.contents = s;
        var ca = t.textRange.characterAttributes;
        ca.textFont = font; ca.size = Math.max(1, size); ca.fillColor = rgb(col);
        var j = Justification.LEFT;
        if (align === "C") j = Justification.CENTER; else if (align === "R") j = Justification.RIGHT;
        t.textRange.paragraphAttributes.justification = j;
        if (name) t.name = name;
        return t;
    }
    function fillBackground(doc, parent, top, left, w, h, o, name) {
        var r = rect(parent, top, left, w, h, o.C.bg, name, 0);
        if (o.gradient) {
            try {
                var gr = doc.gradients.add(); gr.name = "Calendrier dégradé " + doc.gradients.length;
                gr.type = GradientType.LINEAR;
                gr.gradientStops[0].color = rgb(o.C.bg); gr.gradientStops[0].rampPoint = 0;
                gr.gradientStops[1].color = rgb(o.C.grad); gr.gradientStops[1].rampPoint = 100;
                var gc = new GradientColor(); gc.gradient = gr;
                r.fillColor = gc;
            } catch (e) { r.fillColor = rgb(o.C.bg); }
        }
        return r;
    }
    function clipTo(g, l, t, w, h, radius) {
        if (g.pageItems.length === 0) { g.remove(); return null; }
        var c = (radius > 0) ? g.pathItems.roundedRectangle(t, l, w, h, radius, radius) : g.pathItems.rectangle(t, l, w, h);
        c.name = "Masque"; c.filled = false; c.stroked = false;
        g.clipped = true;
        return g;
    }

    // Générateur pseudo-aléatoire déterministe (Park–Miller)
    function Rng(seed) { this.s = Math.abs(Math.floor(seed)) % 2147483647; if (this.s <= 0) this.s += 2147483646; this.next(); }
    Rng.prototype.next = function () { this.s = (this.s * 16807) % 2147483647; return (this.s - 1) / 2147483646; };
    Rng.prototype.range = function (a, b) { return a + (b - a) * this.next(); };
    Rng.prototype.pick = function (arr) { return arr[Math.floor(this.next() * arr.length) % arr.length]; };

    // =====================================================================
    // Décors
    // =====================================================================
    function blob(parent, cx, cy, r, rng, col, name) {
        var n = 6, pts = [], i, a, rr, k;
        for (i = 0; i < n; i++) { a = (i / n) * Math.PI * 2; rr = r * (0.78 + rng.next() * 0.38); pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, a, rr]); }
        var p = parent.pathItems.add(), anchors = [];
        for (i = 0; i < n; i++) anchors.push([pts[i][0], pts[i][1]]);
        p.setEntirePath(anchors); p.closed = true;
        for (i = 0; i < n; i++) {
            a = pts[i][2]; rr = pts[i][3]; k = rr * 4 / 3 * Math.tan(Math.PI / (2 * n));
            var tx = -Math.sin(a), ty = Math.cos(a), pp = p.pathPoints[i];
            pp.leftDirection = [pts[i][0] - tx * k, pts[i][1] - ty * k];
            pp.rightDirection = [pts[i][0] + tx * k, pts[i][1] + ty * k];
            pp.pointType = PointType.SMOOTH;
        }
        p.filled = true; p.fillColor = rgb(col); p.stroked = false; if (name) p.name = name;
        return p;
    }
    // Vague : depth > 0 remplit vers le bas, depth < 0 vers le haut
    function wave(parent, left, baseY, w, amp, waves, depth, col, name) {
        var seg = Math.max(2, waves * 2), step = w / seg, i, pts = [];
        for (i = 0; i <= seg; i++) pts.push([left + i * step, baseY + ((i % 2) ? amp : -amp)]);
        var all = pts.slice(0); all.push([left + w, baseY - depth]); all.push([left, baseY - depth]);
        var p = parent.pathItems.add(); p.setEntirePath(all); p.closed = true;
        var hk = step * 0.5;
        for (i = 0; i <= seg; i++) {
            var pp = p.pathPoints[i];
            pp.leftDirection = [pts[i][0] - hk, pts[i][1]]; pp.rightDirection = [pts[i][0] + hk, pts[i][1]];
            pp.pointType = PointType.SMOOTH;
        }
        p.filled = true; p.fillColor = rgb(col); p.stroked = false; if (name) p.name = name;
        return p;
    }
    function leaf(parent, cx, cy, L, ang, col, name) {
        var dx = Math.cos(ang), dy = Math.sin(ang), nx = -dy, ny = dx;
        var bx = cx - dx * L / 2, by = cy - dy * L / 2, tx = cx + dx * L / 2, ty = cy + dy * L / 2;
        var g = parent.groupItems.add(); g.name = name || "Feuille";
        var p = g.pathItems.add(); p.setEntirePath([[bx, by], [tx, ty]]); p.closed = true;
        var a = 0.25 * L, b = 0.35 * L;
        p.pathPoints[0].rightDirection = [bx + dx * a + nx * b, by + dy * a + ny * b];
        p.pathPoints[0].leftDirection = [bx + dx * a - nx * b, by + dy * a - ny * b];
        p.pathPoints[1].leftDirection = [tx - dx * a + nx * b, ty - dy * a + ny * b];
        p.pathPoints[1].rightDirection = [tx - dx * a - nx * b, ty - dy * a - ny * b];
        p.filled = true; p.fillColor = rgb(col); p.stroked = false;
        var vein = line(g, bx - dx * L * 0.08, by - dy * L * 0.08, tx - dx * L * 0.15, ty - dy * L * 0.15, col, Math.max(0.4, L * 0.025), "Nervure");
        vein.opacity = 70;
        return g;
    }

    // Zones selon la position : 0 haut, 1 bas, 2 coins, 3 tout
    function decoZones(pos, B) {
        var m = Math.min(B.w, B.h), c = m * 0.34;
        if (pos === 0) return [{ l: B.l, t: B.t, w: B.w, h: B.h * 0.3, edge: "top", corner: "tr" }];
        if (pos === 1) return [{ l: B.l, t: B.t - B.h * 0.7, w: B.w, h: B.h * 0.3, edge: "bottom", corner: "bl" }];
        if (pos === 2) return [
            { l: B.l, t: B.t, w: c, h: c, edge: "top", corner: "tl" },
            { l: B.l + B.w - c, t: B.t, w: c, h: c, edge: "top", corner: "tr" },
            { l: B.l, t: B.t - B.h + c, w: c, h: c, edge: "bottom", corner: "bl" },
            { l: B.l + B.w - c, t: B.t - B.h + c, w: c, h: c, edge: "bottom", corner: "br" }];
        return [{ l: B.l, t: B.t, w: B.w, h: B.h, edge: "all", corner: "tr" }];
    }

    function drawStyle(g, st, B, o, rng) {
        var C = o.C, MIN = Math.min(B.w, B.h), S = MIN * o.decoSize, dens = o.density, op = o.decoOpacity;
        var palette = [C.accent, C.decor, C.weekend, C.header, C.title];
        function col() { return o.colorSrc === 0 ? C.accent : (o.colorSrc === 1 ? C.decor : rng.pick(palette)); }
        function col2() { return o.colorSrc === 2 ? rng.pick(palette) : (o.colorSrc === 0 ? C.decor : C.accent); }
        function cnt(z, k) { return clamp(Math.round(dens * k * (z.w * z.h) / (S * S) * 4), 1, 400); }
        function rx(z) { return z.l + rng.next() * z.w; }
        function ry(z) { return z.t - rng.next() * z.h; }
        function setOp(it, f) { it.opacity = clamp(op * (f || 1), 0, 100); return it; }
        var zones = decoZones(o.decoPos, B), zi, z, i, j, it, n, lw = Math.max(0.5, S * 0.006);

        if (st === 14) { // Bordure cadre
            var ins = S * 0.035, ins2 = S * 0.055, rr = Math.max(0, o.radius * 0.6);
            it = g.pathItems.roundedRectangle(B.t - ins, B.l + ins, B.w - 2 * ins, B.h - 2 * ins, rr, rr);
            setOp(strokeOnly(it, col(), Math.max(1, S * 0.008)), 1); it.name = "Cadre";
            it = g.pathItems.roundedRectangle(B.t - ins2, B.l + ins2, B.w - 2 * ins2, B.h - 2 * ins2, rr, rr);
            setOp(strokeOnly(it, col2(), lw), 0.7); it.name = "Cadre intérieur";
            var cs = S * 0.03, cx4 = [B.l + ins, B.l + B.w - ins], cy4 = [B.t - ins, B.t - B.h + ins];
            for (i = 0; i < 2; i++) for (j = 0; j < 2; j++) setOp(poly(g, regPts(cx4[i], cy4[j], cs, 4, Math.PI / 4), col(), "Coin"), 1);
            return;
        }
        for (zi = 0; zi < zones.length; zi++) {
            z = zones[zi];
            var zg = g.groupItems.add(); zg.name = DECOS[st] + " " + (zi + 1);
            var top = z.edge === "top";
            switch (st) {
            case 0: // Cercles
                n = cnt(z, 0.08);
                for (i = 0; i < n; i++) {
                    var r0 = S * rng.range(0.03, 0.2);
                    it = circle(zg, rx(z), ry(z), r0, col(), "Cercle");
                    if (rng.next() < 0.3) strokeOnly(it, col(), lw * 1.5);
                    setOp(it, rng.range(0.5, 1));
                }
                break;
            case 1: // Vagues
                n = 1 + Math.floor(dens / 3);
                for (i = 0; i < n; i++) {
                    var amp = S * (0.015 + 0.01 * rng.next()), base = top ? z.t - z.h * (0.25 + 0.5 * (n - i) / (n + 1)) : z.t - z.h + z.h * (0.25 + 0.5 * (n - i) / (n + 1));
                    it = wave(zg, z.l - 2, base, z.w + 4, amp, 2 + Math.round(rng.range(1, 4) * (z.w / S) / 2), top ? -(z.h + amp * 2) : z.h + amp * 2, i % 2 ? col2() : col(), "Vague " + (i + 1));
                    setOp(it, 0.35 + 0.15 * i);
                }
                break;
            case 2: // Blobs organiques
                n = cnt(z, 0.03);
                for (i = 0; i < n; i++) setOp(blob(zg, rx(z), ry(z), S * rng.range(0.06, 0.28), rng, col(), "Blob"), rng.range(0.4, 0.9));
                break;
            case 3: // Lignes géométriques
                n = 3 + Math.round(dens * 1.2);
                var sp = (z.w + z.h) / n;
                for (i = 0; i < n; i++) {
                    var x0 = z.l - z.h + i * sp;
                    setOp(line(zg, x0, z.t - z.h, x0 + z.h, z.t, i % 2 ? col2() : col(), lw, "Diagonale"), 0.8);
                }
                for (i = 0; i < Math.ceil(dens / 2); i++) {
                    var sq = S * rng.range(0.04, 0.1);
                    it = zg.pathItems.rectangle(ry(z), rx(z), sq, sq); strokeOnly(it, col(), lw * 1.5); it.rotate(rng.range(0, 90)); setOp(it, 1); it.name = "Carré";
                }
                break;
            case 4: // Triangles
                n = cnt(z, 0.2);
                for (i = 0; i < n; i++) {
                    it = poly(zg, regPts(rx(z), ry(z), S * rng.range(0.02, 0.09), 3, rng.range(0, 6.3)), col(), "Triangle", rng.next() < 0.35 ? lw * 1.5 : 0);
                    setOp(it, rng.range(0.5, 1));
                }
                break;
            case 5: // Hexagones
                var hr = Math.max(S * 0.06, MIN * 0.03), hw = Math.sqrt(3) * hr, keep = dens / 10;
                for (j = 0; j * hr * 1.5 < z.h + hr * 2; j++) for (i = -1; i * hw < z.w + hw; i++) {
                    if (rng.next() > keep) continue;
                    var hx = z.l + i * hw + (j % 2 ? hw / 2 : 0), hy = z.t - j * hr * 1.5;
                    it = poly(zg, regPts(hx, hy, hr * 0.92, 6, Math.PI / 6), col(), "Hexagone", rng.next() < 0.6 ? lw : 0);
                    setOp(it, rng.range(0.4, 1));
                }
                break;
            case 6: // Confettis
                n = cnt(z, 0.6);
                for (i = 0; i < n; i++) {
                    var cx = rx(z), cy = ry(z), cz = S * rng.range(0.008, 0.022), c3 = rng.pick([C.accent, C.decor, C.weekend, C.header]);
                    if (o.colorSrc !== 2) c3 = rng.next() < 0.5 ? col() : col2();
                    if (rng.next() < 0.6) { it = rect(zg, cy + cz, cx - cz * 0.4, cz * 0.8, cz * 2, c3, "Confetti"); it.rotate(rng.range(0, 180)); }
                    else it = circle(zg, cx, cy, cz * 0.6, c3, "Confetti");
                    setOp(it, 1);
                }
                break;
            case 7: // Points / pois
                var ps = Math.max(S * (0.16 - dens * 0.011), MIN * 0.02), pr = ps * 0.16;
                for (j = 0; j * ps < z.h + ps; j++) for (i = 0; i * ps < z.w + ps; i++)
                    setOp(circle(zg, z.l + i * ps + (j % 2 ? ps / 2 : 0), z.t - j * ps, pr, col(), "Pois"), 0.8);
                break;
            case 8: // Rayures diagonales
                var rs = Math.max(S * (0.2 - dens * 0.015), MIN * 0.02);
                for (i = 0; i * rs < z.w + z.h; i++) {
                    var xs = z.l - z.h + i * rs;
                    setOp(line(zg, xs, z.t - z.h - 2, xs + z.h + 4, z.t + 2, i % 2 ? col2() : col(), rs * 0.32, "Rayure"), 0.6);
                }
                break;
            case 9: // Zellige / arabesque géométrique (étoile à 8 branches)
                var zr = Math.max(S * (0.13 - dens * 0.007), MIN * 0.025), stp = zr * 2.1, zc1 = col(), zc2 = col2();
                for (j = 0; j * stp < z.h + stp; j++) for (i = 0; i * stp < z.w + stp; i++) {
                    var zx = z.l + i * stp, zy = z.t - j * stp;
                    setOp(poly(zg, starPts(zx, zy, zr, zr * 0.76, 8, Math.PI / 8), zc1, "Khatam", lw * 1.2), 0.9);
                    setOp(poly(zg, regPts(zx, zy, zr * 0.42, 8, Math.PI / 8), zc2, "Octogone"), 0.55);
                    setOp(poly(zg, regPts(zx + stp / 2, zy - stp / 2, zr * 0.3, 4, Math.PI / 4), zc1, "Losange"), 0.7);
                }
                break;
            case 10: // Étoiles
                n = cnt(z, 0.15);
                for (i = 0; i < n; i++) {
                    var sr = S * rng.range(0.015, 0.06);
                    setOp(poly(zg, starPts(rx(z), ry(z), sr, sr * 0.45, 5, rng.range(0, 1.3)), col(), "Étoile"), rng.range(0.5, 1));
                    if (rng.next() < 0.6) setOp(circle(zg, rx(z), ry(z), S * 0.005, col2(), "Scintillement"), 0.8);
                }
                break;
            case 11: // Feuilles stylisées
                n = cnt(z, 0.1);
                for (i = 0; i < n; i++) setOp(leaf(zg, rx(z), ry(z), S * rng.range(0.06, 0.18), rng.range(0, 6.3), col(), "Feuille"), rng.range(0.5, 1));
                break;
            case 12: // Montagnes
                var layers = 2, peaks;
                for (j = 0; j < layers; j++) {
                    peaks = 2 + Math.round(dens / 2) + j;
                    var mp = [], bY = top ? z.t : z.t - z.h, sgn = top ? -1 : 1, wstep = z.w / peaks;
                    mp.push([z.l - 2, bY]);
                    for (i = 0; i < peaks; i++) {
                        var ph = z.h * rng.range(0.35, 0.85) * (j === 0 ? 1 : 0.7);
                        mp.push([z.l + wstep * (i + 0.5) + rng.range(-0.2, 0.2) * wstep, bY + sgn * ph]);
                        mp.push([z.l + wstep * (i + 1), bY + sgn * ph * rng.range(0.2, 0.45)]);
                    }
                    mp.push([z.l + z.w + 2, bY]);
                    setOp(poly(zg, mp, j === 0 ? col2() : col(), "Montagnes " + (j + 1)), j === 0 ? 0.45 : 0.85);
                }
                break;
            case 13: // Soleil / rayons
                var sx = z.corner.charAt(1) === "r" ? z.l + z.w * 0.8 : z.l + z.w * 0.2;
                var sy = z.corner.charAt(0) === "t" ? z.t - z.h * 0.25 : z.t - z.h * 0.75;
                if (z.edge === "all") { sx = z.l + z.w * 0.82; sy = z.t - Math.min(z.w, z.h) * 0.15; }
                var sR = S * 0.1, rays = 8 + dens * 2, sc = col();
                for (i = 0; i < rays; i++) {
                    var a = i * 2 * Math.PI / rays, da = Math.PI / rays * 0.45;
                    setOp(poly(zg, [[sx + Math.cos(a - da) * sR * 1.35, sy + Math.sin(a - da) * sR * 1.35],
                                    [sx + Math.cos(a) * sR * (i % 2 ? 1.9 : 2.4), sy + Math.sin(a) * sR * (i % 2 ? 1.9 : 2.4)],
                                    [sx + Math.cos(a + da) * sR * 1.35, sy + Math.sin(a + da) * sR * 1.35]], sc, "Rayon"), 0.7);
                }
                setOp(circle(zg, sx, sy, sR, sc, "Soleil"), 1);
                setOp(circle(zg, sx, sy, sR * 1.2, col2(), "Halo"), 0.3);
                break;
            }
            clipTo(zg, z.l, z.t, z.w, z.h, 0);
        }
    }

    // Dessine le décor d'une zone (page ou mois), regroupé et masqué
    function drawDecor(parent, o, B, monthIdx, salt, label) {
        var styles = o.seasonal ? SEASON[monthIdx] : [o.deco, o.deco2];
        var g = parent.groupItems.add(); g.name = "Décor - " + label;
        var done = {};
        for (var i = 0; i < styles.length; i++) {
            var st = styles[i];
            if (st === DECO_NONE || done[st]) continue;
            done[st] = true;
            var rng = new Rng(o.seed * 31 + salt * 977 + st * 131 + i * 7 + 1);
            var sg = g.groupItems.add(); sg.name = DECOS[st];
            drawStyle(sg, st, B, o, rng);
            if (sg.pageItems.length === 0) sg.remove();
        }
        return clipTo(g, B.l, B.t, B.w, B.h, B.r || 0);
    }

    // =====================================================================
    // Mois
    // =====================================================================
    function cellDeco(g, o, style, cx, cy, cw, ch, numSize, inMonth) {
        if (style === 0) return;
        var C = o.C, sz = Math.min(cw, ch) * 0.86, lw = Math.max(0.4, sz * 0.025), it;
        if (style === 1) { it = g.pathItems.rectangle(cy + ch * 0.46, cx - cw * 0.46, cw * 0.92, ch * 0.92); strokeOnly(it, C.header, lw); }
        else if (style === 2) { it = rect(g, cy + ch * 0.45, cx - cw * 0.45, cw * 0.9, ch * 0.9, C.header, null, Math.min(cw, ch) * 0.22); it.opacity = 14; }
        else if (style === 3) { it = g.pathItems.ellipse(cy + sz * 0.42, cx - sz * 0.42, sz * 0.84, sz * 0.84); strokeOnly(it, C.header, lw); }
        else if (style === 4) { it = line(g, cx - cw * 0.3, cy - numSize * 0.55, cx + cw * 0.3, cy - numSize * 0.55, C.accent, lw * 1.5); }
        else { it = circle(g, cx, cy - numSize * 0.75, Math.max(0.6, numSize * 0.08), C.accent); }
        it.name = "Case";
        if (!inMonth) it.opacity = (it.opacity || 100) * 0.4;
        else if (style !== 2) it.opacity = 55;
    }

    function drawMonth(contentGroup, fondLayer, decoLayer, o, m, left, top, w, h, fonts, asCard) {
        var C = o.C, Y = o.year, k, r, d;
        var group = contentGroup.groupItems.add(); group.name = MONTHS[o.lang][m] + " " + Y;
        var pad = asCard ? Math.min(w, h) * 0.07 : 0;
        if (asCard) {
            rect(fondLayer, top, left, w, h, C.card, "Carte - " + MONTHS[o.lang][m], o.radius);
            if (o.decoMonth) drawDecor(decoLayer, o, { l: left, t: top, w: w, h: h, r: o.radius }, m, m + 1, MONTHS[o.lang][m]);
        }
        var innerL = left + pad, innerW = w - 2 * pad, innerTop = top - pad, innerBottom = top - h + pad;

        // --- En-tête ---
        var hg = group.groupItems.add(); hg.name = "En-tête";
        var titleSize = o.sTitle > 0 ? o.sTitle : Math.min(w * 0.105, h * 0.09);
        var yearSize = o.sYear > 0 ? o.sYear : titleSize * 0.42;
        var y = innerTop;
        var ax = innerL; if (o.align === "C") ax = innerL + innerW / 2; else if (o.align === "R") ax = innerL + innerW;
        if (o.bar) {
            var barW = innerW * 0.16, barH = Math.max(2, titleSize * 0.09);
            var bx = innerL; if (o.align === "C") bx = ax - barW / 2; else if (o.align === "R") bx = ax - barW;
            rect(hg, y, bx, barW, barH, C.accent, "Barre accent", barH / 2);
            y -= barH + titleSize * 0.3;
        }
        var name = MONTHS[o.lang][m]; if (o.upper) name = name.toUpperCase();
        var tb = y - titleSize * 0.75;
        txt(hg, name, ax, tb, titleSize, fonts.bold, C.title, o.align, "Titre mois");
        y = tb - titleSize * 0.25;
        if (o.showYear) {
            var yb = y - yearSize * 0.75;
            txt(hg, String(Y), ax, yb, yearSize, fonts.reg, C.accent, o.align, "Année");
            y = yb - yearSize * 0.35;
        }
        var gridTop = y - titleSize * 0.35;
        var gridBottom = o.notes ? innerBottom + h * o.notesPct + h * 0.02 : innerBottom;
        var gridH = gridTop - gridBottom;
        if (gridH <= 0) return group;

        var first = dayOfWeek(Y, m, 1), n = daysInMonth(Y, m);
        var s1 = daysFromCivil(Y, m + 1, 1);
        var hdrSize, numSize;

        if (o.monthStyle === 1) {
            // ---------- Agenda : liste verticale ----------
            var lg = group.groupItems.add(); lg.name = "Liste des jours";
            var rh = gridH / n;
            numSize = o.sDay > 0 ? o.sDay : Math.min(rh * 0.6, innerW * 0.08);
            hdrSize = o.sHead > 0 ? o.sHead : numSize * 0.7;
            var numCol = Math.max(numSize * 1.6, innerW * 0.08);
            for (d = 1; d <= n; d++) {
                var dw = (first + d - 1) % 7, we = (dw === 0 || dw === 6), rt = gridTop - (d - 1) * rh;
                var hl = we && o.weHi;
                if (hl && o.weStyle !== 3) rect(lg, rt - rh * 0.06, innerL, innerW, rh * 0.88, C.weekend, "Fond WE " + d, Math.min(o.radius, rh * 0.4)).opacity = 15;
                var bl = rt - rh * 0.5 - numSize * 0.35;
                txt(lg, String(d), innerL + numCol, bl, numSize, fonts.bold, hl ? C.weekend : C.text, "R", "Jour " + d);
                txt(lg, DAYS[o.lang][dw], innerL + numCol + numSize * 0.6, bl, hdrSize, fonts.reg, hl ? C.weekend : C.header, "L", "Nom " + d);
                if (o.weekNum && (dw === 1 || d === 1)) txt(lg, (o.lang === "FR" ? "S" : "W") + isoWeek(s1 + d - 1), innerL + innerW - 2, bl, hdrSize * 0.8, fonts.reg, C.muted, "R", "Semaine");
                if (o.gridLines || o.cellStyle === 4 || o.cellStyle === 0) line(lg, innerL + numCol + numSize * 0.6 + hdrSize * 2.6, rt - rh, innerL + innerW, rt - rh, C.header, 0.5, "Ligne " + d).opacity = (o.gridLines ? 50 : 25);
                if (o.cellStyle === 1 || o.cellStyle === 2) {
                    var bb = rect(lg, rt - rh * 0.08, innerL, innerW, rh * 0.84, C.header, "Case", o.cellStyle === 2 ? Math.min(rh * 0.3, o.radius) : 0);
                    if (o.cellStyle === 1) { strokeOnly(bb, C.header, 0.5); bb.opacity = 50; } else bb.opacity = 10;
                    bb.zOrder(ZOrderMethod.SENDTOBACK);
                }
                if (o.cellStyle === 3 || o.cellStyle === 5) cellDeco(lg, o, o.cellStyle, innerL + numCol - numSize * 0.55, rt - rh * 0.5, numSize * 1.8, rh, numSize, true);
            }
        } else if (o.monthStyle === 2) {
            // ---------- Agenda : bande horizontale ----------
            var sgp = group.groupItems.add(); sgp.name = "Bande des jours";
            var cwS = innerW / n, stripH = Math.min(gridH, cwS * 3.2), half = stripH / 2;
            numSize = o.sDay > 0 ? o.sDay : Math.min(cwS * 0.55, half * 0.55);
            hdrSize = o.sHead > 0 ? o.sHead : numSize * 0.65;
            if (o.gridLines) for (k = 0; k <= n; k++) line(sgp, innerL + k * cwS, gridTop, innerL + k * cwS, gridTop - stripH, C.header, 0.4, "Ligne").opacity = 40;
            for (d = 1; d <= n; d++) {
                var dw2 = (first + d - 1) % 7, we2 = (dw2 === 0 || dw2 === 6), hl2 = we2 && o.weHi, cx = innerL + cwS * (d - 0.5);
                if (hl2 && o.weStyle !== 3) rect(sgp, gridTop, cx - cwS * 0.45, cwS * 0.9, stripH, C.weekend, "Fond WE " + d, Math.min(cwS * 0.4, o.radius)).opacity = 15;
                cellDeco(sgp, o, o.cellStyle, cx, gridTop - half * 1.4, cwS, half, numSize, true);
                txt(sgp, DAYS[o.lang][dw2].charAt(0), cx, gridTop - half * 0.55, hdrSize, fonts.bold, hl2 ? C.weekend : C.header, "C", "Initiale " + d);
                txt(sgp, String(d), cx, gridTop - half * 1.4 - numSize * 0.35, numSize, hl2 ? fonts.bold : fonts.reg, hl2 ? C.weekend : C.text, "C", "Jour " + d);
                if (o.weekNum && dw2 === 1) txt(sgp, String(isoWeek(s1 + d - 1)), cx, gridTop - stripH - hdrSize * 1.1, hdrSize * 0.75, fonts.reg, C.muted, "C", "Semaine");
            }
            if (o.sep) rect(sgp, gridTop - half * 0.8, innerL, innerW, 0.5, C.header, "Séparateur").opacity = 50;
        } else {
            // ---------- Grille classique ----------
            var wnW = o.weekNum ? innerW * 0.08 : 0;
            var gL = innerL + wnW, cellW = (innerW - wnW) / 7, rowH = gridH / 7;
            hdrSize = o.sHead > 0 ? o.sHead : Math.min(cellW * 0.3, rowH * 0.38);
            numSize = o.sDay > 0 ? o.sDay : Math.min(cellW * 0.36, rowH * 0.45);
            var order = [];
            for (k = 0; k < 7; k++) order.push(o.mondayFirst ? (k + 1) % 7 : k);
            var offset = o.mondayFirst ? (first + 6) % 7 : first;
            var pY = m === 0 ? Y - 1 : Y, pM = m === 0 ? 11 : m - 1, pn = daysInMonth(pY, pM);
            var usedRows = Math.ceil((offset + n) / 7), rowsShown = o.adjacent ? 6 : usedRows;

            var hlg = group.groupItems.add(); hlg.name = "Mise en évidence week-end";
            if (o.weHi && o.weStyle === 2) {
                for (k = 0; k < 7; k++) if (order[k] === 0 || order[k] === 6)
                    rect(hlg, gridTop, gL + cellW * k + cellW * 0.06, cellW * 0.88, rowH * (1 + rowsShown), C.weekend, "Colonne " + DAYS[o.lang][order[k]], Math.min(cellW, rowH) * 0.3).opacity = 14;
            }
            if (o.gridLines) {
                var gl = group.groupItems.add(); gl.name = "Lignes de grille";
                var gTop = gridTop - rowH, gBot = gridTop - rowH * (1 + rowsShown);
                for (r = 0; r <= rowsShown; r++) line(gl, gL, gTop - r * rowH, gL + cellW * 7, gTop - r * rowH, C.header, 0.5, "H").opacity = 40;
                for (k = 0; k <= 7; k++) line(gl, gL + k * cellW, gTop, gL + k * cellW, gBot, C.header, 0.5, "V").opacity = 40;
            }
            var wg = group.groupItems.add(); wg.name = "Jours semaine";
            for (k = 0; k < 7; k++) {
                var wd = order[k], wke = (wd === 0 || wd === 6);
                txt(wg, DAYS[o.lang][wd].toUpperCase(), gL + cellW * (k + 0.5), gridTop - rowH * 0.6, hdrSize, fonts.bold, (wke && o.weHi) ? C.weekend : C.header, "C", DAYS[o.lang][wd]);
            }
            if (o.weekNum) txt(wg, o.lang === "FR" ? "SEM." : "WK", innerL + wnW * 0.45, gridTop - rowH * 0.6, hdrSize * 0.75, fonts.reg, C.muted, "C", "Semaine");
            if (o.sep && !o.gridLines) rect(wg, gridTop - rowH * 0.9, innerL, innerW, Math.max(0.5, h * 0.0018), C.header, "Séparateur").opacity = 60;

            var cg = group.groupItems.add(); cg.name = "Cases";
            var dg = group.groupItems.add(); dg.name = "Jours";
            var totalCells = o.adjacent ? 42 : offset + n;
            for (var cell = 0; cell < totalCells; cell++) {
                var col = cell % 7; r = Math.floor(cell / 7);
                d = cell - offset + 1;
                var inMonth = true, label;
                if (d < 1) { if (!o.adjacent) continue; label = String(pn + d); inMonth = false; }
                else if (d > n) { label = String(d - n); inMonth = false; }
                else label = String(d);
                var dwc = order[col], wkd = (dwc === 0 || dwc === 6);
                var ccx = gL + cellW * (col + 0.5), ccy = gridTop - rowH * (r + 1) - rowH * 0.5;
                var hlc = inMonth && wkd && o.weHi;
                cellDeco(cg, o, o.cellStyle, ccx, ccy, cellW, rowH, numSize, inMonth);
                if (hlc && (o.weStyle === 0 || o.weStyle === 1)) {
                    var sz = Math.min(cellW, rowH) * 0.8, b;
                    if (o.weStyle === 1) b = circle(dg, ccx, ccy, sz / 2, C.weekend, "Fond WE " + d);
                    else b = rect(dg, ccy + sz / 2, ccx - sz / 2, sz, sz, C.weekend, "Fond WE " + d, sz * 0.3);
                    b.opacity = 18;
                }
                var t = txt(dg, label, ccx, ccy - numSize * 0.35, numSize, hlc ? fonts.bold : fonts.reg,
                            inMonth ? (hlc ? C.weekend : C.text) : C.muted, "C", (inMonth ? "Jour " : "Adjacent ") + label);
                if (!inMonth) t.opacity = 55;
            }
            if (cg.pageItems.length === 0) cg.remove();
            if (o.weekNum) {
                var ng = group.groupItems.add(); ng.name = "Numéros de semaine";
                var monCol = o.mondayFirst ? 0 : 1;
                for (r = 0; r < rowsShown; r++) {
                    var wk = isoWeek(s1 - offset + r * 7 + monCol);
                    txt(ng, String(wk), innerL + wnW * 0.45, gridTop - rowH * (r + 1.5) - numSize * 0.25, numSize * 0.6, fonts.reg, C.muted, "C", "Semaine " + wk);
                }
            }
        }

        if (o.notes) {
            var nG = group.groupItems.add(); nG.name = "Notes";
            var nHh = h * o.notesPct, nTop = innerBottom + nHh, nr = Math.min(o.radius, nHh / 2);
            var box = nG.pathItems.roundedRectangle(nTop, innerL, innerW, nHh, nr, nr);
            strokeOnly(box, C.header, Math.max(0.5, w * 0.002)); box.opacity = 60; box.name = "Cadre notes";
            var ns = Math.max(5, (hdrSize || 8) * 0.9);
            txt(nG, String(o.notesTitle).toUpperCase(), innerL + nr * 0.5 + 6, nTop - ns * 1.4, ns, fonts.bold, C.accent, "L", "Titre notes");
            var lines = Math.max(1, Math.floor((nHh - ns * 2.2) / (ns * 2.2)));
            for (var li = 1; li <= lines; li++) {
                var ly = nTop - ns * 2.2 - li * ((nHh - ns * 2.2) / (lines + 1));
                line(nG, innerL + 8, ly, innerL + innerW - 8, ly, C.header, 0.5, "Ligne " + li).opacity = 40;
            }
        }
        return group;
    }

    // =====================================================================
    // Génération
    // =====================================================================
    function pad2d(n) { return (n < 10 ? "0" : "") + n; }
    function autoCols(N, landscape) {
        if (N === 1) return 1;
        if (N === 2) return landscape ? 2 : 1;
        if (N === 3) return landscape ? 3 : 1;
        if (N === 4) return 2;
        if (N === 6) return landscape ? 3 : 2;
        return landscape ? 4 : 3;
    }

    function render(o) {
        var fonts = {
            bold: findFont([o.fontBold, "Arial-BoldMT", "Helvetica-Bold", "ArialMT", "Helvetica"]),
            reg:  findFont([o.fontReg, "ArialMT", "Helvetica", "Arial-BoldMT"])
        };
        var N = o.perPage, pages = Math.ceil(12 / N), PW = o.pw, PH = o.ph, mg = o.margin;
        var landscape = PW > PH * 1.05;
        var cols = o.cols > 0 ? Math.min(o.cols, N) : autoCols(N, landscape);
        var rows = Math.ceil(N / cols);
        var asCard = N > 1;
        // Portée du décor : 0 auto, 1 page, 2 mois, 3 les deux
        var sc = o.decoScope;
        o.decoPage = (sc === 1 || sc === 3 || (sc === 0 && !asCard));
        o.decoMonth = asCard && (sc === 2 || sc === 3 || sc === 0);
        if (!asCard && sc === 2) o.decoPage = true;

        var doc = app.documents.add(DocumentColorSpace.RGB, PW, PH);
        var gap = 20 * MM, perRow = Math.min(pages, 4), p, m;
        for (p = 0; p < pages; p++) {
            var L = (p % perRow) * (PW + gap), T = -Math.floor(p / perRow) * (PH + gap);
            var ab = (p === 0) ? doc.artboards[0] : doc.artboards.add([L, T, L + PW, T - PH]);
            if (p === 0) ab.artboardRect = [L, T, L + PW, T - PH];
        }
        var base = doc.layers[0];
        for (p = 0; p < pages; p++) {
            var m0 = p * N, m1 = Math.min(12, m0 + N) - 1;
            var title = (N === 12) ? "Affiche " + o.year : (N === 1 ? pad2d(m0 + 1) + " - " + MONTHS[o.lang][m0] : "Page " + (p + 1) + " - " + MONTHS[o.lang][m0] + " à " + MONTHS[o.lang][m1]);
            doc.artboards[p].name = (N === 1) ? MONTHS[o.lang][m0] + " " + o.year : title;
            var R = doc.artboards[p].artboardRect, X0 = R[0], Y0 = R[1];
            var lay = doc.layers.add(); lay.name = title;
            var lFond = lay.layers.add(); lFond.name = "Fond";
            var lDeco = lay.layers.add(); lDeco.name = "Décor";
            var lCont = lay.layers.add(); lCont.name = "Contenu";

            fillBackground(doc, lFond, Y0, X0, PW, PH, o, "Fond page");
            if (o.decoPage) drawDecor(lDeco, o, { l: X0, t: Y0, w: PW, h: PH, r: 0 }, m0, 100 + p, "Page " + (p + 1));

            var top = Y0 - mg;
            if (asCard && o.pageTitle) {
                var tg = lCont.groupItems.add(); tg.name = "Titre de page";
                var S = Math.min(PW, PH), tSize = S * (N === 12 ? 0.11 : 0.07), yy = top;
                var ax = X0 + mg; if (o.align === "C") ax = X0 + PW / 2; else if (o.align === "R") ax = X0 + PW - mg;
                if (o.bar) {
                    var bW = S * 0.1, bH = Math.max(2, S * 0.008), bx = ax;
                    if (o.align === "C") bx = ax - bW / 2; else if (o.align === "R") bx = ax - bW;
                    rect(tg, yy, bx, bW, bH, o.C.accent, "Barre accent", bH / 2); yy -= bH + tSize * 0.25;
                }
                yy -= tSize * 0.75;
                txt(tg, String(o.year), ax, yy, tSize, fonts.bold, o.C.title, o.align, "Titre année");
                yy -= tSize * 0.45;
                txt(tg, o.lang === "FR" ? "CALENDRIER" : "CALENDAR", ax, yy, tSize * 0.18, fonts.reg, o.C.accent, o.align, "Sous-titre");
                top = yy - tSize * 0.3;
            }
            var availW = PW - 2 * mg, availH = top - (Y0 - PH + mg);
            var cw = (availW - (cols - 1) * o.gutH) / cols;
            if (o.colW > 0) cw = Math.min(cw, o.colW);
            var xOff = (availW - (cols * cw + (cols - 1) * o.gutH)) / 2;
            var ch = (availH - (rows - 1) * o.gutV) / rows;
            if (ch < 15 * MM || cw < 15 * MM) { alert("Format trop petit pour " + N + " mois par page avec " + cols + " colonne(s)."); return doc; }
            for (m = m0; m <= m1; m++) {
                var idx = m - m0;
                drawMonth(lCont, lFond, lDeco, o, m, X0 + mg + xOff + (idx % cols) * (cw + o.gutH), top - Math.floor(idx / cols) * (ch + o.gutV), cw, ch, fonts, asCard);
            }
            if (lDeco.pageItems.length === 0) { try { lDeco.remove(); } catch (e0) {} }
        }
        try { if (base.pageItems.length === 0 && base.layers.length === 0) base.remove(); } catch (e) {}
        return doc;
    }

    function main() {
        var o = showDialog(); if (!o) return;
        render(o);
        app.redraw();
        alert("Calendrier " + o.year + " généré (thème « " + o.themeName + " »).");
    }

    // Exposé pour les tests hors Illustrator
    if (typeof app === "undefined" || (typeof __CAL_TEST__ !== "undefined")) {
        $__cal = { isLeap: isLeap, daysInMonth: daysInMonth, dayOfWeek: dayOfWeek, isoWeek: isoWeek, daysFromCivil: daysFromCivil,
                   civilFromDays: civilFromDays, normHex: normHex, serializeThemes: serializeThemes, parseThemes: parseThemes,
                   PRESETS: PRESETS, presetToTheme: presetToTheme, buildOptions: buildOptions, render: render, DECOS: DECOS };
        return;
    }
    try { main(); } catch (e) { alert("Erreur : " + e.message + (e.line ? " (ligne " + e.line + ")" : "")); }
})();
