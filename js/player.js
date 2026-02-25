export function createPlayer(camera) {

    camera.position.set(0,2,5);

    document.addEventListener("keydown", e => {
        const speed = 0.5;

        if(e.key === "w") camera.position.z -= speed;
        if(e.key === "s") camera.position.z += speed;
        if(e.key === "a") camera.position.x -= speed;
        if(e.key === "d") camera.position.x += speed;
    });

    return camera;
}
