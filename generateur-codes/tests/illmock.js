// Faux DOM Illustrator + ScriptUI : exécute le script complet (dialogue + rendu), puis rastérise et décode
const fs=require('fs'),vm=require('vm');const {decode}=require('./raster');
const SRC=fs.readFileSync(process.argv[2]||__dirname+'/../GenerateurCodes.jsx','utf8').replace(/^#target.*$/m,'');
function makeEnv(scenario){
 const allPaths=[],texts=[],placed=[];let compoundStack=null;
 function container(name,parentOpacity){const c={name,_kids:[],opacity:100,
  pathItems:{add:()=>{const p={pts:[],closed:false,opacity:100,_parent:c,pathPoints:{add:()=>{const pp={};p.pts.push(pp);return pp;}},setEntirePath(a){a.forEach(xy=>p.pts.push({anchor:xy,leftDirection:xy,rightDirection:xy}));},
    rotate(){},remove(){}};allPaths.push(p);return p;},
   rectangle:(t,l,w,h)=>{const p=c.pathItems.add();p.setEntirePath([[l,t],[l+w,t],[l+w,t-h],[l,t-h]]);p.closed=true;return p;}},
  compoundPathItems:{add:()=>{const k=container('compound');k._isC=true;k._parent=c;k.rotate=()=>{};c._kids.push(k);return k;}},
  groupItems:{add:()=>{const g=container('group');g._parent=c;c._kids.push(g);return g;},createFromFile:(f)=>{const g=container('logo');g.width=100;g.height=50;g.resize=function(a){this.width*=a/100;this.height*=a/100;};placed.push(g);return g;}},
  placedItems:{add:()=>{const g={width:200,height:100,resize(a){this.width*=a/100;this.height*=a/100;}};placed.push(g);return g;}},
  textFrames:{pointText:(p)=>{const t={p,textRange:{characterAttributes:{},paragraphAttributes:{}}};texts.push(t);return t;}},
  remove(){c._removed=true;}};return c;}
 const layer=container('layer');layer.locked=false;layer.visible=true;
 const doc={documentColorSpace:'RGB',selection:[],activeLayer:layer,layers:{add:()=>layer},artboards:Object.assign([{artboardRect:[0,0,2000,-2000]}],{getActiveArtboardIndex:()=>0}),
  gradients:{add:()=>{const st=[{},{}];st.add=()=>{const s={};st.push(s);return s;};return {gradientStops:st};}}};
 const docs=[];docs.add=()=>{docs.push(doc);return doc;};if(scenario.hasDoc)docs.push(doc);
 const alerts=[];
 // --- ScriptUI mock ---
 let okBtn=null;const ctrls=[];
 function ctl(type,text,props){const c={type,text:typeof text==='string'?text:'',children:[],visible:true,enabled:true,preferredSize:{width:0,height:0},graphics:{BrushType:{SOLID_COLOR:1},newBrush:()=>({}),newPath(){},rectPath(){},fillPath(){}},
  hide(){},show(){},value:false,
  add(t,b,tx,pr){const k=ctl(t,tx,pr);if(t==='dropdownlist'){k.items=[];(Array.isArray(tx)?tx:[]).forEach(s=>k.add('item',s));Object.defineProperty(k,'selection',{get(){return k._sel==null?null:k.items[k._sel]},set(v){k._sel=v==null?null:(typeof v==='number'?v:v.index)}});}
   if(this.type==='dropdownlist'&&t==='item'){const it={text:tx,index:this.items.length};this.items.push(it);return it;}
   this.children.push(k);ctrls.push(k);if(t==='button'&&tx==='G\u00e9n\u00e9rer')okBtn=k;return k;},
  removeAll(){this.items=[];this._sel=null;},close(v){win._closed=v;}};return c;}
 let win;
 function Window(){win=ctl('dialog','');win.show=function(){scenario.fill(find);if(okBtn.onClick)okBtn.onClick();return win._closed||2;};return win;}
 function find(type,text){return ctrls.filter(c=>c.type===type&&(text===undefined||(c.text||'').indexOf(text)===0));}
 const ctx={app:{documents:docs,get activeDocument(){return doc},textFonts:{getByName:(n)=>({name:n})},redraw(){}},Window,
  alert:(m)=>alerts.push(String(m)),confirm:(m)=>{alerts.push('CONFIRM: '+m);return true;},prompt:()=>null,
  RGBColor:function(){},CMYKColor:function(){},GradientColor:function(){},DocumentColorSpace:{RGB:'RGB',CMYK:'CMYK'},GradientType:{LINEAR:1,RADIAL:2},
  Transformation:{CENTER:1},ElementPlacement:{PLACEATEND:1},Justification:{CENTER:1},PolarityValues:{NEGATIVE:1},
  File:function(p){this.fsName=p;this.name=p;this.exists=!/themes/.test(p);},Folder:Object.assign(function(p){this.fsName=p;this.exists=true;},{userData:'/tmp/ud'}),console};
 ctx.File.openDialog=()=>null;ctx.File.saveDialog=()=>null;
 return {ctx,allPaths,texts,placed,alerts,layer};}
function rasterPaths(env,s){ // Illustrator coords -> raster
 const ps=env.allPaths.filter(p=>p.pts.length&&p.filled);let minX=1e9,maxX=-1e9,minY=1e9,maxY=-1e9;
 ps.forEach(p=>p.pts.forEach(q=>{minX=Math.min(minX,q.anchor[0]);maxX=Math.max(maxX,q.anchor[0]);minY=Math.min(minY,q.anchor[1]);maxY=Math.max(maxY,q.anchor[1]);}));
 // group paths by parent compound
 const groups=new Map();ps.forEach(p=>{const k=p._parent._isC?p._parent:p;if(!groups.has(k))groups.set(k,[]);groups.get(k).push(p);});
 const ops=[];for(const [k,arr] of groups){const f=arr[0].fillColor;let col;if(f.gradient){const st=f.gradient.gradientStops[0].color;col=st;}else col=f;
  const hx='#'+[col.red,col.green,col.blue].map(v=>v.toString(16).padStart(2,'0')).join('');
  ops.push({fill:hx,opacity:k.opacity,contours:arr.map(p=>({pts:p.pts.map(q=>[q.anchor[0]-minX,maxY-q.anchor[1],q.leftDirection[0]-minX,maxY-q.leftDirection[1],q.rightDirection[0]-minX,maxY-q.rightDirection[1]])}))});}
 return require('./raster').render({w:maxX-minX,h:maxY-minY,ops,logoBox:null},s,false);}
function runScenario(sc){const env=makeEnv(sc);vm.createContext(env.ctx);vm.runInContext(SRC,env.ctx);return env;}
module.exports={runScenario,rasterPaths};
if(require.main===module){
 const set=(find,type,label,val)=>{const c=find(type,label)[0];if(!c)throw new Error('ctrl '+label);if(type==='dropdownlist')c.selection=val;else if(type==='edittext')c.text=val;else c.value=val;if(c.onChange)c.onChange();if(c.onClick)c.onClick();};
 // locate edittexts by preceding label: use group children
 function etAfter(find,label){const st=find('statictext',label)[0];return null;}
 const results=[];
 const sc=(name,fill,expect)=>{const env=runScenario({hasDoc:true,fill});const nGroups=env.layer._kids.length;let dec='-';
  if(expect){const R=rasterPaths(env,2.5);const r=decode(R);dec=(r.jsqr===expect||r.zxing===expect)?'DECODE OK':'ECHEC ('+r.jsqr+'/'+r.zxing+')';}
  results.push([name,'tracés='+env.allPaths.length,'textes='+env.texts.length,'logos='+env.placed.length,dec,env.alerts.map(a=>a.slice(0,140).replace(/\n/g,' | ')).join(' || ')]);return env;};
 const T=(find,i)=>find('tabbedpanel')[0];
 // helpers to grab controls by order
 const byLabel=(find,lbl)=>{const g=find('group').find(g=>g.children[0]&&g.children[0].type==='statictext'&&g.children[0].text===lbl);return g?g.children[1]:null;};
 function setDD(find,lbl,idx){const g=find('group').find(g=>g.children[0]&&g.children[0].text===lbl&&g.children[1]&&g.children[1].type==='dropdownlist');const d=g.children[1];d.selection=idx;if(d.onChange)d.onChange();}
 function setET(find,lbl,v){const e=byLabel(find,lbl);e.text=v;if(e.onChange)e.onChange();}
 function content(find,v){find('edittext').find(e=>e.preferredSize.height===54).text=v;}
 sc('QR simple Classique',f=>content(f,'https://exemple.fr'),'https://exemple.fr');
 sc('QR thème Océan + coeurs + feuille + bulle + zellige + ombre',f=>{content(f,'https://ocean.example/menu');byLabel(f,'Th\u00e8me :').selection=2;byLabel(f,'Th\u00e8me :').onChange();
  setDD(f,'Style des modules :',5);setET(f,'Taille des modules (%) :','90');setDD(f,'\u0152il ext\u00e9rieur (cadre 7\u00d77) :',3);setDD(f,'\u0152il int\u00e9rieur (centre 3\u00d73) :',4);
  setDD(f,'Cadre :',3);setDD(f,'Motif de fond :',3);f('checkbox','Ombre')[0].value=true;f('checkbox','Carte de fond')[0].value=true;},'https://ocean.example/menu');
 sc('QR logo fichier + auto H + Néon radial + liquide',f=>{content(f,'Logo test 123');byLabel(f,'Th\u00e8me :').selection=4;byLabel(f,'Th\u00e8me :').onChange();setDD(f,'Style des modules :',9);
  f('radiobutton','Fichier')[0].value=true;f('radiobutton','Aucun logo')[0].value=false;f('edittext').find(e=>e.characters===44&&e.preferredSize.height!==54&&e.text==='' ).text='/tmp/logo.png';},'Logo test 123');
 sc('Contraste faible -> avertissement',f=>{content(f,'x');byLabel(f,'Modules :').text='#DDDDDD';},null);
 sc('Inversé -> avertissement',f=>{content(f,'x');byLabel(f,'Modules :').text='#FFFFFF';byLabel(f,'Fond :').text='#000000';},null);
 sc('EAN-13 clé fausse -> erreur',f=>{setDD(f,'Type de code :',1);content(f,'5901234123458');},null);
 sc('EAN-13 OK',f=>{setDD(f,'Type de code :',1);content(f,'590123412345');},null);
 sc('Lot 5 QR thème Zellige + étiquette {texte} + cadre polaroid (1 ligne invalide en EAN)',f=>{byLabel(f,'Th\u00e8me :').selection=19;byLabel(f,'Th\u00e8me :').onChange();setDD(f,'Cadre :',6);
  byLabel(f,"Texte d'\u00e9tiquette :").text='{texte}';const cb=f('checkbox','Mode lot')[0];cb.value=true;cb.onClick();f('edittext').find(e=>e.preferredSize[0]===600).text='A1\nB2\nC3\nD4\nE5';},null);
 sc('Lot EAN avec ligne invalide',f=>{setDD(f,'Type de code :',1);const cb=f('checkbox','Mode lot')[0];cb.value=true;cb.onClick();f('edittext').find(e=>e.preferredSize[0]===600).text='590123412345\n12AB\n400638133393';},null);
 sc('Logo en M sans auto-H -> erreur',f=>{content(f,'x');f('radiobutton','Zone vide')[0].value=true;f('radiobutton','Aucun logo')[0].value=false;f('checkbox','Passer automatiquement')[0].value=false;},null);
 sc('Motif sans carte -> erreur',f=>{content(f,'x');setDD(f,'Motif de fond :',2);},null);
 for(const r of results)console.log(r.join(' ; '));
}
