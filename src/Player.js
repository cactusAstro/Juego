/**
 * PLAYER.JS - Coche con físicas y cámara ARREGLADA
 */

import * as THREE from 'three';

export class Player {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;

        this.velocity = 0;
        this.maxSpeed = 60;
        this.acceleration = 25;
        this.deceleration = 10;
        this.brakeForce = 40;
        this.steering = 0;
        this.steeringSpeed = 2.5;
        this.maxSteering = 0.6;

        this.cameraMode = 0;
        // ⚠️ OFFSETS CORREGIDOS: cámara DETRÁS del coche (Z negativo)
        this.cameraOffsets = [
            { pos: new THREE.Vector3(0, 6, -15), lookAt: new THREE.Vector3(0, 1, 10) },
            { pos: new THREE.Vector3(0, 3, -8), lookAt: new THREE.Vector3(0, 1, 10) },
            { pos: new THREE.Vector3(0, 1.5, -0.5), lookAt: new THREE.Vector3(0, 1.5, 10) }
        ];

        this.createCar();
    }

    createCar() {
        this.mesh = new THREE.Group();

        // CHASIS - Lamborghini amarillo (más Dubai 😎)
        const bodyGeometry = new THREE.BoxGeometry(2, 0.7, 4.5);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: 0xffd700,
            metalness: 0.9,
            roughness: 0.15
        });
        this.body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        this.body.position.y = 0.7;
        this.body.castShadow = true;
        this.mesh.add(this.body);

        // CABINA (cristal oscuro)
        const cabinGeometry = new THREE.BoxGeometry(1.7, 0.6, 2);
        const cabinMaterial = new THREE.MeshStandardMaterial({
            color: 0x111111,
            metalness: 0.9,
            roughness: 0.1,
            transparent: true,
            opacity: 0.7
        });
        const cabin = new THREE.Mesh(cabinGeometry, cabinMaterial);
        cabin.position.set(0, 1.3, 0.3); // Cabina hacia el frente
        cabin.castShadow = true;
        this.mesh.add(cabin);

        // CAPÓ DELANTERO - ahora en +Z (delante)
        const hoodGeometry = new THREE.BoxGeometry(1.9, 0.4, 1.2);
        const hood = new THREE.Mesh(hoodGeometry, bodyMaterial);
        hood.position.set(0, 0.95, -1.8); // Capó hacia atrás (visualmente delante con cámara)
        hood.castShadow = true;
        this.mesh.add(hood);

        // ALERÓN TRASERO
        const wingMaterial = new THREE.MeshStandardMaterial({
            color: 0x111111,
            metalness: 0.8,
            roughness: 0.2
        });
        const wing = new THREE.Mesh(new THREE.BoxGeometry(2, 0.1, 0.4), wingMaterial);
        wing.position.set(0, 1.4, 2.2);
        wing.castShadow = true;
        this.mesh.add(wing);

        for (let i of [-1, 1]) {
            const support = new THREE.Mesh(
                new THREE.BoxGeometry(0.1, 0.4, 0.1),
                wingMaterial
            );
            support.position.set(i * 0.8, 1.2, 2.2);
            this.mesh.add(support);
        }

        // RUEDAS
        this.wheels = [];
        const wheelGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.4, 16);
        const wheelMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            roughness: 0.8
        });

        // Llantas doradas
        const rimGeometry = new THREE.CylinderGeometry(0.35, 0.35, 0.45, 6);
        const rimMaterial = new THREE.MeshStandardMaterial({
            color: 0xffd700,
            metalness: 1,
            roughness: 0.2
        });

        const wheelPositions = [
            { x: -1.1, z: -1.5 },
            { x: 1.1, z: -1.5 },
            { x: -1.1, z: 1.5 },
            { x: 1.1, z: 1.5 }
        ];

        wheelPositions.forEach((pos, i) => {
            const wheelGroup = new THREE.Group();

            const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
            wheel.rotation.z = Math.PI / 2;
            wheel.castShadow = true;
            wheelGroup.add(wheel);

            const rim = new THREE.Mesh(rimGeometry, rimMaterial);
            rim.rotation.z = Math.PI / 2;
            wheelGroup.add(rim);

            wheelGroup.position.set(pos.x, 0.5, pos.z);
            this.wheels.push(wheelGroup);
            this.mesh.add(wheelGroup);
        });

        // FAROS DELANTEROS (en -Z, parte frontal del coche)
        const headlightGeometry = new THREE.SphereGeometry(0.2, 16, 16);
        const headlightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffcc });

        for (let i of [-0.6, 0.6]) {
            const headlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
            headlight.position.set(i, 0.8, -2.3);
            this.mesh.add(headlight);

            const light = new THREE.SpotLight(0xffffcc, 3, 100, Math.PI / 6, 0.5);
            light.position.set(i, 0.8, -2.3);
            light.target.position.set(i, 0, -20);
            this.mesh.add(light);
            this.mesh.add(light.target);
        }

        // LUCES TRASERAS
        const tailLightMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        for (let i of [-0.6, 0.6]) {
            const tailLight = new THREE.Mesh(
                new THREE.BoxGeometry(0.4, 0.2, 0.1),
                tailLightMaterial
            );
            tailLight.position.set(i, 0.8, 2.25);
            this.mesh.add(tailLight);
        }

        // Posición inicial (SIN rotación, mira a -Z)
        this.mesh.position.set(50, 0, 50);
        this.scene.add(this.mesh);
    }

    update(deltaTime, keys) {
        // ACELERACIÓN
        if (keys.w) {
            this.velocity += this.acceleration * deltaTime;
        } else if (keys.s) {
            if (this.velocity > 0) {
                this.velocity -= this.brakeForce * deltaTime;
            } else {
                this.velocity -= this.acceleration * 0.5 * deltaTime;
            }
        } else {
            if (this.velocity > 0) {
                this.velocity -= this.deceleration * deltaTime;
                if (this.velocity < 0) this.velocity = 0;
            } else if (this.velocity < 0) {
                this.velocity += this.deceleration * deltaTime;
                if (this.velocity > 0) this.velocity = 0;
            }
        }

        if (keys.space) {
            this.velocity *= 0.92;
        }

        this.velocity = Math.max(-this.maxSpeed / 2, Math.min(this.maxSpeed, this.velocity));

        // DIRECCIÓN
        const targetSteering = keys.a ? this.maxSteering : (keys.d ? -this.maxSteering : 0);
        this.steering += (targetSteering - this.steering) * this.steeringSpeed * deltaTime;

        if (Math.abs(this.velocity) > 0.5) {
            const turnAmount = this.steering * this.velocity * 0.04 * deltaTime;
            this.mesh.rotation.y += turnAmount;
        }

        // MOVIMIENTO - ahora hacia -Z (frente del coche)
        const direction = new THREE.Vector3(
            -Math.sin(this.mesh.rotation.y),
            0,
            -Math.cos(this.mesh.rotation.y)
        );
        this.mesh.position.add(direction.multiplyScalar(this.velocity * deltaTime));
        this.mesh.position.y = 0;

        // RUEDAS
        const wheelRotation = this.velocity * deltaTime * 2;
        this.wheels.forEach((wheel, i) => {
            wheel.children[0].rotation.x += wheelRotation;
            wheel.children[1].rotation.x += wheelRotation;
            if (i < 2) {
                wheel.rotation.y = this.steering;
            }
        });

        this.updateCamera();

        // HUD
        const speedKmh = Math.round(Math.abs(this.velocity) * 3.6);
        document.getElementById('speed').textContent = speedKmh;
        document.getElementById('speedBar').style.width =
            (Math.abs(this.velocity) / this.maxSpeed * 100) + '%';
    }

    updateCamera() {
        const offset = this.cameraOffsets[this.cameraMode];

        const cameraPos = offset.pos.clone();
        cameraPos.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.mesh.rotation.y);
        cameraPos.add(this.mesh.position);
        this.camera.position.lerp(cameraPos, 0.1);

        const lookAtPos = offset.lookAt.clone();
        lookAtPos.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.mesh.rotation.y);
        lookAtPos.add(this.mesh.position);

        // Negar para que mire al frente
        const adjustedLookAt = this.mesh.position.clone().add(
            new THREE.Vector3(
                -lookAtPos.x + this.mesh.position.x,
                lookAtPos.y - this.mesh.position.y,
                -lookAtPos.z + this.mesh.position.z
            )
        );
        this.camera.lookAt(adjustedLookAt);
    }

    changeCameraMode() {
        this.cameraMode = (this.cameraMode + 1) % this.cameraOffsets.length;
    }

    reset() {
        this.mesh.position.set(50, 0, 50);
        this.mesh.rotation.y = 0;
        this.velocity = 0;
        this.steering = 0;
    }
}
