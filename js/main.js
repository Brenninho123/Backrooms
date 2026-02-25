import { createWorld } from "./world.js";
import { createPlayer } from "./player.js";
import { createEnemy } from "./enemy.js";
import { updateUI } from "./ui.js";

let scene, camera, renderer;
let player, enemy;
let flashlight = 100;
let sanity = 100;

document.getElementById("startBtn").onclick = startGame;

function startGame() {
    document.getElementById("menu").style.display = "none";
    document.getElementById("hud").style.display = "block";

    init();
    animate();
}

function init() {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    createWorld(scene);
    player = createPlayer(camera);
    enemy = createEnemy(scene);
}

function animate() {
    requestAnimationFrame(animate);

    flashlight -= 0.02;
    sanity -= 0.01;

    enemy.follow(camera.position);

    if(camera.position.distanceTo(enemy.position) < 2) {
        alert("Você foi capturado...");
        location.reload();
    }

    if(sanity <= 0) {
        alert("Você enlouqueceu...");
        location.reload();
    }

    updateUI(flashlight, sanity);
    renderer.render(scene, camera);
}
