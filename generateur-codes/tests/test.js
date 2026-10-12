const fs=require('fs'),vm=require('vm'),jsQR=require('jsqr');
const B=require('jsbarcode/bin/barcodes').default;
const src=fs.readFileSync(process.argv[2]||__dirname+'/../GenerateurCodes.jsx','utf8');
const enc=src.slice(src.indexOf('// ===== BEGIN ENCODERS'),src.indexOf('// ===== END ENCODERS'));
const ctx={};vm.createContext(ctx);vm.runInContext(enc+';this.CG=CG;',ctx);const CG=ctx.CG;
let pass=0,fail=0;const fails=[];
function ok(c,msg){if(c)pass++;else{fail++;fails.push(msg);}}
function render(q,scale=4,qz=4){const n=q.size+2*qz,W=n*scale,d=new Uint8ClampedArray(W*W*4).fill(255);
 for(let y=0;y<q.size;y++)for(let x=0;x<q.size;x++)if(q.modules[y][x])
  for(let dy=0;dy<scale;dy++)for(let dx=0;dx<scale;dx++){const i=(((y+qz)*scale+dy)*W+(x+qz)*scale+dx)*4;d[i]=d[i+1]=d[i+2]=0;}
 return {d,W};}
function rnd(n,al){let s='';for(let i=0;i<n;i++)s+=al[Math.floor(Math.random()*al.length)];return s;}
// QR
const ZX=require('@zxing/library');const zxFallback=[];
function zx(d,W){try{const lum=new Uint8ClampedArray(W*W);for(let i=0;i<W*W;i++)lum[i]=d[i*4];
 const src=new ZX.RGBLuminanceSource(lum,W,W);const bmp=new ZX.BinaryBitmap(new ZX.HybridBinarizer(src));
 const h=new Map();h.set(ZX.DecodeHintType.CHARACTER_SET,'UTF-8');h.set(ZX.DecodeHintType.PURE_BARCODE,true);return new ZX.QRCodeReader().decode(bmp,h).getText();}catch(e){return null}}
const stats={};let qrN=0;
function qrTest(text,opts){let q;try{q=CG.QR.encode(text,opts);}catch(e){ok(false,'enc '+e.message+' '+text.slice(0,30));return;}
 const {d,W}=render(q);const r=jsQR(d,W,W,{inversionAttempts:'dontInvert'});qrN++;
 const exp=Buffer.from(text,'utf8');
 let good=r&&Buffer.from(r.binaryData).equals(exp)&&r.version===q.version;
 if(!good){const z=zx(d,W);if(z!==null&&Buffer.from(z,'utf8').equals(exp)){good=true;zxFallback.push('v'+q.version+'-'+q.ecl);}}
 ok(good,`QR v${q.version} ${q.ecl} m${q.mask} ${q.mode} len${text.length} ${text.slice(0,25)}`);
 const k=q.mode;stats[k]=(stats[k]||0)+1; return q;}
const fixed=['Bonjour','https://www.exemple.fr/?q=été','0123456789','HELLO WORLD 123 $%*+-./:','Ünïcødé 😀 中文 العربية','',
 CG.Preset.wifi('Ma Box;5G','p@ss:"word"','WPA',false),CG.Preset.vcard('Dupont','Jean','+33 6 12','j@d.fr','ACME, SA','https://a.fr'),
 CG.Preset.email('a@b.fr','Sujet é','Corps'),CG.Preset.tel('+33 6 12 34 56 78'),CG.Preset.sms('0612345678','Salut'),CG.Preset.geo('48,8566','2.3522')];
for(const t of fixed)for(const e of ['L','M','Q','H'])qrTest(t,{ecl:e});
const AL={numeric:'0123456789',alnum:CG.QR.ALNUM,byte:'abcdefghijklmnopqrstuvwxyzéàç€ABC0123 ;:/?&=日本'};
const versions=new Set();
for(let v=1;v<=40;v++)for(const e of ['L','M','Q','H'])for(const m of Object.keys(AL)){
  // fill near capacity of version v
  const cap=CG.QR.dataCodewords(v,e);let n=m==='numeric'?Math.floor(cap*8*0.95/3.34):m==='alnum'?Math.floor(cap*8*0.95/5.5):Math.floor(cap*0.95/1.6);
  n=Math.max(1,n-10);const q=qrTest(rnd(n,AL[m]),{ecl:e,minVersion:v});if(q)versions.add(q.version);}
for(let mk=0;mk<8;mk++)qrTest('Masque '+mk,{ecl:'Q',mask:mk});
// exact capacity boundaries: v40-L byte 2953 ok, 2954 fails
ok(CG.QR.encode('a'.repeat(2953),{ecl:'L'}).version===40,'cap 2953');
let thr=false;try{CG.QR.encode('a'.repeat(2954),{ecl:'L'})}catch(e){thr=true}ok(thr,'cap 2954 doit echouer');
ok(CG.QR.encode('1'.repeat(7089),{ecl:'L'}).version===40,'num 7089');
ok(CG.QR.encode('A'.repeat(4296),{ecl:'L'}).version===40,'alnum 4296');
// compare matrix with npm qrcode for same version/ecl/mask (mode forced same)
const QRC=require('qrcode');let cmpN=0;
for(const [t,e,v] of [['HELLO WORLD','Q',1],['0123456789012345','M',2],['hello é',"H",5],['x'.repeat(300),'L',12],['ABC'.repeat(200),'M',25],['9'.repeat(3000),'H',40]]){
 const q=CG.QR.encode(t,{ecl:e,minVersion:v,mask:3});
 const r=QRC.create([{data:t,mode:q.mode==='alnum'?'alphanumeric':q.mode}],{errorCorrectionLevel:e,version:q.version,maskPattern:3});
 let same=r.modules.size===q.size;for(let y=0;same&&y<q.size;y++)for(let x=0;x<q.size;x++)if(!!r.modules.get(y,x)!==q.modules[y][x]){same=false;break;}
 ok(same,'matrice identique a npm qrcode '+t.slice(0,10)+' v'+q.version);cmpN++;}
