
var socket = io.connect();
socket.emit('test',1);

//-----------------------    

// scene object variables
var renderer, scene, camera, pointLight, spotLight;

// field variables
var fieldWidth = 400, fieldHeight = 200;

// paddle variables
var paddleWidth, paddleHeight, paddleDepth, paddleQuality;
var paddle1DirY = 0, paddle2DirY = 0, paddleSpeed = 1;

// ball variables
var ball, paddle1, paddle2;
var ballDirX = 2, ballDirY = 2, ballSpeed = 2;

var score1 = 0, score2 = 0;
var maxScore = 3;


var can_move = false;



/**********************************************************

					Setup The Game

***********************************************************/

function setup()
{
	document.getElementById("winnerBoard").innerHTML = "First to " + maxScore + " wins!";

	score1 = -1;
	score2 = -1;

	init();
	
	animate();
}

function animate()
{
	renderer.render(scene, camera);
	requestAnimationFrame(animate);
	
	start();
	ballPhysics();
	paddlePhysics();
	cameraPhysics();
	playerPaddleMovement();
	stats.update();
}

function init()
{

	
	timeout();
	
	// set the scene size
	var WIDTH = 960,
	  HEIGHT = 540;

	// set some camera attributes
	var VIEW_ANGLE = 75,
	  ASPECT = WIDTH / HEIGHT,
	  NEAR = 0.1,
	  FAR = 10000;

	var c = document.getElementById("gameCanvas");
	var stats_c = document.createElement("stat");
	document.body.appendChild( stats_c );

	// create a WebGL renderer, camera
	// and a scene
	renderer = new THREE.WebGLRenderer();
	camera =
	  new THREE.PerspectiveCamera(
		VIEW_ANGLE,
		ASPECT,
		NEAR,
		FAR);

	scene = new THREE.Scene();

	scene.add(camera);
	camera.rotation.z = (-180) * Math.PI/180;
	camera.position.z = 350;
	
	renderer.setSize(WIDTH, HEIGHT);

	c.appendChild(renderer.domElement);
	

	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.top = '0px';
	stats_c.appendChild( stats.domElement );

	// set up the playing surface plane 
	var planeWidth = fieldWidth,
		planeHeight = fieldHeight,
		planeQuality = 10;
		
	// create the paddle1's material
	var paddle1Material =
	  new THREE.MeshLambertMaterial(
		{
		  color: 0x1B32C0
		});
	// create the paddle2's material
	var paddle2Material =
	  new THREE.MeshLambertMaterial(
		{
		  color: 0xFF4045
		});
	var paddle1MaterialGhost =
	  new THREE.MeshLambertMaterial(
		{
		  color: 0x1B32C0,
		  transparent: true,
		  opacity:0
		});
	// create the plane's material	
	var planeMaterial =
	  new THREE.MeshLambertMaterial(
		{
		  color: 0xFFFFFF,
		  ambient: 0xFFFFFF,
		  emissive: 0x000000,
		  map: THREE.ImageUtils.loadTexture('bg/planeMaterial_bg.png')
		});
	// create the table's material
	var tableMaterial =
	  new THREE.MeshLambertMaterial(
		{
		  color: 0x111111
		});
	// create the pillar's material
	var pillarMaterial =
	  new THREE.MeshLambertMaterial(
		{
		  color: 0x534d0d
		});
	// create the ground's material
	var groundMaterial =
	  new THREE.MeshLambertMaterial(
		{
		  color: 0xFFFFFF
		});
		
	var CylinderMaterial =
	  new THREE.MeshPhongMaterial(
		{
		  color: 0xFFFFFF,
		  ambient: 0xFFFFFF,
		  emissive: 0x000000,
		  specular: 0x111111,
		  shininess: 30,
		});
		
		
			
	/**********************************************************
	
							Modules
	
	***********************************************************/
		
		
	// create the playing surface plane
	var plane = new THREE.Mesh(new THREE.PlaneGeometry(planeWidth, planeHeight, planeQuality, planeQuality),  planeMaterial);
	scene.add(plane);	
	plane.receiveShadow = true;	
	
	
	
	
	var table = new THREE.Mesh(	new THREE.CubeGeometry(planeWidth + 15, planeHeight + 15, 20, planeQuality, planeQuality, 1), tableMaterial);
	table.position.z = -11;
	scene.add(table);
	table.receiveShadow = true;	
	
	var table_right__bottom = new THREE.Mesh(	new THREE.CubeGeometry(15, 15 + planeHeight/4 +4, planeWidth * .12, planeQuality, planeQuality, 1), tableMaterial);
	table_right__bottom.position.x = (planeWidth/2 + 15/2);
	table_right__bottom.position.y = -(planeHeight/2 -15  );
	table_right__bottom.position.z = planeWidth * .06 - 16;
	scene.add(table_right__bottom);
	
	var table_right__top = new THREE.Mesh(	new THREE.CubeGeometry(15, 15 + planeHeight/4 +4, planeWidth * .12, planeQuality, planeQuality, 1), tableMaterial);
	table_right__top.position.x = (planeWidth/2 + 15/2);
	table_right__top.position.y = (planeHeight/2 -15  );
	table_right__top.position.z = planeWidth * .06 - 16;
	scene.add(table_right__top);

	
	
	
	var table_left__bottom = new THREE.Mesh(	new THREE.CubeGeometry(10, 15 + planeHeight/4 , planeWidth * .12, planeQuality, planeQuality, 1), tableMaterial);
	table_left__bottom.position.x = -(planeWidth/2 + 15/2);
	table_left__bottom.position.y = -(planeHeight/2  - 17.5 );
	table_left__bottom.position.z = planeWidth * .06 - 16;
	scene.add(table_left__bottom);
	
	var table_left__top = new THREE.Mesh(	new THREE.CubeGeometry(10, 15 + planeHeight/4 +4, planeWidth * .12, planeQuality, planeQuality, 1), tableMaterial);
	table_left__top.position.x = -(planeWidth/2 + 15/2);
	table_left__top.position.y = (planeHeight/2 - 19.5  );
	table_left__top.position.z = planeWidth * .06 - 16;
	scene.add(table_left__top);

	// // set up the sphere vars
	// lower 'segment' and 'ring' values will increase performance
	var radius = 10,
		segments = 4,
		rings = 4;
		
	// // create the sphere's material
	var sphereMaterial =
	  new THREE.MeshLambertMaterial(
		{
		  color: 0xFFFFFF,
		  ambient: 0xFFFFFF,
		  emissive: 0x000000,
		  // map:null
		  map: THREE.ImageUtils.loadTexture('bg/soccer_ball.jpg')
		});
		
		
	/***************** 		BALL	*******************/
		
	// Create a ball with sphere geometry
	ball = new THREE.Mesh(
	  new THREE.SphereGeometry(
		radius,
		segments,
		rings),
	  sphereMaterial);

	// // add the sphere to the scene
	scene.add(ball);
		
	ball.position.x = 0;
	ball.position.y = 0;
	// set ball above the table surface
	ball.position.z = radius;
	// ball.receiveShadow = true;
    // ball.castShadow = true;
	
	
	
	daste1 = new THREE.Object3D();
	scene.add(daste1);
	daste2 = new THREE.Object3D();
	scene.add(daste2);
	

	/***************		paddle		***************/
	
	
	// // set up the paddle vars
	paddleWidth = 15;
	paddleHeight = 60;
	paddleDepth = 20;
	paddleQuality = 1;
		
	paddle1 = new THREE.Mesh(
	  new THREE.CubeGeometry(
		paddleWidth,
		paddleHeight,
		paddleDepth,
		paddleQuality,
		paddleQuality,
		paddleQuality),
	  paddle1MaterialGhost);

	// // add the sphere to the scene
	scene.add(paddle1);
	
	paddle1Daste = new THREE.Mesh(
	  new THREE.CubeGeometry(
		paddleWidth,
		paddleHeight,
		paddleDepth,
		paddleQuality,
		paddleQuality,
		paddleQuality),
	  paddle1Material);

	// // add the sphere to the scene
	daste1.add(paddle1Daste);
	paddle1Daste.receiveShadow = true;
    paddle1Daste.castShadow = true;


	
	paddle2 = new THREE.Mesh(
	  new THREE.CubeGeometry(
		paddleWidth,
		paddleHeight,
		paddleDepth,
		paddleQuality,
		paddleQuality,
		paddleQuality),
	  paddle1MaterialGhost);
	  
	// // add the sphere to the scene
	scene.add(paddle2);
	
	paddle2Daste = new THREE.Mesh(
	  new THREE.CubeGeometry(
		paddleWidth,
		paddleHeight,
		paddleDepth,
		paddleQuality,
		paddleQuality,
		paddleQuality),
	  paddle2Material);
	  
	// // add the sphere to the scene
	daste2.add(paddle2Daste);
	paddle2Daste.receiveShadow = true;
    paddle2Daste.castShadow = true;
	
	// set paddles on each side of the table
	paddle1.position.x = -fieldWidth/2 + paddleWidth + 50;
	paddle2.position.x = fieldWidth/2 - paddleWidth - 50;
	
	// lift paddles over playing surface
	paddle1.position.z = paddleDepth;
	paddle2.position.z = paddleDepth;
	
	// set paddles on each side of the table
	daste1.position.x = -fieldWidth/2 + paddleWidth + 50;
	daste2.position.x = fieldWidth/2 - paddleWidth - 50;
	
	paddle1Daste.position.x = 0;
	paddle2Daste.position.x = 0;
	
	// lift paddles over playing surface
	var cylinderRadius = 3;
	daste1.position.z = paddleDepth + (cylinderRadius * 2);
	daste2.position.z = paddleDepth + (cylinderRadius * 2);
	
	paddle1Daste.position.z -= (cylinderRadius * 2);
	paddle2Daste.position.z -= (cylinderRadius * 2);
	
	
	// white cylinder
	
	var CylinderGeometry =	new THREE.CylinderGeometry(cylinderRadius, cylinderRadius, planeHeight * 2, planeQuality);
	var cylinder1 = new THREE.Mesh(CylinderGeometry, CylinderMaterial);
	cylinder1.position.set(paddle1Daste.position.x, paddle1Daste.position.y, 0 );
	daste1.add(cylinder1);
	
	var cylinder2 = new THREE.Mesh(CylinderGeometry, CylinderMaterial);
	cylinder2.position.set(paddle2Daste.position.x, paddle2Daste.position.y, 0 );
	daste2.add(cylinder2);
	
	
	// head of paddles
	var CylinderGeometry =	new THREE.SphereGeometry(paddleWidth / 1.5, 32, 16, 0, 2* Math.PI, 0, Math.PI);
	var sphere1 = new THREE.Mesh(CylinderGeometry, paddle1Material);
	sphere1.position.set(paddle1Daste.position.x, paddle1Daste.position.y, paddleWidth / 1.5 * 2 - (cylinderRadius * 2));
	daste1.add(sphere1);
	
	var sphere2 = new THREE.Mesh(CylinderGeometry, paddle2Material);
	sphere2.position.set(paddle2Daste.position.x, paddle2Daste.position.y, paddleWidth / 1.5 * 2 - (cylinderRadius * 2));
	daste2.add(sphere2);
	
	
	// big daste
	var CylinderGeometry =	new THREE.CylinderGeometry(cylinderRadius*5, cylinderRadius*5, planeHeight/3, planeQuality);
	var cylinder1_daste = new THREE.Mesh(CylinderGeometry, paddle1Material);
	cylinder1_daste.position.set(cylinder1.position.x, (planeHeight + cylinderRadius*5 + 20), cylinder1.position.z);
	daste1.add(cylinder1_daste);
	
	var cylinder2_daste = new THREE.Mesh(CylinderGeometry, paddle2Material);
	cylinder2_daste.position.set(cylinder2.position.x, -(planeHeight + cylinderRadius*5 + 20), cylinder2.position.z);
	daste2.add(cylinder2_daste);
	
	
	// big micro daste 
	var CylinderGeometry =	new THREE.CylinderGeometry(cylinderRadius*8, cylinderRadius*8, planeHeight/60, planeQuality);
	var cylinder1_daste_micro = new THREE.Mesh(CylinderGeometry, paddle1Material);
	cylinder1_daste_micro.position.set(cylinder1.position.x, (planeHeight + cylinderRadius*5 - 15), cylinder1.position.z);
	daste1.add(cylinder1_daste_micro);
	
	var cylinder2_daste_micro = new THREE.Mesh(CylinderGeometry, paddle2Material);
	cylinder2_daste_micro.position.set(cylinder2.position.x, -(planeHeight + cylinderRadius*5 - 15), cylinder2.position.z);
	daste2.add(cylinder2_daste_micro);
	
	
	
    cylinder1.castShadow = true;
    cylinder1_daste_micro.castShadow = true;
	cylinder1_daste.castShadow = true;
	sphere1.castShadow = true;
	
	cylinder2.castShadow = true;
    cylinder2_daste_micro.castShadow = true;
	cylinder2_daste.castShadow = true;
	sphere2.castShadow = true;
		

	
	
	var ground = new THREE.Mesh(
	  new THREE.CubeGeometry(5000, 2000, 3, 1, 1, 1), groundMaterial);
	  
    // set ground to arbitrary z position to best show off shadowing
	ground.position.z = -100;	
	scene.add(ground);		
	
	
		
	/**********************************************************
	
						Camera Logics
	
	***********************************************************/
	
	//					LIGHTS
		
	// create a point light
	pointLight =
	  new THREE.PointLight(0xFFFFFF);

	// set its position
	pointLight.position.x = -1000;
	pointLight.position.y = 0;
	pointLight.position.z = 0;
	pointLight.intensity = .5;
	pointLight.distance = 1000;
	// add to the scene
	scene.add(pointLight);
	
	pointLight2 =
	  new THREE.PointLight(0xFFFFFF);

	// set its position
	pointLight2.position.x = 1000;
	pointLight2.position.y = 0;
	pointLight2.position.z = 10000;
	pointLight2.intensity = .5;
	pointLight2.distance = 100000;
	// add to the scene
	scene.add(pointLight2);
		
	// add a spot light
    spotLight = new THREE.SpotLight(0xFFFFFF);
    spotLight.position.set(0, 0, 460);
    spotLight.intensity = 1.5;
    spotLight.castShadow = true;
    scene.add(spotLight);
	
	// MAGIC SHADOW CREATOR DELUXE EDITION with Lights PackTM DLC
	renderer.shadowMapEnabled = true;	
}




	//					Camera
