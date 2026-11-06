'use strict';
/* ===== COOLIDGE TUBE – INTERACTIVE X-RAY LAB (không backend, không theo dõi người dùng) ===== */
const $=s=>document.querySelector(s),clamp=(v,a,b)=>Math.min(b,Math.max(a,v)),sm=t=>{t=clamp(t,0,1);return t*t*(3-2*t)};
const f=(x,d=1)=>x.toFixed(d).replace('.',',');

/* ---------- Mô hình vật lý (định tính, có cơ sở) ----------
   μ/ρ ≈ a·E^-p + c  (quang điện ∝ Z^~3/E^3 cộng phần tán xạ gần phẳng), hệ số khớp thô với bảng hấp thụ NIST.
   Bỏ qua các bờ hấp thụ (trừ bờ K của chì ở 88 keV). Chỉ để minh họa giáo dục. */
const MAT={
 Al:{n:'NHÔM',a:26300,c:.15,p:3,rho:2.7,t:2,max:10,on:true,col:'#b8c4cc',hex:0xb8c4cc,y:4.2},
 Cu:{n:'ĐỒNG',a:269000,c:.12,p:3,rho:8.96,t:.3,max:2,on:false,col:'#c77d3f',hex:0xc77d3f,y:4.8},
 Pb:{n:'CHÌ',a:412000,c:.1,p:2.8,rho:11.34,t:.5,max:2,on:false,col:'#59606e',hex:0x59606e,y:5.4,edge:88}};
const INH={a:26300,c:.15,p:3,rho:2.7,t:1};            // lọc cố định của ống ≈ 1 mm Al
const BODY=[{n:'Mô mềm',a:5830,c:.16,p:3,rho:1},{n:'Xương',a:31000,c:.17,p:3,rho:1.85},MAT.Al,MAT.Cu,MAT.Pb];
const mu=(m,E)=>m.rho*(m.a*Math.pow(E,-m.p)+m.c)*((m.edge&&E>m.edge)?2.5:1);   // cm^-1
const tr=(m,E,t=m.t)=>Math.exp(-mu(m,E)*t/10);                                // t tính bằng mm
const KE=69.5,LINES=[[57.98,.58],[59.3,1],[67.2,.22]];                       // bờ K và các vạch Kα2, Kα1, Kβ của W (keV)

const S={kV:80,mA:10,speed:1,stage:0,run:false,auto:false,pres:false,timer:0,tab:'tube',mode:'both',d:5,sel:null};
const V={lab:true,exp:false,cut:true,traj:true,fld:true};

function spec(filt){
 const E=[],tot=[],con=[];
 for(let i=0;i<300;i++){
  const e=.5*(i+1);let c=e<S.kV?S.mA*(S.kV-e)*tr(INH,e):0,t=c;      // Kramers: I(E) ∝ I·Z·(Emax − E)
  if(S.kV>KE){const k=100*S.mA*Math.pow(S.kV/KE-1,1.6);LINES.forEach(([e0,r])=>{t+=k*r*tr(INH,e0)*Math.exp(-((e-e0)**2)/.5)})}
  if(filt){const k=Object.values(MAT).reduce((a,m)=>a*(m.on?tr(m,e):1),1);c*=k;t*=k}
  E.push(e);con.push(c);tot.push(t)}
 return{E,tot,con}}
let cdf=null;
function sampleE(){if(!cdf){let a=0;cdf=spec(false).tot.map(v=>a+=v)}const r=Math.random()*cdf[cdf.length-1];return .5*(cdf.findIndex(v=>v>=r)+1)}

/* ---------- Nội dung ---------- */
const ST=[
['Nung nóng dây tóc','Dòng điện nung chạy qua dây tóc tungsten, tỏa nhiệt Joule làm dây tóc nóng sáng tới khoảng 2200 °C.','P = I²·R'],
['Phát xạ nhiệt','Ở nhiệt độ cao, một số electron trong tungsten có đủ năng lượng để thoát khỏi bề mặt (hiện tượng phát xạ nhiệt), tạo đám mây electron quanh catốt. Lúc này chưa có gia tốc đáng kể.','J = A·T²·e^(−W/kT)  (Richardson)'],
['Gia tốc electron','Điện áp cao giữa catốt (−) và anốt (+) tạo điện trường hướng từ anốt về catốt. Electron mang điện âm chịu lực ngược chiều điện trường nên bị gia tốc từ catốt sang anốt.','eU = ½·m·v²'],
['Va chạm vào bia','Chén hội tụ thu hẹp chùm electron vào tiêu điểm trên bia tungsten. Tại đây electron mất dần động năng.','Động năng K = eU'],
['Tạo tia X','Khoảng 1% động năng biến thành photon tia X (bức xạ hãm và bức xạ đặc trưng); hơn 99% chuyển thành nhiệt làm nóng bia. (Hình vẽ phóng đại tỉ lệ photon để dễ quan sát.)','E_max = eU ;  λ_min = 12,4 / U(kV)  [Å]'],
['Phát tia X','Photon tia X (sóng điện từ, không mang điện) đi ra khỏi ống qua cửa sổ. Photon không bị điện trường hay từ trường làm lệch; màu photon trên hình chỉ biểu thị năng lượng (cam: thấp, tím: cao).','E = h·f = h·c/λ'],
['Lọc tia X','Tấm lọc hấp thụ ưu tiên photon năng lượng thấp (tia X mềm) nên chùm tia sau lọc có năng lượng trung bình cao hơn ("cứng" hơn) nhưng cường độ giảm.','I = I₀·e^(−μ·x)']];
const INFO={
glass:['Bầu thủy tinh chân không','Giữ chân không và cách điện.','Chân không giúp electron không va chạm với phân tử khí trên đường tới anốt, đồng thời bảo vệ dây tóc và bia khỏi bị oxy hóa ở nhiệt độ cao.'],
filament:['Dây tóc tungsten','Nguồn phát electron nhờ phát xạ nhiệt.','Tungsten nóng chảy ở 3422 °C nên chịu được nhiệt độ ~2200 °C. Số electron phát ra tăng rất nhanh theo nhiệt độ dây tóc, quyết định dòng ống I.'],
cup:['Chén hội tụ và trụ catốt (cực âm)','Hội tụ electron thành chùm hẹp.','Chén kim loại ở điện thế âm tạo điện trường đẩy electron về phía trục ống, thu chùm electron vào một tiêu điểm nhỏ trên bia.'],
target:['Bia tungsten','Nơi electron va chạm và sinh tia X.','Tungsten có Z = 74 nên hiệu suất bức xạ hãm cao và chịu nhiệt tốt. Bia nghiêng để chùm tia X thoát ra gần vuông góc với trục ống. Hơn 99% năng lượng chùm electron thành nhiệt.'],
anode:['Khối đỡ anốt (đồng)','Đỡ bia và dẫn nhiệt khỏi bia.','Đồng dẫn nhiệt rất tốt, truyền nhiệt từ bia ra hệ tản nhiệt.'],
sink:['Hệ tản nhiệt (minh họa)','Tản nhiệt ra môi trường.','Các cánh tản nhiệt làm tăng diện tích trao đổi nhiệt. Trong thực tế còn có dầu làm mát hoặc anốt quay.'],
window:['Cửa sổ phát tia X','Cho tia X thoát ra ngoài ống.','Làm bằng vật liệu hấp thụ ít tia X nên chùm tia đi ra ít bị suy giảm.'],
hv:['Nguồn điện áp cao','Tạo hiệu điện thế U giữa anốt (+) và catốt (−).','U (30–150 kV trên mô phỏng này) quyết định động năng cực đại của electron, tức năng lượng photon cực đại E_max = eU.'],
heater:['Nguồn nung dây tóc','Cấp dòng điện nung cho dây tóc.','Mạch riêng, điện áp thấp. Thay đổi dòng nung làm thay đổi số electron phát ra, tức dòng ống I, chứ không đổi điện áp ống U.']};
const LB=[['glass','Bầu thủy tinh chân không',[-1.2,2.15,0]],['filament','Dây tóc tungsten',[-3,.35,.5]],['cup','Chén hội tụ (catốt)',[-3.5,-.9,0]],['target','Bia tungsten',[1,-.45,.5]],['anode','Khối đỡ anốt',[3.5,.95,0]],['sink','Tản nhiệt',[6.1,1.4,0]],['window','Cửa sổ tia X',[1,2.4,0]],['hv','Nguồn cao áp',[.5,-3.75,0]],['heater','Nguồn nung dây tóc',[-6.2,-3.1,0]]];
const TABS=[['tube','Cấu tạo ống Coolidge 3D'],['mech','Cơ chế tạo tia X'],['spec','Phổ tia X'],['filt','Lọc và chắn tia X'],['prop','Tính chất tia X']];