// 1D
function jb(k,s,o){const r=new B[k](s,Object.assign({flat:true},o||{})).encode();return Array.isArray(r)?r.map(x=>x.data).join(''):r.data;}
const eanList=[];for(let i=0;i<200;i++)eanList.push(rnd(12,'0123456789'));
let n1=0;
for(const s of eanList){const r=CG.B.ean13(s);ok(r.bits===jb('EAN13',s),'EAN13 '+s);ok(r.text===s+CG.B.gs1Check(s),'');n1++;
 const s7=s.slice(0,7);ok(CG.B.ean8(s7).bits===jb('EAN8',s7),'EAN8 '+s7);
 const s11=s.slice(0,11);ok(CG.B.upca(s11).bits===jb('UPC',s11),'UPC '+s11);
 const s13=s.slice(0,13-0).slice(0,13);const i13=s.slice(0,12)+'1';ok(CG.B.itf14(i13,3).bits.replace(/111/g,'W').replace(/000/g,'w')===jb('ITF14',i13).replace(/111/g,'W').replace(/000/g,'w')||CG.B.itf14(i13,2).bits===jb('ITF14',i13),'ITF14 '+i13);}
// known references
ok(CG.B.ean13('590123412345').text==='5901234123457','EAN ref 5901234123457');
ok(CG.B.ean13('400638133393').text==='4006381333931','EAN ref 4006381333931');
ok(CG.B.upca('03600029145').text==='036000291452','UPC ref 036000291452');
ok(CG.B.ean8('9638507').text==='96385074','EAN8 ref 96385074');
ok(CG.B.itf14('1540014128876').text==='15400141288763','ITF ref 15400141288763');
let t=false;try{CG.B.ean13('5901234123458')}catch(e){t=/cle attendue est 7/.test(e.message)}ok(t,'EAN check invalid detect');
// Code 128: decode independently with jsbarcode's table
const C=require('jsbarcode/bin/barcodes/CODE128/constants');
const jbBars=C.BARS||require('jsbarcode/bin/barcodes/CODE128/CODE128').default.prototype&&null;
function dec128(bits){// convert to widths
 const w=[];let i=0;while(i<bits.length){let j=i;while(j<bits.length&&bits[j]===bits[i])j++;w.push(j-i);i=j;}
 const vals=[];let p=0;while(p<w.length){const len=(w.length-p===7)?7:6;vals.push(w.slice(p,p+len).join(''));p+=len;}
 return vals;}
const tableOK=CG.B.C128.every((x,i)=>CG.B.widthsToBits(x)===String(C.BARS[i]));
ok(tableOK,'table Code128 identique a jsbarcode');
function decodeVals(vals){let set=vals[0]===103?'A':vals[0]===104?'B':'C',out='',shift=false;
 let sum=vals[0];for(let i=1;i<vals.length-2;i++)sum+=i*vals[i];if(sum%103!==vals[vals.length-2])return null;
 for(let i=1;i<vals.length-2;i++){const v=vals[i];const cs=shift?(set==='A'?'B':'A'):set;shift=false;
  if(cs==='C'){if(v<100)out+=String(v).padStart(2,'0');else if(v===100)set='B';else if(v===101)set='A';continue;}
  if(v===99){set='C';continue}if(v===98){shift=true;continue}if(v===100&&cs==='A'){set='B';continue}if(v===101&&cs==='B'){set='A';continue}
  out+=String.fromCharCode(cs==='A'?(v<64?v+32:v-64):v+32);}return out;}
const c128=['HELLO','hello world','1234567890','12345','Ab12345678cD','\tTAB\nNL','abc\x01def','ABC\x01d','00123456789012345678','X1','ÉCHEC?'];
for(let i=0;i<300;i++)c128.push(rnd(1+Math.floor(Math.random()*25),' !"#AZaz09123456789\x01\x1f~{}'));
let n128=0,jbSame=0;
for(const s of c128){let r;try{r=CG.B.code128(s)}catch(e){ok(/[^\x00-\x7f]/.test(s),'128 throw '+s);continue}
 // decode bits -> widths -> values via table lookup
 const ws=dec128(r.bits);const vals=ws.map(w=>CG.B.C128.indexOf(w));
 ok(decodeVals(vals)===s&&vals[vals.length-1]===106,'C128 '+JSON.stringify(s));n128++;
 try{if(jb('CODE128',s)===r.bits)jbSame++;}catch(e){}
 // bwip-js check: lengths by optimal? skip
}
// Code 39 vs jsbarcode
const c39=['CODE39','HELLO WORLD','ABC-123.$/+%','0123456789','A'];for(let i=0;i<100;i++)c39.push(rnd(1+Math.floor(Math.random()*15),'0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ-. $/+%'));
let n39=0;for(const s of c39){const a=CG.B.code39(s,3).bits,b=jb('CODE39',s).replace(/0$/,'');ok(a===b,'C39 '+s+'\n'+a+'\n'+b);n39++;}
console.log('Fallback zxing (bug jsQR):',[...new Set(zxFallback)].join(','),zxFallback.length);console.log(JSON.stringify({pass,fail,qrDecoded:qrN,qrModes:stats,versionsCovered:versions.size,qrMatrixVsNpmQrcode:cmpN,ean_upc_itf_inputs:n1,code128:n128,code128_bitIdenticalToJsBarcode:jbSame,code39:n39},null,1));
if(fails.length)console.log(fails.slice(0,15).join('\n'));