function cameraPhysics()
{
	spotLight.position.x = ball.position.x;
	spotLight.position.y = ball.position.y;
	spotLight.position.z = ball.position.z + 600;
	
	
	if(camera.position.x >= paddle1.position.x - 150)
		camera.position.x -= 10;
	camera.position.y += (paddle1.position.y - camera.position.y) * .2;
	if(camera.position.z > paddle1.position.z + 210)
		camera.position.z -=(paddle1.position.z + 200)/70;
	else
	camera.position.z = paddle1.position.z + 200 + 0.1 * ( paddle1.position.x - ball.position.x );
			
	camera.rotation.x = -0.01 * (ball.position.y) * Math.PI/180;
	if(camera.rotation.y >= -45 * Math.PI/180)
		camera.rotation.y += -2 * Math.PI/180;
	if(camera.rotation.z <= (-90) * Math.PI/180)
		camera.rotation.z += 2 * Math.PI/180;
}



/**********************************************************

				MOVEMENT OF THE Ball

***********************************************************/

function ballPhysics()
{
	if(can_move){
	// if ball goes off your side
	if (ball.position.x <= -fieldWidth/2)
	{	
		if ((ball.position.y >= -fieldHeight/4 + 10) && (ball.position.y <= fieldHeight/4 - 10)){
			score2++;
			document.getElementById("scores").innerHTML = "<span class='red'>" + score2 + "</span>-<span class='blue'>" + score1 + "</span>";
			// reset ball to center
			resetBall(2);
			can_move = false ;
			matchScoreCheck();	
		}else{
			ballDirX = -ballDirX;
			ball.rotation.x = -ball.rotation.x;
		}
	}
	
	// if ball goes off the apponent side
	if (ball.position.x >= fieldWidth/2)
	{	
		if ((ball.position.y >= -fieldHeight/4 + 10) && (ball.position.y <= fieldHeight/4 - 10)){
			score1++;
			document.getElementById("scores").innerHTML = "<span class='red'>" + score2 + "</span>-<span class='blue'>" + score1 + "</span>";
			// reset ball to center
			resetBall(1);
			can_move = false ;
			matchScoreCheck();	
		}else{
			ballDirX = -ballDirX;
			ball.rotation.x = -ball.rotation.x;
		}
	}
	
	// if ball goes off the top side (side of table)
	if (ball.position.y <= -fieldHeight/2 + 10 )
	{
		ballDirY = -ballDirY;
		ball.rotation.y = -ball.rotation.y;
	}	
	// if ball goes off the bottom side (side of table)
	if (ball.position.y >= fieldHeight/2 - 10)
	{
		ballDirY = -ballDirY;
		ball.rotation.y = -ball.rotation.y;
	}
		
	
		// update ball position
		ball.position.x += ballDirX * ballSpeed;
		ball.position.y += ballDirY * ballSpeed;
		
		// rotation of the ball
		if(ball.rotation.y < 0)
		ball.rotation.y -= ballSpeed * 1;
		else
		ball.rotation.y += ballSpeed * 1;
		
		if(ball.rotation.x < 0)
		ball.rotation.X -= ballSpeed * 1;
		else
		ball.rotation.X += ballSpeed * 1;
		
		if(ball.rotation.y < 0)
		ball.rotation.y -= ballSpeed * 0.075;
		else
		ball.rotation.y += ballSpeed * 0.075;
		
		if(ball.rotation.x < 0)
		ball.rotation.X -= ballSpeed * 0.075;
		else
		ball.rotation.X += ballSpeed * 0.075;
		
	}
	
	// 因為切球拿掉所以這裡都用1不影響
	if (ballDirY > ballSpeed * 1)
	{
		ballDirY = ballSpeed * 1;
		ball.rotation.x = ballSpeed * 1;
		ball.rotation.y = ballSpeed * 1;
	}
	else if (ballDirY < -ballSpeed * 1)
	{
		ballDirY = -ballSpeed * 1;
		ball.rotation.x = -ballSpeed *1;
		ball.rotation.y = -ballSpeed * 1;
	}
	
	
}


