/**
 * BUILDINGS.JS - +250 edificios variados
 */

import * as THREE from 'three';

export class Buildings {
    constructor(scene) {
        this.scene = scene;
        this.buildings = [];

        this.createBurjKhalifa();
        this.createSkyline();
        this.createFarBuildings();
    }

    createBurjKhalifa() {
        const group = new THREE.Group();
        const sections = 15;
        let currentHeight = 0;
        let currentWidth = 30;

        for (let i = 0; i < sections; i++) {
            const sectionHeight = 22 - i * 0.6;
            const geometry = new THREE.BoxGeometry(currentWidth, sectionHeight, currentWidth);
            const material = new THREE.MeshStandardMaterial({
                color: 0xd0d8e0,
                metalness: 0.9,
                roughness: 0.1,
                emissive: 0x222244,
                emissiveIntensity: 0.3
            });

            const section = new THREE.Mesh(geometry, material);
            section.position.y = currentHeight + sectionHeight / 2;
            section.castShadow = true;
            section.receiveShadow = true;
            section.rotation.y = (i * Math.PI) / 20;

            group.add(section);
            this.addWindowsToBuilding(section, currentWidth, sectionHeight);

            currentHeight += sectionHeight;
            currentWidth *= 0.93;
        }

        // Antena
        const antenna = new THREE.Mesh(
            new THREE.ConeGeometry(0.5, 40, 8),
            new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 1, roughness: 0.3 })
        );
        antenna.position.y = currentHeight + 20;
        antenna.castShadow = true;
        group.add(antenna);

        // Luz parpadeante
        this.antennaLight = new THREE.Mesh(
            new THREE.SphereGeometry(1, 16, 16),
            new THREE.MeshBasicMaterial({ color: 0xff0000 })
        );
        this.antennaLight.position.y = currentHeight + 38;
        group.add(this.antennaLight);

        group.position.set(0, 0, -150);
        this.scene.add(group);
        this.buildings.push(group);
    }

    addWindowsToBuilding(building, width, height) {
        const windowsTexture = this.createWindowsTexture();
        const windowsMaterial = new THREE.MeshStandardMaterial({
            map: windowsTexture,
            emissiveMap: windowsTexture,
            emissive: 0xffaa44,
            emissiveIntensity: 1.8,
            metalness: 0.3,
            roughness: 0.4,
            transparent: true,
            opacity: 0.95
        });

        const offset = 0.05;
        for (let face = 0; face < 4; face++) {
            const planeGeo = new THREE.PlaneGeometry(width * 0.95, height * 0.95);
            const plane = new THREE.Mesh(planeGeo, windowsMaterial);

            switch (face) {
                case 0: plane.position.z = width / 2 + offset; break;
                case 1: plane.position.z = -width / 2 - offset; plane.rotation.y = Math.PI; break;
                case 2: plane.position.x = width / 2 + offset; plane.rotation.y = -Math.PI / 2; break;
                case 3: plane.position.x = -width / 2 - offset; plane.rotation.y = Math.PI / 2; break;
            }
            building.add(plane);
        }
    }

    createWindowsTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#0a0a1a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const cols = 8;
        const rows = 16;
        const margin = 2;
        const winWidth = (canvas.width - margin * (cols + 1)) / cols;
        const winHeight = (canvas.height - margin * (rows + 1)) / rows;

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (Math.random() > 0.25) {
                    const colors = ['#ffd87a', '#ffaa44', '#ffe0a0', '#ffcc66', '#ffeb99'];
                    ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
                } else {
                    ctx.fillStyle = '#1a1a2a';
                }
                ctx.fillRect(
                    margin + c * (winWidth + margin),
                    margin + r * (winHeight + margin),
                    winWidth, winHeight
                );
            }
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        return texture;
    }

    createSkyline() {
        const buildingCount = 250;

        for (let i = 0; i < buildingCount; i++) {
            const angle = (i / buildingCount) * Math.PI * 2 + Math.random() * 0.4;
            const distance = 80 + Math.random() * 500;
            const x = Math.cos(angle) * distance;
            const z = Math.sin(angle) * distance;

            // Evitar la zona del agua (al norte)
            if (z > 400 && Math.abs(x) < 600) continue;

            const distFactor = 1 - Math.min(distance / 500, 1);
            const height = 30 + Math.random() * 100 + distFactor * 80;
            const width = 8 + Math.random() * 15;
            const depth = 8 + Math.random() * 15;

            const geometry = new THREE.BoxGeometry(width, height, depth);

            const colors = [0xa8b8c8, 0x88a0c0, 0xc8d0e0, 0x607890, 0x90a8b8, 0xd0c8b0, 0xb0a888];
            const material = new THREE.MeshStandardMaterial({
                color: colors[Math.floor(Math.random() * colors.length)],
                metalness: 0.7 + Math.random() * 0.3,
                roughness: 0.1 + Math.random() * 0.3,
                emissive: 0x111122,
                emissiveIntensity: 0.15
            });

            const building = new THREE.Mesh(geometry, material);
            building.position.set(x, height / 2, z);
            building.castShadow = true;
            building.receiveShadow = true;
            building.rotation.y = Math.random() * Math.PI;

            this.scene.add(building);

            if (height > 50 && distance < 350) {
                this.addWindowsToBuilding(building, Math.min(width, depth), height);
            }

            this.buildings.push(building);
        }
    }

    createFarBuildings() {
        // Edificios pequeños low-poly al fondo (sin sombras para optimizar)
        const farMaterial = new THREE.MeshStandardMaterial({
            color: 0x607890,
            metalness: 0.5,
            roughness: 0.5
        });

        for (let i = 0; i < 150; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = 500 + Math.random() * 400;
            const x = Math.cos(angle) * distance;
            const z = Math.sin(angle) * distance;

            if (z > 400) continue; // No al norte (donde está el agua)

            const height = 20 + Math.random() * 60;
            const building = new THREE.Mesh(
                new THREE.BoxGeometry(15, height, 15),
                farMaterial
            );
            building.position.set(x, height / 2, z);
            this.scene.add(building);
        }
    }

    update(deltaTime) {
        if (this.antennaLight) {
            this.antennaLight.material.color.setHex(
                Math.sin(performance.now() * 0.003) > 0 ? 0xff0000 : 0x440000
            );
        }
    }
}
