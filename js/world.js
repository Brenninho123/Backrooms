export function createWorld(scene) {

    const floorGeo = new THREE.PlaneGeometry(200, 200);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0xbfae4b });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI/2;
    scene.add(floor);

    const wallMat = new THREE.MeshStandardMaterial({ color: 0xaaaa66 });

    for(let i = 0; i < 50; i++) {
        const wallGeo = new THREE.BoxGeometry(5,5,1);
        const wall = new THREE.Mesh(wallGeo, wallMat);

        wall.position.set(
            (Math.random() - 0.5) * 100,
            2.5,
            (Math.random() - 0.5) * 100
        );

        scene.add(wall);
    }

    const light = new THREE.PointLight(0xffffaa, 1, 100);
    light.position.set(0,10,0);
    scene.add(light);
}
