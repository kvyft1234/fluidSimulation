var ctx = document.querySelectorAll('canvas')[0].getContext('2d');
var mkTensor = function(a,...b){return b.length==0 ? Array(a).fill(0):Array(a).fill(0).map(i=>mkTensor(...b))};
var mkVecAndFill = function(n,x){return mkTensor(n).map(i=>x)};
var clone = function(arr){return JSON.parse(JSON.stringify(arr))};
var vectorSum = function(v1,v2){let r=[]; for(let i=0; i<v1.length; i++){r.push(v1[i]+v2[i])} return r};
var vectorSub = function(v1,v2){let r=[]; for(let i=0; i<v1.length; i++){r.push(v1[i]-v2[i])} return r};
var vectorPdt = function(v1,v2){let r=[]; for(let i=0; i<v1.length; i++){r.push(v1[i]*v2[i])} return r};
var vectorDvd = function(v1,v2){let r=[]; for(let i=0; i<v1.length; i++){r.push(v1[i]/v2[i])} return r};
var vectorExp = function(v1,v2){let r=[]; for(let i=0; i<v1.length; i++){r.push(v1[i]**v2[i])} return r};
var vecOpr = function(t,...v){
	let o=Array.from(t);
	let r=v[0];
	for(let i=0; i<o.length; i++){
		if(o[i]=='+')r=vectorSum(r,v[i+1]);
		if(o[i]=='-')r=vectorSub(r,v[i+1]);
		if(o[i]=='*')r=vectorPdt(r,v[i+1]);
		if(o[i]=='/')r=vectorDvd(r,v[i+1]);
		if(o[i]=='^')r=vectorExp(r,v[i+1]);
	}
	return r;
}; // +-*/^
var summation = function(arr){let s=0; for(let i=0; i<arr.length; i++){s+=arr[i]} return s;};
var ucdDistance = function(v1,v2){let r=0; for(let i=0; i<v1.length; i++){r+=(v1[i]-v2[i])**2} return r**0.5;};
var cl = function(i,...j){console.log(clone([i,...j])); return i};
var qngh = function(x){return x>0 ? 1:(x==0 ? 0:-1)};

var field = mkTensor(20,20,2);
var particle = mkTensor(200).map(i=>[Math.random()*10+5,Math.random()*10+5,10*(Math.random()-0.5),10*(Math.random()-0.5)]);

var PressConst = 0.00000001;
var ViscosityConst = 100;

var deltaTime = 0.1;
// var deltaGap = 1;