/**********************************************************

				MOVEMENT OF THE PADDLES

***********************************************************/

var _Y1  ;
var _Y2  ; 
	
// Socket events
socket.on('Move', function (Y1,Y2) {
	_Y1 =  -1*Y1 ;
	_Y2 = -1*Y2;

});
	
function timeout() {
    setTimeout(function () {
    	console.log("test");
		paddle2.position.y =  _Y1 ; 
     	daste2.position.y = _Y2; 
        timeout();
    }, 1);
}


function playerPaddleMovement()
{
	if(1){
		if (Key.isDown(Key.LEFTARROW))		
		{
			if (paddle1.position.y < fieldHeight * 0.4)
			{ // not touching the side
				paddle1DirY = paddleSpeed * 1.5;
			}
			else
			{
				paddle1DirY = 0;
			}

		}	
		else if (Key.isDown(Key.RIGHTARROW))
		{
			if (paddle1.position.y > -fieldHeight * 0.4)
			{ // not touching the side
				paddle1DirY = -paddleSpeed * 1.5;
			}
			else
			{
				paddle1DirY = 0;
			}
		}

		else
		{
			paddle1DirY = 0;
		}

		paddle1.position.y += paddle1DirY;
		daste1.position.y += paddle1DirY;
		
	    socket.emit("Move",paddle1.position.y,daste1.position.y);
	}
}


