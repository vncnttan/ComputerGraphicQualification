// Import
import * as THREE from "./three.js/build/three.module.js"
import {OrbitControls} from "./three.js/examples/jsm/controls/OrbitControls.js"
import {GLTFLoader} from "./three.js/examples/jsm/loaders/GLTFLoader.js"
import {TextGeometry} from "./three.js/examples/jsm/geometries/TextGeometry.js"
import {FontLoader} from "./three.js/examples/jsm/loaders/FontLoader.js"

// Code starts here
// Global Variable
var scene, renderer;
var camera1, camera2, currentCam
var control;
var sphere;

initialize()
addAllToScene()
raycasting()

// Animation
let renderFunction = () => {
    renderer.render(scene, currentCam);
    if(sphere.position.z > -42 && sphere.position.y > -10){
        sphere.position.y -= 0.5
    }
    requestAnimationFrame(renderFunction)
}
renderFunction()

// Event Handling
window.onresize = () => {
    let width = window.innerWidth
    let height = window.innerHeight
    renderer.setSize(width, height)
    
    camera1.aspect = width/height
    camera1.updateProjectionMatrix()
    
    camera2.aspect = width/height
    camera2.updateProjectionMatrix()
}

// Raycasting
function raycasting(){
    var rayCast = new THREE.Raycaster()
    var pointer = new THREE.Vector2()

    window.addEventListener('pointerdown', (e)=>{
        pointer.x = (e.clientX / window.innerWidth) * 2 - 1
        pointer.y = - (e.clientY / window.innerHeight) * 2 + 1
        
        rayCast.setFromCamera(pointer, currentCam)
        
        let intersects = rayCast.intersectObjects(scene.children)
        console.log(intersects)
        
        for(let i = 0; i<intersects.length; i++){
            if(intersects[i].object.name == 'left'){
                intersects[i].object.position.x -= 0.5
            } else if (intersects[i].object.name == 'right'){
                intersects[i].object.position.x += 0.5
            } else if (intersects[i].object.name == 'forward'){
                intersects[i].object.position.z += 0.5
            }
        }
    })
}

// All Functions
function addAllToScene(){
    makeModel()
    scene.add(makeSkybox())
    makeAllGeo()
    makeLight(30, 15, -48)
    make_text("NJ23-1 \nSpace to Continue\n\n                    I'm gonna rule \n                    this world")
}

function make_text(text){
    var font = new FontLoader().load("./three.js/examples/fonts/helvetiker_bold.typeface.json", (font)=>{
        let fontGeometry = new TextGeometry(text, {
            font: font,
            size: 3,
            height: 0.7
        })
        fontGeometry.center()
        let fontMaterial = new THREE.MeshBasicMaterial({
            color: 0xff0000
        })
        let fontMesh = new THREE.Mesh(fontGeometry, fontMaterial)
        fontMesh.quaternion.copy( currentCam.quaternion );
        fontMesh.position.y = 3
        scene.add(fontMesh)
    })
}

// Make Geometry Shapes
function makeBox(l, w, h, x, y, z){
    let boxGeometry = new THREE.BoxGeometry(l, w, h, 200, 200, 200)
    var colorRandomizer = [
        0x00ff00, 0xff0000, 0x2596be, 0x873e23, 0xe68b44, 0x063970, 0xeeeee4, 0x063970, 0x111111, 0xead448, 0x91c027, 0xcfcfc9
    ]

    let color = colorRandomizer[Math.floor(Math.random() * 11)]
    let boxMaterial = new THREE.MeshLambertMaterial({
        side: THREE.DoubleSide,
        map: new THREE.TextureLoader().load('./assets/bookredpattern.jpeg'),
        color: color
    })

    let boxMesh = new THREE.Mesh(boxGeometry, boxMaterial)
    boxMesh.position.set(x, y, z)
    boxMesh.rotation.x = Math.PI/2 
    boxMesh.castShadow = true
    boxMesh.receiveShadow = true;
    return boxMesh
}


