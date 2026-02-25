export function createEnemy(scene) {

    const geo = new THREE.BoxGeometry(2,4,2);
    const mat = new THREE.MeshStandardMaterial({ color: 0x000000 });
    const enemy = new THREE.Mesh(geo, mat);

    enemy.position.set(10,2,10);
    scene.add(enemy);

    enemy.follow = function(target) {
        this.position.lerp(target, 0.001);
    }

    return enemy;
}
