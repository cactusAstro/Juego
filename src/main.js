/**
 * MAIN.JS - Renderer con calidad gráfica mejorada
 */

import * as THREE from 'three';
import { World } from './World.js';
import { Player } from './Player.js';
import { Environment } from './Environment.js';
import { Controls } from './Controls.js';

class Game {
    constructor() {
        this.lastTime = performance.now();
        this.frames = 0;
        this.fpsTime = 0;
        this.fps = 60;
        this.init();
    }

    async init() {
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0xd4a574, 0.0012);

        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            3000
        );
        this.camera.position.set(0, 10, 30);

        // RENDERER MEJORADO
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.1;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        document.body.appendChild(this.renderer.domElement);

        this.environment = new Environment(this.scene);
        this.world = new World(this.scene);
        this.player = new Player(this.scene, this.camera);
        this.controls = new Controls(this.player, this.environment);

        window.addEventListener('resize', () => this.onResize());

        setTimeout(() => {
            const loading = document.getElementById('loadingScreen');
            if (loading) {
                loading.style.opacity = '0';
                setTimeout(() => loading.style.display = 'none', 1000);
            }
        }, 2000);

        this.animate();
    }

    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    updateFPS(deltaTime) {
        this.frames++;
        this.fpsTime += deltaTime;
        if (this.fpsTime >= 1000) {
            this.fps = Math.round((this.frames * 1000) / this.fpsTime);
            document.getElementById('fps').textContent = `FPS: ${this.fps}`;
            this.frames = 0;
            this.fpsTime = 0;
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const now = performance.now();
        const deltaTime = now - this.lastTime;
        this.lastTime = now;
        const dt = Math.min(deltaTime / 1000, 0.1);

        this.environment.update(dt);
        this.player.update(dt, this.controls.keys);
        this.world.update(dt, this.player.mesh.position);

        this.updateFPS(deltaTime);
        this.renderer.render(this.scene, this.camera);
    }
}

new Game();