function makeCone(r, h, x, y, z, xscaler){
    let coneGeometry = new THREE.ConeGeometry(r, h, 64, 1)
    let coneMaterial = new THREE.MeshLambertMaterial({
        side: THREE.DoubleSide,
        color: 0xae8f60
    })

    let coneMesh = new THREE.Mesh(coneGeometry, coneMaterial)
    coneMesh.rotation.x = xscaler
    coneMesh.position.set(x, y, z)
    coneMesh.castShadow = true
    coneMesh.name = "left"
    return coneMesh
}

function makeSphere(r, x, y, z){
    let sphereGeometry = new THREE.SphereGeometry(r, 64, 64)
    let sphereMaterial = new THREE.MeshStandardMaterial({
        side: THREE.DoubleSide,
        roughness: 1,
        metalness: 0.4,
        map: new THREE.TextureLoader().load("./assets/assets.jpeg")
    })

    let sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial)
    sphereMesh.position.set(x, y, z)
    sphereMesh.castShadow = true
    sphereMesh.name = "forward"

    return sphereMesh
}

function makeCylinder(r, h, x, y, z){
    let cylinderGeometry = new THREE.CylinderGeometry(r, r, h, 64)
    
    // Envmap
    // var pmrem = new THREE.PMREMGenerator(renderer)
    // console.log(new THREE.TextureLoader().load("./assets/indoors-skyboxes/DallasW/posz.jpg"))
    let cylinderMaterial = new THREE.MeshPhongMaterial({
        side: THREE.DoubleSide,
        shininess: 10,
        specular: 0xffffff,
        color: 0x715775,
        // envMap: pmrem.fromEquirectangular(new THREE.TextureLoader().load("./assets/indoors-skyboxes/DallasW/posz.jpg"))
    })

    let cylinderMesh = new THREE.Mesh(cylinderGeometry, cylinderMaterial)
    cylinderMesh.position.set(x, y, z)
    cylinderMesh.castShadow = true
    cylinderMesh.name = "right"

    return cylinderMesh
}

function makePlane(l, w, x, y, z, rotateAngle){
    let planeGeometry = new THREE.PlaneGeometry(l, w, 3000, 3000)
    let planeMaterial = new THREE.MeshLambertMaterial({
        side: THREE.DoubleSide,
        map: new THREE.TextureLoader().load("./assets/assets.jpeg")
        // color: 0xaaaa00
    })

    let planeMesh = new THREE.Mesh(planeGeometry, planeMaterial)
    planeMesh.position.set(x, y, z)
    planeMesh.rotation.x = rotateAngle
    planeMesh.receiveShadow = true;
    return planeMesh
}

function makeSkybox(){
    let textureLoader = new THREE.TextureLoader()
    let boxMaterialArr = [
        new THREE.MeshBasicMaterial({
            map: textureLoader.load('./assets/indoors-skyboxes/DallasW/posx.jpg'),
            side: THREE.DoubleSide,
            side: THREE.DoubleSide
        }),
        new THREE.MeshBasicMaterial({
            map: textureLoader.load('./assets/indoors-skyboxes/DallasW/negx.jpg'),
            side: THREE.DoubleSide
        }),
        new THREE.MeshBasicMaterial({
            map: textureLoader.load('./assets/indoors-skyboxes/DallasW/posy.jpg'),
            side: THREE.DoubleSide
        }),
        new THREE.MeshBasicMaterial({
            map: textureLoader.load('./assets/indoors-skyboxes/DallasW/negy.jpg'),
            side: THREE.DoubleSide
        }),
        new THREE.MeshBasicMaterial({
            map: textureLoader.load('./assets/indoors-skyboxes/DallasW/posz.jpg'),
            side: THREE.DoubleSide
        }),
        new THREE.MeshBasicMaterial({
            map: textureLoader.load('./assets/indoors-skyboxes/DallasW/negz.jpg'),
            side: THREE.DoubleSide
        }),
    ]
    
    let skyGeometry = new THREE.BoxGeometry(1000, 1000, 1000)
    return new THREE.Mesh(skyGeometry, boxMaterialArr)
}

