/**
 * ENVIRONMENT.JS - Gestión del cielo, sol, iluminación y ciclo día/noche
 */

import * as THREE from 'three';

export class Environment {
    constructor(scene) {
        this.scene = scene;
        this.timeOfDay = 0.35; // 0 = medianoche, 0.5 = mediodía, 1 = medianoche
        this.timeSpeed = 0.005; // Velocidad del paso del tiempo (lento)

        this.createSky();
        this.createSun();
        this.createLights();
    }

    createSky() {
        // Skybox - cielo gradiente
        const skyGeometry = new THREE.SphereGeometry(1500, 32, 16);
        const skyMaterial = new THREE.ShaderMaterial({
            uniforms: {
                topColor: { value: new THREE.Color(0x87CEEB) },
                bottomColor: { value: new THREE.Color(0xFFB347) },
                offset: { value: 50 },
                exponent: { value: 0.7 }
            },
            vertexShader: `
                varying vec3 vWorldPosition;
                void main() {
                    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                    vWorldPosition = worldPosition.xyz;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 topColor;
                uniform vec3 bottomColor;
                uniform float offset;
                uniform float exponent;
                varying vec3 vWorldPosition;
                void main() {
                    float h = normalize(vWorldPosition + offset).y;
                    gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
                }
            `,
            side: THREE.BackSide
        });
        this.sky = new THREE.Mesh(skyGeometry, skyMaterial);
        this.scene.add(this.sky);
    }

    createSun() {
        // Disco del sol
        const sunGeometry = new THREE.SphereGeometry(20, 32, 32);
        const sunMaterial = new THREE.MeshBasicMaterial({
            color: 0xfff4b3,
            fog: false
        });
        this.sun = new THREE.Mesh(sunGeometry, sunMaterial);
        this.scene.add(this.sun);

        // Luna (aparece de noche)
        const moonGeometry = new THREE.SphereGeometry(15, 32, 32);
        const moonMaterial = new THREE.MeshBasicMaterial({
            color: 0xeeeeff,
            fog: false
        });
        this.moon = new THREE.Mesh(moonGeometry, moonMaterial);
        this.scene.add(this.moon);
    }

    createLights() {
        // Luz ambiental (iluminación general)
        this.ambient = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(this.ambient);

        // Luz direccional (sol con sombras)
        this.sunLight = new THREE.DirectionalLight(0xffd5a0, 1.2);
        this.sunLight.castShadow = true;
        this.sunLight.shadow.mapSize.width = 2048;
        this.sunLight.shadow.mapSize.height = 2048;
        this.sunLight.shadow.camera.near = 0.5;
        this.sunLight.shadow.camera.far = 500;
        this.sunLight.shadow.camera.left = -200;
        this.sunLight.shadow.camera.right = 200;
        this.sunLight.shadow.camera.top = 200;
        this.sunLight.shadow.camera.bottom = -200;
        this.sunLight.shadow.bias = -0.0005;
        this.scene.add(this.sunLight);

        // Luz hemisférica (cielo + suelo)
        this.hemisphereLight = new THREE.HemisphereLight(0xffeebb, 0xc9a96e, 0.4);
        this.scene.add(this.hemisphereLight);
    }

    update(deltaTime) {
        // Avanzar tiempo
        this.timeOfDay += this.timeSpeed * deltaTime;
        if (this.timeOfDay > 1) this.timeOfDay -= 1;

        // Ángulo del sol según hora
        const angle = this.timeOfDay * Math.PI * 2 - Math.PI / 2;
        const distance = 800;

        const sunX = Math.cos(angle) * distance;
        const sunY = Math.sin(angle) * distance;

        this.sun.position.set(sunX, sunY, -200);
        this.moon.position.set(-sunX, -sunY, -200);

        // Mover luz direccional con el sol
        this.sunLight.position.set(sunX * 0.3, sunY * 0.3, -100);

        // Intensidad luz según hora (más fuerte de día)
        const dayFactor = Math.max(0, Math.sin(angle));
        this.sunLight.intensity = dayFactor * 1.5;
        this.ambient.intensity = 0.2 + dayFactor * 0.4;

        // Color del cielo según hora
        const topColor = new THREE.Color();
        const bottomColor = new THREE.Color();

        if (dayFactor > 0.5) {
            // Día
            topColor.setHex(0x87CEEB);
            bottomColor.setHex(0xFFD89B);
        } else if (dayFactor > 0.1) {
            // Atardecer/amanecer
            topColor.setHex(0xff6b35);
            bottomColor.setHex(0xf7931e);
        } else {
            // Noche
            topColor.setHex(0x0a0a2e);
            bottomColor.setHex(0x16213e);
        }

        this.sky.material.uniforms.topColor.value.lerp(topColor, 0.05);
        this.sky.material.uniforms.bottomColor.value.lerp(bottomColor, 0.05);

        // Color de niebla con el cielo
        this.scene.fog.color.copy(this.sky.material.uniforms.bottomColor.value);

        // Actualizar reloj en HUD
        const hours = Math.floor(this.timeOfDay * 24);
        const minutes = Math.floor((this.timeOfDay * 24 * 60) % 60);
        document.getElementById('time').textContent =
            `🕐 ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }

    skipTime() {
        // Avanzar 4 horas
        this.timeOfDay = (this.timeOfDay + 4 / 24) % 1;
    }
}
