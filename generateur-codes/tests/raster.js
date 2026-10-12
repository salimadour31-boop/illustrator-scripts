// Rasteriseur des operations de mise en page (regle non nulle, Bezier aplaties) + decodage
const jsQR=require('jsqr');const ZX=require('@zxing/library');
function hex(h){h=h.replace('#','');return [parseInt(h.substr(0,2),16),parseInt(h.substr(2,2),16),parseInt(h.substr(4,2),16)];}
function flatten(c,s){const out=[],p=c.pts,n=p.length;for(let i=0;i<n;i++){const a=p[i],b=p[(i+1)%n];
 const P0=[a[0],a[1]],P1=[a[4],a[5]],P2=[b[2],b[3]],P3=[b[0],b[1]];const straight=P1[0]===P0[0]&&P1[1]===P0[1]&&P2[0]===P3[0]&&P2[1]===P3[1];
 const N=straight?1:10;for(let k=0;k<N;k++){const t=k/N,u=1-t;out.push([(u*u*u*P0[0]+3*u*u*t*P1[0]+3*u*t*t*P2[0]+t*t*t*P3[0])*s,(u*u*u*P0[1]+3*u*u*t*P1[1]+3*u*t*t*P2[1]+t*t*t*P3[1])*s]);}}return out;}
function fillOp(img,W,H,polys,colorAt,alpha){const edges=[];for(const pl of polys)for(let i=0;i<pl.length;i++){const a=pl[i],b=pl[(i+1)%pl.length];if(a[1]!==b[1])edges.push(a[1]<b[1]?[a[0],a[1],b[0],b[1],1]:[b[0],b[1],a[0],a[1],-1]);}
 for(let y=0;y<H;y++){const yc=y+.5,xs=[];for(const e of edges)if(yc>=e[1]&&yc<e[3])xs.push([e[0]+(yc-e[1])*(e[2]-e[0])/(e[3]-e[1]),e[4]]);
  if(!xs.length)continue;xs.sort((p,q)=>p[0]-q[0]);let w=0;for(let i=0;i<xs.length-1;i++){w+=xs[i][1];if(w!==0){const x1=Math.max(0,Math.ceil(xs[i][0]-.5)),x2=Math.min(W-1,Math.floor(xs[i+1][0]-.5));
   for(let x=x1;x<=x2;x++){const c=colorAt(x+.5,yc),j=(y*W+x)*4;for(let k=0;k<3;k++)img[j+k]=img[j+k]*(1-alpha)+c[k]*alpha;}}}}}
function gradColor(g,bbox,s){const st=g.stops.map(hex);return (x,y)=>{let t;const bx=bbox[0]*s,by=bbox[1]*s,bw=bbox[2]*s,bh=bbox[3]*s;
 if(g.type==='radial'){const dx=x-(bx+bw/2),dy=y-(by+bh/2);t=Math.min(1,Math.sqrt(dx*dx+dy*dy)/(bw/2*Math.SQRT2));}
 else{const a=g.angle*Math.PI/180,ca=Math.cos(a),sa=-Math.sin(a);const proj=(x-bx-bw/2)*ca+(y-by-bh/2)*sa,L=(Math.abs(bw*ca)+Math.abs(bh*sa))/2;t=(proj/L+1)/2;}
 t=Math.max(0,Math.min(1,t))*(st.length-1);const i=Math.min(st.length-2,Math.floor(t)),f=t-i;return [0,1,2].map(k=>st[i][k]+(st[i+1][k]-st[i][k])*f);};}
function render(L,s,logoMode){const W=Math.ceil(L.w*s)+8,H=Math.ceil(L.h*s)+8;const img=new Float32Array(W*H*4).fill(255);
 for(const op of L.ops){const polys=op.contours.map(c=>flatten(c,s));const col=typeof op.fill==='string'?(()=>{const c=hex(op.fill);return()=>c;})():gradColor(op.fill.grad,op.fill.bbox,s);
  fillOp(img,W,H,polys,col,(op.opacity===undefined?100:op.opacity)/100);}
 if(L.logoBox&&logoMode){const b=L.logoBox,c=b.shape==='rond'?{pts:ellipse(b.x+b.w/2,b.y+b.h/2,b.w/2)}:{pts:[[b.x,b.y],[b.x+b.w,b.y],[b.x+b.w,b.y+b.h],[b.x,b.y+b.h]].map(p=>[p[0],p[1],p[0],p[1],p[0],p[1]])};
  fillOp(img,W,H,[flatten(c,s)],()=>[70,70,70],1);}
 const out=new Uint8ClampedArray(W*H*4);for(let i=0;i<W*H*4;i++)out[i]=i%4===3?255:img[i];return {d:out,W,H};}
function ellipse(cx,cy,r){const K=.5523*r;return [[cx,cy-r,cx-K,cy-r,cx+K,cy-r],[cx+r,cy,cx+r,cy-K,cx+r,cy+K],[cx,cy+r,cx+K,cy+r,cx-K,cy+r],[cx-r,cy,cx-r,cy+K,cx-r,cy-K]];}
function decode({d,W,H}){const r=jsQR(d,W,H,{inversionAttempts:'dontInvert'});const res={jsqr:r?r.data:null,zxing:null};
 try{const lum=new Uint8ClampedArray(W*H);for(let i=0;i<W*H;i++)lum[i]=(d[i*4]*299+d[i*4+1]*587+d[i*4+2]*114)/1000;
  const h=new Map();h.set(ZX.DecodeHintType.TRY_HARDER,true);
  res.zxing=new ZX.QRCodeReader().decode(new ZX.BinaryBitmap(new ZX.HybridBinarizer(new ZX.RGBLuminanceSource(lum,W,H))),h).getText();}catch(e){}
 return res;}
module.exports={render,decode};