/* ---------- Trạng thái mô phỏng ---------- */
let R,scene,cam,hl,GL=false,parts={},eS=[],ph=[],eP,pP,pC,eGeo,pGeo,fil,tgm,heat=0,tHeat=0,spAcc=0,exK=0,fieldG,trajG,cone,plM={},labEls=[],wires=[],wireDefs=[];
const o0={th:.45,ph:1.25,r:16.5,tx:.6,ty:.2,tz:0},o={...o0};

function setStage(i){
 S.stage=clamp(i,0,6);S.timer=0;
 [...$('#tl').children].forEach((b,j)=>{b.classList.toggle('on',j===S.stage);b.classList.toggle('done',j<S.stage)});
 if(S.stage<1){eS.forEach(e=>e.on=false);ph.forEach(p=>p.on=false);tHeat=0;if(S.stage===0&&!S.run)heat=0}
 if(S.tab==='tube')side()}
const goStage=i=>{setStage(i);S.run=true;S.auto=false};

/* ---------- Dựng 3D ---------- */
function buildGL(){
 if(typeof THREE==='undefined'){fail('Không tải được thư viện Three.js. Hãy kết nối mạng, hoặc tải three.min.js (r128) đặt vào thư mục lib/ cạnh index.html. Các tab 2D vẫn hoạt động.');return}
 try{
 R=new THREE.WebGLRenderer({canvas:$('#gl'),antialias:true,alpha:true});R.localClippingEnabled=true;R.setPixelRatio(Math.min(devicePixelRatio||1,2));
 scene=new THREE.Scene();cam=new THREE.PerspectiveCamera(45,1,.1,100);
 scene.add(new THREE.AmbientLight(0xffffff,.7));const dl=new THREE.DirectionalLight(0xffffff,.9);dl.position.set(4,8,7);scene.add(dl);
 hl=new THREE.PointLight(0xff8a30,0,9);hl.position.set(-3,0,0);scene.add(hl);
 const M=(c,x)=>new THREE.MeshStandardMaterial(Object.assign({color:c,metalness:.6,roughness:.4},x)),DS=THREE.DoubleSide;
 const part=id=>{const g=new THREE.Group();g.userData.id=id;scene.add(g);parts[id]=g;return g};
 const add=(g,geo,mat,p,r)=>{const m=new THREE.Mesh(geo,mat);if(p)m.position.set(...p);if(r)m.rotation.set(...r);m.userData.part=g;g.add(m);return m};
 const X=[0,0,Math.PI/2],Cy=(r,l,open)=>new THREE.CylinderGeometry(r,r,l,40,1,!!open);
 const clip=new THREE.Plane(new THREE.Vector3(0,0,-1),0);
 const gm=M(0x9fd8ff,{transparent:true,opacity:.2,metalness:0,roughness:.05,side:DS,depthWrite:false,clippingPlanes:[clip]});
 add(part('glass'),Cy(2.1,10),gm,[0,0,0],X);GL=true;parts.glass.userData.gm=gm;parts.glass.userData.clip=clip;
 const cup=part('cup'),cm=M(0x7a8696,{side:DS});
 add(cup,Cy(.75,1,true),cm,[-3.1,0,0],X);add(cup,Cy(.75,.08),cm,[-3.6,0,0],X);add(cup,Cy(.22,2.8),cm,[-4.8,0,0],X);
 class Helix extends THREE.Curve{getPoint(t,v=new THREE.Vector3()){const a=t*Math.PI*16;return v.set(-3+.12*Math.cos(a),.12*Math.sin(a),(t-.5))}}
 fil=add(part('filament'),new THREE.TubeGeometry(new Helix(),160,.025,6),M(0x888888,{emissive:0x000000}));
 tgm=add(part('target'),new THREE.BoxGeometry(1.5,.16,1.5),M(0xaab6cc,{emissive:0x000000}),[1,0,0],[0,0,Math.PI/4]);
 add(part('anode'),Cy(.8,6.1),M(0xc77d3f),[3.95,0,0],X);
 const sk=part('sink');for(let k=0;k<5;k++)add(sk,Cy(1.5,.08),M(0xd99a5c),[5.7+k*.3,0,0],X);
 const wd=part('window');add(wd,new THREE.TorusGeometry(.5,.07,12,32),M(0x9aa6b8),[1,2.1,0],[Math.PI/2,0,0]);add(wd,Cy(.46,.06),M(0xbfe8ff,{transparent:true,opacity:.6,metalness:0}),[1,2.1,0]);
 const hv=part('hv');add(hv,new THREE.BoxGeometry(2.4,.9,.9),M(0x2b3442),[.5,-4.4,0]);add(hv,new THREE.SphereGeometry(.15),M(0xff4040),[1.7,-4.4,0]);add(hv,new THREE.SphereGeometry(.15),M(0x4080ff),[-.7,-4.4,0]);
 add(part('heater'),new THREE.BoxGeometry(.9,.9,.9),M(0x3a4a30),[-6.2,-2.6,0]);
 // dây dẫn (cập nhật theo vị trí khi tách rời)
 const P=(g,x,y,z)=>new THREE.Vector3(x,y,z).add(parts[g].position);
 wireDefs=[()=>[P('heater',-6.2,-2.15,0),P('cup',-6.2,-.2,0)],()=>[P('hv',-.7,-4.4,0),P('hv',-7.4,-4.4,0),P('cup',-7.4,0,0),P('cup',-6.2,0,0)],()=>[P('hv',1.7,-4.4,0),P('hv',7.7,-4.4,0),P('anode',7.7,0,0),P('anode',7,0,0)]];
 const wc=[0xffb347,0x4080ff,0xff4040];wires=wireDefs.map((_,i)=>{const l=new THREE.Line(new THREE.BufferGeometry(),new THREE.LineBasicMaterial({color:wc[i]}));scene.add(l);return l});
 // quỹ đạo electron (cùng công thức với hạt)
 trajG=new THREE.Group();[-.25,-.12,0,.12,.25].forEach(y0=>{const pts=[];for(let i=0;i<=40;i++){const x=-3+4*i/40;pts.push(new THREE.Vector3(x,y0*(1-sm(i/40)),0))}trajG.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:0x66ccff,transparent:true,opacity:.6})))});scene.add(trajG);
 // điện trường: hướng từ anốt về catốt (−x)
 fieldG=new THREE.Group();[[1.4,0],[-1.4,0],[0,1.4],[0,-1.4]].forEach(([y,z])=>fieldG.add(new THREE.ArrowHelper(new THREE.Vector3(-1,0,0),new THREE.Vector3(.8,y,z),3.8,0x40e0ff,.35,.2)));scene.add(fieldG);
 cone=new THREE.Mesh(new THREE.ConeGeometry(1.7,6,32,1,true),new THREE.MeshBasicMaterial({color:0xffe27a,transparent:true,opacity:.1,side:DS,depthWrite:false}));cone.position.set(1,3.1,0);cone.rotation.x=Math.PI;scene.add(cone);
 Object.keys(MAT).forEach(k=>{const m=new THREE.Mesh(new THREE.BoxGeometry(3.4,.08,3.4),M(MAT[k].hex,{transparent:true,opacity:.8}));m.position.set(1,MAT[k].y,0);scene.add(m);plM[k]=m});
 // hạt electron và photon
 const NE=160,NP=140;eP=new Float32Array(NE*3);pP=new Float32Array(NP*3);pC=new Float32Array(NP*3);
 for(let i=0;i<NE;i++)eS.push({on:false});for(let i=0;i<NP;i++)ph.push({on:false});
 eGeo=new THREE.BufferGeometry();eGeo.setAttribute('position',new THREE.BufferAttribute(eP,3));
 pGeo=new THREE.BufferGeometry();pGeo.setAttribute('position',new THREE.BufferAttribute(pP,3));pGeo.setAttribute('color',new THREE.BufferAttribute(pC,3));
 const e=new THREE.Points(eGeo,new THREE.PointsMaterial({color:0x66ccff,size:.16,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));
 const p=new THREE.Points(pGeo,new THREE.PointsMaterial({vertexColors:true,size:.2,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));
 e.frustumCulled=p.frustumCulled=false;scene.add(e,p);
 // nhãn
 LB.concat(Object.keys(MAT).map(k=>['pl'+k,'Tấm lọc '+MAT[k].n.toLowerCase(),[3.2,MAT[k].y,0]])).forEach(l=>{const d=document.createElement('div');d.textContent=l[1];$('#labels').appendChild(d);labEls.push({d,id:l[0],a:new THREE.Vector3(...l[2])})});
 bindOrbit();
 }catch(err){GL=false;fail('Lỗi khởi tạo WebGL: '+err.message+'. Các tab 2D vẫn hoạt động.')}}
