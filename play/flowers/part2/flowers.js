'use strict';
const flowers=[
{name:'Rose',latin:'ROSA',mood:'DUSTY ROSE',colors:['#e4b4ad','#bc7685','#f1d5bc'],bg:'#20372d',leaf:'#6e8360',shape:0},
{name:'Iris',latin:'IRIS',mood:'LILAC & SAGE',colors:['#b6a7cd','#85749f','#ded1e3'],bg:'#293039',leaf:'#7a8977',shape:1},
{name:'Lily',latin:'LILIUM',mood:'IVORY & GOLD',colors:['#f0e5c6','#d0bc86','#fcf2dc'],bg:'#2b352c',leaf:'#7a8b65',shape:2},
{name:'Peony',latin:'PAEONIA',mood:'ROSE SILK',colors:['#c987a5','#e7b4c4','#f3d7da'],bg:'#342a31',leaf:'#81906f',shape:3},
{name:'Cherry blossom',latin:'PRUNUS',mood:'BLUSH PINK',colors:['#e6b6c2','#c48b9a','#f4d6d1'],bg:'#34312f',leaf:'#869076',shape:4},
{name:'Violet',latin:'VIOLA',mood:'VELVET VIOLET',colors:['#aa8eae','#816585','#d2bace'],bg:'#302c38',leaf:'#7e8b77',shape:5},
{name:'Camellia',latin:'CAMELLIA',mood:'ANTIQUE CRIMSON',colors:['#b96372','#d59299','#e9b8ad'],bg:'#302c2a',leaf:'#6f8667',shape:6},
{name:'Daisy',latin:'BELLIS',mood:'PEARL & HONEY',colors:['#eee6cd','#c9b572','#fff6df'],bg:'#303a31',leaf:'#8e9b6f',shape:7},
{name:'Hydrangea',latin:'HYDRANGEA',mood:'PORCELAIN BLUE',colors:['#9bbcc9','#718da9','#c8dbe1'],bg:'#22353b',leaf:'#7b9890',shape:8},
{name:'Pot marigold',latin:'CALENDULA',mood:'AMBER GLOW',colors:['#d6a75d','#bc8748','#edd294'],bg:'#363327',leaf:'#8b9268',shape:9}];


const petalShapes=[
'M0 0C-3 -6 -16 -12 -15 -25C-14 -37 -4 -40 0 -29C5 -40 16 -35 15 -24C14 -12 3 -6 0 0Z',
'M0 0C-4 -8 -16 -14 -14 -26C-12 -34 -7 -32 -5 -37C0 -32 4 -40 8 -34C19 -26 12 -11 0 0Z',
'M0 0C-9 -11 -13 -25 0 -42C13 -25 9 -11 0 0Z',
'M0 0C-5 -8 -20 -13 -19 -27Q-20 -35 -13 -33Q-12 -41 -6 -36Q-2 -43 2 -36Q8 -42 11 -34Q20 -36 19 -27C18 -13 5 -8 0 0Z',
'M0 0C-4 -8 -15 -14 -13 -29Q-10 -39 -3 -36L0 -26L3 -36Q12 -39 14 -29C15 -15 4 -8 0 0Z',
'M0 0C-6 -5 -17 -12 -14 -26C-12 -37 -3 -38 0 -33C9 -39 18 -30 13 -20C10 -11 3 -5 0 0Z',
'M0 0C-4 -8 -16 -14 -15 -27C-13 -39 1 -39 7 -35C19 -31 17 -19 10 -12C5 -7 2 -4 0 0Z',
'M0 0C-5 -12 -8 -29 -5 -39Q0 -46 5 -39C8 -29 5 -12 0 0Z',
'M0 0C-3 -5 -15 -11 -14 -24C-13 -35 -2 -38 0 -31C5 -38 16 -32 14 -22C12 -11 3 -5 0 0Z',
'M0 0C-4 -11 -10 -24 -7 -36L-3 -39L0 -36L3 -39L7 -36C10 -24 4 -11 0 0Z'];

const petalPaths=petalShapes.map(p=>new Path2D(p));
let flowerPoints=[];
function makeFlowerPoints(index){const mask=document.createElement('canvas');mask.width=256;mask.height=256;const m=mask.getContext('2d',{willReadFrequently:true});m.fillStyle='#fff';
 const petal=(x,y,angle,scale,width=1)=>{m.save();m.translate(x,y);m.rotate(angle);m.scale(scale*width,scale);m.fill(petalPaths[index]);m.globalCompositeOperation='destination-out';m.lineWidth=.75;m.stroke(petalPaths[index]);m.restore();};
 const ring=(n,r,scale,offset=0,width=1,x=128,y=128)=>{for(let k=0;k<n;k++){const a=k*Math.PI*2/n+offset;petal(x+Math.sin(a)*r,y-Math.cos(a)*r,a,scale,width);}};
 if(index===0){ring(8,12,2.05);ring(7,7,1.4,.38);ring(5,3,.8,.7);}
 else if(index===1){ring(3,9,2.15,.5,1.05);ring(3,4,1.65,Math.PI/3+.5,.62);}
 else if(index===2)ring(6,0,2.55,0,.93);
 else if(index===3){ring(12,11,2.05,.1,1.12);ring(10,7,1.65,.36,1.06);ring(8,3,1.2,.62);ring(6,0,.75,.88);}
 else if(index===4)ring(5,4,2.45,0,1.1);
 else if(index===5){ring(5,3,2.3,.2);petal(128,137,Math.PI,2.5,1.2);}
 else if(index===6){ring(10,11,2.25);ring(8,4,1.5,.35);ring(5,0,.85,.65);}
 else if(index===7){ring(16,13,2.15);m.beginPath();m.arc(128,128,20,0,Math.PI*2);m.fill();}
 else if(index===8){for(const [x,y] of [[128,128],[90,91],[166,91],[88,161],[167,161]])ring(4,0,1.18,.45,1,x,y);}
 else{ring(20,13,2.2);ring(15,7,1.65,.15);ring(10,1,1.05,.35);}
 m.beginPath();m.arc(128,128,index===8?5:12,0,Math.PI*2);m.fill();const data=m.getImageData(0,0,256,256).data;flowerPoints=[];
 for(let y=0;y<256;y++)for(let x=0;x<256;x++)if(data[(y*256+x)*4+3]>200)flowerPoints.push({x:(x-128)/256,y:(y-128)/256});
}

function geometryFor(index){makeFlowerPoints(index);return flowerPoints.map(p=>({...p}));}
