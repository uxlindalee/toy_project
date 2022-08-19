import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as CANNON from 'cannon-es';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Player } from './Player';
import { House } from './House';
import { Tree } from './tree';
import gsap from 'gsap';
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";

// Texture
const textureLoader = new THREE.TextureLoader();
const floorTexture = textureLoader.load('/images/ocean.jpg');
const matcapTexture = textureLoader.load("/textures/matcaps/7.png");
floorTexture.wrapS = THREE.RepeatWrapping;
floorTexture.wrapT = THREE.RepeatWrapping;
floorTexture.repeat.x = 1;
floorTexture.repeat.y = 1;

/**
 * Fonts
 */
const fontLoader = new FontLoader()

fontLoader.load(
    '/fonts/raleway_black_regular.json',
    (font) =>
    {
        // Material
        // const material = new THREE.MeshBasicMaterial({ color: 0xffffff })
      const material = new THREE.MeshMatcapMaterial({ matcap: matcapTexture });
      
        // Text
        const textGeometry = new TextGeometry(
            'EUNJI LINDA LEE',
            {
                font: font,
                size: 0.6,
                height: 0.2,
                curveSegments: 12,
                bevelEnabled: true,
                bevelThickness: 0.03,
                bevelSize: 0.02,
                bevelOffset: 0,
                bevelSegments: 2
            }
        )
        textGeometry.center()

      const text = new THREE.Mesh(textGeometry, material)
      text.receiveShadow = true;
      text.castShadow = true;
      text.position.set(0.5, 0.4, -1)
        scene.add(text)

        // Donuts
        const donutGeometry = new THREE.TorusGeometry(0.3, 0.2, 32, 64)

        for(let i = 0; i < 100; i++)
        {
            const donut = new THREE.Mesh(donutGeometry, material)
            donut.position.x = (Math.random() - 0.5) * 10
            donut.position.y = (Math.random() - 0.5) * 10
            donut.position.z = (Math.random() - 0.5) * 10
            donut.rotation.x = Math.random() * Math.PI
            donut.rotation.y = Math.random() * Math.PI
            const scale = Math.random()
            donut.scale.set(scale, scale, scale)

            // scene.add(donut)
        }
    }
)

// Renderer
const canvas = document.querySelector('#three-canvas');
const renderer = new THREE.WebGLRenderer({
	canvas,
	antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio > 1 ? 2 : 1);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; //makes shadow with less pixels
 
// Scene
const scene = new THREE.Scene();

// Camera
const camera = new THREE.OrthographicCamera(
	-(window.innerWidth / window.innerHeight), // left
	window.innerWidth / window.innerHeight, // right,
	1, // top
	-1, // bottom
	-1000,
	1000
);

const cameraPosition = new THREE.Vector3(1, 5, 5);
camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
camera.zoom = 0.2;
camera.updateProjectionMatrix();
scene.add(camera);

// Light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
const directionalLightOriginPosition = new THREE.Vector3(1, 1, 1);
directionalLight.position.x = directionalLightOriginPosition.x;
directionalLight.position.y = directionalLightOriginPosition.y;
directionalLight.position.z = directionalLightOriginPosition.z;
directionalLight.castShadow = true; //real light that receives on the object

// mapSize 세팅으로 그림자 퀄리티 설정
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
// 그림자 범위
directionalLight.shadow.camera.left = -100;
directionalLight.shadow.camera.right = 100;
directionalLight.shadow.camera.top = 100;
directionalLight.shadow.camera.bottom = -100;
directionalLight.shadow.camera.near = -100;
directionalLight.shadow.camera.far = 100;
scene.add(directionalLight);

//Controls
// const controls = new OrbitControls(camera, renderer.domElement);

//Cannon
const cannonWorld = new CANNON.World();
cannonWorld.gravity.set(0, -10, 0);


//Contact Material
const defaultMaterial = new CANNON.Material("default");
const rubberMaterial = new CANNON.Material("rubber");
const ironMaterial = new CANNON.Material("iron");

const defaultContactMaterial = new CANNON.ContactMaterial(defaultMaterial, defaultMaterial, {
  friction: 0.5,
  restitution: 0.3,
});
cannonWorld.defaultContactMaterial = defaultContactMaterial;

const rubberDefaultContactMaterial = new CANNON.ContactMaterial(rubberMaterial, defaultMaterial, {
  friction: 0.5,
  restitution: 0.7,
});
cannonWorld.addContactMaterial(rubberDefaultContactMaterial);

const ironDefaultContactMaterial = new CANNON.ContactMaterial(ironMaterial, defaultMaterial, {
  friction: 0.5,
  restitution: 0,
});
cannonWorld.addContactMaterial(ironDefaultContactMaterial);


const floorShape = new CANNON.Plane();
const floorBody = new CANNON.Body({
  mass: 0, //if 1, it passes through plane
  position: new CANNON.Vec3(1, 3, 0),
  shape: floorShape
});
floorBody.quaternion.setFromAxisAngle(
  new CANNON.Vec3(-1.2, 0, 0),
  Math.PI / 2
);
cannonWorld.addBody(floorBody);

//Rectangle Box
const boxShape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5));
const boxBody = new CANNON.Body({
  mass: 1,
  position: new CANNON.Vec3(1, 10, 0),
  material: ironMaterial,
  shape: boxShape,
});
cannonWorld.addBody(boxBody);