function fail(m){const e=$('#err');e.textContent=m;e.hidden=false}

function bindOrbit(){
 const cv=$('#gl'),rc=new THREE.Raycaster();let d=null;
 cv.addEventListener('contextmenu',e=>e.preventDefault());
 cv.addEventListener('pointerdown',e=>{d={x:e.clientX,y:e.clientY,m:0,pan:e.button===2||e.shiftKey};cv.setPointerCapture(e.pointerId)});
 cv.addEventListener('pointermove',e=>{if(!d)return;const dx=e.clientX-d.x,dy=e.clientY-d.y;d.m+=Math.abs(dx)+Math.abs(dy);d.x=e.clientX;d.y=e.clientY;
  if(d.pan){const k=o.r*.0015;o.tx-=dx*k*Math.cos(o.th);o.tz+=dx*k*Math.sin(o.th);o.ty+=dy*k}else{o.th-=dx*.006;o.ph=clamp(o.ph-dy*.006,.15,3)}});
 cv.addEventListener('pointerup',e=>{if(d&&d.m<5){const r=cv.getBoundingClientRect();rc.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),cam);
  const ms=[];Object.entries(parts).forEach(([id,g])=>{if(id!=='glass')g.traverse(m=>m.isMesh&&ms.push(m))});
  let h=rc.intersectObjects(ms,false)[0]||rc.intersectObject(parts.glass.children[0])[0];select(h?h.object.userData.part.userData.id:null)}d=null});
 cv.addEventListener('wheel',e=>{e.preventDefault();o.r=clamp(o.r*(1+Math.sign(e.deltaY)*.08),5,35)},{passive:false})}
function select(id){
 if(S.sel)parts[S.sel].traverse(m=>{if(m.isMesh&&m!==fil&&m!==tgm&&m.material.emissive)m.material.emissive.setHex(0)});
 S.sel=id;if(id)parts[id].traverse(m=>{if(m.isMesh&&m!==fil&&m!==tgm&&m.material.emissive)m.material.emissive.setHex(0x0b3a6a)});side()}

/* ---------- Cập nhật mỗi khung hình ---------- */
function tick(dt){
 const sd=S.run?dt*S.speed:0;
 if(S.auto&&S.run){S.timer+=sd;if(S.timer>5){if(S.stage<6)setStage(S.stage+1);else if(S.pres)setStage(0);else S.auto=false}}
 if(GL&&S.tab==='tube')stepGL(dt,sd)}
