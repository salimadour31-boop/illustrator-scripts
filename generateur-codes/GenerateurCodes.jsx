/*
 * GenerateurCodes.jsx v2 \u2014 QR codes et codes-barres vectoriels personnalisables pour Adobe Illustrator
 * ExtendScript (ES3). Encodeurs int\u00e9gr\u00e9s, aucune connexion Internet requise.
 * QR Code (v1-40, L/M/Q/H), EAN-13, EAN-8, UPC-A, Code 128 (A/B/C auto), Code 39, ITF-14.
 * Personnalisation QR : 22 th\u00e8mes, d\u00e9grad\u00e9s, 11 styles de modules, 8 styles d'yeux (ext./int.),
 * 10 cadres, \u00e9tiquette, motifs de fond, ombre, carte arrondie, logo, th\u00e8mes JSON personnalis\u00e9s.
 * Utilisation : Fichier > Scripts > Autre script\u2026 puis choisir ce fichier.
 */
#target illustrator

// ===== BEGIN ENCODERS (pur ES3, sans dependance Illustrator) =====
var CG = {};

CG.trim = function (s) { return String(s).replace(/^\s+|\s+$/g, ""); };
CG.inArr = function (a, v) { for (var i = 0; i < a.length; i++) { if (a[i] === v) { return true; } } return false; };

/* ---------- UTF-8 ---------- */
CG.utf8 = function (str) {
    var out = [], i, c, c2;
    for (i = 0; i < str.length; i++) {
        c = str.charCodeAt(i);
        if (c >= 0xD800 && c <= 0xDBFF && i + 1 < str.length) {
            c2 = str.charCodeAt(i + 1);
            if (c2 >= 0xDC00 && c2 <= 0xDFFF) { c = 0x10000 + ((c - 0xD800) << 10) + (c2 - 0xDC00); i++; }
        }
        if (c < 0x80) { out.push(c); }
        else if (c < 0x800) { out.push(0xC0 | (c >> 6), 0x80 | (c & 63)); }
        else if (c < 0x10000) { out.push(0xE0 | (c >> 12), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63)); }
        else { out.push(0xF0 | (c >> 18), 0x80 | ((c >> 12) & 63), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63)); }
    }
    return out;
};