function pressVectorInParticle(){
	let prs = mkTensor(particle.length);
	for(let i=0; i<prs.length; i++){
		prs[i] = (particle[i][2]**2+particle[i][3]**2);
	}
	return prs;
}
function injectionInGrid(){
	let prs = pressVectorInParticle();
	let r = mkTensor(field.length,field.length);
	field = mkTensor(20,20,2);
	let n,m,dx,dy,lt,rt,lb,rb,t;
	for(let i=0; i<prs.length; i++){
		t = particle[i];
		n = Math.floor(t[0]-0.5);
		m = Math.floor(t[1]-0.5);
		dx = t[0]-n-0.5;
		dy = t[1]-m-0.5;
		lt = (1-dx)*(1-dy);
		rt = dx*(1-dy);
		lb = (1-dx)*dy;
		rb = dx*dy;
		n = n<0?0:n;
		m = m<0?0:m;
		n = n>field.length-1?field.length-1:n;
		m = m>field.length-1?field.length-1:m;
		r[n][m] += lt*prs[i];
		if(n<field.length-1)r[n+1][m] += rt*prs[i];
		if(m<field.length-1)r[n][m+1] += lb*prs[i];
		if(n<field.length-1 && m<field.length-1)r[n+1][m+1] += rb*prs[i];
	}
	for(let i=0; i<prs.length; i++){
		t = particle[i];
		n = Math.floor(t[0]-0.5);
		m = Math.floor(t[1]-0.5);
		dx = t[0]-n-0.5;
		dy = t[1]-m-0.5;
		lt = (1-dx)*dy;
		rt = dx*dy;
		lb = (1-dx)*(1-dy);
		rb = dx*(1-dy);
		n = n<0?0:n;
		m = m<0?0:m;
		n = n>field.length-1?field.length-1:n;
		m = m>field.length-1?field.length-1:m;
		field[n][m][0] += lt*particle[i][2];
		if(n<field.length-1)field[n+1][m][0] += rt*particle[i][2];
		if(m<field.length-1)field[n][m+1][0] += lb*particle[i][2];
		if(n<field.length-1 && m<field.length-1)field[n+1][m+1][0] += rb*particle[i][2];
		field[n][m][1] += lt*particle[i][3];
		if(n<field.length-1)field[n+1][m][1] += rt*particle[i][3];
		if(m<field.length-1)field[n][m+1][1] += lb*particle[i][3];
		if(n<field.length-1 && m<field.length-1)field[n+1][m+1][1] += rb*particle[i][3];
	}
	return r;
}
function nextFrame(){
	let prsField = injectionInGrid();
	let velocityField = clone(field);
	let ptc = clone(particle);
	let fl = field.length-1;
	for(let i=1; i<field.length-1; i++){
		for(let j=1; j<field[0].length-1; j++){
			velocityField[i][j][0] = field[i][j][0] + deltaTime*(-(field[i+1][j][0]-field[i][j][0])*(field[i][j][0]+field[i][j][1]) - PressConst*(prsField[i+1][j]-prsField[i][j]) + ViscosityConst*(field[i+1][j][0]-2*field[i][j][0]+field[i-1][j][0] + field[i][j+1][0]-2*field[i][j][0]+field[i][j-1][0]));
			velocityField[i][j][1] = field[i][j][1] + deltaTime*(-(field[i][j+1][1]-field[i][j][1])*(field[i][j][0]+field[i][j][1]) - 1 - PressConst*(prsField[i][j+1]-prsField[i][j]) + ViscosityConst*(field[i+1][j][1]-2*field[i][j][1]+field[i-1][j][1] + field[i][j+1][1]-2*field[i][j][1]+field[i][j-1][1]));
		}
	}
	for(let i=1; i<field.length-1; i++){
		velocityField[i][0][0] = velocityField[i][1][0];
		velocityField[i][0][1] = -velocityField[i][1][1];

		velocityField[i][fl][0] = velocityField[i][fl-1][0];
		velocityField[i][fl][1] = -velocityField[i][fl-1][0];

		velocityField[0][i][0] = -velocityField[1][i][0];
		velocityField[0][i][1] = velocityField[1][i][1];

		velocityField[fl][i][0] = -velocityField[fl-1][i][0];
		velocityField[fl][i][1] = velocityField[fl-1][i][1];
	}
	velocityField[0][0][0] = -velocityField[1][1][0];
	velocityField[0][0][1] = -velocityField[1][1][1];
	velocityField[fl][0][0] = -velocityField[fl-1][1][0];
	velocityField[fl][0][1] = -velocityField[fl-1][1][1];
	velocityField[0][fl][0] = -velocityField[1][fl-1][0];
	velocityField[0][fl][1] = -velocityField[1][fl-1][1];
	velocityField[fl][fl][0] = -velocityField[fl-1][fl-1][0];
	velocityField[fl][fl][1] = -velocityField[fl-1][fl-1][1];

	let m,n,dx,dy,lt,lb,rt,rb;
	for(let i=0; i<ptc.length; i++){
		m = Math.floor(ptc[i][0]);
		n = Math.floor(ptc[i][1]);
		dx = ptc[i][0]-m;
		dy = ptc[i][1]-n;
		lt = (1-dx)*dy;
		rt = dx*dy;
		lb = (1-dx)*(1-dy);
		rb = dx*(1-dy);
		n = n<0?0:n;
		m = m<0?0:m;
		if(m<velocityField.length-1 && n<velocityField.length-1)ptc[i][2] += deltaTime * (lb*velocityField[m][n][0] + rb*velocityField[m+1][n][0] + lt*velocityField[m][n+1][0] + rt*velocityField[m+1][n+1][0]);
		if(m<velocityField.length-1 && n<velocityField.length-1)ptc[i][3] += deltaTime * (lb*velocityField[m][n][1] + rb*velocityField[m+1][n][1] + lt*velocityField[m][n+1][1] + rt*velocityField[m+1][n+1][1]);
	}
	for(let i=0; i<ptc.length; i++){
		if(ptc[i][0] + deltaTime * particle[i][2] < 0){
			ptc[i][2] *= qngh(particle[i][2]) * 0.5;
		}else if(ptc[i][0] + deltaTime * particle[i][2] > 1000){
			ptc[i][2] *= -qngh(particle[i][2]) * 0.5;
		}
		if(ptc[i][1] + deltaTime * particle[i][3] < 0){
			ptc[i][3] *= qngh(particle[i][3]) * 0.5;
		}else if(ptc[i][1] + deltaTime * particle[i][3] > 1000){
			ptc[i][3] *= -qngh(particle[i][3]) * 0.5;
		}
		ptc[i][0] += deltaTime * ptc[i][2];
		ptc[i][1] += deltaTime * ptc[i][3];
	}
	field = velocityField;
	particle = ptc;
};

function drawCanvas(v){
	ctx.beginPath();
	ctx.arc(v[0]*50,(1000-v[1]*50),20,0,6.28);
	ctx.closePath();
	ctx.fill();
};
function projectParticle(){
	ctx.clearRect(0,0,1000,1000);
	for(let i=0; i<particle.length; i++){
		drawCanvas(particle[i]);
	}
};

function renderFrame(){
	nextFrame();
	projectParticle();
}


var timer = setInterval(renderFrame,100);
setTimeout(function(){clearInterval(timer)},100000);