function stepGL(dt,sd){
 const s=S.stage;
 if(s>0)heat=1;else if(S.run)heat=Math.min(1,heat+sd*.25);
 fil.material.emissive.setRGB(heat,heat*heat*.45,heat*heat*heat*.1);fil.material.emissiveIntensity=1.6;hl.intensity=heat*1.2;
 // electron
 if(s>=1&&sd>0){spAcc+=sd*(20+S.mA*5);while(spAcc>=1){spAcc--;const e=eS.find(q=>!q.on);if(!e)break;Object.assign(e,{on:true,x:-2.85+Math.random()*.15,y0:(Math.random()-.5)*.5,z0:(Math.random()-.5)*.8,vx:.15,age:0})}}
 for(let i=0;i<eS.length;i++){const e=eS[i];if(!e.on){eP[i*3+1]=1e3;continue}
  e.age+=sd;
  if(s<2){e.x=clamp(e.x+(Math.random()-.35)*.6*sd,-2.95,-2.55);e.y0+=(Math.random()-.5)*.5*sd;if(e.age>1.4)e.on=false}
  else{e.vx+=3*(S.kV/80)*sd;e.x+=e.vx*sd;if(e.x>=1){e.on=false;if(s>=3){tHeat=Math.min(1,tHeat+.06);if(s>=4&&Math.random()<.4)spawnPh()}}}
  const q=sm((e.x+3)/4);eP[i*3]=e.x;eP[i*3+1]=e.y0*(1-q);eP[i*3+2]=e.z0*(1-q)}
 eGeo.attributes.position.needsUpdate=true;
 tHeat=Math.max(0,tHeat-sd*.4);tgm.material.emissive.setRGB(tHeat,tHeat*.3,0);tgm.material.emissiveIntensity=1.5;
 // photon
 for(let i=0;i<ph.length;i++){const p=ph[i];if(!p.on){pP[i*3+1]=1e3;continue}
  const y0=p.y;p.x+=p.vx*sd;p.y+=p.vy*sd;p.z+=p.vz*sd;
  if(s>=6)for(const k of Object.keys(MAT)){const m=MAT[k];if(m.on&&m.t>0&&y0<m.y&&p.y>=m.y&&Math.random()>tr(m,p.E))p.on=false}   // hấp thụ theo E, vật liệu, độ dày
  if(p.y>9)p.on=false;pP[i*3]=p.x;pP[i*3+1]=p.y;pP[i*3+2]=p.z}
 pGeo.attributes.position.needsUpdate=true;
 // hiển thị các thành phần
 trajG.visible=V.traj&&s>=1;fieldG.visible=V.fld&&s>=2;cone.visible=s>=5;
 Object.keys(MAT).forEach(k=>{plM[k].visible=s>=6&&MAT[k].on;plM[k].scale.y=1+MAT[k].t/MAT[k].max*6});
 // tách rời / cắt lớp
 const EX={cup:[-2.2,0,0],filament:[-1.2,1.4,0],target:[1.2,1.5,0],anode:[2.5,0,0],sink:[4.2,0,0],window:[0,2.6,0],hv:[0,-1.2,0],heater:[-2.4,-1.2,0],glass:[0,0,0]};
 exK+=((V.exp?1:0)-exK)*Math.min(1,dt*5);Object.keys(EX).forEach(k=>parts[k].position.set(EX[k][0]*exK,EX[k][1]*exK,EX[k][2]*exK));
 const gm=parts.glass.userData.gm,want=V.cut?[parts.glass.userData.clip]:[];if(gm.clippingPlanes.length!==want.length){gm.clippingPlanes=want;gm.needsUpdate=true}
 wires.forEach((w,i)=>w.geometry.setFromPoints(wireDefs[i]()));
 // camera
 const sp=Math.sin(o.ph);cam.position.set(o.tx+o.r*sp*Math.sin(o.th),o.ty+o.r*Math.cos(o.ph),o.tz+o.r*sp*Math.cos(o.th));cam.lookAt(o.tx,o.ty,o.tz);
 R.render(scene,cam);
 // nhãn
 const W=$('#stage').clientWidth,H=$('#stage').clientHeight,v=new THREE.Vector3();
 labEls.forEach(l=>{const pl=l.id.startsWith('pl'),k=l.id.slice(2),show=V.lab&&(pl?s>=6&&MAT[k].on:true);l.d.style.display=show?'':'none';if(!show)return;
  v.copy(l.a);if(!pl)v.add(parts[l.id].position);v.project(cam);l.d.style.transform=`translate(${(v.x+1)/2*W+6}px,${(1-v.y)/2*H-10}px)`})}
function spawnPh(){
 const p=ph.find(q=>!q.on);if(!p)return;const dx=(Math.random()-.5)*.6,dz=(Math.random()-.5)*.6,n=Math.hypot(dx,1,dz),E=sampleE(),t=clamp(E/S.kV,0,1);
 Object.assign(p,{on:true,x:1.05,y:.1,z:(Math.random()-.5)*.2,vx:3.5*dx/n,vy:3.5/n,vz:3.5*dz/n,E});
 const i=ph.indexOf(p)*3;pC[i]=1-.45*t;pC[i+1]=.55-.05*t;pC[i+2]=.15+.85*t;pGeo.attributes.color.needsUpdate=true}

/* ---------- Vẽ 2D ---------- */
let c2,dpr=1;
function chart(c,x,y,w,h,ser,ymax,xmax){
 c.save();c.lineWidth=1;c.strokeStyle='#1d2b45';c.fillStyle='#8fa6c4';c.textAlign='center';
 for(let i=0;i<=5;i++){const gx=x+w*i/5;c.beginPath();c.moveTo(gx,y);c.lineTo(gx,y+h);c.stroke();c.fillText(Math.round(xmax*i/5),gx,y+h+16)}
 for(let i=0;i<=4;i++){const gy=y+h*i/4;c.beginPath();c.moveTo(x,gy);c.lineTo(x+w,gy);c.stroke()}
 c.fillText('Năng lượng photon (keV)',x+w/2,y+h+34);c.translate(x-38,y+h/2);c.rotate(-Math.PI/2);c.fillText('Cường độ tương đối',0,0);c.restore();
 ser.forEach(s=>{c.beginPath();c.moveTo(x,y+h);s.d.forEach((v,i)=>c.lineTo(x+.5*(i+1)/xmax*w,y+h-clamp(v/ymax,0,1)*h));c.lineTo(x+w,y+h);c.closePath();c.fillStyle=s.fill;c.fill();c.strokeStyle=s.line;c.lineWidth=1.5;c.stroke()})}
function wrap(c,s,x,y,w,lh){let l='';for(const wd of s.split(' ')){const t=l+wd+' ';if(c.measureText(t).width>w&&l){c.fillText(l,x,y);y+=lh;l=wd+' '}else l=t}c.fillText(l,x,y);return y+lh}
function wave(c,o,d,L,A,t,col){c.beginPath();const nx=-d[1],ny=d[0];for(let s=0;s<=L;s+=3){const w=A*Math.sin(s*.2-t*12),px=o[0]+d[0]*s+nx*w,py=o[1]+d[1]*s+ny*w;s?c.lineTo(px,py):c.moveTo(px,py)}c.strokeStyle=col;c.lineWidth=2;c.stroke()}
const dot=(c,x,y,col,a)=>{c.globalAlpha=a==null?1:a;c.fillStyle=col;c.beginPath();c.arc(x,y,6,0,7);c.fill();c.globalAlpha=1};

