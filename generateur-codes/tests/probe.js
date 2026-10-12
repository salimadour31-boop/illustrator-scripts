const fs=require('fs'),vm=require('vm');const {render,decode}=require('./raster');
let src=fs.readFileSync(__dirname+'/../GenerateurCodes.jsx','utf8');src=src.slice(src.indexOf('// ===== BEGIN ENCODERS'),src.indexOf('// ===== END ENCODERS'));
const c={};vm.createContext(c);vm.runInContext(src+';this.CG=CG',c);const CG=c.CG;
const urls=['https://exemple.fr/p?id=42','WIFI:T:WPA;S:MaBox;P:motdepasse;;','Bonjour Alger 2026','tel:+213555123456'];
console.log('style'.padEnd(14),'| taille 100% | 90% | 75% | 60%');
for(const s of CG.MODULE_STYLES){const row=[];for(const sc of [1,.9,.75,.6]){let ok=0,okz=0;for(const u of urls){const q=CG.QR.encode(u,{ecl:'M'});
 const L=CG.Layout.qr(q,{m:4,qz:4,style:s,scale:sc,eyeOut:'carre',eyeIn:'carre',th:CG.THEMES[0],merge:true});const r=decode(render(L,3,false));if(r.jsqr===u)ok++;if(r.zxing===u)okz++;}row.push('jsQR '+ok+'/4 ZXing '+okz+'/4');}
 console.log(s.padEnd(14),'|',row.join('   '));}