function makeModel(){
    var gltfloader = new GLTFLoader().load("./assets/warrior_toy/scene.gltf", (object)=>{
        let texture = new THREE.TextureLoader().load('./assets/warrior_toy/textures/bojovnikDiffuseMap_metallicRoughness.png')

        let model = object.scene
        model.scale.set(10, 10, 10)
        scene.add(model)
    })
}

window.addEventListener('keydown', (e)=>{
    if(e.key == ' '){
        if(currentCam == camera1){
            currentCam = camera2
        } else {
            currentCam = camera1
        }
    }
})

function makeLight(x, y, z){
    // Light 1 = Ambient Light
    scene.add(new THREE.AmbientLight(0xffffff, 1))

    // Light 2 = Point Light
    let pointLight = new THREE.PointLight(0xffff00, 2)
    let pointHelper = new THREE.PointLightHelper(pointLight)
    pointLight.position.set(x, y, z)
    pointLight.castShadow = true;
    scene.add(pointLight, pointHelper)
}

function initialize(){
    renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    scene = new THREE.Scene();
    
    var FOV = 45;
    var ratio = window.innerWidth / window.innerHeight
    var near = 1
    var far = 1000
    camera1 = new THREE.PerspectiveCamera(FOV, ratio, near, far);
    camera2 = new THREE.PerspectiveCamera(FOV, ratio, near, far);
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true
    document.body.appendChild(renderer.domElement);
    
    currentCam = camera1;
    camera1.position.set(5, 2, -45)
    camera1.lookAt(0, 0, 0)
    camera2.position.set(0, 5, -28)
    camera2.lookAt(5, 2, -45)

    // control = new OrbitControls(currentCam, renderer.domElement)
    // control.update()
}

function makeAllGeo(){
    scene.add(makePlane(43, 17, 13, -1.3, -50, Math.PI/2))
    scene.add(makePlane(43, 17, 13, -9.82, -41.5, Math.PI))
    sphere = makeSphere(1, 2.3, -0.4, -43.4)
    scene.add(sphere)
    scene.add(makeBox(2, 13, 8, 3, 2.8, -52 ))
    scene.add(makeBox(1.78, 13, 8, 5.3, 2.8, -52 ))
    scene.add(makeBox(2, 13, 8, 7.6, 2.8, -52 ))
    scene.add(makeBox(1, 13, 8, 9.9, 2.8, -52 ))
    scene.add(makeBox(1.78, 13, 8, 12.2, 2.8, -52 ))
    scene.add(makeBox(1, 13, 8, 14.5, 2.8, -52 ))
    scene.add(makeBox(1.78, 13, 8, 16.8, 2.8, -52 ))
    scene.add(makeBox(1, 13, 8, 19.1, 2.8, -52 ))
    scene.add(makeBox(2, 13, 8, 21.4, 2.8, -52 ))
    scene.add(makeBox(1, 13, 8, 23.7, 2.8, -52 ))
    scene.add(makeBox(1.78, 13, 8, 26, 2.8, -52 ))
    scene.add(makeBox(2, 13, 8, 28.3, 2.8, -52 ))
    scene.add(makeBox(2, 13, 8, 30.6, 2.8, -52 ))
    scene.add(makeBox(1.78, 13, 8, 32.9, 2.8, -52 ))
    scene.add(makeBox(1.4, 13, 8, 0.7, 2.8, -52 ))
    scene.add(makeBox(2, 13, 8, -1.6, 2.8, -52 ))
    scene.add(makeBox(2, 13, 8, -3.9, 2.8, -52 ))
    scene.add(makeBox(1.4, 13, 8, -6.2, 2.8, -52 ))
    scene.add(makeCone(1, 2, -1, -0.3, -44, Math.PI*2))
    scene.add(makeCone(1, 2, -1, 1, -44, Math.PI))
    scene.add(makeCylinder(1, 5, 8, 1, -43))
}