function brems(c,x,y,w,h,t){
 const k=Math.min(w/460,(h-150)/260);c.save();c.translate(x+w/2,y+h/2-40);c.scale(k,k);c.textAlign='center';
 const g=c.createRadialGradient(0,0,2,0,0,28);g.addColorStop(0,'#ff6b6b');g.addColorStop(1,'rgba(255,107,107,0)');c.fillStyle=g;c.beginPath();c.arc(0,0,28,0,7);c.fill();
 c.fillStyle='#ff9a9a';c.beginPath();c.arc(0,0,9,0,7);c.fill();c.fillStyle='#dbe6f5';c.font='14px "Segoe UI"';c.fillText('Hạt nhân W (Z = 74, điện tích +)',0,46);
 const B=u=>[(1-u)*(1-u)*-170+2*u*(1-u)*10+u*u*150,(1-u)*(1-u)*-70+2*u*(1-u)*45+u*u*-110];
 c.beginPath();for(let i=0;i<=50;i++){const p=B(i/50);i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1])}c.strokeStyle='rgba(120,200,255,.25)';c.lineWidth=1.5;c.stroke();
 const u=Math.min(1,(t%6)/4.5),p=B(u);dot(c,p[0],p[1],u<.5?'#6cf':'#3f7a99');c.fillStyle='#9fd';c.fillText(u<.5?'electron tới (động năng lớn)':'electron sau tán xạ (động năng nhỏ hơn)',p[0],p[1]-14);
 if(u>.5){const o=B(.5),L=(u-.5)*2*230;wave(c,o,[.6,.8],L,7,t,'#ffd24a');c.fillStyle='#ffd24a';c.fillText('photon tia X: hf = ΔE',o[0]+.6*L+40,o[1]+.8*L)}
 c.restore();c.fillStyle='#ffb347';c.font='bold 15px "Segoe UI"';c.textAlign='left';c.fillText('BỨC XẠ HÃM (Bremsstrahlung)',x+14,y+28);
 c.fillStyle='#c9d6ea';c.font='13px "Segoe UI"';wrap(c,'Electron bị điện trường hạt nhân tungsten làm lệch hướng và giảm tốc. Phần động năng mất đi ΔE được phát ra thành một photon tia X (photon không phải electron). ΔE có thể nhận mọi giá trị từ 0 đến eU nên tạo ra phổ liên tục, có giới hạn E_max = eU.',x+14,y+h-100,w-28,18)}
function chars(c,x,y,w,h,t){
 const k=Math.min(w*.5/250,(h-150)/260),T=t%7,cx=x+w*.34,cy=y+h/2-40;
 c.save();c.translate(cx,cy);c.scale(k,k);c.textAlign='center';c.font='13px "Segoe UI"';
 [34,66,100].forEach((r,i)=>{c.strokeStyle='#2c4a78';c.lineWidth=1.5;c.beginPath();c.arc(0,0,r,0,7);c.stroke();c.fillStyle='#6f8fb8';c.fillText('Lớp '+'KLM'[i],r*.72+10,-r*.72-4)});
 c.fillStyle='#ff9a9a';c.beginPath();c.arc(0,0,8,0,7);c.fill();c.fillStyle='#dbe6f5';c.fillText('Nguyên tử W phóng đại',0,128);
 dot(c,-34,0,'#6cf');
 if(T<1.5)dot(c,34,0,'#6cf');                                                    // electron lớp K bị bật ra
 else if(T<2.4){const q=(T-1.5)/.9;dot(c,34+196*q,-150*q,'#6cf',1-q)}
 if(T>=1.5&&T<3.4){c.setLineDash([3,3]);c.strokeStyle='#ff7a7a';c.beginPath();c.arc(34,0,9,0,7);c.stroke();c.setLineDash([]);c.fillStyle='#ff9a9a';c.fillText('chỗ trống lớp K',70,-14)}
 if(T<2.6)dot(c,0,-66,'#6cf');else{const q=sm((T-2.6)/.8);dot(c,34*q,-66*(1-q),'#6cf')}   // electron lớp L nhảy xuống lớp K
 [0,2.1,4.2].forEach(a=>dot(c,66*Math.cos(t*.5+a+1),66*Math.sin(t*.5+a+1),'#6cf'));[0,3].forEach(a=>dot(c,100*Math.cos(t*.3+a),100*Math.sin(t*.3+a),'#6cf'));
 if(T<1.5){const q=T/1.5;dot(c,-250+216*q,-30+28*q,'#4fb8ff');c.fillStyle='#9fd';c.fillText('electron tới',-250+216*q,-44+28*q)}
 else if(T<3){const q=(T-1.5)/1.5;dot(c,-34-190*q,-2-138*q,'#3f7a99',1-q)}
 if(T>=3.2&&T<6.5){wave(c,[34,0],[.8,.6],Math.min((T-3.2)*110,330),6,t,'#ffd24a');c.fillStyle='#ffd24a';c.fillText('photon đặc trưng',150,150)}
 c.restore();
 const lx=x+w*.74,y0=cy-110,Y={0:0,M:40,L:95,K:230},ly=e=>y0+Y[e];
 c.textAlign='left';c.font='13px "Segoe UI"';c.lineWidth=2;
 [['0','0 (electron tự do)'],['M','M: −2,3 keV'],['L','L: −10,2 keV'],['K','K: −69,5 keV']].forEach(([e,s])=>{c.strokeStyle='#4a6a9a';c.beginPath();c.moveTo(lx,ly(e));c.lineTo(lx+90,ly(e));c.stroke();c.fillStyle='#9fb6d6';c.fillText(s,lx+96,ly(e)+4)});
 const arrow=(ax,from,to,col,lab,q)=>{const a=ly(from),b=a+(ly(to)-a)*q;c.strokeStyle=c.fillStyle=col;c.beginPath();c.moveTo(ax,a);c.lineTo(ax,b);c.stroke();c.beginPath();c.moveTo(ax,b+1);c.lineTo(ax-5,b-9);c.lineTo(ax+5,b-9);c.fill();c.fillText(lab,ax+8,(a+b)/2)};
 if(T>=2.6)arrow(lx+30,'L','K','#ffd24a','Kα = 59,3 keV',Math.min(1,(T-2.6)/.8));
 if(T>=2.6)arrow(lx+70,'M','K','rgba(255,210,74,.5)','Kβ = 67,2 keV',Math.min(1,(T-2.6)/.8));
 c.fillStyle='#7f93b3';c.fillText('Sơ đồ mức năng lượng (không theo tỉ lệ)',lx,y0-16);
 c.fillStyle='#ffb347';c.font='bold 15px "Segoe UI"';c.fillText('BỨC XẠ ĐẶC TRƯNG (Characteristic)',x+14,y+28);
 c.fillStyle='#c9d6ea';c.font='13px "Segoe UI"';wrap(c,'Electron tới có động năng lớn hơn năng lượng liên kết lớp K (69,5 keV) làm bật một electron lớp K. Electron lớp ngoài (L hoặc M) nhảy xuống lấp chỗ trống, năng lượng chênh lệch giữa hai mức được phát ra thành photon có năng lượng xác định (ví dụ Kα ≈ 59,3 keV) nên tạo các vạch phổ đặc trưng của tungsten. Cần điện áp ống U > 69,5 kV.',x+14,y+h-100,w-28,18)}
