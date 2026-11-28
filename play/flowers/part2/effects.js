'use strict';
// Botanical flourishes: cached halos, bounded petal flights and engraved light.
// Every coloured mark comes from the specimen's existing three-colour palette.
function createBotanicalEffects(c,f,index,paintPetal,reduced){
 const motes=[],atlas=document.createElement('canvas');atlas.width=192;atlas.height=64;
 const ac=atlas.getContext('2d');for(let k=0;k<3;k++){const g=ac.createRadialGradient(k*64+32,32,0,k*64+32,32,31);g.addColorStop(0,f.colors[k]);g.addColorStop(.15,f.colors[k]+'b0');g.addColorStop(1,f.colors[k]+'00');ac.fillStyle=g;ac.fillRect(k*64,0,64,64);}
 let previous=null,energy=0,time=0,lastBloom=0,serial=0,lastPollen=0;
 const api={before,after,clear,get count(){return motes.length;},get energy(){return energy;}};
 function clear(){motes.length=0;previous=null;energy=0;lastBloom=0;lastPollen=time;}
 function halo(x,y,r,tone=0,alpha=.15){if(r<=0||alpha<=0)return;c.save();c.globalAlpha=alpha;c.drawImage(atlas,tone*64,0,64,64,x-r,y-r,r*2,r*2);c.restore();}
 function glint(x,y,r,tone=2,alpha=.8){c.save();c.globalAlpha=alpha;c.strokeStyle=f.colors[tone];c.lineWidth=.9;c.beginPath();c.moveTo(x-r,y);c.quadraticCurveTo(x,y-1,x+r,y);c.moveTo(x,y-r*1.5);c.quadraticCurveTo(x+1,y,x,y+r*1.5);c.stroke();c.restore();halo(x,y,r*3,tone,alpha*.4);}
 function burst(x,y,power=1,kind='petal'){if(reduced)return;energy=Math.min(1.5,energy+power*.7);const n=Math.round(14+power*25);for(let k=0;k<n;k++){const angle=k*2.399+serial*.7,speed=(.7+(k%7)*.27)*power;const p={x,y,ox:x,oy:y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed-1.1,phase:angle,age:0,life:70+k%35,tone:k%3,size:kind==='petal'?9+(k%4)*3:2+k%3,kind};motes.push(p);}serial++;if(motes.length>180)motes.splice(0,motes.length-180);}
 function sync(s){const next={bloom:s.bloom,letter:s.letter,dew:s.dew.length,shed:s.shed,complete:s.complete,plucked:s.plucked.size,locked:s.clusters.filter(p=>p.locked).length,clock:s.clock};if(previous){
  if(index===0&&s.held&&s.bloom-lastBloom>.11){lastBloom=s.bloom;burst(400,300,.45,'pollen');}
  if(index===1&&next.letter!==previous.letter&&s.letter){burst(400,290,.8,'pollen');}
  if(index===2&&next.dew>previous.dew){const dew=s.dew[s.dew.length-1];burst(dew.x,dew.y,.28,'dew');}
  if(index===3&&s.wind>.18&&time-lastPollen>.12&&motes.length<60){lastPollen=time;burst(400+s.windSign*90,290,.18,'pollen');}
  if(index===4&&next.shed>previous.shed){energy=1;}
  if(index===7&&next.plucked>previous.plucked){burst(400,300,.5,'pollen');}
  if(index===8&&next.locked>previous.locked){const p=s.clusters.find(p=>p.pulse>.95)||s.clusters[0];burst(p.x,p.y,.8,'petal');}
  if(index===9&&Math.abs(next.clock-previous.clock)>.05){energy=1;burst(400,300,.3,'pollen');}
  if(next.complete&&!previous.complete){burst(index===5?s.lens.x:400,index===5?s.lens.y:300,index===0?1.25:1,index===6||index===8?'petal':'pollen');}
 }previous=next;}
 function line(draw,tone=1,alpha=.35,width=1){c.save();c.strokeStyle=f.colors[tone];c.globalAlpha=alpha;c.lineWidth=width;c.beginPath();draw();c.stroke();c.restore();}
 function lace(radius,count,rotation,alpha){line(()=>{for(let k=0;k<count;k++){const a=k*Math.PI*2/count+rotation,b=a+Math.PI*2/count;c.moveTo(400+Math.sin(a)*radius,300-Math.cos(a)*radius);c.quadraticCurveTo(400+Math.sin((a+b)/2)*(radius+23),300-Math.cos((a+b)/2)*(radius+23),400+Math.sin(b)*radius,300-Math.cos(b)*radius);}},2,alpha,1.3);}
 function before(dt,s){time+=reduced?0:dt/60;energy=Math.max(0,energy-dt*.008);sync(s);const excitement=Math.min(1,energy);
  halo(400,300,205,0,.07+excitement*.14);
  if(index===0){halo(400,300,90+s.bloom*95,2,.09+s.bloom*.12);if(s.bloom>.1)lace(80+s.bloom*132,8,(1-s.bloom)*.5,.16+s.bloom*.23);}
  if(index===1){for(let k=0;k<3;k++)line(()=>{c.moveTo(320+k*70,505);c.bezierCurveTo(145+k*190,400,180+k*170,175,330+k*65,145);},k,.12+excitement*.25,1.5);if(s.letter&&excitement>0){const sweep=(1-excitement)*620+90;halo(sweep,290,90,2,excitement*.28);}}
  if(index===2){s.dew.forEach((p,k)=>{if(p.age<3.5){for(let ring=0;ring<3;ring++){const r=6+p.age*20+ring*10;line(()=>c.ellipse(p.x,p.y,r,r*.45,-.3,0,Math.PI*2),k%3,(1-p.age/3.5)*.4/(ring+1),1.2);}halo(p.x,p.y,28,2,Math.max(0,1-p.age/4)*.28);}});}
  if(index===3&&s.wind>.03){lace(165+Math.min(24,s.wind*10),12,s.windSign*s.wind*.06,.18);for(let k=0;k<7;k++){const y=190+k*38,shift=Math.sin(time*1.4+k)*18;line(()=>{c.moveTo(130,y+shift);c.bezierCurveTo(270,y-70,500,y+80,660,y-25);},k%3,Math.min(.32,s.wind*.13),1+(k%2)*.6);}}
  if(index===4){[[270,185],[400,250],[545,190],[585,320],[315,355]].forEach((p,k)=>halo(p[0],p[1],75,k%3,(1-s.shed)*.12));}
  if(index===5&&s.complete){halo(s.lens.x,s.lens.y,103,2,.17);lace(205,5,.2,.12);}
  if(index===6){const aligned=Math.max(0,1-Math.abs(Math.sin(s.angle/2)));lace(205,10,s.angle,.15+aligned*.32);lace(143,8,.35,.18);if(s.complete)halo(400,300,235,2,.15);}
  if(index===7){const gone=s.plucked.size/s.total;halo(400,300,65+gone*100,1,.12+gone*.1);if(s.complete)lace(92,12,time*.035,.5);}
  if(index===8){s.clusters.forEach((p,k)=>{if(p.locked){halo(p.x,p.y,92,k%3,.18);line(()=>{c.moveTo(400,460);c.bezierCurveTo(350+k*25,420,p.x,p.y+70,p.x,p.y);},k%3,.4,1.5);}});if(s.complete)lace(175,14,0,.3);}
  if(index===9){const sun=Math.max(0,Math.sin((s.clock-6)/12*Math.PI)),sx=400+(s.clock-12)*19,sy=105+(1-sun)*75;halo(sx,sy,100,2,sun*.45);halo(400,300,230,0,sun*.14);for(let k=0;k<12;k++){const a=(k/11-.5)*1.8;c.save();c.globalAlpha=sun*.035;c.fillStyle=f.colors[k%3];c.beginPath();c.moveTo(sx,sy);c.lineTo(400+Math.sin(a)*250,300+Math.cos(a)*165);c.lineTo(400+Math.sin(a+.065)*250,300+Math.cos(a+.065)*165);c.closePath();c.fill();c.restore();}if(sun<.3)for(let k=0;k<18;k++){const a=k*2.399,r=125+(k%5)*16,x=400+Math.cos(a)*r,y=300+Math.sin(a)*r;halo(x,y,9,k%3,(.3-sun)*(.35+.15*Math.sin(time*.6+k)));}}
 }
 function after(dt,s){
  if(index===0&&(s.held||s.complete))for(let k=0;k<8;k++){const a=k*Math.PI/4,r=85+s.bloom*95;glint(400+Math.sin(a)*r,300-Math.cos(a)*r,3+(k%2),k%3,.25+s.bloom*.35);}
  if(index===2)s.dew.forEach((p,k)=>{if(p.age<5)glint(p.x-1,p.y-2,4,k%3,(1-p.age/5)*.7);});
  if(index===5&&s.complete){c.save();c.beginPath();c.arc(s.lens.x,s.lens.y,69,0,Math.PI*2);c.clip();for(let k=0;k<12;k++){const a=k*2.399,r=26+k*2.7;glint(s.lens.x+Math.cos(a)*r,s.lens.y+Math.sin(a)*r,2.5,k%3,.5);}c.restore();}
  if(index===6&&s.complete)for(let k=0;k<10;k++){const a=k*Math.PI/5;glint(400+Math.sin(a)*205,300-Math.cos(a)*205,4,k%3,.65);}
  for(let k=motes.length-1;k>=0;k--){const p=motes[k];p.age+=dt;if(p.age>=p.life){motes.splice(k,1);continue;}const fade=Math.sin(p.age/p.life*Math.PI);p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=(p.kind==='petal'?.008:.002)*dt;p.vx*=Math.pow(.995,dt);const sway=Math.sin(time*2+p.phase)*6;if(p.kind==='petal'){halo(p.x+sway,p.y,p.size*1.3,p.tone,fade*.2);paintPetal(p,p.x+sway,p.y,p.phase+time*.5,fade*.8,p.size);}else{halo(p.x+sway,p.y,p.size*4,p.tone,fade*.55);if(k%4===0)glint(p.x+sway,p.y,p.size*.7,p.tone,fade*.65);}}
 }
 return api;
}
