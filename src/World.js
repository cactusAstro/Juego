/**
 * WORLD.JS - Terreno, agua, palmeras, carreteras
 */

import * as THREE from 'three';
import { Water } from 'three/addons/objects/Water.js';
import { Buildings } from './Buildings.js';

export class World {
    constructor(scene) {
        this.scene = scene;

        this.createGround();
        this.createWater();
        this.createRoads();
        this.createPalmTrees();
        this.buildings = new Buildings(scene);
    }

    createGround() {
        const groundGeometry = new THREE.PlaneGeometry(2000, 2000, 100, 100);
        const sandTexture = this.createSandTexture();
        sandTexture.repeat.set(50, 50);

        const groundMaterial = new THREE.MeshStandardMaterial({
            map: sandTexture,
            color: 0xd4a574,
            roughness: 0.95,
            metalness: 0
        });

        this.ground = new THREE.Mesh(groundGeometry, groundMaterial);
        this.ground.rotation.x = -Math.PI / 2;
        this.ground.receiveShadow = true;
        this.scene.add(this.ground);

        const positions = groundGeometry.attributes.position;
        for (let i = 0; i < positions.count; i++) {
            const x = positions.getX(i);
            const y = positions.getY(i);
            const distance = Math.sqrt(x * x + y * y);

            if (distance > 400) {
                const dune = Math.sin(x * 0.01) * Math.cos(y * 0.01) * 15;
                positions.setZ(i, dune * (distance / 1000));
            }
        }
        positions.needsUpdate = true;
        groundGeometry.computeVertexNormals();
    }

    /**
     * AGUA con olas reales (Persian Gulf / Dubai Marina)
     */
    createWater() {
        const waterGeometry = new THREE.PlaneGeometry(1500, 1500);

        this.water = new Water(waterGeometry, {
            textureWidth: 512,
            textureHeight: 512,
            waterNormals: new THREE.TextureLoader().load(
                'https://threejs.org/examples/textures/waternormals.jpg',
                function (texture) {
                    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                }
            ),
            sunDirection: new THREE.Vector3(0.5, 1, 0.5),
            sunColor: 0xffffff,
            waterColor: 0x006994,
            distortionScale: 4.0,
            fog: this.scene.fog !== undefined
        });

        this.water.rotation.x = -Math.PI / 2;
        this.water.position.set(0, 0.5, 700); // Al "norte" del mapa
        this.scene.add(this.water);

        // Playa: zona arena que limita con el agua
        const beachMaterial = new THREE.MeshStandardMaterial({
            color: 0xf5e6c8,
            roughness: 1
        });
        const beach = new THREE.Mesh(
            new THREE.PlaneGeometry(1500, 80),
            beachMaterial
        );
        beach.rotation.x = -Math.PI / 2;
        beach.position.set(0, 0.15, 410);
        beach.receiveShadow = true;
        this.scene.add(beach);
    }

    createSandTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#d4a574';
        ctx.fillRect(0, 0, 256, 256);

        for (let i = 0; i < 5000; i++) {
            const x = Math.random() * 256;
            const y = Math.random() * 256;
            const brightness = Math.random();
            ctx.fillStyle = brightness > 0.5
                ? `rgba(220, 180, 130, ${brightness * 0.3})`
                : `rgba(180, 140, 90, ${brightness * 0.3})`;
            ctx.fillRect(x, y, 2, 2);
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        return texture;
    }

    createRoads() {
        const roadMaterial = new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            roughness: 0.8,
            metalness: 0.1
        });

        const road1 = new THREE.Mesh(new THREE.PlaneGeometry(2000, 20), roadMaterial);
        road1.rotation.x = -Math.PI / 2;
        road1.position.y = 0.1;
        road1.receiveShadow = true;
        this.scene.add(road1);

        const road2 = new THREE.Mesh(new THREE.PlaneGeometry(20, 2000), roadMaterial);
        road2.rotation.x = -Math.PI / 2;
        road2.position.y = 0.1;
        road2.receiveShadow = true;
        this.scene.add(road2);

        this.createRoadLines(2000, 20, 'horizontal');
        this.createRoadLines(20, 2000, 'vertical');

        for (let i = 0; i < 4; i++) {
            const angle = (i * Math.PI) / 2 + Math.PI / 4;
            const diagonalRoad = new THREE.Mesh(
                new THREE.PlaneGeometry(15, 1500),
                roadMaterial
            );
            diagonalRoad.rotation.x = -Math.PI / 2;
            diagonalRoad.rotation.z = angle;
            diagonalRoad.position.y = 0.05;
            this.scene.add(diagonalRoad);
        }
    }

    createRoadLines(width, height, direction) {
        const lineMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const segments = 100;

        for (let i = -segments / 2; i < segments / 2; i++) {
            if (i % 2 === 0) {
                const lineGeo = direction === 'horizontal'
                    ? new THREE.PlaneGeometry(15, 0.5)
                    : new THREE.PlaneGeometry(0.5, 15);

                const line = new THREE.Mesh(lineGeo, lineMaterial);
                line.rotation.x = -Math.PI / 2;
                line.position.y = 0.15;

                if (direction === 'horizontal') {
                    line.position.x = i * 20;
                } else {
                    line.position.z = i * 20;
                }
                this.scene.add(line);
            }
        }
    }

    createPalmTrees() {
        const palmCount = 200;

        for (let i = 0; i < palmCount; i++) {
            const palm = this.createPalmTree();

            let x, z;
            do {
                x = (Math.random() - 0.5) * 800;
                z = (Math.random() - 0.5) * 800;
            } while (Math.abs(x) < 15 || Math.abs(z) < 15 || z > 400);

            palm.position.set(x, 0, z);
            palm.rotation.y = Math.random() * Math.PI * 2;
            palm.scale.setScalar(0.8 + Math.random() * 0.6);

            this.scene.add(palm);
        }

        // Palmeras en la playa (zona costera)
        for (let i = 0; i < 50; i++) {
            const palm = this.createPalmTree();
            const x = (Math.random() - 0.5) * 1200;
            const z = 380 + Math.random() * 40;

            palm.position.set(x, 0, z);
            palm.rotation.y = Math.random() * Math.PI * 2;
            palm.scale.setScalar(1 + Math.random() * 0.4);
            this.scene.add(palm);
        }
    }

    createPalmTree() {
        const group = new THREE.Group();

        const trunkGeometry = new THREE.CylinderGeometry(0.4, 0.6, 12, 8);
        const trunkMaterial = new THREE.MeshStandardMaterial({
            color: 0x6b4423,
            roughness: 0.9
        });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 6;
        trunk.castShadow = true;
        group.add(trunk);

        const leafMaterial = new THREE.MeshStandardMaterial({
            color: 0x2d5016,
            roughness: 0.7,
            side: THREE.DoubleSide
        });

        for (let i = 0; i < 8; i++) {
            const leaf = new THREE.Mesh(
                new THREE.PlaneGeometry(5, 1.5),
                leafMaterial
            );

            const angle = (i / 8) * Math.PI * 2;
            leaf.position.y = 12;
            leaf.position.x = Math.cos(angle) * 2.5;
            leaf.position.z = Math.sin(angle) * 2.5;
            leaf.rotation.y = angle;
            leaf.rotation.z = -Math.PI / 6;
            leaf.castShadow = true;

            group.add(leaf);
        }

        return group;
    }

    update(deltaTime, playerPosition) {
        // Animar agua (olas)
        if (this.water) {
            this.water.material.uniforms['time'].value += deltaTime;
        }

        if (this.buildings.update) {
            this.buildings.update(deltaTime);
        }
    }
}