//Sphere
const sphereShape = new CANNON.Sphere(0.5);
const sphereBody = new CANNON.Body({
  mass: 1,
  position: new CANNON.Vec3(1, 10, 1),
  shape: sphereShape,
  material: rubberMaterial,
  // material: ironMaterial,
});
cannonWorld.addBody(sphereBody);

// Mesh
const meshes = [];
const floorMesh = new THREE.Mesh(
  new THREE.PlaneGeometry(100, 100),
  new THREE.MeshStandardMaterial({
    // map: floorTexture,
    color: "#719fed",
  })
);
floorMesh.name = 'floor';
floorMesh.rotation.x = -Math.PI/2;
floorMesh.receiveShadow = true; //shadow that shows on the surface plane
scene.add(floorMesh);
meshes.push(floorMesh);


//Physics Box
const boxGeometry = new THREE.BoxGeometry(1, 2, 1);
const boxMaterial = new THREE.MeshMatcapMaterial({ matcap: matcapTexture });
const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
boxMesh.position.y = 0;
boxMesh.receiveShadow = true;
boxMesh.castShadow = true;
scene.add(boxMesh);

//Physics Sphere
const sphereGeometry = new THREE.SphereGeometry(0.5);
const sphereMaterial = new THREE.MeshStandardMaterial({
  color: "seagreen",
});
const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
sphereMesh.position.y = 0;
sphereMesh.castShadow = true;
scene.add(sphereMesh);


//Pointer Mesh
const pointerMesh = new THREE.Mesh(
	new THREE.PlaneGeometry(1, 1),
	new THREE.MeshBasicMaterial({
		color: 'crimson',
		transparent: true,
		opacity: 0.5
	})
);
pointerMesh.rotation.x = -Math.PI/2;
pointerMesh.position.y = 0.01;
pointerMesh.receiveShadow = true;
scene.add(pointerMesh);

const spotMesh = new THREE.Mesh(
	new THREE.PlaneGeometry(3, 3),
	new THREE.MeshStandardMaterial({
		color: 'yellow',
		transparent: true,
		opacity: 0.5
	})
);
spotMesh.position.set(5, 0.005, 5);
spotMesh.rotation.x = -Math.PI/2;
spotMesh.receiveShadow = true;
scene.add(spotMesh);

const gltfLoader = new GLTFLoader();

const house = new House({
  gltfLoader,
  scene,
  modelSrc: "/models/house.glb",
  x: 5,
  y: -1.3,
  z: 2,
});

const tree = new Tree({
  gltfLoader,
  scene,
  modelSrc: "/models/tree.glb",
  x: 7,
  y: 0,
  z: 2,
  scale: 0.01,
});

// const wind = new Wind({
//   gltfLoader,
//   scene,
//   modelSrc: "/models/wind.glb",
//   x: 10,
//   y: 0,
//   z: 5,
//   scale: 0.5,
// });

const player = new Player({
  scene,
	meshes,
	gltfLoader,
  modelSrc: '/models/best-girl.glb',
  scale: 0.01,
});

const raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let destinationPoint = new THREE.Vector3();
let angle = 0;
let isPressed = false; // 마우스를 누르고 있는 상태

// 그리기
const clock = new THREE.Clock();