function drawMech(c,W,H,t){const both=S.mode==='both';if(S.mode!=='char')brems(c,0,0,both?W/2:W,H,t);if(S.mode!=='brem')chars(c,both?W/2:0,0,both?W/2:W,H,t);
 if(both){c.strokeStyle='#1d2b45';c.beginPath();c.moveTo(W/2,10);c.lineTo(W/2,H-10);c.stroke()}}

function drawSpec(c,W,H){
 const s=spec(false),x=62,y=50,w=W-92,h=H-120,ym=Math.max(1500,Math.max(...s.tot)*1.1);
 c.fillStyle='#dbe6f5';c.font='bold 16px "Segoe UI"';c.textAlign='left';c.fillText('Phổ tia X của ống bia tungsten (mô hình định tính, đơn vị tương đối)',x,26);c.font='13px "Segoe UI"';
 chart(c,x,y,w,h,[{d:s.tot,fill:'rgba(255,179,71,.3)',line:'#ffb347'},{d:s.con,fill:'rgba(58,209,255,.25)',line:'#3ad1ff'}],ym,150);
 const ex=x+S.kV/150*w;c.strokeStyle='#ff5a7a';c.setLineDash([5,4]);c.beginPath();c.moveTo(ex,y);c.lineTo(ex,y+h);c.stroke();c.setLineDash([]);
 c.fillStyle='#ff8aa0';c.textAlign=ex>x+w-130?'right':'left';c.fillText('E_max = eU = '+S.kV+' keV',ex+(ex>x+w-130?-6:6),y+14);c.textAlign='left';
 c.fillStyle='#3ad1ff';c.fillText('■ Phổ liên tục (bức xạ hãm)',x+10,y+h-40);c.fillStyle='#ffb347';c.fillText('■ Tổng: phổ liên tục + vạch đặc trưng (bức xạ đặc trưng)',x+10,y+h-20);
 if(S.kV>KE){const px=x+59.3/150*w;c.fillStyle='#ffd24a';c.fillText('Kα ≈ 59,3 keV',px-86,y+30);c.fillText('Kβ ≈ 67,2 keV',x+67.2/150*w+8,y+50)}}

function drawFilt(c,W,H){
 const keys=Object.keys(MAT),sp=spec(false).tot,ft=spec(true).tot;
 const I=[0,1,2,3].map(k=>sp.reduce((a,v,i)=>a+v*keys.slice(0,k).reduce((p,q)=>p*(MAT[q].on?tr(MAT[q],.5*(i+1)):1),1),0));
 const mean=a=>a.reduce((s,v,i)=>s+v*.5*(i+1),0)/a.reduce((s,v)=>s+v,0);
 Fl={I0:I[0],I3:I[3],mB:mean(sp),mA:mean(ft)};
 const cy=82,px=[W*.3,W*.5,W*.7],ex=W*.88,bar=k=>4+54*I[k]/I[0];
 c.textAlign='center';c.font='13px "Segoe UI"';
 c.fillStyle='#2b3442';c.fillRect(20,cy-34,80,68);c.fillStyle='#dbe6f5';c.fillText('Chùm tia',60,cy-2);c.fillText('từ ống',60,cy+14);
 const xs=[100,...px,ex];
 for(let k=0;k<4;k++){c.fillStyle='rgba(255,210,74,.55)';c.fillRect(xs[k],cy-bar(k)/2,xs[k+1]-xs[k],bar(k));c.fillStyle='#ffd24a';c.fillText(f(100*I[k]/I[0],0)+' %',(xs[k]+xs[k+1])/2,cy-38)}
 keys.forEach((k,i)=>{const m=MAT[k],tw=8+m.t/m.max*20;c.globalAlpha=m.on?1:.25;c.fillStyle=m.col;c.fillRect(px[i]-tw/2,cy-45,tw,90);c.globalAlpha=1;c.fillStyle='#dbe6f5';c.fillText(m.n+(m.on?'':' (tắt)'),px[i],cy+62)});
 c.fillStyle='#8fa6c4';c.fillText('Cường độ tương đối trước → sau mỗi vật liệu',W/2,16);c.fillText('Cảm biến',ex+34,cy+4);
 const y=150,h=H-y-60,ym=Math.max(...sp)*1.1;
 chart(c,62,y,W-92,h,[{d:sp,fill:'rgba(143,166,196,.25)',line:'#8fa6c4'},{d:ft,fill:'rgba(255,179,71,.4)',line:'#ffb347'}],ym,150);
 c.textAlign='left';c.fillStyle='#8fa6c4';c.fillText('■ Trước lọc',72,y+16);c.fillStyle='#ffb347';c.fillText('■ Sau lọc',72,y+34)}
let Fl={I0:1,I3:1,mB:0,mA:0};

function drawProp(c,W,H){
 const x=60,y=70,w=W-100,h=H-190;c.textAlign='left';c.fillStyle='#dbe6f5';c.font='bold 16px "Segoe UI"';
 c.fillText('Tỉ lệ photon xuyên qua lớp vật liệu dày '+f(S.d)+' mm: tia X mềm (30 keV) so với tia X cứng (80 keV)',x,28);c.font='13px "Segoe UI"';
 c.strokeStyle='#1d2b45';for(let i=0;i<=4;i++){const gy=y+h*i/4;c.beginPath();c.moveTo(x,gy);c.lineTo(x+w,gy);c.stroke();c.fillStyle='#8fa6c4';c.fillText(100-25*i+' %',x-42,gy+4)}
 const gw=w/BODY.length;
 BODY.forEach((m,i)=>[30,80].forEach((E,j)=>{const v=tr(m,E,S.d),bw=gw*.3,bx=x+i*gw+gw*.15+j*bw*1.1;c.fillStyle=j?'#8c7dff':'#ff9a3c';c.fillRect(bx,y+h*(1-v),bw,h*v);c.fillStyle='#dbe6f5';c.textAlign='center';c.fillText(f(v*100,v<.1?2:1)+'%',bx+bw/2,y+h*(1-v)-6)}));
 c.textAlign='center';BODY.forEach((m,i)=>{c.fillStyle='#dbe6f5';c.fillText(m.n.charAt(0)+m.n.slice(1).toLowerCase(),x+i*gw+gw/2,y+h+20)});
 c.textAlign='left';c.fillStyle='#ff9a3c';c.fillText('■ Tia X mềm (30 keV)',x,y+h+48);c.fillStyle='#8c7dff';c.fillText('■ Tia X cứng (80 keV)',x+190,y+h+48)}

