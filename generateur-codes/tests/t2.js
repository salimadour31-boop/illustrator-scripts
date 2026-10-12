const fs=require('fs'),vm=require('vm');const {render,decode}=require('./raster');
const file=process.argv[2]||__dirname+'/../GenerateurCodes.jsx';let src=fs.readFileSync(file,'utf8');
if(src.indexOf('BEGIN ENCODERS')>=0)src=src.slice(src.indexOf('// ===== BEGIN ENCODERS'),src.indexOf('// ===== END ENCODERS'));
const c={};vm.createContext(c);vm.runInContext(src+';this.CG=CG',c);const CG=c.CG;
let sampleBad=0;const sampleCases=[];const S=CG.MODULE_STYLES,E=CG.EYE_STYLES,stats={},cases=[];
function run(tag,txt,ecl,o,keyList){const q=CG.QR.encode(txt,{ecl});const L=CG.Layout.qr(q,Object.assign({m:4,qz:4,scale:1,merge:true,th:CG.THEMES[0],frame:'aucun',label:{text:'',size:11,pos:'bas'},pattern:'aucun',patOpacity:35,card:{on:false,pad:0,radius:0}},o));
 const R=render(L,3,true);const r=decode(R);
 // echantillonnage parfait des centres de modules (hors zone logo)
 let bad=0;for(let y=0;y<q.size;y++)for(let x=0;x<q.size;x++){const px=Math.floor((L.qrBox.x+(4+x+.5)*4)*3),py=Math.floor((L.qrBox.y+(4+y+.5)*4)*3),i=(py*R.W+px)*4;
  const lum=(R.d[i]*299+R.d[i+1]*587+R.d[i+2]*114)/1000;const isDark=lum<128;if(L.logoBox){const cx=(4+x+.5)*4+L.qrBox.x-(L.logoBox.x+L.logoBox.w/2),cy=(4+y+.5)*4+L.qrBox.y-(L.logoBox.y+L.logoBox.h/2);if(Math.abs(cx)<L.logoBox.w/2+6&&Math.abs(cy)<L.logoBox.h/2+6)continue;}
  if((x<8&&y<8)||(x>=q.size-8&&y<8)||(x<8&&y>=q.size-8))continue;if(isDark!==q.modules[y][x])bad++;}
 sampleBad+=bad;if(bad)sampleCases.push(tag+' ('+bad+' modules)');const j=r.jsqr===txt,z=r.zxing===txt;
 for(const k of keyList){stats[k]=stats[k]||{n:0,jsqr:0,zxing:0,any:0};const s=stats[k];s.n++;if(j)s.jsqr++;if(z)s.zxing++;if(j||z)s.any++;}
 cases.push({tag,j,z});}
const urls=['https://exemple.fr/p?id=42','WIFI:T:WPA;S:MaBox;P:motdepasse;;','Bonjour Alger 2026'];
// 1) chaque style de module x chaque style d'oeil (ext=int)
for(const s of S)for(const e of E)for(const u of urls)run(`mod=${s} oeil=${e}`,u,'M',{style:s,eyeOut:e,eyeIn:e,scale:s==='carre'?1:0.9},['module:'+s,'oeil:'+e]);
// 2) ext x int croises
for(const a of E)for(const b of E)for(const u of urls.slice(0,2))run(`ext=${a} int=${b}`,u,'Q',{style:'carre',eyeOut:a,eyeIn:b},['oeilExt:'+a,'oeilInt:'+b]);
// 3) themes x cadres x motifs + logo
const F=CG.FRAMES,P=CG.PATTERNS;
CG.THEMES.forEach((th,i)=>{const fr=F[i%F.length],pt=P[i%P.length];const s=S[i%S.length];
 run(`theme=${th.n} cadre=${fr} motif=${pt} mod=${s}`,urls[i%3],'H',{th,style:s,scale:.9,eyeOut:E[i%8],eyeIn:E[(i+3)%8],frame:fr,pattern:pt,shadow:i%2===0,card:{on:true,pad:14,radius:8},label:{text:i%2?'Mon menu':'',size:11,pos:i%3?'bas':'haut'},logo:i%3===0?{pct:22,shape:i%2?'rond':'carre'}:null},['theme:'+th.n,'cadre:'+fr,'motif:'+pt]);});
// 4) tous les cadres x motifs avec logo H
for(const fr of F)for(const pt of P)run(`cadre=${fr} motif=${pt} logo`,urls[0],'H',{th:CG.THEMES[19],style:'arrondi',scale:.95,eyeOut:'arrondi',eyeIn:'arrondi',frame:fr,pattern:pt,shadow:true,card:{on:true,pad:16,radius:10},label:{text:'Scannez',size:11,pos:'bas'},logo:{pct:25,shape:'rond'}},['cadre:'+fr,'motif:'+pt,'logo']);
// 5) logo zones max par niveau
for(const [ecl,pct] of [['H',30],['H',35],['Q',20]])for(const sh of ['carre','rond'])run(`logo ${ecl} ${pct}% ${sh}`,urls[0],ecl,{style:'carre',eyeOut:'carre',eyeIn:'carre',logo:{pct,shape:sh}},[`logo ${ecl}${pct} ${sh}`]);
const tot=cases.length,any=cases.filter(c=>c.j||c.z).length,jj=cases.filter(c=>c.j).length;
console.log(`TOTAL ${tot} rendus : jsQR ${jj}, ZXing ${cases.filter(c=>c.z).length}, au moins un ${any}`);
for(const k of Object.keys(stats)){const s=stats[k];if(s.any<s.n||s.jsqr<s.n)console.log(k.padEnd(28),`jsQR ${s.jsqr}/${s.n}  ZXing ${s.zxing}/${s.n}  lu ${s.any}/${s.n}`);}
console.log('Echantillonnage des centres : modules faux =',sampleBad,sampleCases.slice(0,10));console.log('Non lus par ZXing :');cases.filter(c=>!c.z).forEach(c=>console.log('   '+c.tag+(c.j?' (lu par jsQR)':'')));console.log('ECHECS:');cases.filter(c=>!c.j&&!c.z).forEach(c=>console.log('  '+c.tag));