function draw() {
  const delta = clock.getDelta();

  // console.log(delta);
  let cannonStepTime = 1 / 60;
  if (delta < 0.01) cannonStepTime = 1 / 120;
  cannonWorld.step(cannonStepTime, delta, 3);
  // floorMesh.position.copy(floorBody.position);

  //rectangle
  boxMesh.position.copy(boxBody.position);
  boxMesh.quaternion.copy(boxBody.quaternion);

  //sphere
  sphereMesh.position.copy(sphereBody.position); // location
  sphereMesh.quaternion.copy(sphereBody.quaternion); // rotate

  if (player.mixer) player.mixer.update(delta);

  if (player.modelMesh) {
    camera.lookAt(player.modelMesh.position);
  }

  if (player.modelMesh) {
    if (isPressed) {
      raycasting();
    }

    if (player.moving) {
      // 걸어가는 상태
      angle = Math.atan2(destinationPoint.z - player.modelMesh.position.z, destinationPoint.x - player.modelMesh.position.x);
      player.modelMesh.position.x += Math.cos(angle) * 0.05;
      player.modelMesh.position.z += Math.sin(angle) * 0.05;

      camera.position.x = cameraPosition.x + player.modelMesh.position.x;
      camera.position.z = cameraPosition.z + player.modelMesh.position.z;

      // player.actions[0].stop();
      // player.actions[1].play();
      player.actions[0].play();

      if (Math.abs(destinationPoint.x - player.modelMesh.position.x) < 0.03 && Math.abs(destinationPoint.z - player.modelMesh.position.z) < 0.03) {
        player.moving = false;
        console.log("멈춤");
      }

      if (Math.abs(spotMesh.position.x - player.modelMesh.position.x) < 1.5 && Math.abs(spotMesh.position.z - player.modelMesh.position.z) < 1.5) {
        if (!house.visible) {
          console.log("나와");
          house.visible = true;
          spotMesh.material.color.set("seagreen");
          gsap.to(house.modelMesh.position, {
            duration: 1,
            y: 1,
            ease: "Circ.easeOut",
          });
          gsap.to(camera.position, {
            duration: 1,
            y: 3,
          });
        }
      } else if (house.visible) {
        console.log("들어가");
        house.visible = false;
        spotMesh.material.color.set("yellow");
        gsap.to(house.modelMesh.position, {
          duration: 0.5,
          y: -1.3,
        });
        gsap.to(camera.position, {
          duration: 1,
          y: cameraPosition.y,
        });
      }
    } else {
      // 서 있는 상태
      // player.actions[1].stop();
      // player.actions[0].play();
      player.actions[0].stop();
      // wind.actions[0].play();
    }
  }

  renderer.render(scene, camera);
  renderer.setAnimationLoop(draw);
}

function checkIntersects() {
	// raycaster.setFromCamera(mouse, camera);

	const intersects = raycaster.intersectObjects(meshes);
	for (const item of intersects) {
		if (item.object.name === 'floor') {
			destinationPoint.x = item.point.x;
			destinationPoint.y = 30;
			destinationPoint.z = item.point.z;
			player.modelMesh.lookAt(destinationPoint);

			// console.log(item.point)

			player.moving = true;

			pointerMesh.position.x = destinationPoint.x;
			pointerMesh.position.z = destinationPoint.z;
		}
		break;
	}
}

function setSize() {
	camera.left = -(window.innerWidth / window.innerHeight);
	camera.right = window.innerWidth / window.innerHeight;
	camera.top = 1;
	camera.bottom = -1;

	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.render(scene, camera);
}

// 이벤트
window.addEventListener('resize', setSize);

// 마우스 좌표를 three.js에 맞게 변환
function calculateMousePosition(e) {
	mouse.x = e.clientX / canvas.clientWidth * 2 - 1;
	mouse.y = -(e.clientY / canvas.clientHeight * 2 - 1);
}

// 변환된 마우스 좌표를 이용해 래이캐스팅
function raycasting() {
	raycaster.setFromCamera(mouse, camera);
	checkIntersects();
}

// 마우스 이벤트
canvas.addEventListener('mousedown', e => {
	isPressed = true;
	calculateMousePosition(e);
});
canvas.addEventListener('mouseup', () => {
	isPressed = false;
});
canvas.addEventListener('mousemove', e => {
	if (isPressed) {
		calculateMousePosition(e);
	}
});

// 터치 이벤트
canvas.addEventListener('touchstart', e => {
	isPressed = true;
	calculateMousePosition(e.touches[0]);
});
canvas.addEventListener('touchend', () => {
	isPressed = false;
});
canvas.addEventListener('touchmove', e => {
	if (isPressed) {
		calculateMousePosition(e.touches[0]);
	}
});

draw();