function draw2D(t){
 const W=$('#stage').clientWidth,H=$('#stage').clientHeight,c=c2.getContext('2d');c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,W,H);
 ({mech:drawMech,spec:(c,W,H)=>drawSpec(c,W,H),filt:(c,W,H)=>drawFilt(c,W,H),prop:(c,W,H)=>drawProp(c,W,H)})[S.tab](c,W,H,t);readouts()}
function readouts(){
 const T=(id,v)=>{const e=$('#'+id);if(e&&e.textContent!==v)e.textContent=v};
 if(S.tab==='spec'){const s=spec(false).tot,sum=s.reduce((a,b)=>a+b,0);T('rE',f(S.kV)+' keV');T('rL',f(12.398/S.kV,3)+' Å');T('rI',f(sum*.5/100,1)+' (đơn vị tương đối)');T('rM',f(s.reduce((a,v,i)=>a+v*.5*(i+1),0)/sum)+' keV');T('rK',S.kV>KE?'Có (U > 69,5 kV)':'Không (U < 69,5 kV)')}
 if(S.tab==='filt'){T('rA',f(100*Fl.I3/Fl.I0)+' %');T('rMb',f(Fl.mB)+' keV');T('rMa',f(Fl.mA)+' keV');Object.keys(MAT).forEach(k=>T('t'+k,f(MAT[k].t)+' mm'))}
 if(S.tab==='prop')T('tD',f(S.d)+' mm')}

/* ---------- Bảng bên ---------- */
const slider=(l,k,mn,mx,st,v,id)=>`<div class="row"><label>${l}</label><input type="range" data-k="${k}" min="${mn}" max="${mx}" step="${st}" value="${v}"><span id="${id}"></span></div>`;
function side(){
 const el=$('#info'),n=S.stage;let h='';
 if(S.tab==='tube'){const s=ST[n],p=S.sel&&INFO[S.sel];
  h=`<div class="card"><h3>Giai đoạn ${n+1}/7: ${s[0]}</h3><p>${s[1]}</p><code>${s[2]}</code></div>
  <div class="card">${p?`<h3>${p[0]}</h3><p><b>Chức năng:</b> ${p[1]}</p><p>${p[2]}</p>`:'<p>Nhấp (hoặc chạm) vào một bộ phận của ống để xem tên, chức năng và giải thích. Kéo chuột để xoay, cuộn để phóng to, giữ Shift hoặc chuột phải để di chuyển.</p>'}</div>
  <div class="card warn">Chiều chuyển động: electron đi từ catốt (−) sang anốt (+); điện trường E hướng ngược lại, từ anốt về catốt. Hình vẽ không theo tỉ lệ thật.</div>`}
 if(S.tab==='mech')h=`<div class="card"><h3>Chọn cơ chế hiển thị</h3><div class="row">${[['brem','CHỈ BỨC XẠ HÃM'],['char','CHỈ BỨC XẠ ĐẶC TRƯNG'],['both','HIỂN THỊ CẢ HAI']].map(([k,l])=>`<button data-mode="${k}" class="${S.mode===k?'on':''}">${l}</button>`).join('')}</div></div>
  <div class="card"><h3>Bức xạ hãm</h3><p>Phổ liên tục, E từ 0 đến eU. Phụ thuộc vào cả U và số electron (I).</p><code>λ_min = hc/(eU)</code></div>
  <div class="card"><h3>Bức xạ đặc trưng</h3><p>Phổ vạch, năng lượng chỉ phụ thuộc vào loại nguyên tử bia (tungsten), không phụ thuộc U miễn là U vượt ngưỡng kích thích.</p><code>E(Kα) = E_L − E_K ≈ 59,3 keV</code></div>
  <div class="card warn">Chỉ khoảng 1% năng lượng chùm electron thành tia X, còn lại thành nhiệt. Photon tia X là sóng điện từ, khác hoàn toàn với electron.</div>`;
 if(S.tab==='spec')h=`<div class="card"><h3>Số liệu theo U và I hiện tại</h3>${[['rE','Năng lượng photon cực đại'],['rL','Bước sóng ngắn nhất λ_min'],['rM','Năng lượng photon trung bình'],['rI','Tổng cường độ tương đối'],['rK','Kích thích vạch K của W']].map(([i,l])=>`<div class="kv">${l}<b id="${i}"></b></div>`).join('')}</div>
  <div class="card"><h3>Điện áp U và dòng điện I</h3><p><b>Tăng U:</b> E_max = eU tăng, phổ dịch sang năng lượng cao, tổng cường độ tăng; khi U > 69,5 kV mới xuất hiện các vạch K.</p><p><b>Tăng I:</b> số electron tăng nên cường độ (số photon) tăng tỉ lệ thuận; E_max và vị trí các vạch không đổi.</p><p>Hãy kéo thanh trượt U và I ở bảng dưới để quan sát.</p></div>
  <div class="card warn">Mô hình: định luật Kramers cho phổ liên tục, I(E) ∝ I·Z·(E_max − E), có tính lọc cố định ~1 mm nhôm (nên vùng năng lượng rất thấp bị cắt). Biên độ vạch đặc trưng là mô hình định tính; không phải số liệu thực nghiệm.</div>`;
 if(S.tab==='filt')h=`<div class="card"><h3>Vật liệu đặt trên đường truyền</h3>${Object.keys(MAT).map(k=>`<div class="row"><button data-m="${k}" class="${MAT[k].on?'on':''}">${MAT[k].n}</button><input type="range" data-k="${k}.t" min="0" max="${MAT[k].max}" step=".1" value="${MAT[k].t}"><span id="t${k}"></span></div>`).join('')}<p style="font-size:12px">Độ dày chỉ mang tính minh họa.</p></div>
  <div class="card"><h3>Kết quả (U, I hiện tại)</h3><div class="kv">Cường độ trước lọc<b>100 %</b></div><div class="kv">Cường độ sau lọc<b id="rA"></b></div><div class="kv">Năng lượng trung bình trước<b id="rMb"></b></div><div class="kv">Năng lượng trung bình sau<b id="rMa"></b></div></div>
  <div class="card"><h3>Vì sao tia X mềm dễ bị hấp thụ hơn?</h3><p>Hấp thụ quang điện giảm rất nhanh khi năng lượng tăng (xấp xỉ ∝ Z³/E³). Photon năng lượng thấp bị hấp thụ nhiều hơn, photon năng lượng cao xuyên qua dễ hơn nên chùm tia sau lọc "cứng" hơn.</p><code>I = I₀·e^(−μ(E,Z)·x)</code>
  <p><b>Nhôm:</b> Z nhỏ, hấp thụ ít, lọc tia X mềm. <b>Đồng:</b> hấp thụ mạnh hơn, làm cứng chùm tia rõ hơn. <b>Chì:</b> Z = 82 hấp thụ rất mạnh nên dùng che chắn, nhưng vẫn không chặn tuyệt đối 100%; cường độ chỉ giảm theo hàm mũ.</p></div>
  <div class="card warn">Lọc tia X (cải thiện chất lượng chùm tia) khác với che chắn bức xạ (giảm liều cho người xung quanh). Đây là mô phỏng giáo dục, không dùng để thiết kế che chắn thực tế; mô hình bỏ qua các bờ hấp thụ (trừ bờ K của chì) và tán xạ.</div>`;
 if(S.tab==='prop')h=`<div class="card"><h3>Độ dày vật liệu</h3>${slider('d','d',.5,30,.5,S.d,'tD')}<p style="font-size:12px">Biểu đồ so sánh tia X mềm (30 keV) và cứng (80 keV) qua mô mềm, xương, nhôm, đồng, chì.</p></div>
  ${[['Khả năng đâm xuyên','Photon không mang điện nên xuyên sâu vào vật chất; năng lượng càng cao càng xuyên sâu, vật liệu càng nhẹ càng dễ xuyên qua.'],['Ion hóa môi trường','Photon truyền năng lượng cho electron của nguyên tử/phân tử, làm bật electron ra, tạo ion.'],['Tác dụng lên phim và cảm biến','Làm đen phim ảnh và tạo tín hiệu trong cảm biến số, cơ sở của chụp X-quang.'],['Gây phát quang','Một số chất (như màn huỳnh quang) hấp thụ tia X rồi phát ra ánh sáng nhìn thấy.'],['Không bị lệch bởi điện, từ trường','Photon không mang điện nên điện trường và từ trường thông thường không làm lệch hướng.'],['Bản chất sóng điện từ','Sóng điện từ bước sóng ngắn (khoảng 0,01–10 nm), năng lượng photon E = hc/λ.']].map(([a,b])=>`<div class="card"><h3>${a}</h3><p>${b}</p></div>`).join('')}`;
 el.innerHTML=h}