function paddlePhysics()
{
	// PLAYER PADDLE LOGIC
	if (ball.position.y <= paddle1.position.y + paddleHeight/2
	&&  ball.position.y >= paddle1.position.y - paddleHeight/2)
	{
		if (ballDirX < 0)
		{
			if (ball.position.x <= paddle1.position.x + paddleWidth
			&&  ball.position.x >= paddle1.position.x)
			{
				ballDirX = -ballDirX;
				ball.rotation.x = -ball.rotation.x;
				// 切球部分因難同步暫時拿掉
				/*
				if(ball.position.y < 0)
				ballDirY += paddle1DirY * 0.7;
				else
				ballDirY -= paddle1DirY * 0.7;
				*/
				document.getElementById('ding').play();
			}
		}
		else 
			if (ball.position.x >= paddle1.position.x - paddleWidth
			&&  ball.position.x <= paddle1.position.x)
			{
				ballDirX = -ballDirX;
				ball.rotation.x = -ball.rotation.x;
				/*
				if(ball.position.y < 0)
				ballDirY += paddle1DirY * 0.7;
				else
				ballDirY -= paddle1DirY * 0.7;
				*/
				document.getElementById('ding').play();
			}
	}
	
	
	// OPPONENT PADDLE LOGIC
	if (ball.position.y <= paddle2.position.y + paddleHeight/2
	&&  ball.position.y >= paddle2.position.y - paddleHeight/2)
	{
		if (ballDirX > 0)
		{
			if (ball.position.x >= paddle2.position.x - paddleWidth
			&&  ball.position.x <= paddle2.position.x)
			{
				ballDirX = -ballDirX;
				ball.rotation.x = -ball.rotation.x;
				/*
				if(ball.position.y < 0)
				ballDirY += paddle1DirY * 0.7;
				else
				ballDirY -= paddle1DirY * 0.7;
				*/
				document.getElementById('ding').play();
			}
		}else if (ball.position.x <= paddle2.position.x + paddleWidth
			&&  ball.position.x >= paddle2.position.x)
			{
				ballDirX = -ballDirX;
				ball.rotation.x = -ball.rotation.x;
				/*
				if(ball.position.y < 0)
				ballDirY += paddle1DirY * 0.7;
				else
				ballDirY -= paddle1DirY * 0.7;
				*/
				document.getElementById('ding').play();
			}
	}
}