/* ---------- QR CODE ---------- */
CG.QR = {};
CG.QR.ECC_CW = [
    [-1, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
    [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28],
    [-1, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
    [-1, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30]
];
CG.QR.NUM_BLK = [
    [-1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25],
    [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49],
    [-1, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68],
    [-1, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81]
];
CG.QR.ECL_INDEX = { "L": 0, "M": 1, "Q": 2, "H": 3 };
CG.QR.ECL_FMT = { "L": 1, "M": 0, "Q": 3, "H": 2 };
CG.QR.ALNUM = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:";

CG.QR.rawModules = function (v) {
    var r = (16 * v + 128) * v + 64, n;
    if (v >= 2) { n = Math.floor(v / 7) + 2; r -= (25 * n - 10) * n - 55; if (v >= 7) { r -= 36; } }
    return r;
};
CG.QR.dataCodewords = function (v, ecl) {
    var e = CG.QR.ECL_INDEX[ecl];
    return Math.floor(CG.QR.rawModules(v) / 8) - CG.QR.ECC_CW[e][v] * CG.QR.NUM_BLK[e][v];
};

/* GF(256) */
CG.QR.gfMul = function (x, y) {
    var z = 0, i;
    for (i = 7; i >= 0; i--) { z = (z << 1) ^ ((z >>> 7) * 0x11D); z ^= ((y >>> i) & 1) * x; }
    return z & 255;
};
CG.QR.rsDivisor = function (deg) {
    var r = [], i, j, root = 1;
    for (i = 0; i < deg - 1; i++) { r.push(0); }
    r.push(1);
    for (i = 0; i < deg; i++) {
        for (j = 0; j < r.length; j++) { r[j] = CG.QR.gfMul(r[j], root); if (j + 1 < r.length) { r[j] ^= r[j + 1]; } }
        root = CG.QR.gfMul(root, 2);
    }
    return r;
};
CG.QR.rsRemainder = function (data, div) {
    var r = [], i, k, f;
    for (i = 0; i < div.length; i++) { r.push(0); }
    for (k = 0; k < data.length; k++) {
        f = data[k] ^ r.shift(); r.push(0);
        for (i = 0; i < div.length; i++) { r[i] ^= CG.QR.gfMul(div[i], f); }
    }
    return r;
};

CG.QR.detectMode = function (text) {
    if (/^[0-9]*$/.test(text)) { return "numeric"; }
    var i;
    for (i = 0; i < text.length; i++) { if (CG.QR.ALNUM.indexOf(text.charAt(i)) < 0) { return "byte"; } }
    return "alnum";
};
CG.QR.countBits = function (mode, v) {
    var idx = v <= 9 ? 0 : (v <= 26 ? 1 : 2);
    if (mode === "numeric") { return [10, 12, 14][idx]; }
    if (mode === "alnum") { return [9, 11, 13][idx]; }
    return [8, 16, 16][idx];
};
/* renvoie {mode, count, bits:[...]} (bits de donnees sans entete) */
CG.QR.makeSegment = function (text, forceMode) {
    var mode = forceMode || CG.QR.detectMode(text), bits = [], i, n, bytes;
    function app(val, len) { for (var j = len - 1; j >= 0; j--) { bits.push((val >>> j) & 1); } }
    if (mode === "numeric") {
        for (i = 0; i < text.length; i += 3) {
            n = Math.min(3, text.length - i);
            app(parseInt(text.substr(i, n), 10), n * 3 + 1);
        }
        return { mode: mode, count: text.length, bits: bits };
    }
    if (mode === "alnum") {
        for (i = 0; i + 1 < text.length; i += 2) {
            app(CG.QR.ALNUM.indexOf(text.charAt(i)) * 45 + CG.QR.ALNUM.indexOf(text.charAt(i + 1)), 11);
        }
        if (i < text.length) { app(CG.QR.ALNUM.indexOf(text.charAt(i)), 6); }
        return { mode: mode, count: text.length, bits: bits };
    }
    bytes = CG.utf8(text);
    for (i = 0; i < bytes.length; i++) { app(bytes[i], 8); }
    return { mode: "byte", count: bytes.length, bits: bits };
};

/* opts: {ecl:"M", minVersion:1, maxVersion:40, mask:-1 (auto), mode:null} */
CG.QR.encode = function (text, opts) {
    opts = opts || {};
    var ecl = opts.ecl || "M", minV = opts.minVersion || 1, maxV = opts.maxVersion || 40;
    if (!CG.QR.ECL_INDEX.hasOwnProperty(ecl)) { throw new Error("Niveau de correction invalide : " + ecl); }
    var seg = CG.QR.makeSegment(String(text), opts.mode || null);
    var modeInd = { "numeric": 1, "alnum": 2, "byte": 4 }[seg.mode];
    var v, used, cap, cb;
    for (v = minV; v <= maxV; v++) {
        cb = CG.QR.countBits(seg.mode, v);
        used = 4 + cb + seg.bits.length;
        cap = CG.QR.dataCodewords(v, ecl) * 8;
        if (seg.count < (1 << cb) && used <= cap) { break; }
    }
    if (v > maxV) { throw new Error("Donnees trop longues pour un QR code (niveau " + ecl + ", version max " + maxV + ")."); }
    var bits = [], i;
    function app(val, len) { for (var j = len - 1; j >= 0; j--) { bits.push((val >>> j) & 1); } }
    app(modeInd, 4); app(seg.count, cb);
    for (i = 0; i < seg.bits.length; i++) { bits.push(seg.bits[i]); }
    app(0, Math.min(4, cap - bits.length));
    app(0, (8 - bits.length % 8) % 8);
    var data = [];
    for (i = 0; i < bits.length; i += 8) {
        var b = 0, k; for (k = 0; k < 8; k++) { b = (b << 1) | bits[i + k]; } data.push(b);
    }
    for (i = 0; data.length < cap / 8; i++) { data.push((i & 1) ? 0x11 : 0xEC); }
    var all = CG.QR.addEcc(data, v, ecl);
    var q = CG.QR.buildMatrix(all, v, ecl, (opts.mask === undefined || opts.mask === null) ? -1 : opts.mask);
    q.mode = seg.mode;
    return q;
};

CG.QR.addEcc = function (data, v, ecl) {
    var e = CG.QR.ECL_INDEX[ecl], nb = CG.QR.NUM_BLK[e][v], ecc = CG.QR.ECC_CW[e][v];
    var raw = Math.floor(CG.QR.rawModules(v) / 8), nShort = nb - raw % nb, shortLen = Math.floor(raw / nb);
    var blocks = [], div = CG.QR.rsDivisor(ecc), i, j, k = 0, dat, len;
    for (i = 0; i < nb; i++) {
        len = shortLen - ecc + (i < nShort ? 0 : 1);
        dat = data.slice(k, k + len); k += len;
        var rem = CG.QR.rsRemainder(dat, div);
        if (i < nShort) { dat.push(0); }
        blocks.push(dat.concat(rem));
    }
    var res = [];
    for (i = 0; i < blocks[0].length; i++) {
        for (j = 0; j < blocks.length; j++) {
            if (i !== shortLen - ecc || j >= nShort) { res.push(blocks[j][i]); }
        }
    }
    return res;
};

CG.QR.alignPos = function (v) {
    if (v === 1) { return []; }
    var n = Math.floor(v / 7) + 2, size = v * 4 + 17;
    var step = (v === 32) ? 26 : Math.ceil((v * 4 + 4) / (n * 2 - 2)) * 2;
    var r = [6], i, pos;
    for (i = 0, pos = size - 7; i < n - 1; i++, pos -= step) { r.splice(1, 0, pos); }
    return r;
};

CG.QR.buildMatrix = function (cw, v, ecl, mask) {
    var size = v * 4 + 17, m = [], fn = [], x, y, i, j;
    for (y = 0; y < size; y++) { m.push([]); fn.push([]); for (x = 0; x < size; x++) { m[y].push(false); fn[y].push(false); } }
    function set(px, py, d) { m[py][px] = d; fn[py][px] = true; }
    for (i = 0; i < size; i++) { set(6, i, i % 2 === 0); set(i, 6, i % 2 === 0); }
    function finder(cx, cy) {
        var dx, dy, d, xx, yy;
        for (dy = -4; dy <= 4; dy++) { for (dx = -4; dx <= 4; dx++) {
            d = Math.max(Math.abs(dx), Math.abs(dy)); xx = cx + dx; yy = cy + dy;
            if (xx >= 0 && xx < size && yy >= 0 && yy < size) { set(xx, yy, d !== 2 && d !== 4); }
        } }
    }
    finder(3, 3); finder(size - 4, 3); finder(3, size - 4);
    var ap = CG.QR.alignPos(v), na = ap.length;
    for (i = 0; i < na; i++) { for (j = 0; j < na; j++) {
        if ((i === 0 && j === 0) || (i === 0 && j === na - 1) || (i === na - 1 && j === 0)) { continue; }
        var dx, dy;
        for (dy = -2; dy <= 2; dy++) { for (dx = -2; dx <= 2; dx++) { set(ap[i] + dx, ap[j] + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1); } }
    } }
    function drawFormat(msk) {
        var data = (CG.QR.ECL_FMT[ecl] << 3) | msk, rem = data, k, bits;
        for (k = 0; k < 10; k++) { rem = (rem << 1) ^ ((rem >>> 9) * 0x537); }
        bits = ((data << 10) | rem) ^ 0x5412;
        function gb(n) { return ((bits >>> n) & 1) !== 0; }
        for (k = 0; k <= 5; k++) { set(8, k, gb(k)); }
        set(8, 7, gb(6)); set(8, 8, gb(7)); set(7, 8, gb(8));
        for (k = 9; k < 15; k++) { set(14 - k, 8, gb(k)); }
        for (k = 0; k < 8; k++) { set(size - 1 - k, 8, gb(k)); }
        for (k = 8; k < 15; k++) { set(8, size - 15 + k, gb(k)); }
        set(8, size - 8, true);
    }
    drawFormat(0);
    if (v >= 7) {
        var rem = v, k, vb;
        for (k = 0; k < 12; k++) { rem = (rem << 1) ^ ((rem >>> 11) * 0x1F25); }
        vb = (v << 12) | rem;
        for (k = 0; k < 18; k++) {
            var bt = ((vb >>> k) & 1) !== 0, a = size - 11 + k % 3, b = Math.floor(k / 3);
            set(a, b, bt); set(b, a, bt);
        }
    }
    /* placement zigzag */
    var idx = 0, right, vert, up;
    for (right = size - 1; right >= 1; right -= 2) {
        if (right === 6) { right = 5; }
        for (vert = 0; vert < size; vert++) { for (j = 0; j < 2; j++) {
            x = right - j; up = ((right + 1) & 2) === 0; y = up ? size - 1 - vert : vert;
            if (!fn[y][x] && idx < cw.length * 8) { m[y][x] = ((cw[idx >>> 3] >>> (7 - (idx & 7))) & 1) !== 0; idx++; }
        } }
    }
    function applyMask(msk) {
        var xx, yy, inv;
        for (yy = 0; yy < size; yy++) { for (xx = 0; xx < size; xx++) {
            switch (msk) {
                case 0: inv = (xx + yy) % 2 === 0; break;
                case 1: inv = yy % 2 === 0; break;
                case 2: inv = xx % 3 === 0; break;
                case 3: inv = (xx + yy) % 3 === 0; break;
                case 4: inv = (Math.floor(xx / 3) + Math.floor(yy / 2)) % 2 === 0; break;
                case 5: inv = xx * yy % 2 + xx * yy % 3 === 0; break;
                case 6: inv = (xx * yy % 2 + xx * yy % 3) % 2 === 0; break;
                default: inv = ((xx + yy) % 2 + xx * yy % 3) % 2 === 0;
            }
            if (!fn[yy][xx] && inv) { m[yy][xx] = !m[yy][xx]; }
        } }
    }
    if (mask < 0) {
        var best = 0, bestP = 1e15, p;
        for (i = 0; i < 8; i++) {
            applyMask(i); drawFormat(i); p = CG.QR.penalty(m, size);
            if (p < bestP) { bestP = p; best = i; }
            applyMask(i);
        }
        mask = best;
    }
    applyMask(mask); drawFormat(mask);
    return { size: size, version: v, ecl: ecl, mask: mask, modules: m, isFunction: fn };
};

CG.QR.penalty = function (m, size) {
    var p = 0, x, y, run, c, dark = 0, line, s, k;
    for (var pass = 0; pass < 2; pass++) {
        for (y = 0; y < size; y++) {
            run = 0; c = null; line = "";
            for (x = 0; x < size; x++) {
                var val = pass === 0 ? m[y][x] : m[x][y];
                line += val ? "1" : "0";
                if (val === c) { run++; if (run === 5) { p += 3; } else if (run > 5) { p++; } }
                else { c = val; run = 1; }
            }
            s = "0000" + line + "0000";
            k = s.indexOf("1011101");
            while (k >= 0) {
                if (s.substr(k - 4, 4) === "0000" || s.substr(k + 7, 4) === "0000") { p += 40; }
                k = s.indexOf("1011101", k + 1);
            }
        }
    }
    for (y = 0; y < size - 1; y++) { for (x = 0; x < size - 1; x++) {
        c = m[y][x];
        if (c === m[y][x + 1] && c === m[y + 1][x] && c === m[y + 1][x + 1]) { p += 3; }
    } }
    for (y = 0; y < size; y++) { for (x = 0; x < size; x++) { if (m[y][x]) { dark++; } } }
    var total = size * size;
    k = Math.ceil(Math.abs(dark * 20 - total * 10) / total) - 1;
    if (k > 0) { p += k * 10; }
    return p;
};

/* ---------- Contenus QR predefinis ---------- */
CG.Preset = {};
CG.Preset.escWifi = function (s) { return String(s).replace(/([\\;,:"])/g, "\\$1"); };
CG.Preset.wifi = function (ssid, pass, sec, hidden) {
    if (CG.trim(ssid) === "") { throw new Error("Le nom du reseau (SSID) est obligatoire."); }
    sec = sec || "WPA";
    var s = "WIFI:T:" + sec + ";S:" + CG.Preset.escWifi(ssid) + ";";
    if (sec !== "nopass") {
        if (pass === "") { throw new Error("Le mot de passe Wi-Fi est obligatoire pour la securite " + sec + "."); }
        s += "P:" + CG.Preset.escWifi(pass) + ";";
    }
    if (hidden) { s += "H:true;"; }
    return s + ";";
};
CG.Preset.escV = function (s) { return String(s).replace(/([\\;,])/g, "\\$1").replace(/\r?\n/g, "\\n"); };
CG.Preset.vcard = function (nom, prenom, tel, email, org, url) {
    if (CG.trim(nom) === "" && CG.trim(prenom) === "") { throw new Error("Indiquez au moins un nom ou un prenom pour la vCard."); }
    var e = CG.Preset.escV, L = ["BEGIN:VCARD", "VERSION:3.0", "N:" + e(nom) + ";" + e(prenom) + ";;;",
        "FN:" + e(CG.trim(prenom + " " + nom))];
    if (org) { L.push("ORG:" + e(org)); }
    if (tel) { L.push("TEL;TYPE=CELL:" + e(tel)); }
    if (email) { L.push("EMAIL:" + e(email)); }
    if (url) { L.push("URL:" + e(url)); }
    L.push("END:VCARD");
    return L.join("\r\n");
};
CG.Preset.email = function (addr, subj, body) {
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(CG.trim(addr))) { throw new Error("Adresse e-mail invalide."); }
    var q = [];
    if (subj) { q.push("subject=" + encodeURIComponent(subj)); }
    if (body) { q.push("body=" + encodeURIComponent(body)); }
    return "mailto:" + CG.trim(addr) + (q.length ? "?" + q.join("&") : "");
};
CG.Preset.cleanPhone = function (t) {
    var p = String(t).replace(/[\s.\-()]/g, "");
    if (!/^\+?[0-9]{3,20}$/.test(p)) { throw new Error("Numero de telephone invalide."); }
    return p;
};
CG.Preset.tel = function (t) { return "tel:" + CG.Preset.cleanPhone(t); };
CG.Preset.sms = function (t, msg) { return "SMSTO:" + CG.Preset.cleanPhone(t) + ":" + (msg || ""); };
CG.Preset.geo = function (lat, lon) {
    var a = parseFloat(String(lat).replace(",", ".")), b = parseFloat(String(lon).replace(",", "."));
    if (isNaN(a) || a < -90 || a > 90) { throw new Error("Latitude invalide (entre -90 et 90)."); }
    if (isNaN(b) || b < -180 || b > 180) { throw new Error("Longitude invalide (entre -180 et 180)."); }
    return "geo:" + a + "," + b;
};

/* ---------- CODES 1D : resultat {bits:"1010..", text:"...", guards:[...] } ---------- */
CG.B = {};
CG.B.gs1Check = function (digits) { /* digits sans cle */
    var s = 0, i, w = 3;
    for (i = digits.length - 1; i >= 0; i--) { s += parseInt(digits.charAt(i), 10) * w; w = (w === 3) ? 1 : 3; }
    return String((10 - s % 10) % 10);
};
CG.B.gs1Prepare = function (code, len, name) {
    code = String(code).replace(/\s/g, "");
    if (!/^[0-9]+$/.test(code)) { throw new Error(name + " : seuls les chiffres sont autorises."); }
    if (code.length === len - 1) { return code + CG.B.gs1Check(code); }
    if (code.length !== len) { throw new Error(name + " : " + (len - 1) + " ou " + len + " chiffres attendus (" + code.length + " fournis)."); }
    var c = CG.B.gs1Check(code.substr(0, len - 1));
    if (c !== code.charAt(len - 1)) { throw new Error(name + " : cle de controle incorrecte (" + code.charAt(len - 1) + "), la cle attendue est " + c + "."); }
    return code;
};
CG.B.EAN_L = ["0001101", "0011001", "0010011", "0111101", "0100011", "0110001", "0101111", "0111011", "0110111", "0001011"];
CG.B.EAN_PAR = ["LLLLLL", "LLGLGG", "LLGGLG", "LLGGGL", "LGLLGG", "LGGLLG", "LGGGLL", "LGLGLG", "LGLGGL", "LGGLGL"];
CG.B.eanR = function (d) { var l = CG.B.EAN_L[d], r = "", i; for (i = 0; i < 7; i++) { r += l.charAt(i) === "1" ? "0" : "1"; } return r; };
CG.B.eanG = function (d) { var r = CG.B.eanR(d), g = "", i; for (i = 6; i >= 0; i--) { g += r.charAt(i); } return g; };
CG.B.ean13 = function (code) {
    code = CG.B.gs1Prepare(code, 13, "EAN-13");
    var par = CG.B.EAN_PAR[parseInt(code.charAt(0), 10)], b = "101", i, d;
    for (i = 1; i <= 6; i++) { d = parseInt(code.charAt(i), 10); b += par.charAt(i - 1) === "L" ? CG.B.EAN_L[d] : CG.B.eanG(d); }
    b += "01010";
    for (i = 7; i <= 12; i++) { b += CG.B.eanR(parseInt(code.charAt(i), 10)); }
    b += "101";
    return { type: "EAN-13", bits: b, text: code, guards: [[0, 3], [45, 50], [92, 95]],
        textGroups: [{ t: code.charAt(0), from: -7, to: -1 }, { t: code.substr(1, 6), from: 3, to: 45 }, { t: code.substr(7, 6), from: 50, to: 92 }] };
};
CG.B.ean8 = function (code) {
    code = CG.B.gs1Prepare(code, 8, "EAN-8");
    var b = "101", i;
    for (i = 0; i < 4; i++) { b += CG.B.EAN_L[parseInt(code.charAt(i), 10)]; }
    b += "01010";
    for (i = 4; i < 8; i++) { b += CG.B.eanR(parseInt(code.charAt(i), 10)); }
    b += "101";
    return { type: "EAN-8", bits: b, text: code, guards: [[0, 3], [31, 36], [64, 67]],
        textGroups: [{ t: code.substr(0, 4), from: 3, to: 31 }, { t: code.substr(4, 4), from: 36, to: 64 }] };
};
CG.B.upca = function (code) {
    code = CG.B.gs1Prepare(code, 12, "UPC-A");
    var r = CG.B.ean13("0" + code);
    r.type = "UPC-A"; r.text = code;
    r.guards = [[0, 10], [45, 50], [85, 95]];
    r.textGroups = [{ t: code.charAt(0), from: -7, to: -1 }, { t: code.substr(1, 5), from: 10, to: 45 },
        { t: code.substr(6, 5), from: 50, to: 85 }, { t: code.charAt(11), from: 96, to: 102 }];
    return r;
};

CG.B.C128 = ["212222", "222122", "222221", "121223", "121322", "131222", "122213", "122312", "132212", "221213",
    "221312", "231212", "112232", "122132", "122231", "113222", "123122", "123221", "223211", "221132",
    "221231", "213212", "223112", "312131", "311222", "321122", "321221", "312212", "322112", "322211",
    "212123", "212321", "232121", "111323", "131123", "131321", "112313", "132113", "132311", "211313",
    "231113", "231311", "112133", "112331", "132131", "113123", "113321", "133121", "313121", "211331",
    "231131", "213113", "213311", "213131", "311123", "311321", "331121", "312113", "312311", "332111",
    "314111", "221411", "431111", "111224", "111422", "121124", "121421", "141122", "141221", "112214",
    "112412", "122114", "122411", "142112", "142211", "241211", "221114", "413111", "241112", "134111",
    "111242", "121142", "121241", "114212", "124112", "124211", "411212", "421112", "421211", "212141",
    "214121", "412121", "111143", "111341", "131141", "114113", "114311", "411113", "411311", "113141",
    "114131", "311141", "411131", "211412", "211214", "211232", "2331112"];
CG.B.widthsToBits = function (w) {
    var b = "", i, k;
    for (i = 0; i < w.length; i++) { for (k = 0; k < parseInt(w.charAt(i), 10); k++) { b += (i % 2 === 0) ? "1" : "0"; } }
    return b;
};
/* renvoie la liste des valeurs (start .. data, sans checksum ni stop) */
CG.B.code128Values = function (s) {
    var i, c, vals = [], set = null, n = s.length;
    for (i = 0; i < n; i++) { c = s.charCodeAt(i); if (c > 127) { throw new Error("Code 128 : caractere non ASCII interdit (\"" + s.charAt(i) + "\")."); } }
    function digitRun(p) { var k = p; while (k < n && s.charCodeAt(k) >= 48 && s.charCodeAt(k) <= 57) { k++; } return k - p; }
    function bestAB(p) { /* A si un caractere de controle arrive avant une minuscule */
        for (var k = p; k < n; k++) { var cc = s.charCodeAt(k); if (cc < 32) { return "A"; } if (cc >= 96) { return "B"; } }
        return "B";
    }
    function valIn(st, cc) { if (st === "A") { return cc < 32 ? cc + 64 : cc - 32; } return cc - 32; }
    function fits(st, cc) { return st === "A" ? cc < 96 : cc >= 32; }
    var r0 = digitRun(0);
    if ((r0 >= 4 && r0 % 2 === 0) || (r0 === n && r0 === 2)) { set = "C"; vals.push(105); }
    else { set = bestAB(0); vals.push(set === "A" ? 103 : 104); }
    i = 0;
    while (i < n) {
        if (set === "C") {
            if (digitRun(i) >= 2) { vals.push(parseInt(s.substr(i, 2), 10)); i += 2; continue; }
            set = bestAB(i); vals.push(set === "A" ? 101 : 100); continue;
        }
        var run = digitRun(i);
        if ((run >= 6) || (run >= 4 && i + run === n)) {
            if (run % 2 === 1) { c = s.charCodeAt(i); vals.push(valIn(set, c)); i++; }
            vals.push(99); set = "C"; continue;
        }
        c = s.charCodeAt(i);
        if (!fits(set, c)) {
            var other = set === "A" ? "B" : "A";
            /* shift (98) si un seul caractere de l'autre jeu */
            var nx = i + 1 < n ? s.charCodeAt(i + 1) : -1;
            if (nx >= 0 && !fits(other, nx) && fits(set, nx)) { vals.push(98); vals.push(valIn(other, c)); i++; continue; }
            set = other; vals.push(set === "A" ? 101 : 100);
        }
        vals.push(valIn(set, c)); i++;
    }
    return vals;
};
CG.B.code128 = function (s) {
    s = String(s);
    if (s === "") { throw new Error("Code 128 : contenu vide."); }
    var vals = CG.B.code128Values(s), sum = vals[0], i, b = "";
    for (i = 1; i < vals.length; i++) { sum += i * vals[i]; }
    vals.push(sum % 103); vals.push(106);
    for (i = 0; i < vals.length; i++) { b += CG.B.widthsToBits(CG.B.C128[vals[i]]); }
    return { type: "Code 128", bits: b, text: s, values: vals };
};

CG.B.C39 = {
    "0": "nnnwwnwnn", "1": "wnnwnnnnw", "2": "nnwwnnnnw", "3": "wnwwnnnnn", "4": "nnnwwnnnw",
    "5": "wnnwwnnnn", "6": "nnwwwnnnn", "7": "nnnwnnwnw", "8": "wnnwnnwnn", "9": "nnwwnnwnn",
    "A": "wnnnnwnnw", "B": "nnwnnwnnw", "C": "wnwnnwnnn", "D": "nnnnwwnnw", "E": "wnnnwwnnn",
    "F": "nnwnwwnnn", "G": "nnnnnwwnw", "H": "wnnnnwwnn", "I": "nnwnnwwnn", "J": "nnnnwwwnn",
    "K": "wnnnnnnww", "L": "nnwnnnnww", "M": "wnwnnnnwn", "N": "nnnnwnnww", "O": "wnnnwnnwn",
    "P": "nnwnwnnwn", "Q": "nnnnnnwww", "R": "wnnnnnwwn", "S": "nnwnnnwwn", "T": "nnnnwnwwn",
    "U": "wwnnnnnnw", "V": "nwwnnnnnw", "W": "wwwnnnnnn", "X": "nwnnwnnnw", "Y": "wwnnwnnnn",
    "Z": "nwwnwnnnn", "-": "nwnnnnwnw", ".": "wwnnnnwnn", " ": "nwwnnnwnn", "*": "nwnnwnwnn",
    "$": "nwnwnwnnn", "/": "nwnwnnnwn", "+": "nwnnnwnwn", "%": "nnnwnwnwn"
};
CG.B.nwToBits = function (p, ratio, startBar) {
    var b = "", i, k, w, bar = startBar;
    for (i = 0; i < p.length; i++) {
        w = p.charAt(i) === "w" ? ratio : 1;
        for (k = 0; k < w; k++) { b += bar ? "1" : "0"; }
        bar = !bar;
    }
    return b;
};
CG.B.code39 = function (s, ratio) {
    ratio = ratio || 3;
    s = String(s).toUpperCase();
    if (s === "") { throw new Error("Code 39 : contenu vide."); }
    var i, b = "", full = "*" + s + "*";
    for (i = 0; i < s.length; i++) {
        if (s.charAt(i) === "*" || !CG.B.C39.hasOwnProperty(s.charAt(i))) { throw new Error("Code 39 : caractere interdit \"" + s.charAt(i) + "\" (autorises : 0-9 A-Z - . espace $ / + %)."); }
    }
    for (i = 0; i < full.length; i++) {
        if (i > 0) { b += "0"; }
        b += CG.B.nwToBits(CG.B.C39[full.charAt(i)], ratio, true);
    }
    return { type: "Code 39", bits: b, text: full };
};
CG.B.I25 = ["nnwwn", "wnnnw", "nwnnw", "wwnnn", "nnwnw", "wnwnn", "nwwnn", "nnnww", "wnnwn", "nwnwn"];
CG.B.itf14 = function (code, ratio) {
    ratio = ratio || 3;
    code = CG.B.gs1Prepare(code, 14, "ITF-14");
    var b = CG.B.nwToBits("nnnn", ratio, true), i, j, p, a, c;
    for (i = 0; i < 14; i += 2) {
        a = CG.B.I25[parseInt(code.charAt(i), 10)]; c = CG.B.I25[parseInt(code.charAt(i + 1), 10)]; p = "";
        for (j = 0; j < 5; j++) { p += a.charAt(j) + c.charAt(j); }
        b += CG.B.nwToBits(p, ratio, true);
    }
    b += CG.B.nwToBits("wnn", ratio, true);
    return { type: "ITF-14", bits: b, text: code };
};
CG.B.encode = function (type, s) {
    switch (type) {
        case "EAN-13": return CG.B.ean13(s);
        case "EAN-8": return CG.B.ean8(s);
        case "UPC-A": return CG.B.upca(s);
        case "Code 128": return CG.B.code128(s);
        case "Code 39": return CG.B.code39(s);
        case "ITF-14": return CG.B.itf14(s);
    }
    throw new Error("Type de code inconnu : " + type);
};

/* ---------- COULEURS ---------- */
CG.Color = {};
CG.Color.parse = function (hex) {
    var h = CG.trim(String(hex)).replace(/^#/, "");
    if (/^[0-9a-fA-F]{3}$/.test(h)) { h = h.charAt(0) + h.charAt(0) + h.charAt(1) + h.charAt(1) + h.charAt(2) + h.charAt(2); }
    if (!/^[0-9a-fA-F]{6}$/.test(h)) { return null; }
    return [parseInt(h.substr(0, 2), 16), parseInt(h.substr(2, 2), 16), parseInt(h.substr(4, 2), 16)];
};
CG.Color.norm = function (hex) {
    var c = CG.Color.parse(hex), s = "#", i, t;
    if (!c) { return null; }
    for (i = 0; i < 3; i++) { t = c[i].toString(16).toUpperCase(); s += (t.length < 2 ? "0" : "") + t; }
    return s;
};
CG.Color.lum = function (hex) {
    var c = CG.Color.parse(hex), i, v, r = [];
    for (i = 0; i < 3; i++) { v = c[i] / 255; r.push(v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)); }
    return 0.2126 * r[0] + 0.7152 * r[1] + 0.0722 * r[2];
};
CG.Color.contrast = function (a, b) {
    var la = CG.Color.lum(a), lb = CG.Color.lum(b);
    return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
};
CG.Color.mix = function (a, b, t) {
    var A = CG.Color.parse(a), B = CG.Color.parse(b), i, r = [];
    for (i = 0; i < 3; i++) { r.push(Math.round(A[i] + (B[i] - A[i]) * t)); }
    return CG.Color.norm("#" + ((1 << 24) + (r[0] << 16) + (r[1] << 8) + r[2]).toString(16).substr(1));
};
/* Renvoie la liste des avertissements (francais) */
CG.Color.check = function (th, transparent) {
    var w = [], bg = th.bg, list = [], i, r;
    if (transparent) { bg = "#FFFFFF"; }
    if (th.grad && th.grad.type !== "aucun") {
        for (i = 0; i < th.grad.stops.length; i++) { list.push(["D\u00e9grad\u00e9 (couleur " + (i + 1) + ")", th.grad.stops[i]]); }
    } else { list.push(["Modules", th.mod]); }
    list.push(["\u0152il ext\u00e9rieur", th.eo]); list.push(["\u0152il int\u00e9rieur", th.ei]);
    for (i = 0; i < list.length; i++) {
        r = CG.Color.contrast(list[i][1], bg);
        if (CG.Color.lum(list[i][1]) > CG.Color.lum(bg)) {
            w.push(list[i][0] + " : couleurs invers\u00e9es (clair sur fonc\u00e9), beaucoup de lecteurs ne liront pas le code.");
        } else if (r < 4) {
            w.push(list[i][0] + " : contraste insuffisant avec le fond (" + (Math.round(r * 10) / 10) + ":1, minimum conseill\u00e9 4:1).");
        }
    }
    return w;
};

/* ---------- THEMES ---------- */
CG.THEMES = [
    { n: "Classique", mod: "#000000", bg: "#FFFFFF", eo: "#000000", ei: "#000000", fr: "#000000", tx: "#FFFFFF" },
    { n: "Minuit", mod: "#0B1F4B", bg: "#FFFFFF", eo: "#0B1F4B", ei: "#2F55D4", fr: "#0B1F4B", tx: "#FFFFFF", grad: { type: "lineaire", stops: ["#0B1F4B", "#2A3F8F"], angle: 45 } },
    { n: "Oc\u00e9an", mod: "#005F73", bg: "#F1FAFB", eo: "#005F73", ei: "#0A7A85", fr: "#005F73", tx: "#E9F5F7", grad: { type: "lineaire", stops: ["#03465A", "#00707F"], angle: 90 } },
    { n: "Sahara", mod: "#6B3E16", bg: "#FFF8EC", eo: "#9A4B26", ei: "#6B3E16", fr: "#C68B59", tx: "#3B2208" },
    { n: "N\u00e9on", mod: "#6A00F4", bg: "#FFFFFF", eo: "#B0007A", ei: "#6A00F4", fr: "#1A1A2E", tx: "#39FF14", grad: { type: "radial", stops: ["#6A00F4", "#B0007A"], angle: 0 } },
    { n: "Luxe noir & or", mod: "#111111", bg: "#FBF6E9", eo: "#7A5C12", ei: "#111111", fr: "#111111", tx: "#D4AF37" },
    { n: "Pastel", mod: "#4A4E8C", bg: "#FFF7FA", eo: "#7A4F9C", ei: "#A23B6E", fr: "#F6C6D8", tx: "#4A4E8C", grad: { type: "lineaire", stops: ["#4A4E8C", "#7A4F9C", "#A23B6E"], angle: 30 } },
    { n: "Nature", mod: "#1B4332", bg: "#F4FBF6", eo: "#2D6A4F", ei: "#1B4332", fr: "#2D6A4F", tx: "#FFFFFF", grad: { type: "lineaire", stops: ["#1B4332", "#2D6A4F"], angle: 135 } },
    { n: "Corail", mod: "#A93226", bg: "#FFF6F4", eo: "#C0392B", ei: "#7B241C", fr: "#E8735F", tx: "#FFFFFF" },
    { n: "Lavande", mod: "#4B3F72", bg: "#F7F4FF", eo: "#6B4FA0", ei: "#4B3F72", fr: "#6B4FA0", tx: "#FFFFFF" },
    { n: "R\u00e9tro", mod: "#3D2C2E", bg: "#F4E9D8", eo: "#A2402B", ei: "#2F5D62", fr: "#C8553D", tx: "#F4E9D8" },
    { n: "Cyber", mod: "#3A0CA3", bg: "#F5F7FF", eo: "#B5179E", ei: "#3A0CA3", fr: "#0D0221", tx: "#00F5D4", grad: { type: "lineaire", stops: ["#3A0CA3", "#7209B7", "#B5179E"], angle: 0 } },
    { n: "Caf\u00e9", mod: "#3E2723", bg: "#F5EDE3", eo: "#6D4C41", ei: "#3E2723", fr: "#6D4C41", tx: "#F5EDE3" },
    { n: "Bordeaux", mod: "#5C0A1E", bg: "#FFF7F8", eo: "#800020", ei: "#5C0A1E", fr: "#800020", tx: "#FFE8EC" },
    { n: "Menthe", mod: "#0E5E50", bg: "#EFFFF9", eo: "#107A66", ei: "#0E5E50", fr: "#7ED9C0", tx: "#0E3B33" },
    { n: "Terracotta", mod: "#8A3522", bg: "#FBF1EA", eo: "#A8462B", ei: "#5E2416", fr: "#C66B4E", tx: "#FFFFFF" },
    { n: "Glacier", mod: "#1D3557", bg: "#F1FAFF", eo: "#2E5F86", ei: "#1D3557", fr: "#A8DADC", tx: "#1D3557", grad: { type: "radial", stops: ["#1D3557", "#2E5F86"], angle: 0 } },
    { n: "Bonbon", mod: "#B0164F", bg: "#FFF0F6", eo: "#7B1FA2", ei: "#B0164F", fr: "#F48FB1", tx: "#4A0D2B", grad: { type: "lineaire", stops: ["#B0164F", "#7B1FA2"], angle: 60 } },
    { n: "Monochrome", mod: "#333333", bg: "#FFFFFF", eo: "#000000", ei: "#555555", fr: "#333333", tx: "#FFFFFF" },
    { n: "Zellige", mod: "#0E4D64", bg: "#FFFDF6", eo: "#137547", ei: "#A4241B", fr: "#0E4D64", tx: "#F2C14E", grad: { type: "lineaire", stops: ["#0E4D64", "#137547"], angle: 45 } },
    { n: "Ardoise", mod: "#2F3E46", bg: "#F8F9FA", eo: "#354F52", ei: "#2F3E46", fr: "#52796F", tx: "#FFFFFF" },
    { n: "Soleil", mod: "#8A2E0E", bg: "#FFFBEB", eo: "#A1460A", ei: "#8A2E0E", fr: "#F59E0B", tx: "#3B1404", grad: { type: "radial", stops: ["#8A2E0E", "#A1460A"], angle: 0 } }
];

/* ---------- JSON minimal (ES3) ---------- */
CG.JSON = {};
CG.JSON.str = function (v, ind) {
    ind = ind || "";
    var t = typeof v, i, a = [], k, n2 = ind + "  ";
    if (v === null || v === undefined) { return "null"; }
    if (t === "number") { return isFinite(v) ? String(v) : "null"; }
    if (t === "boolean") { return v ? "true" : "false"; }
    if (t === "string") {
        return "\"" + v.replace(/[\\"\u0000-\u001f]/g, function (c) {
            var m = { "\\": "\\\\", "\"": "\\\"", "\n": "\\n", "\r": "\\r", "\t": "\\t" };
            return m[c] || ("\\u" + ("0000" + c.charCodeAt(0).toString(16)).slice(-4));
        }) + "\"";
    }
    if (Object.prototype.toString.call(v) === "[object Array]") {
        for (i = 0; i < v.length; i++) { a.push(CG.JSON.str(v[i], n2)); }
        return "[" + a.join(", ") + "]";
    }
    for (k in v) { if (v.hasOwnProperty(k)) { a.push(n2 + CG.JSON.str(k) + ": " + CG.JSON.str(v[k], n2)); } }
    return a.length ? "{\n" + a.join(",\n") + "\n" + ind + "}" : "{}";
};
CG.JSON.parse = function (s) {
    var p = 0;
    function err(m) { throw new Error("JSON invalide (position " + p + ") : " + m); }
    function ws() { while (p < s.length && " \t\r\n".indexOf(s.charAt(p)) >= 0) { p++; } }
    function val() {
        ws();
        var c = s.charAt(p), r, k;
        if (c === "{") {
            p++; r = {}; ws();
            if (s.charAt(p) === "}") { p++; return r; }
            while (true) {
                ws(); if (s.charAt(p) !== "\"") { err("cl\u00e9 attendue"); }
                k = str(); ws(); if (s.charAt(p) !== ":") { err("\u00ab : \u00bb attendu"); } p++;
                r[k] = val(); ws();
                if (s.charAt(p) === ",") { p++; continue; }
                if (s.charAt(p) === "}") { p++; return r; }
                err("\u00ab , \u00bb ou \u00ab } \u00bb attendu");
            }
        }
        if (c === "[") {
            p++; r = []; ws();
            if (s.charAt(p) === "]") { p++; return r; }
            while (true) {
                r.push(val()); ws();
                if (s.charAt(p) === ",") { p++; continue; }
                if (s.charAt(p) === "]") { p++; return r; }
                err("\u00ab , \u00bb ou \u00ab ] \u00bb attendu");
            }
        }
        if (c === "\"") { return str(); }
        if (s.substr(p, 4) === "true") { p += 4; return true; }
        if (s.substr(p, 5) === "false") { p += 5; return false; }
        if (s.substr(p, 4) === "null") { p += 4; return null; }
        var m = /^-?\d+(\.\d+)?([eE][+\-]?\d+)?/.exec(s.substr(p, 40));
        if (m) { p += m[0].length; return parseFloat(m[0]); }
        err("valeur inattendue");
    }
    function str() {
        var r = "", c, e = { "\"": "\"", "\\": "\\", "/": "/", "b": "\b", "f": "\f", "n": "\n", "r": "\r", "t": "\t" };
        p++;
        while (p < s.length) {
            c = s.charAt(p++);
            if (c === "\"") { return r; }
            if (c === "\\") {
                c = s.charAt(p++);
                if (c === "u") { r += String.fromCharCode(parseInt(s.substr(p, 4), 16)); p += 4; }
                else if (e.hasOwnProperty(c)) { r += e[c]; } else { err("\u00e9chappement invalide"); }
            } else { r += c; }
        }
        err("cha\u00eene non termin\u00e9e");
    }
    var out = val(); ws();
    if (p < s.length) { err("caract\u00e8res en trop"); }
    return out;
};
/* Valide un theme importe, renvoie un theme propre ou leve une erreur */
CG.cleanTheme = function (t) {
    var keys = ["mod", "bg", "eo", "ei", "fr", "tx"], r = {}, i, g;
    if (!t || typeof t.n !== "string" || CG.trim(t.n) === "") { throw new Error("Th\u00e8me sans nom."); }
    r.n = CG.trim(t.n).substr(0, 40);
    for (i = 0; i < keys.length; i++) {
        r[keys[i]] = CG.Color.norm(t[keys[i]]);
        if (!r[keys[i]]) { throw new Error("Th\u00e8me \u00ab " + r.n + " \u00bb : couleur \u00ab " + keys[i] + " \u00bb invalide."); }
    }
    if (t.grad && t.grad.type && t.grad.type !== "aucun") {
        g = { type: t.grad.type === "radial" ? "radial" : "lineaire", stops: [], angle: Number(t.grad.angle) || 0 };
        for (i = 0; t.grad.stops && i < t.grad.stops.length && i < 3; i++) {
            if (!CG.Color.norm(t.grad.stops[i])) { throw new Error("Th\u00e8me \u00ab " + r.n + " \u00bb : couleur de d\u00e9grad\u00e9 invalide."); }
            g.stops.push(CG.Color.norm(t.grad.stops[i]));
        }
        if (g.stops.length >= 2) { r.grad = g; }
    }
    return r;
};

/* ---------- GEOMETRIE (repere y vers le bas, unites = points) ---------- */
/* contour = { pts:[[ax,ay, inx,iny, outx,outy],...], poly:bool, hole:bool } */
CG.Geo = {};
CG.Geo.K = 0.5523;
CG.Geo.poly = function (xy) {
    var pts = [], i;
    for (i = 0; i < xy.length; i += 2) { pts.push([xy[i], xy[i + 1], xy[i], xy[i + 1], xy[i], xy[i + 1]]); }
    return { pts: pts, poly: true };
};
CG.Geo.rect = function (x, y, w, h) { return CG.Geo.poly([x, y, x + w, y, x + w, y + h, x, y + h]); };
CG.Geo.roundRect = function (x, y, w, h, rad) {
    var lim = Math.min(w, h) / 2, K = CG.Geo.K, pts = [], i, r, C, din, dout;
    var cs = [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
    var dirs = [[0, -1], [1, 0], [0, 1], [-1, 0]];
    var any = false;
    for (i = 0; i < 4; i++) {
        r = Math.min(Math.max(rad[i] || 0, 0), lim); C = cs[i]; din = dirs[i]; dout = dirs[(i + 1) % 4];
        if (r <= 0.0001) { pts.push([C[0], C[1], C[0], C[1], C[0], C[1]]); continue; }
        any = true;
        var a1x = C[0] - din[0] * r, a1y = C[1] - din[1] * r, a2x = C[0] + dout[0] * r, a2y = C[1] + dout[1] * r;
        pts.push([a1x, a1y, a1x, a1y, a1x + din[0] * K * r, a1y + din[1] * K * r]);
        pts.push([a2x, a2y, a2x - dout[0] * K * r, a2y - dout[1] * K * r, a2x, a2y]);
    }
    return { pts: pts, poly: !any };
};
CG.Geo.ellipse = function (cx, cy, rx, ry, k) {
    k = k || CG.Geo.K;
    return { pts: [
        [cx, cy - ry, cx - k * rx, cy - ry, cx + k * rx, cy - ry],
        [cx + rx, cy, cx + rx, cy - k * ry, cx + rx, cy + k * ry],
        [cx, cy + ry, cx + k * rx, cy + ry, cx - k * rx, cy + ry],
        [cx - rx, cy, cx - rx, cy + k * ry, cx - rx, cy - k * ry]
    ], poly: false };
};
CG.Geo.star = function (cx, cy, R, r, n) {
    var xy = [], i, a;
    for (i = 0; i < 2 * n; i++) { a = -Math.PI / 2 + i * Math.PI / n; xy.push(cx + Math.cos(a) * (i % 2 ? r : R), cy + Math.sin(a) * (i % 2 ? r : R)); }
    return CG.Geo.poly(xy);
};
CG.Geo.chamfer = function (x, y, w, h, c) {
    return CG.Geo.poly([x + c, y, x + w - c, y, x + w, y + c, x + w, y + h - c, x + w - c, y + h, x + c, y + h, x, y + h - c, x, y + c]);
};
CG.Geo.heart = function (x, y, s) {
    var u = [[0.5, 0.3, 0.42, 0.12, 0.58, 0.12], [0.75, 0.06, 0.62, 0.06, 0.9, 0.06], [1, 0.36, 1, 0.16, 1, 0.6],
        [0.5, 0.96, 0.72, 0.78, 0.28, 0.78], [0, 0.36, 0, 0.6, 0, 0.16], [0.25, 0.06, 0.1, 0.06, 0.38, 0.06]];
    var pts = [], i, j, p;
    for (i = 0; i < u.length; i++) { p = []; for (j = 0; j < 6; j++) { p.push((j % 2 ? y : x) + u[i][j] * s); } pts.push(p); }
    return { pts: pts, poly: false };
};
CG.Geo.area = function (c) {
    var a = 0, i, p = c.pts, n = p.length, q;
    for (i = 0; i < n; i++) { q = p[(i + 1) % n]; a += p[i][0] * q[1] - q[0] * p[i][1]; }
    return a / 2;
};
CG.Geo.reverse = function (c) {
    var r = [], i, p;
    for (i = c.pts.length - 1; i >= 0; i--) { p = c.pts[i]; r.push([p[0], p[1], p[4], p[5], p[2], p[3]]); }
    return { pts: r, poly: c.poly, hole: c.hole };
};
/* orientation : pleins = aire positive, trous = aire negative (regle non nulle) */
CG.Geo.orient = function (c, hole) {
    var a = CG.Geo.area(c), r = c;
    if ((hole && a > 0) || (!hole && a < 0)) { r = CG.Geo.reverse(c); }
    r.hole = !!hole;
    return r;
};
/* Forme generique dans une boite : style + orientation (0 HG, 1 HD, 2 BG) */
CG.Geo.shape = function (style, x, y, w, h, orient) {
    var s = Math.min(w, h), R = s / 2, rr;
    switch (style) {
        case "rond": case "cercle": case "petitsPoints": return CG.Geo.ellipse(x + w / 2, y + h / 2, w / 2, h / 2);
        case "arrondi": return CG.Geo.roundRect(x, y, w, h, [s * 0.3, s * 0.3, s * 0.3, s * 0.3]);
        case "losange": return CG.Geo.poly([x + w / 2, y, x + w, y + h / 2, x + w / 2, y + h, x, y + h / 2]);
        case "etoile": return CG.Geo.star(x + w / 2, y + h / 2 + s * 0.04, s * 0.55, s * 0.24, 5);
        case "coeur": return CG.Geo.heart(x, y, s);
        case "goutte":
            rr = [[R, R, 0, R], [R, R, R, 0], [R, 0, R, R]][orient || 0];
            if (orient === undefined || orient < 0) { rr = [0, R, R, R]; }
            return CG.Geo.roundRect(x, y, w, h, rr);
        case "feuille":
            rr = (orient === 1 || orient === 2) ? [R, 0, R, 0] : [0, R, 0, R];
            return CG.Geo.roundRect(x, y, w, h, rr);
        case "coussin": return CG.Geo.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0.92);
        case "pointu": return CG.Geo.chamfer(x, y, w, h, s * 0.25);
    }
    return CG.Geo.rect(x, y, w, h);
};

/* ---------- MISE EN PAGE QR COMPLETE ---------- */
CG.MODULE_STYLES = ["carre", "rond", "arrondi", "losange", "etoile", "coeur", "goutte", "barresV", "barresH", "liquide", "petitsPoints"];
CG.MODULE_NOMS = ["Carr\u00e9s", "Ronds", "Arrondis", "Losanges", "\u00c9toiles", "C\u0153urs", "Gouttes", "Barres verticales", "Barres horizontales", "Liquide", "Petits points"];
CG.EYE_STYLES = ["carre", "arrondi", "cercle", "feuille", "goutte", "coussin", "pointu", "points"];
CG.EYE_NOMS = ["Carr\u00e9", "Arrondi", "Cercle", "Feuille", "Goutte", "Coussin", "Pointu (biseaut\u00e9)", "Points"];
CG.FRAMES = ["aucun", "simple", "arrondi", "bulle", "ticket", "badge", "polaroid", "banniereHaut", "banniereBas", "cercle"];
CG.FRAME_NOMS = ["Aucun", "Cadre simple", "Cadre arrondi", "Bulle \u00ab Scannez-moi \u00bb", "Ticket", "Badge", "Polaro\u00efd", "Banni\u00e8re en haut", "Banni\u00e8re en bas", "Cercle"];
CG.PATTERNS = ["aucun", "cercles", "points", "zellige", "vagues", "confettis"];
CG.PATTERN_NOMS = ["Aucun", "Cercles", "Points", "Zellige", "Vagues", "Confettis"];

CG.Layout = {};
/*
 o = { m, qz, style, scale(0.4-1), eyeOut, eyeIn, th:{mod,bg,eo,ei,fr,tx,grad}, transparent, merge,
       logo:{pct, shape:"carre"|"rond"}|null, frame, label:{text,size,pos:"haut"|"bas"}, pattern, patOpacity,
       shadow, card:{on, pad, radius} }
 Renvoie { w, h, ops:[{name, group, contours, fill, opacity}], texts:[{text,x,y,size,color}], logoBox }
*/
CG.Layout.qr = function (q, o) {
    var n = q.size, m = o.m, qz = o.qz, ops = [], texts = [], G = CG.Geo, th = o.th;
    var Q = (n + 2 * qz) * m, x0 = qz * m, y0 = qz * m, i, j, x, y;
    var scale = Math.max(0.3, Math.min(1, o.scale || 1));
    /* zone logo */
    var lz = null;
    if (o.logo && o.logo.pct > 0) {
        var side = Math.round(n * o.logo.pct / 100);
        if ((n - side) % 2 !== 0) { side++; }
        lz = { c: n / 2, half: side / 2, shape: o.logo.shape };
    }
    function inLogo(cx, cy) { /* cx,cy = centre du module en modules */
        if (!lz) { return false; }
        if (lz.shape === "rond") { var dx = cx - lz.c, dy = cy - lz.c; return dx * dx + dy * dy <= (lz.half + 0.5) * (lz.half + 0.5); }
        return Math.abs(cx - lz.c) <= lz.half && Math.abs(cy - lz.c) <= lz.half;
    }
    function isEye(xx, yy) { return (xx < 7 && yy < 7) || (xx >= n - 7 && yy < 7) || (xx < 7 && yy >= n - 7); }
    function dark(xx, yy) {
        if (xx < 0 || yy < 0 || xx >= n || yy >= n) { return false; }
        return q.modules[yy][xx] && !isEye(xx, yy) && !inLogo(xx + 0.5, yy + 0.5);
    }
    /* --- modules --- */
    var mods = [], st = o.style, sz, off;
    if (st === "barresV" || st === "barresH") {
        var w = m * (scale < 1 ? scale : 0.82), inset = (m - w) / 2;
        for (i = 0; i < n; i++) {
            j = 0;
            while (j < n) {
                var on = st === "barresV" ? dark(i, j) : dark(j, i);
                if (!on) { j++; continue; }
                var k = j;
                while (k + 1 < n && (st === "barresV" ? dark(i, k + 1) : dark(k + 1, i))) { k++; }
                var len = (k - j + 1) * m - 2 * inset;
                if (st === "barresV") { mods.push(G.roundRect(x0 + i * m + inset, y0 + j * m + inset, w, len, [w / 2, w / 2, w / 2, w / 2])); }
                else { mods.push(G.roundRect(x0 + j * m + inset, y0 + i * m + inset, len, w, [w / 2, w / 2, w / 2, w / 2])); }
                j = k + 1;
            }
        }
    } else {
        for (y = 0; y < n; y++) {
            x = 0;
            while (x < n) {
                if (!dark(x, y)) { x++; continue; }
                if (st === "carre" && scale >= 1) {
                    var x2 = x; while (x2 + 1 < n && dark(x2 + 1, y)) { x2++; }
                    mods.push(G.rect(x0 + x * m, y0 + y * m, (x2 - x + 1) * m, m));
                    x = x2 + 1; continue;
                }
                if (st === "liquide") {
                    var r = m / 2, L = dark(x - 1, y), R = dark(x + 1, y), T = dark(x, y - 1), B = dark(x, y + 1);
                    mods.push(G.roundRect(x0 + x * m, y0 + y * m, m, m, [(!L && !T) ? r : 0, (!R && !T) ? r : 0, (!R && !B) ? r : 0, (!L && !B) ? r : 0]));
                    x++; continue;
                }
                sz = m * (st === "petitsPoints" ? Math.min(scale, 0.6) : scale); off = (m - sz) / 2;
                mods.push(G.shape(st, x0 + x * m + off, y0 + y * m + off, sz, sz, -1));
                x++;
            }
        }
    }
    var modFill = (th.grad && th.grad.type !== "aucun") ? { grad: th.grad, bbox: [x0, y0, n * m, n * m] } : th.mod;
    if (o.merge || typeof modFill !== "string") { ops.push({ name: "Modules", contours: mods, fill: modFill, layer: "qr" }); }
    else { for (i = 0; i < mods.length; i++) { ops.push({ name: "Module", group: "Modules", contours: [mods[i]], fill: modFill, layer: "qr" }); } }
    /* --- yeux --- */
    var eyes = [[0, 0], [n - 7, 0], [0, n - 7]], e;
    for (e = 0; e < 3; e++) {
        var ex = x0 + eyes[e][0] * m, ey = y0 + eyes[e][1] * m, ring = [];
        if (o.eyeOut === "points") {
            for (j = 0; j < 7; j++) { for (i = 0; i < 7; i++) {
                if (i === 0 || j === 0 || i === 6 || j === 6) { ring.push(G.ellipse(ex + (i + 0.5) * m, ey + (j + 0.5) * m, m * 0.56, m * 0.56)); }
            } }
        } else {
            ring.push(G.shape(o.eyeOut, ex, ey, 7 * m, 7 * m, e));
            ring.push(G.orient(G.shape(o.eyeOut, ex + m, ey + m, 5 * m, 5 * m, e), true));
        }
        ops.push({ name: "\u0152il ext\u00e9rieur " + (e + 1), group: "Yeux", contours: ring, fill: th.eo, layer: "qr" });
        var inner = [];
        if (o.eyeIn === "points") {
            for (j = 0; j < 3; j++) { for (i = 0; i < 3; i++) { inner.push(G.ellipse(ex + (2.5 + i) * m, ey + (2.5 + j) * m, m * 0.5, m * 0.5)); } }
            inner.push(G.rect(ex + 2.5 * m, ey + 2 * m, 2 * m, 3 * m)); inner.push(G.rect(ex + 2 * m, ey + 2.5 * m, 3 * m, 2 * m));
        } else { inner.push(G.shape(o.eyeIn, ex + 2 * m, ey + 2 * m, 3 * m, 3 * m, e)); }
        ops.push({ name: "\u0152il int\u00e9rieur " + (e + 1), group: "Yeux", contours: inner, fill: th.ei, layer: "qr" });
    }
    /* normaliser l'orientation */
    for (i = 0; i < ops.length; i++) { for (j = 0; j < ops[i].contours.length; j++) { var c = ops[i].contours[j]; ops[i].contours[j] = G.orient(c, !!c.hole); } }
    var logoBox = null;
    if (lz) {
        var lb = (lz.half * 2 - 1) * m, lc = x0 + lz.c * m;
        logoBox = { x: lc - lb / 2, y: y0 + lz.c * m - lb / 2, w: lb, h: lb, shape: lz.shape };
    }

    /* --- decor : carte, cadre, motif, ombre, etiquette --- */
    var back = [], fr = o.frame || "aucun", lab = o.label || { text: "", size: 12, pos: "bas" };
    var labText = lab.text;
    if (fr === "bulle" && CG.trim(labText) === "") { labText = "Scannez-moi"; }
    var hasLab = CG.trim(labText) !== "";
    var pos = lab.pos === "haut" ? "haut" : "bas";
    if (fr === "banniereHaut") { pos = "haut"; } if (fr === "banniereBas" || fr === "polaroid") { pos = "bas"; }
    var card = o.card || { on: false, pad: 0, radius: 0 };
    var pad = card.on || fr !== "aucun" ? Math.max(card.pad || 0, fr === "aucun" ? 0 : m) : 0;
    if (fr === "bulle") { pad = Math.max(pad, 2 * m); }
    var cx = -pad, cy = -pad, cw = Q + 2 * pad, ch = Q + 2 * pad, crad = card.on ? Math.min(card.radius || 0, cw / 2) : 0;
    var t = Math.max(1.5 * m, 2), band = hasLab ? lab.size * 2.2 : 0;
    if (fr === "ticket" || fr === "polaroid" || fr === "badge") { t = Math.max(3 * m, 5); }
    var cardC, outer = null, frameHoles = [], extra = [];
    if (fr === "cercle") {
        var D = Math.sqrt(2) * cw;
        cardC = G.ellipse(Q / 2, Q / 2, D / 2, D / 2);
        outer = G.ellipse(Q / 2, Q / 2, D / 2 + t, D / 2 + t);
        cx = Q / 2 - D / 2; cy = cx; cw = D; ch = D;
    } else {
        cardC = crad > 0 || fr === "arrondi" || fr === "bulle" || fr === "badge" ? G.roundRect(cx, cy, cw, ch, [Math.max(crad, fr === "aucun" ? 0 : 2 * m), Math.max(crad, fr === "aucun" ? 0 : 2 * m), Math.max(crad, fr === "aucun" ? 0 : 2 * m), Math.max(crad, fr === "aucun" ? 0 : 2 * m)]) : G.rect(cx, cy, cw, ch);
        if (fr !== "aucun") {
            var bandFr = (fr === "simple" || fr === "arrondi" || fr === "bulle" || fr === "ticket" || fr === "badge" || fr === "polaroid" || fr === "banniereHaut" || fr === "banniereBas") && hasLab;
            var ox = cx - t, oy = cy - t, ow = cw + 2 * t, oh = ch + 2 * t;
            if (fr === "polaroid") { oh += Math.max(band, 6 * m); }
            else if (bandFr) { oh += band; if (pos === "haut") { oy -= band; } }
            if (fr === "badge") { oy -= 4 * m; oh += 4 * m; }
            var orad = (fr === "arrondi" || fr === "bulle" || fr === "badge") ? Math.max(crad, 2 * m) + t : (crad > 0 ? crad + t : 0);
            outer = orad > 0 ? G.roundRect(ox, oy, ow, oh, [orad, orad, orad, orad]) : G.rect(ox, oy, ow, oh);
            if (fr === "ticket") {
                frameHoles.push(G.ellipse(ox, oy + oh / 2, t * 0.8, t * 0.8));
                frameHoles.push(G.ellipse(ox + ow, oy + oh / 2, t * 0.8, t * 0.8));
            }
            if (fr === "badge") { frameHoles.push(G.roundRect(ox + ow / 2 - 3 * m, oy + 1.2 * m, 6 * m, 1.6 * m, [0.8 * m, 0.8 * m, 0.8 * m, 0.8 * m])); }
            if (hasLab) {
                var ly = pos === "haut" ? oy + (fr === "badge" ? 4 * m : 0) + t / 2 + band / 2 : oy + oh - (fr === "polaroid" ? Math.max(band, 6 * m) / 2 + t / 2 : t / 2 + band / 2);
                texts.push({ text: labText, x: Q / 2, y: ly + lab.size * 0.35, size: lab.size, color: th.tx });
            }
            if (fr === "bulle" && hasLab) { /* fleche vers le QR */
                var aw = Math.min(pad * 0.9, 3 * m);
                if (pos === "bas") { extra.push(G.poly([Q / 2 - aw, cy + ch, Q / 2 + aw, cy + ch, Q / 2, cy + ch - aw * 0.9])); }
                else { extra.push(G.poly([Q / 2 - aw, cy, Q / 2, cy + aw * 0.9, Q / 2 + aw, cy])); }
            }
        }
    }
    if (hasLab && (fr === "aucun" || fr === "cercle")) {
        var by = fr === "cercle" ? cy + ch + t : cy + ch, ty = fr === "cercle" ? cy - t : cy;
        texts.push({ text: labText, x: Q / 2, y: pos === "haut" ? ty - lab.size * 0.6 : by + lab.size * 1.3, size: lab.size, color: th.tx === th.bg || fr === "aucun" ? th.mod : th.fr });
    }
    /* ombre */
    var shadowBase = outer || ((card.on || fr !== "aucun") ? cardC : G.rect(0, 0, Q, Q));
    if (o.shadow) {
        var so = Math.max(m * 0.8, 2), sh = { pts: [], poly: shadowBase.poly };
        for (i = 0; i < shadowBase.pts.length; i++) { var pp = shadowBase.pts[i]; sh.pts.push([pp[0] + so, pp[1] + so, pp[2] + so, pp[3] + so, pp[4] + so, pp[5] + so]); }
        back.push({ name: "Ombre port\u00e9e", contours: [G.orient(sh, false)], fill: "#000000", opacity: 28, layer: "decor" });
    }
    if (outer) {
        var fc = [G.orient(outer, false), G.orient(cardC, true)];
        for (i = 0; i < frameHoles.length; i++) { fc.push(G.orient(frameHoles[i], true)); }
        back.push({ name: "Cadre", contours: fc, fill: th.fr, layer: "decor" });
        for (i = 0; i < extra.length; i++) { back.push({ name: "Fl\u00e8che", contours: [G.orient(extra[i], false)], fill: th.fr, layer: "decor" }); }
    }
    if (!o.transparent) {
        if (card.on || fr !== "aucun") { back.push({ name: "Carte de fond", contours: [G.orient(cardC, false)], fill: th.bg, layer: "decor" }); }
        else { back.push({ name: "Fond", contours: [G.rect(0, 0, Q, Q)], fill: th.bg, layer: "qr" }); }
    }
    /* motif de fond (hors zone QR + zone de silence) */
    var pat = o.pattern || "aucun";
    if (pat !== "aucun" && pad > 0) {
        var u = Math.max(2.5 * m, 4), pc = [], seed = 12345, ii, jj;
        var rnd = function () { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
        var insideCard = function (px, py, rad) {
            if (fr === "cercle") { var dx = px - Q / 2, dy = py - Q / 2; return Math.sqrt(dx * dx + dy * dy) + rad <= cw / 2; }
            var cr = Math.max(crad, fr === "aucun" ? 0 : 2 * m);
            if (px - rad < cx || px + rad > cx + cw || py - rad < cy || py + rad > cy + ch) { return false; }
            var ccx = Math.max(cx + cr, Math.min(px, cx + cw - cr)), ccy = Math.max(cy + cr, Math.min(py, cy + ch - cr));
            return Math.sqrt((px - ccx) * (px - ccx) + (py - ccy) * (py - ccy)) + rad <= cr + 0.001 || (px >= cx + cr && px <= cx + cw - cr) || (py >= cy + cr && py <= cy + ch - cr);
        };
        var freeOfQR = function (px, py, rad) { return px + rad < 0 || py + rad < 0 || px - rad > Q || py - rad > Q; };
        var cols2 = [th.eo, th.ei, th.fr];
        for (jj = 0; cy + (jj + 0.5) * u < cy + ch; jj++) { for (ii = 0; cx + (ii + 0.5) * u < cx + cw; ii++) {
            var px = cx + (ii + 0.5) * u + ((pat === "points" || pat === "cercles") && jj % 2 ? u / 2 : 0), py = cy + (jj + 0.5) * u, rad = u * 0.45;
            if (pat === "confettis") { px += (rnd() - 0.5) * u * 0.6; py += (rnd() - 0.5) * u * 0.6; }
            if (!insideCard(px, py, rad) || !freeOfQR(px, py, rad)) { continue; }
            var shp = null;
            if (pat === "points") { shp = [G.ellipse(px, py, u * 0.16, u * 0.16)]; }
            else if (pat === "cercles") { shp = [G.ellipse(px, py, u * 0.34, u * 0.34), G.orient(G.ellipse(px, py, u * 0.22, u * 0.22), true)]; }
            else if (pat === "zellige") {
                var zz = [], a2;
                for (a2 = 0; a2 < 16; a2++) { var ang = -Math.PI / 2 + a2 * Math.PI / 8, rr2 = a2 % 2 ? u * 0.3 : u * 0.45; zz.push(px + Math.cos(ang) * rr2, py + Math.sin(ang) * rr2); }
                shp = [G.poly(zz), G.orient(G.star(px, py, u * 0.18, u * 0.1, 8), true)];
            } else if (pat === "vagues") {
                var hw = u * 0.5, a = u * 0.18, th2 = u * 0.09;
                shp = [{ pts: [[px - hw, py - th2, px - hw, py - th2, px - hw / 2, py - th2 - a], [px + hw, py - th2, px + hw / 2, py - th2 + a, px + hw, py - th2],
                    [px + hw, py + th2, px + hw, py + th2, px + hw / 2, py + th2 + a], [px - hw, py + th2, px - hw / 2, py + th2 - a, px - hw, py + th2]], poly: false }];
            } else if (pat === "confettis") {
                if (rnd() < 0.45) { continue; }
                var ca = rnd() * Math.PI, cl = u * 0.22, cw2 = u * 0.08, co = Math.cos(ca), si = Math.sin(ca);
                shp = rnd() < 0.5 ? [G.ellipse(px, py, u * 0.1, u * 0.1)] :
                    [G.poly([px - co * cl + si * cw2, py - si * cl - co * cw2, px + co * cl + si * cw2, py + si * cl - co * cw2, px + co * cl - si * cw2, py + si * cl + co * cw2, px - co * cl - si * cw2, py - si * cl + co * cw2])];
                back.push({ name: "Confetti", group: "Motif", contours: [G.orient(shp[0], false)], fill: cols2[Math.floor(rnd() * 3)], opacity: o.patOpacity, layer: "decor" });
                continue;
            }
            for (i = 0; i < shp.length; i++) { pc.push(shp[i].hole ? shp[i] : G.orient(shp[i], false)); }
        } }
        if (pc.length) { back.push({ name: "Motif " + pat, contours: pc, fill: th.eo, opacity: o.patOpacity, layer: "decor" }); }
    }
    ops = back.concat(ops);
    /* normalisation des coordonnees (origine en haut a gauche) */
    var minX = 0, minY = 0, maxX = Q, maxY = Q;
    for (i = 0; i < ops.length; i++) { for (j = 0; j < ops[i].contours.length; j++) { var ps = ops[i].contours[j].pts; for (k = 0; k < ps.length; k++) {
        minX = Math.min(minX, ps[k][0]); minY = Math.min(minY, ps[k][1]); maxX = Math.max(maxX, ps[k][0]); maxY = Math.max(maxY, ps[k][1]);
    } } }
    for (i = 0; i < texts.length; i++) { minY = Math.min(minY, texts[i].y - texts[i].size); maxY = Math.max(maxY, texts[i].y + texts[i].size * 0.3); }
    function sh2(c) { var r2 = { pts: [], poly: c.poly, hole: c.hole }, kk; for (kk = 0; kk < c.pts.length; kk++) { var p = c.pts[kk]; r2.pts.push([p[0] - minX, p[1] - minY, p[2] - minX, p[3] - minY, p[4] - minX, p[5] - minY]); } return r2; }
    for (i = 0; i < ops.length; i++) {
        for (j = 0; j < ops[i].contours.length; j++) { ops[i].contours[j] = sh2(ops[i].contours[j]); }
        if (ops[i].fill && ops[i].fill.bbox) { ops[i].fill = { grad: ops[i].fill.grad, bbox: [ops[i].fill.bbox[0] - minX, ops[i].fill.bbox[1] - minY, ops[i].fill.bbox[2], ops[i].fill.bbox[3]] }; }
    }
    for (i = 0; i < texts.length; i++) { texts[i].x -= minX; texts[i].y -= minY; }
    if (logoBox) { logoBox.x -= minX; logoBox.y -= minY; }
    return { w: maxX - minX, h: maxY - minY, ops: ops, texts: texts, logoBox: logoBox, qrBox: { x: -minX, y: -minY, w: Q, h: Q } };
};
// ===== END ENCODERS =====

/* ===================== PARTIE ILLUSTRATOR ===================== */
var MM = 72 / 25.4;
var CG_VERSION = "2.0";

function cgParseNum(s, nom, min, max) {
    var v = parseFloat(CG.trim(String(s)).replace(",", "."));
    if (isNaN(v)) { throw new Error("\u00ab " + nom + " \u00bb doit \u00eatre un nombre."); }
    if (v < min || v > max) { throw new Error("\u00ab " + nom + " \u00bb doit \u00eatre compris entre " + min + " et " + max + "."); }
    return v;
}

/* Couleur Illustrator depuis #RRGGBB */
function cgColor(hex, doc) {
    var c = CG.Color.parse(hex), col;
    if (!c) { throw new Error("Couleur invalide : \u00ab " + hex + " \u00bb (format #RRGGBB attendu)."); }
    if (doc.documentColorSpace === DocumentColorSpace.CMYK) {
        col = new CMYKColor();
        var k = 1 - Math.max(c[0], c[1], c[2]) / 255;
        if (k >= 1) { col.cyan = 0; col.magenta = 0; col.yellow = 0; col.black = 100; }
        else {
            col.cyan = Math.round((1 - c[0] / 255 - k) / (1 - k) * 100);
            col.magenta = Math.round((1 - c[1] / 255 - k) / (1 - k) * 100);
            col.yellow = Math.round((1 - c[2] / 255 - k) / (1 - k) * 100);
            col.black = Math.round(k * 100);
        }
        return col;
    }
    col = new RGBColor(); col.red = c[0]; col.green = c[1]; col.blue = c[2];
    return col;
}

function cgGradient(spec, doc) {
    var g = doc.gradients.add(), i, n = spec.stops.length;
    g.name = "QR d\u00e9grad\u00e9 " + spec.stops.join("-");
    g.type = spec.type === "radial" ? GradientType.RADIAL : GradientType.LINEAR;
    while (g.gradientStops.length < n) { g.gradientStops.add(); }
    for (i = 0; i < n; i++) {
        g.gradientStops[i].rampPoint = n > 1 ? i / (n - 1) * 100 : 0;
        g.gradientStops[i].midPoint = 50;
        g.gradientStops[i].color = cgColor(spec.stops[i], doc);
    }
    var gc = new GradientColor();
    gc.gradient = g;
    return gc;
}

function cgMakePath(target, c, left, top) {
    var p = target.pathItems.add(), i, pt;
    if (c.poly) {
        var arr = [];
        for (i = 0; i < c.pts.length; i++) { arr.push([left + c.pts[i][0], top - c.pts[i][1]]); }
        p.setEntirePath(arr);
    } else {
        for (i = 0; i < c.pts.length; i++) {
            pt = p.pathPoints.add();
            pt.anchor = [left + c.pts[i][0], top - c.pts[i][1]];
            pt.leftDirection = [left + c.pts[i][2], top - c.pts[i][3]];
            pt.rightDirection = [left + c.pts[i][4], top - c.pts[i][5]];
        }
    }
    p.closed = true;
    return p;
}

/* Rend la mise en page CG.Layout.qr dans le groupe */
function cgRenderLayout(grp, L, left, top, doc, o) {
    var groups = {}, colors = {}, i, j, op, cont, target, item, fill, paths;
    function col(hex) { if (!colors[hex]) { colors[hex] = cgColor(hex, doc); } return colors[hex]; }
    for (i = 0; i < L.ops.length; i++) {
        op = L.ops[i];
        cont = grp;
        if (op.group) {
            if (!groups[op.group]) { groups[op.group] = grp.groupItems.add(); groups[op.group].name = op.group; }
            cont = groups[op.group];
        }
        if (op.contours.length === 0) { continue; }
        if (op.contours.length > 1) { target = cont.compoundPathItems.add(); item = target; }
        else { target = cont; item = null; }
        paths = [];
        for (j = 0; j < op.contours.length; j++) { paths.push(cgMakePath(target, op.contours[j], left, top)); }
        if (!item) { item = paths[0]; }
        fill = typeof op.fill === "string" ? col(op.fill) : cgGradient(op.fill.grad, doc);
        for (j = 0; j < paths.length; j++) {
            paths[j].filled = true; paths[j].stroked = false;
            try { paths[j].evenodd = false; } catch (e0) {}
            paths[j].fillColor = fill;
        }
        if (typeof op.fill !== "string" && op.fill.grad.type !== "radial" && op.fill.grad.angle) {
            try { item.rotate(op.fill.grad.angle, false, false, true, false, Transformation.CENTER); } catch (e1) {}
        }
        if (op.opacity !== undefined && op.opacity < 100) { item.opacity = op.opacity; }
        item.name = op.name;
    }
    var font = null;
    if (o.labelFont) { try { font = app.textFonts.getByName(o.labelFont); } catch (e2) { font = null; } }
    for (i = 0; i < L.texts.length; i++) {
        var t = L.texts[i], tf = grp.textFrames.pointText([left + t.x, top - t.y]);
        tf.contents = t.text;
        tf.textRange.characterAttributes.size = t.size;
        if (font) { tf.textRange.characterAttributes.textFont = font; }
        tf.textRange.characterAttributes.fillColor = col(t.color);
        tf.textRange.paragraphAttributes.justification = Justification.CENTER;
        tf.name = "\u00c9tiquette";
    }
    if (L.logoBox && o.logoMode !== "aucun") { cgPlaceLogo(grp, L.logoBox, left, top, o); }
}

function cgPlaceLogo(grp, b, left, top, o) {
    var item = null;
    if (o.logoMode === "fichier") {
        var f = new File(o.logoFile);
        if (!f.exists) { throw new Error("Fichier logo introuvable : " + o.logoFile); }
        if (/\.(ai|eps|svg|pdf)$/i.test(f.name)) { item = grp.groupItems.createFromFile(f); }
        else { item = grp.placedItems.add(); item.file = f; }
    } else if (o.logoMode === "selection" && o.logoItem) {
        item = o.logoItem.duplicate(grp, ElementPlacement.PLACEATEND);
    }
    if (!item) { return; }
    item.name = "Logo";
    var fit = b.shape === "rond" ? 0.68 : 0.86, bw = b.w * fit, bh = b.h * fit;
    var s = Math.min(bw / item.width, bh / item.height) * 100;
    item.resize(s, s);
    var cx = left + b.x + b.w / 2, cy = top - (b.y + b.h / 2);
    item.position = [cx - item.width / 2, cy + item.height / 2];
}

/* Code-barres 1D (couleurs du theme : modules + fond) */
function cgDrawBar(grp, r, o, left, top, doc) {
    var X = o.module, bits = r.bits, isGS1 = !!r.textGroups, fg = cgColor(o.th.mod, doc), bg = cgColor(o.th.bg, doc);
    var qzL = o.bquiet, qzR = o.bquiet;
    if (isGS1 && o.text) { qzL = Math.max(qzL, r.type === "EAN-8" ? 7 : 9); if (r.type === "UPC-A") { qzR = Math.max(qzR, 9); } }
    var bearer = (r.type === "ITF-14" && o.bearer) ? 3 * X : 0;
    var barTop = top - X * 2 - bearer, barH = o.barHeight;
    var guardExtra = (isGS1 && o.text) ? o.fontSize * 0.55 : 0;
    var totalW = (qzL + bits.length + qzR) * X;
    var totalH = X * 2 + bearer * 2 + barH + (o.text ? (isGS1 ? guardExtra + o.fontSize * 0.7 : o.fontSize * 1.15) : 0) + X * 2;
    function fillIt(it, c) { it.filled = true; it.fillColor = c; it.stroked = false; return it; }
    if (!o.transparent) { fillIt(grp.pathItems.rectangle(top, left, totalW, totalH), bg).name = "Fond"; }
    var cont = o.merge ? grp.compoundPathItems.add() : grp.groupItems.add();
    cont.name = "Barres";
    var paths = [], i = 0, j, x0 = left + qzL * X;
    function isGuard(p) {
        if (!isGS1 || !o.text) { return false; }
        for (var g = 0; g < r.guards.length; g++) { if (p >= r.guards[g][0] && p < r.guards[g][1]) { return true; } }
        return false;
    }
    while (i < bits.length) {
        if (bits.charAt(i) !== "1") { i++; continue; }
        j = i; while (j + 1 < bits.length && bits.charAt(j + 1) === "1") { j++; }
        paths.push(cont.pathItems.rectangle(barTop, x0 + i * X, (j - i + 1) * X, barH + (isGuard(i) ? guardExtra : 0)));
        i = j + 1;
    }
    if (bearer > 0) {
        paths.push(cont.pathItems.rectangle(top - X * 2, left + X * 2, totalW - 4 * X, bearer));
        paths.push(cont.pathItems.rectangle(barTop - barH, left + X * 2, totalW - 4 * X, bearer));
    }
    for (i = 0; i < paths.length; i++) { fillIt(paths[i], fg); }
    if (o.text) {
        var font = null;
        try { font = app.textFonts.getByName(o.font); } catch (e) { font = null; }
        var base = barTop - barH - bearer - o.fontSize * (isGS1 ? 0.75 : 0.95), items = [];
        if (isGS1) { for (i = 0; i < r.textGroups.length; i++) { items.push({ t: r.textGroups[i].t, x: x0 + (r.textGroups[i].from + r.textGroups[i].to) / 2 * X }); } }
        else { items.push({ t: r.type === "Code 39" ? r.text.replace(/^\*|\*$/g, "") : r.text, x: left + totalW / 2 }); }
        for (i = 0; i < items.length; i++) {
            var tf = grp.textFrames.pointText([items[i].x, base]);
            tf.contents = items[i].t.replace(/[\x00-\x1f]/g, " ");
            tf.textRange.characterAttributes.size = o.fontSize;
            if (font) { tf.textRange.characterAttributes.textFont = font; }
            tf.textRange.characterAttributes.fillColor = fg;
            tf.textRange.paragraphAttributes.justification = Justification.CENTER;
        }
    }
    return { w: totalW, h: totalH };
}

/* Lecture CSV / TXT : premiere colonne */
function cgParseLines(txt, isCsv, skipHeader) {
    var raw = String(txt).replace(/\r\n?/g, "\n").split("\n"), out = [], i, l;
    for (i = 0; i < raw.length; i++) {
        if (skipHeader && i === 0) { continue; }
        l = raw[i];
        if (isCsv) {
            if (l.charAt(0) === "\"") {
                var k = 1, v = "";
                while (k < l.length) {
                    if (l.charAt(k) === "\"") { if (l.charAt(k + 1) === "\"") { v += "\""; k += 2; continue; } break; }
                    v += l.charAt(k); k++;
                }
                l = v;
            } else {
                var sep = l.indexOf(";") >= 0 ? ";" : (l.indexOf("\t") >= 0 ? "\t" : ",");
                l = l.split(sep)[0];
            }
        }
        if (CG.trim(l) !== "") { out.push({ line: i + 1, text: CG.trim(l) }); }
    }
    return out;
}

/* ---------- Themes personnalises (Folder.userData) ---------- */
function cgThemeFile() {
    var d = new Folder(Folder.userData + "/GenerateurCodes");
    if (!d.exists) { d.create(); }
    return new File(d.fsName + "/themes.json");
}
function cgReadText(f) {
    f.encoding = "UTF-8";
    if (!f.open("r")) { throw new Error("Impossible d'ouvrir \u00ab " + f.fsName + " \u00bb."); }
    var t = f.read(); f.close();
    if (t.charCodeAt(0) === 0xFEFF) { t = t.substr(1); }
    return t;
}
function cgWriteText(f, t) {
    f.encoding = "UTF-8"; f.lineFeed = "Unix";
    if (!f.open("w")) { throw new Error("Impossible d'\u00e9crire \u00ab " + f.fsName + " \u00bb."); }
    f.write(t); f.close();
}
function cgThemesFromJSON(txt) {
    var d = CG.JSON.parse(txt), list, out = [], i;
    if (Object.prototype.toString.call(d) === "[object Array]") { list = d; }
    else if (d && d.themes) { list = d.themes; } else { list = [d]; }
    for (i = 0; i < list.length; i++) { out.push(CG.cleanTheme(list[i])); }
    return out;
}
function cgLoadCustom() {
    var f = cgThemeFile();
    if (!f.exists) { return []; }
    try { return cgThemesFromJSON(cgReadText(f)); } catch (e) { alert("Fichier de th\u00e8mes illisible, il sera ignor\u00e9 :\n" + e.message); return []; }
}
function cgSaveCustom(list) { cgWriteText(cgThemeFile(), CG.JSON.str({ version: 2, themes: list })); }

/* ---------- Dessin ScriptUI (aper\u00e7us) ---------- */
function cgUIRect(gfx, x, y, w, h, hex) {
    var c = CG.Color.parse(hex) || [255, 255, 255];
    var b = gfx.newBrush(gfx.BrushType.SOLID_COLOR, [c[0] / 255, c[1] / 255, c[2] / 255, 1]);
    gfx.newPath(); gfx.rectPath(x, y, w, h); gfx.fillPath(b);
}
function cgRedraw(ctrl) { try { ctrl.hide(); ctrl.show(); } catch (e) {} }

var CG_TYPES = ["QR Code", "EAN-13", "EAN-8", "UPC-A", "Code 128", "Code 39", "ITF-14"];
var CG_PRESETS = [
    { n: "Texte / URL", f: ["Texte ou URL"] },
    { n: "Wi-Fi", f: ["SSID (nom du r\u00e9seau)", "Mot de passe"] },
    { n: "vCard (contact)", f: ["Nom", "Pr\u00e9nom", "T\u00e9l\u00e9phone", "E-mail", "Organisation", "Site web"] },
    { n: "E-mail", f: ["Adresse e-mail", "Sujet", "Message"] },
    { n: "T\u00e9l\u00e9phone", f: ["Num\u00e9ro"] },
    { n: "SMS", f: ["Num\u00e9ro", "Message"] },
    { n: "G\u00e9olocalisation", f: ["Latitude", "Longitude"] }
];
var CG_ROLES = [["mod", "Modules"], ["bg", "Fond"], ["eo", "\u0152il ext\u00e9rieur"], ["ei", "\u0152il int\u00e9rieur"], ["fr", "Cadre"], ["tx", "Couleur du texte"]];

function cgDialog(selection) {
    var i, k;
    var custom = cgLoadCustom();
    var cur = {};
    function copyTheme(t) {
        var r = { n: t.n, mod: t.mod, bg: t.bg, eo: t.eo, ei: t.ei, fr: t.fr, tx: t.tx };
        r.grad = t.grad ? { type: t.grad.type, stops: t.grad.stops.slice(0), angle: t.grad.angle } : null;
        return r;
    }
    cur = copyTheme(CG.THEMES[0]);

    var w = new Window("dialog", "G\u00e9n\u00e9rateur de codes vectoriels v" + CG_VERSION);
    w.orientation = "column"; w.alignChildren = "fill";
    var tabs = w.add("tabbedpanel"); tabs.alignChildren = "fill"; tabs.preferredSize = [640, 470];
    function tab(t) { var x = tabs.add("tab", undefined, t); x.alignChildren = "left"; x.margins = 12; return x; }
    function row(p, label, chars) { var g = p.add("group"); var s = g.add("statictext", undefined, label); if (chars) { s.characters = chars; } return g; }
    function dd(p, label, items, sel, chars) { var g = row(p, label, chars); var d = g.add("dropdownlist", undefined, items); d.selection = sel || 0; return d; }
    function et(p, label, val, n, chars) { var g = row(p, label, chars); var e = g.add("edittext", undefined, val); e.characters = n || 6; return e; }

    /* --- Onglet Contenu --- */
    var tC = tab("Contenu");
    var ddType = dd(tC, "Type de code :", CG_TYPES, 0, 16);
    var names = []; for (i = 0; i < CG_PRESETS.length; i++) { names.push(CG_PRESETS[i].n); }
    var ddPreset = dd(tC, "Mod\u00e8le QR :", names, 0, 16);
    var rows = [];
    for (i = 0; i < 6; i++) {
        var g = tC.add("group");
        var lb = g.add("statictext", undefined, ""); lb.characters = 16;
        var ed = i === 0 ? g.add("edittext", undefined, "", { multiline: true, scrolling: true }) : g.add("edittext", undefined, "");
        ed.characters = 44; if (i === 0) { ed.preferredSize.height = 54; }
        rows.push({ g: g, lb: lb, et: ed });
    }
    var gW = tC.add("group"); gW.add("statictext", undefined, "S\u00e9curit\u00e9 Wi-Fi :");
    var ddSec = gW.add("dropdownlist", undefined, ["WPA", "WEP", "nopass"]); ddSec.selection = 0;
    var cbHidden = gW.add("checkbox", undefined, "R\u00e9seau masqu\u00e9");
    var pB = tC.add("panel", undefined, "Codes-barres (EAN, UPC, Code 128, Code 39, ITF-14)"); pB.alignChildren = "left";
    var gB1 = pB.add("group");
    gB1.add("statictext", undefined, "Hauteur des barres (mm) :"); var etBarH = gB1.add("edittext", undefined, "20"); etBarH.characters = 5;
    gB1.add("statictext", undefined, "Zone de silence (modules) :"); var etBqz = gB1.add("edittext", undefined, "10"); etBqz.characters = 4;
    var gB2 = pB.add("group");
    var cbText = gB2.add("checkbox", undefined, "Texte lisible"); cbText.value = true;
    gB2.add("statictext", undefined, "Police :"); var etFont = gB2.add("edittext", undefined, "ArialMT"); etFont.characters = 12;
    gB2.add("statictext", undefined, "Corps (pt) :"); var etFs = gB2.add("edittext", undefined, "9"); etFs.characters = 4;
    var cbBearer = gB2.add("checkbox", undefined, "Barres de support ITF-14"); cbBearer.value = true;

    /* --- Onglet Theme & couleurs --- */
    var tT = tab("Th\u00e8me & couleurs");
    var tTop = tT.add("group"); tTop.alignChildren = "top";
    var tL = tTop.add("group"); tL.orientation = "column"; tL.alignChildren = "left";
    var gTh = tL.add("group"); gTh.add("statictext", undefined, "Th\u00e8me :");
    var ddTheme = gTh.add("dropdownlist", undefined, []); ddTheme.preferredSize.width = 200;
    function fillThemeList(selName) {
        ddTheme.removeAll();
        var j, sel = 0;
        for (j = 0; j < CG.THEMES.length; j++) { ddTheme.add("item", CG.THEMES[j].n); if (CG.THEMES[j].n === selName) { sel = j; } }
        for (j = 0; j < custom.length; j++) { ddTheme.add("item", "\u2605 " + custom[j].n); if (custom[j].n === selName) { sel = CG.THEMES.length + j; } }
        ddTheme.selection = sel;
    }
    var colorEts = {}, swatches = {};
    for (i = 0; i < CG_ROLES.length; i++) {
        var gr = tL.add("group");
        var lab = gr.add("statictext", undefined, CG_ROLES[i][1] + " :"); lab.characters = 15;
        var e1 = gr.add("edittext", undefined, ""); e1.characters = 8;
        var sw = gr.add("group"); sw.preferredSize = [22, 18]; sw.role = CG_ROLES[i][0];
        sw.onDraw = function () { cgUIRect(this.graphics, 0, 0, 22, 18, "#777777"); cgUIRect(this.graphics, 1, 1, 20, 16, cur[this.role]); };
        e1.role = CG_ROLES[i][0];
        e1.onChanging = function () { var v = CG.Color.norm(this.text); if (v) { cur[this.role] = v; cgRedraw(swatches[this.role]); cgRedraw(preview); } };
        colorEts[CG_ROLES[i][0]] = e1; swatches[CG_ROLES[i][0]] = sw;
    }
    var cbTransp = tL.add("checkbox", undefined, "Fond transparent");
    var pG = tL.add("panel", undefined, "D\u00e9grad\u00e9 des modules"); pG.alignChildren = "left";
    var gG1 = pG.add("group");
    var ddGrad = gG1.add("dropdownlist", undefined, ["Aucun", "Lin\u00e9aire", "Radial"]); ddGrad.selection = 0;
    gG1.add("statictext", undefined, "Angle (\u00b0) :"); var etAng = gG1.add("edittext", undefined, "45"); etAng.characters = 4;
    var gG2 = pG.add("group"); gG2.add("statictext", undefined, "Couleurs :");
    var etS1 = gG2.add("edittext", undefined, ""); etS1.characters = 8;
    var etS2 = gG2.add("edittext", undefined, ""); etS2.characters = 8;
    var etS3 = gG2.add("edittext", undefined, ""); etS3.characters = 8; etS3.helpTip = "3e couleur facultative";
    var tR = tTop.add("group"); tR.orientation = "column"; tR.alignChildren = "center";
    tR.add("statictext", undefined, "Aper\u00e7u");
    var preview = tR.add("group"); preview.preferredSize = [150, 150];
    var sampleQ = CG.QR.encode("APERCU", { ecl: "L", mask: 0 });
    preview.onDraw = function () {
        var gfx = this.graphics, n = sampleQ.size, ms = 5, off = (150 - n * ms) / 2, x, y, colr, isE, st;
        cgUIRect(gfx, 0, 0, 150, 150, cur.fr);
        cgUIRect(gfx, 8, 8, 134, 134, cbTransp.value ? "#FFFFFF" : cur.bg);
        for (y = 0; y < n; y++) { for (x = 0; x < n; x++) {
            if (!sampleQ.modules[y][x]) { continue; }
            isE = (x < 7 && y < 7) || (x >= n - 7 && y < 7) || (x < 7 && y >= n - 7);
            if (isE) { var lx = x % (n - 7), ly = y % (n - 7); lx = x >= n - 7 ? x - (n - 7) : x; ly = y >= n - 7 ? y - (n - 7) : y; colr = (lx >= 2 && lx <= 4 && ly >= 2 && ly <= 4) ? cur.ei : cur.eo; }
            else if (cur.grad && cur.grad.stops.length >= 2) {
                st = cur.grad.stops; var tt = (x + y) / (2 * n) * (st.length - 1), ii = Math.min(st.length - 2, Math.floor(tt));
                colr = CG.Color.mix(st[ii], st[ii + 1], tt - ii);
            } else { colr = cur.mod; }
            cgUIRect(gfx, off + x * ms, off + y * ms, ms, ms, colr);
        } }
    };
    var lblContrast = tR.add("statictext", undefined, "", { multiline: true }); lblContrast.preferredSize = [170, 60];
    var gTB = tT.add("group");
    var btSave = gTB.add("button", undefined, "Enregistrer le th\u00e8me\u2026");
    var btDel = gTB.add("button", undefined, "Supprimer");
    var btImp = gTB.add("button", undefined, "Importer\u2026");
    var btExp = gTB.add("button", undefined, "Exporter\u2026");

    function themeToUI(t) {
        cur = copyTheme(t);
        for (var r = 0; r < CG_ROLES.length; r++) { colorEts[CG_ROLES[r][0]].text = cur[CG_ROLES[r][0]]; }
        if (cur.grad) {
            ddGrad.selection = cur.grad.type === "radial" ? 2 : 1;
            etAng.text = String(cur.grad.angle || 0);
            etS1.text = cur.grad.stops[0]; etS2.text = cur.grad.stops[1]; etS3.text = cur.grad.stops[2] || "";
        } else { ddGrad.selection = 0; etS1.text = cur.mod; etS2.text = cur.eo; etS3.text = ""; }
        refreshTheme();
    }
    function readGrad() {
        if (ddGrad.selection.index === 0) { cur.grad = null; return; }
        var s = [], a = CG.Color.norm(etS1.text), b = CG.Color.norm(etS2.text), c = CG.Color.norm(etS3.text);
        if (a) { s.push(a); } if (b) { s.push(b); } if (c) { s.push(c); }
        var ang = parseFloat(String(etAng.text).replace(",", "."));
        cur.grad = s.length >= 2 ? { type: ddGrad.selection.index === 2 ? "radial" : "lineaire", stops: s, angle: isNaN(ang) ? 0 : ang } : null;
    }
    function refreshTheme() {
        readGrad();
        var ws = CG.Color.check(cur, cbTransp.value);
        lblContrast.text = ws.length ? "\u26a0 " + ws.join("\n\u26a0 ") : "Contraste correct \u2713";
        for (var r = 0; r < CG_ROLES.length; r++) { cgRedraw(swatches[CG_ROLES[r][0]]); }
        cgRedraw(preview);
    }
    ddTheme.onChange = function () {
        if (!ddTheme.selection) { return; }
        var ix = ddTheme.selection.index;
        themeToUI(ix < CG.THEMES.length ? CG.THEMES[ix] : custom[ix - CG.THEMES.length]);
    };
    ddGrad.onChange = refreshTheme; etAng.onChange = refreshTheme; etS1.onChange = refreshTheme; etS2.onChange = refreshTheme; etS3.onChange = refreshTheme;
    cbTransp.onClick = refreshTheme;
    for (k in colorEts) { if (colorEts.hasOwnProperty(k)) { colorEts[k].onChange = refreshTheme; } }
    btSave.onClick = function () {
        var nm = prompt("Nom du th\u00e8me personnalis\u00e9 :", cur.n.replace(/^\u2605 /, "") + " (perso)");
        if (!nm) { return; }
        try {
            readGrad();
            var t = copyTheme(cur); t.n = nm; t = CG.cleanTheme(t);
            for (var j = 0; j < custom.length; j++) { if (custom[j].n === t.n) { custom.splice(j, 1); break; } }
            custom.push(t); cgSaveCustom(custom); fillThemeList(t.n);
            alert("Th\u00e8me \u00ab " + t.n + " \u00bb enregistr\u00e9 dans :\n" + cgThemeFile().fsName);
        } catch (e) { alert(e.message, "Erreur", true); }
    };
    btDel.onClick = function () {
        var ix = ddTheme.selection ? ddTheme.selection.index - CG.THEMES.length : -1;
        if (ix < 0) { alert("Seuls les th\u00e8mes personnalis\u00e9s (\u2605) peuvent \u00eatre supprim\u00e9s."); return; }
        if (!confirm("Supprimer le th\u00e8me \u00ab " + custom[ix].n + " \u00bb ?")) { return; }
        custom.splice(ix, 1); cgSaveCustom(custom); fillThemeList(CG.THEMES[0].n); ddTheme.onChange();
    };
    btImp.onClick = function () {
        var f = File.openDialog("Importer des th\u00e8mes (JSON)", "*.json");
        if (!f) { return; }
        try {
            var list = cgThemesFromJSON(cgReadText(f)), j, m2, last = null;
            for (j = 0; j < list.length; j++) {
                for (m2 = 0; m2 < custom.length; m2++) { if (custom[m2].n === list[j].n) { custom.splice(m2, 1); break; } }
                custom.push(list[j]); last = list[j].n;
            }
            cgSaveCustom(custom); fillThemeList(last); ddTheme.onChange();
            alert(list.length + " th\u00e8me(s) import\u00e9(s).");
        } catch (e) { alert("Import impossible : " + e.message, "Erreur", true); }
    };
    btExp.onClick = function () {
        var f = File.saveDialog("Exporter les th\u00e8mes (JSON)", "*.json");
        if (!f) { return; }
        if (!/\.json$/i.test(f.name)) { f = new File(f.fsName + ".json"); }
        readGrad();
        var list = custom.length ? custom : [CG.cleanTheme(copyTheme(cur))];
        try { cgWriteText(f, CG.JSON.str({ version: 2, themes: list })); alert(list.length + " th\u00e8me(s) export\u00e9(s) vers :\n" + f.fsName); }
        catch (e) { alert(e.message, "Erreur", true); }
    };

    /* --- Onglet Modules --- */
    var tM = tab("Modules");
    var ddStyle = dd(tM, "Style des modules :", CG.MODULE_NOMS, 0, 22);
    var etScale = et(tM, "Taille des modules (%) :", "100", 5, 22);
    tM.add("statictext", undefined, "(La taille < 100 % s\u00e9pare les modules ; \u00ab Liquide \u00bb et \u00ab Carr\u00e9s \u00bb restent jointifs \u00e0 100 %.)");
    var ddEcl = dd(tM, "Correction d'erreur :", ["L (7 %)", "M (15 %)", "Q (25 %)", "H (30 %)"], 1, 22);
    var vers = ["Auto"]; for (i = 1; i <= 40; i++) { vers.push(String(i)); }
    var ddVer = dd(tM, "Version minimale :", vers, 0, 22);
    var ddMask = dd(tM, "Masque :", ["Auto (p\u00e9nalit\u00e9 minimale)", "0", "1", "2", "3", "4", "5", "6", "7"], 0, 22);
    var etQz = et(tM, "Zone de silence (modules) :", "4", 4, 22);
    var cbMerge = tM.add("checkbox", undefined, "Fusionner les modules en un seul trac\u00e9 compos\u00e9 (forc\u00e9 avec un d\u00e9grad\u00e9)"); cbMerge.value = true;

    /* --- Onglet Yeux --- */
    var tY = tab("Yeux");
    var ddEyeO = dd(tY, "\u0152il ext\u00e9rieur (cadre 7\u00d77) :", CG.EYE_NOMS, 0, 24);
    var ddEyeI = dd(tY, "\u0152il int\u00e9rieur (centre 3\u00d73) :", CG.EYE_NOMS, 0, 24);
    tY.add("statictext", undefined, "Les couleurs des yeux se r\u00e8glent dans l'onglet \u00ab Th\u00e8me & couleurs \u00bb.");
    tY.add("statictext", undefined, "\u00ab Feuille \u00bb et \u00ab Goutte \u00bb sont orient\u00e9es automatiquement vers le centre du code.");

    /* --- Onglet Decor & cadre --- */
    var tD = tab("D\u00e9cor & cadre");
    var ddFrame = dd(tD, "Cadre :", CG.FRAME_NOMS, 0, 18);
    var etLabel = et(tD, "Texte d'\u00e9tiquette :", "", 30, 18);
    tD.add("statictext", undefined, "({texte} est remplac\u00e9 par le contenu du code \u2014 utile en mode lot.)");
    var gLf = tD.add("group");
    gLf.add("statictext", undefined, "Police :"); var etLFont = gLf.add("edittext", undefined, "Arial-BoldMT"); etLFont.characters = 14;
    gLf.add("statictext", undefined, "Corps (pt) :"); var etLSize = gLf.add("edittext", undefined, "12"); etLSize.characters = 4;
    gLf.add("statictext", undefined, "Position :"); var ddLPos = gLf.add("dropdownlist", undefined, ["Bas", "Haut"]); ddLPos.selection = 0;
    var gPt = tD.add("group");
    gPt.add("statictext", undefined, "Motif de fond :"); var ddPat = gPt.add("dropdownlist", undefined, CG.PATTERN_NOMS); ddPat.selection = 0;
    gPt.add("statictext", undefined, "Opacit\u00e9 (%) :"); var etPatOp = gPt.add("edittext", undefined, "30"); etPatOp.characters = 4;
    var cbShadow = tD.add("checkbox", undefined, "Ombre port\u00e9e (forme d\u00e9cal\u00e9e \u00e0 28 % d'opacit\u00e9)");
    var gCard = tD.add("group");
    var cbCard = gCard.add("checkbox", undefined, "Carte de fond arrondie");
    gCard.add("statictext", undefined, "Marge (mm) :"); var etPad = gCard.add("edittext", undefined, "4"); etPad.characters = 4;
    gCard.add("statictext", undefined, "Rayon (mm) :"); var etRad = gCard.add("edittext", undefined, "3"); etRad.characters = 4;
    tD.add("statictext", undefined, "Le motif est dessin\u00e9 dans la marge de la carte, jamais sous le QR ni dans sa zone de silence.");

    /* --- Onglet Logo --- */
    var tLg = tab("Logo");
    var rbNoLogo = tLg.add("radiobutton", undefined, "Aucun logo"); rbNoLogo.value = true;
    var rbZone = tLg.add("radiobutton", undefined, "Zone vide seulement (logo plac\u00e9 \u00e0 la main ensuite)");
    var rbFile = tLg.add("radiobutton", undefined, "Fichier image (PNG, JPG, SVG, AI, EPS, PDF)");
    var gLfile = tLg.add("group"); var etLogoFile = gLfile.add("edittext", undefined, ""); etLogoFile.characters = 44;
    var btLogo = gLfile.add("button", undefined, "Parcourir\u2026");
    var hasSel = selection && selection.length > 0;
    var rbSel = tLg.add("radiobutton", undefined, "Objet s\u00e9lectionn\u00e9 dans le document" + (hasSel ? "" : " (aucune s\u00e9lection)"));
    rbSel.enabled = hasSel;
    var etLogoPct = et(tLg, "Zone d\u00e9gag\u00e9e (% du c\u00f4t\u00e9) :", "22", 4, 22);
    var ddLogoShape = dd(tLg, "Forme de la zone :", ["Carr\u00e9", "Rond"], 0, 22);
    var cbAutoH = tLg.add("checkbox", undefined, "Passer automatiquement la correction en H"); cbAutoH.value = true;
    tLg.add("statictext", undefined, "Limites : 35 % en H, 20 % en Q. Les niveaux L et M n'acceptent pas de logo.");
    btLogo.onClick = function () { var f = File.openDialog("Choisir le logo"); if (f) { etLogoFile.text = f.fsName; rbFile.value = true; } };

    /* --- Onglet Export / Lot --- */
    var tE = tab("Export / Lot");
    var gS = tE.add("group");
    var rbMod = gS.add("radiobutton", undefined, "Taille du module (mm)"); rbMod.value = true;
    var rbTot = gS.add("radiobutton", undefined, "Largeur du code, zone de silence comprise (mm)");
    var etSize = et(tE, "Valeur :", "1", 6, 8);
    var cbBatch = tE.add("checkbox", undefined, "Mode lot : une donn\u00e9e par ligne (le th\u00e8me et le d\u00e9cor s'appliquent \u00e0 chaque code)");
    var etList = tE.add("edittext", undefined, "", { multiline: true, scrolling: true }); etList.preferredSize = [600, 130];
    var gL1 = tE.add("group");
    var btLoad = gL1.add("button", undefined, "Charger CSV/TXT\u2026");
    var cbHeader = gL1.add("checkbox", undefined, "Ignorer la 1re ligne (en-t\u00eate)");
    gL1.add("statictext", undefined, "Colonnes :"); var etCols = gL1.add("edittext", undefined, "4"); etCols.characters = 4;
    gL1.add("statictext", undefined, "Espacement (mm) :"); var etGap = gL1.add("edittext", undefined, "6"); etGap.characters = 4;
    var loadedCsv = false;
    btLoad.onClick = function () {
        var f = File.openDialog("Choisir un fichier CSV ou TXT", "*.csv;*.txt");
        if (!f) { return; }
        try { etList.text = cgReadText(f); loadedCsv = /\.csv$/i.test(f.name); cbBatch.value = true; refresh(); }
        catch (e) { alert(e.message, "Erreur", true); }
    };

    var gb = w.add("group"); gb.alignment = "right";
    gb.add("button", undefined, "Annuler", { name: "cancel" });
    var btOk = gb.add("button", undefined, "G\u00e9n\u00e9rer", { name: "ok" });

    function refresh() {
        var isQR = ddType.selection.index === 0, p = CG_PRESETS[ddPreset.selection.index], j;
        ddPreset.enabled = isQR && !cbBatch.value;
        for (j = 0; j < 6; j++) {
            if (!isQR) { rows[j].g.visible = j === 0; rows[j].lb.text = "Donn\u00e9es"; }
            else { rows[j].g.visible = j < p.f.length; rows[j].lb.text = j < p.f.length ? p.f[j] : ""; }
            rows[j].g.enabled = !cbBatch.value;
        }
        gW.visible = isQR && ddPreset.selection.index === 1; gW.enabled = !cbBatch.value;
        pB.enabled = !isQR;
        etList.enabled = cbBatch.value; btLoad.enabled = cbBatch.value; cbHeader.enabled = cbBatch.value;
        etCols.enabled = cbBatch.value; etGap.enabled = cbBatch.value;
        if (!isQR && etSize.text === "1" && rbMod.value) { etSize.text = "0.33"; }
        if (isQR && etSize.text === "0.33" && rbMod.value) { etSize.text = "1"; }
    }
    ddType.onChange = refresh; ddPreset.onChange = refresh; cbBatch.onClick = refresh;
    fillThemeList(CG.THEMES[0].n); themeToUI(CG.THEMES[0]); refresh();

    var result = null;
    btOk.onClick = function () {
        try { result = collect(); if (result) { w.close(1); } }
        catch (e) { alert(e.message, "Erreur de saisie", true); }
    };

    function collect() {
        var o = {}, isQR = ddType.selection.index === 0, r;
        o.type = CG_TYPES[ddType.selection.index];
        readGrad();
        for (r = 0; r < CG_ROLES.length; r++) {
            if (!CG.Color.norm(colorEts[CG_ROLES[r][0]].text)) { throw new Error("Couleur \u00ab " + CG_ROLES[r][1] + " \u00bb invalide : utilisez #RRGGBB."); }
            cur[CG_ROLES[r][0]] = CG.Color.norm(colorEts[CG_ROLES[r][0]].text);
        }
        if (ddGrad.selection.index > 0 && !cur.grad) { throw new Error("Le d\u00e9grad\u00e9 n\u00e9cessite au moins 2 couleurs valides (#RRGGBB)."); }
        o.th = copyTheme(cur);
        o.transparent = cbTransp.value;
        o.ecl = ["L", "M", "Q", "H"][ddEcl.selection.index];
        o.minVersion = ddVer.selection.index === 0 ? 1 : ddVer.selection.index;
        o.mask = ddMask.selection.index - 1;
        o.style = CG.MODULE_STYLES[ddStyle.selection.index];
        o.scale = cgParseNum(etScale.text, "Taille des modules", 40, 100) / 100;
        o.qz = Math.round(cgParseNum(etQz.text, "Zone de silence", 0, 20));
        if (isQR && o.qz < 2) { throw new Error("La zone de silence d'un QR code doit faire au moins 2 modules (4 recommand\u00e9s)."); }
        o.merge = cbMerge.value;
        o.eyeOut = CG.EYE_STYLES[ddEyeO.selection.index];
        o.eyeIn = CG.EYE_STYLES[ddEyeI.selection.index];
        o.frame = CG.FRAMES[ddFrame.selection.index];
        o.labelText = etLabel.text; o.labelFont = CG.trim(etLFont.text);
        o.labelSize = cgParseNum(etLSize.text, "Corps de l'\u00e9tiquette", 4, 120);
        o.labelPos = ddLPos.selection.index === 1 ? "haut" : "bas";
        o.pattern = CG.PATTERNS[ddPat.selection.index];
        o.patOpacity = cgParseNum(etPatOp.text, "Opacit\u00e9 du motif", 1, 100);
        o.shadow = cbShadow.value;
        o.card = { on: cbCard.value, pad: cgParseNum(etPad.text, "Marge de la carte", 0, 100) * MM, radius: cgParseNum(etRad.text, "Rayon de la carte", 0, 100) * MM };
        if (o.pattern !== "aucun" && !o.card.on && o.frame === "aucun") { throw new Error("Le motif de fond n\u00e9cessite une carte de fond ou un cadre (avec une marge > 0)."); }
        o.logoMode = rbFile.value ? "fichier" : (rbSel.value ? "selection" : (rbZone.value ? "zone" : "aucun"));
        o.logoFile = etLogoFile.text; o.logoItem = o.logoMode === "selection" ? selection[0] : null;
        o.logoPct = o.logoMode === "aucun" ? 0 : cgParseNum(etLogoPct.text, "Zone d\u00e9gag\u00e9e", 5, 35);
        o.logoShape = ddLogoShape.selection.index === 1 ? "rond" : "carre";
        if (o.logoMode === "fichier" && !(new File(o.logoFile)).exists) { throw new Error("Choisissez un fichier logo existant."); }
        if (isQR && o.logoPct > 0) {
            if (cbAutoH.value) { o.ecl = "H"; }
            if (o.ecl === "L" || o.ecl === "M") { throw new Error("Un logo n\u00e9cessite la correction Q ou H (cochez \u00ab Passer automatiquement en H \u00bb)."); }
            if (o.ecl === "Q" && o.logoPct > 20) { throw new Error("Zone logo trop grande pour le niveau Q (20 % max.)."); }
        }
        o.barHeight = cgParseNum(etBarH.text, "Hauteur des barres", 1, 500) * MM;
        o.bquiet = Math.round(cgParseNum(etBqz.text, "Zone de silence des codes-barres", 0, 50));
        o.text = cbText.value; o.font = CG.trim(etFont.text); o.fontSize = cgParseNum(etFs.text, "Corps du texte", 2, 200);
        o.bearer = cbBearer.value;
        o.sizeMode = rbMod.value ? "module" : "total";
        o.sizeVal = cgParseNum(etSize.text, "Taille", 0.05, 2000) * MM;
        o.items = [];
        if (cbBatch.value) {
            o.items = cgParseLines(etList.text, loadedCsv, cbHeader.value);
            if (o.items.length === 0) { throw new Error("La liste du mode lot est vide."); }
            o.cols = Math.round(cgParseNum(etCols.text, "Colonnes", 1, 100));
            o.gap = cgParseNum(etGap.text, "Espacement", 0, 1000) * MM;
        } else {
            var v = [], j, content;
            for (j = 0; j < 6; j++) { v.push(rows[j].et.text); }
            if (!isQR) { content = CG.trim(v[0]); }
            else {
                switch (ddPreset.selection.index) {
                    case 0: content = v[0]; break;
                    case 1: content = CG.Preset.wifi(v[0], v[1], ddSec.selection.text, cbHidden.value); break;
                    case 2: content = CG.Preset.vcard(v[0], v[1], CG.trim(v[2]), CG.trim(v[3]), v[4], CG.trim(v[5])); break;
                    case 3: content = CG.Preset.email(v[0], v[1], v[2]); break;
                    case 4: content = CG.Preset.tel(v[0]); break;
                    case 5: content = CG.Preset.sms(v[0], v[1]); break;
                    default: content = CG.Preset.geo(v[0], v[1]);
                }
            }
            if (content === "") { throw new Error("Le contenu est vide."); }
            if (isQR) { CG.QR.encode(content, { ecl: o.ecl, minVersion: o.minVersion }); } else { CG.B.encode(o.type, content); }
            o.items.push({ line: 0, text: content });
            o.cols = 1; o.gap = 0;
        }
        /* controle du contraste */
        var warn = CG.Color.check(o.th, o.transparent);
        if (!isQR) { warn = CG.Color.lum(o.th.mod) > CG.Color.lum(o.th.bg) ? ["Couleurs invers\u00e9es (barres claires sur fond fonc\u00e9)."] : (CG.Color.contrast(o.th.mod, o.th.bg) < 4 ? ["Contraste barres/fond insuffisant (< 4:1)."] : []); }
        if (isQR && o.frame !== "aucun" && CG.trim(o.labelText + (o.frame === "bulle" ? "x" : "")) !== "" && CG.Color.contrast(o.th.tx, o.th.fr) < 3) { warn.push("Texte d'\u00e9tiquette peu lisible sur la couleur du cadre."); }
        if (warn.length && !confirm("Attention :\n\u2022 " + warn.join("\n\u2022 ") + "\n\nContinuer quand m\u00eame ?")) { return null; }
        return o;
    }

    if (w.show() !== 1) { return null; }
    return result;
}

function cgRun() {
    var sel = app.documents.length ? app.activeDocument.selection : null;
    var o = cgDialog(sel);
    if (!o) { return; }
    var doc = app.documents.length ? app.activeDocument : app.documents.add(DocumentColorSpace.RGB);
    var layer = doc.activeLayer;
    if (layer.locked || !layer.visible) { layer = doc.layers.add(); layer.name = "Codes"; }
    var ab = doc.artboards[doc.artboards.getActiveArtboardIndex()].artboardRect;
    var margin = 10 * MM, startX = ab[0] + margin, x = startX, y = ab[1] - margin, rowH = 0, col = 0;
    var errors = [], made = 0, i;
    var master = o.items.length > 1 ? layer.groupItems.add() : null;
    if (master) { master.name = "Lot " + o.type + " (" + o.items.length + ")"; }
    for (i = 0; i < o.items.length; i++) {
        var it = o.items[i], grp = null, sz;
        try {
            if (o.type === "QR Code") {
                var q = CG.QR.encode(it.text, { ecl: o.ecl, minVersion: o.minVersion, mask: o.mask });
                var m = o.sizeMode === "module" ? o.sizeVal : o.sizeVal / (q.size + 2 * o.qz);
                var L = CG.Layout.qr(q, {
                    m: m, qz: o.qz, style: o.style, scale: o.scale, eyeOut: o.eyeOut, eyeIn: o.eyeIn, th: o.th,
                    transparent: o.transparent, merge: o.merge,
                    logo: o.logoPct > 0 ? { pct: o.logoPct, shape: o.logoShape } : null,
                    frame: o.frame, label: { text: o.labelText.replace(/\{texte\}/g, it.text.replace(/[\r\n]+/g, " ").substr(0, 40)), size: o.labelSize, pos: o.labelPos },
                    pattern: o.pattern, patOpacity: o.patOpacity, shadow: o.shadow, card: o.card
                });
                grp = (master || layer).groupItems.add();
                grp.name = "QR " + q.version + "-" + q.ecl + " - " + it.text.replace(/[\r\n]+/g, " ").substr(0, 60);
                cgRenderLayout(grp, L, x, y, doc, o);
                sz = { w: L.w, h: L.h };
            } else {
                var r = CG.B.encode(o.type, it.text), oo = {}, k2;
                for (k2 in o) { if (o.hasOwnProperty(k2)) { oo[k2] = o[k2]; } }
                oo.module = o.sizeMode === "module" ? o.sizeVal : o.sizeVal / (r.bits.length + 2 * o.bquiet);
                grp = (master || layer).groupItems.add();
                grp.name = o.type + " - " + it.text.substr(0, 60);
                sz = cgDrawBar(grp, r, oo, x, y, doc);
            }
            made++; col++; rowH = Math.max(rowH, sz.h);
            if (col >= o.cols) { col = 0; x = startX; y -= rowH + o.gap; rowH = 0; } else { x += sz.w + o.gap; }
        } catch (e) {
            if (grp) { try { grp.remove(); } catch (e2) {} }
            errors.push((it.line ? "Ligne " + it.line + " : " : "") + e.message);
        }
    }
    if (master && made === 0) { master.remove(); }
    if (errors.length) {
        var msg = made + " code(s) g\u00e9n\u00e9r\u00e9(s), " + errors.length + " erreur(s) :\n" + errors.slice(0, 15).join("\n");
        if (errors.length > 15) { msg += "\n\u2026 (" + (errors.length - 15) + " autres)"; }
        alert(msg, "G\u00e9n\u00e9rateur de codes", true);
    }
    app.redraw();
}

if (typeof app !== "undefined" && typeof Window !== "undefined") {
    try { cgRun(); } catch (err) { alert("Erreur inattendue : " + err.message + (err.line ? " (ligne " + err.line + ")" : ""), "G\u00e9n\u00e9rateur de codes", true); }
}