$('#info').addEventListener('input',e=>{const k=e.target.dataset.k;if(!k)return;const v=+e.target.value;if(k==='d')S.d=v;else{const[m,p]=k.split('.');MAT[m][p]=v}});
$('#info').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
 if(b.dataset.m){MAT[b.dataset.m].on=!MAT[b.dataset.m].on;b.classList.toggle('on')}
 if(b.dataset.mode){S.mode=b.dataset.mode;[...b.parentNode.children].forEach(x=>x.classList.toggle('on',x===b))}});

/* ---------- Tab, điều khiển, thuyết trình ---------- */
function tab(k){S.tab=k;[...$('#tabs').children].forEach(b=>b.classList.toggle('on',b.dataset.k===k));
 $('#gl').hidden=k!=='tube'||!GL;$('#labels').hidden=k!=='tube';$('#viewbar').hidden=k!=='tube';$('#c2d').hidden=k==='tube';$('#err').hidden=GL||k!=='tube'||!$('#err').textContent;side();resize()}
function resize(){const st=$('#stage'),W=st.clientWidth,H=st.clientHeight;dpr=Math.min(devicePixelRatio||1,2);c2.width=W*dpr;c2.height=H*dpr;if(GL){R.setSize(W,H,false);cam.aspect=W/H;cam.updateProjectionMatrix()}}
TABS.forEach(([k,l])=>{const b=document.createElement('button');b.textContent=l;b.dataset.k=k;b.onclick=()=>tab(k);$('#tabs').appendChild(b)});
ST.forEach((s,i)=>{const b=document.createElement('button');b.textContent=(i+1)+'. '+s[0];b.onclick=()=>goStage(i);$('#tl').appendChild(b)});
$('#bStart').onclick=()=>{S.run=true;S.auto=true;S.timer=0};
$('#bPause').onclick=()=>{S.run=false};
$('#bReset').onclick=()=>{S.run=false;S.auto=false;heat=0;setStage(0)};
$('#bNext').onclick=()=>goStage(S.stage+1);$('#bPrev').onclick=()=>goStage(S.stage-1);
function setSpeed(v){S.speed=v;$('#spd').value=v;$('#spdV').textContent=f(v,2).replace(/,?0+$/,'')+'×';document.querySelectorAll('[data-sp]').forEach(b=>b.classList.toggle('on',+b.dataset.sp===v))}
document.querySelectorAll('[data-sp]').forEach(b=>b.onclick=()=>setSpeed(+b.dataset.sp));$('#spd').oninput=e=>setSpeed(+e.target.value);
$('#kV').oninput=e=>{S.kV=+e.target.value;$('#kVv').textContent=S.kV+' kV';cdf=null};
$('#mA').oninput=e=>{S.mA=+e.target.value;$('#mAv').textContent=S.mA+' mA';cdf=null};
$('#viewbar').onclick=e=>{const b=e.target.closest('button');if(!b)return;const k=b.dataset.v;if(k==='reset'){Object.assign(o,o0);return}V[k]=!V[k];b.classList.toggle('on',V[k])};
$('#bHud').onclick=()=>{document.body.classList.toggle('nohud');setTimeout(resize,50)};
$('#bFs').onclick=()=>document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen().catch(()=>{});
function pres(on){S.pres=on;document.body.classList.toggle('pres',on);if(on){tab('tube');setStage(0);S.run=true;S.auto=true;if(!document.fullscreenElement)document.documentElement.requestFullscreen().catch(()=>{})}else if(document.fullscreenElement)document.exitFullscreen();setTimeout(resize,80)}
$('#bPres').onclick=()=>{pres(!S.pres);$('#bPres').textContent=S.pres?'THOÁT THUYẾT TRÌNH':'THUYẾT TRÌNH'};
document.addEventListener('fullscreenchange',()=>{if(!document.fullscreenElement&&S.pres){pres(false);$('#bPres').textContent='THUYẾT TRÌNH'}setTimeout(resize,80)});
document.addEventListener('keydown',e=>{if(e.target.tagName==='INPUT')return;if(e.key==='ArrowRight')goStage(S.stage+1);if(e.key==='ArrowLeft')goStage(S.stage-1)});
window.addEventListener('resize',resize);

c2=$('#c2d');buildGL();setStage(0);tab('tube');
let last=performance.now();
(function frame(now){requestAnimationFrame(frame);const dt=Math.min(.05,(now-last)/1000);last=now;tick(dt);if(S.tab!=='tube')draw2D(now/1000)})(performance.now());