/**********************************************************

				Progress after Scored

***********************************************************/


function resetBall(loser)
{
	ball.position.x = 0;
	ball.position.y = 0;

	// player lost
	if (loser == 1)
	{
		ballDirX = -1;
		ballDirY = 1;
	}
	// opponent lost
	else
	{
		ballDirX = 1;
		ballDirY = -1;
	}
}


// checks if either player or opponent has reached MAX points
function matchScoreCheck()
{
	if (score1 >= maxScore)
	{
		// stop the ball
		can_move = false;
		// write to the banner
		document.getElementById("scores").innerHTML = "You Win!";		
		document.getElementById("winnerBoard").innerHTML = "Refresh to play again";
	}
	else if (score2 >= maxScore)
	{
		// stop the ball
		can_move = false;
		// write to the banner
		document.getElementById("scores").innerHTML = "<span style='color:red;'>You Lose!</span>";
		document.getElementById("winnerBoard").innerHTML = "Refresh to play again";
	}
}

var status = false;

function start(){
	if (score2 < maxScore && score1 < maxScore)
	if (Enter_isUp)		
	{
		socket.emit("Start");
		
		setTimeout(function(){
			can_move = true;
			
			Enter_isUp = false;
		}, 1);
		
	}
}

var socket_ball = 1 ;

// Socket events
socket.on('Start', function () {
	can_move = true;
	Enter_isUp = false;
	 socket_ball = 1 ;
	 resetBall(socket_ball);
});

var first_run = true;
var charkhesh = 10 * Math.PI/180;



window.addEventListener('keyup', function( ev ) {
			switch( ev.keyCode ) {
				case 13:// Enter
				Enter_isUp = true;
				break;
			}
		}, false
	);
	

