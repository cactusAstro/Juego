/**
 * CONTROLS.JS - Gestión de inputs del teclado y minimapa
 */

export class Controls {
    constructor(player, environment) {
        this.player = player;
        this.environment = environment;

        this.keys = {
            w: false,
            a: false,
            s: false,
            d: false,
            space: false
        };

        this.setupEvents();
        this.setupMinimap();
    }

    setupEvents() {
        document.addEventListener('keydown', (e) => {
            switch (e.code) {
                case 'KeyW': this.keys.w = true; break;
                case 'KeyA': this.keys.a = true; break;
                case 'KeyS': this.keys.s = true; break;
                case 'KeyD': this.keys.d = true; break;
                case 'Space': this.keys.space = true; e.preventDefault(); break;
                case 'KeyC': this.player.changeCameraMode(); break;
                case 'KeyR': this.player.reset(); break;
                case 'KeyN': this.environment.skipTime(); break;
            }
        });

        document.addEventListener('keyup', (e) => {
            switch (e.code) {
                case 'KeyW': this.keys.w = false; break;
                case 'KeyA': this.keys.a = false; break;
                case 'KeyS': this.keys.s = false; break;
                case 'KeyD': this.keys.d = false; break;
                case 'Space': this.keys.space = false; break;
            }
        });
    }

    setupMinimap() {
        this.minimapCanvas = document.getElementById('minimapCanvas');
        this.minimapCtx = this.minimapCanvas.getContext('2d');

        // Renderizar minimapa en bucle
        setInterval(() => this.renderMinimap(), 100);
    }

    renderMinimap() {
        const ctx = this.minimapCtx;
        const size = 200;
        const range = 400; // Rango del minimapa en unidades del mundo

        // Fondo
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, size, size);

        // Cuadrícula
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.lineWidth = 1;
        for (let i = 0; i < size; i += 20) {
            ctx.beginPath();
            ctx.moveTo(i, 0); ctx.lineTo(i, size);
            ctx.moveTo(0, i); ctx.lineTo(size, i);
            ctx.stroke();
        }

        // Carreteras
        ctx.strokeStyle = '#444';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(0, size / 2); ctx.lineTo(size, size / 2);
        ctx.moveTo(size / 2, 0); ctx.lineTo(size / 2, size);
        ctx.stroke();

        // Centro de la ciudad (Burj Khalifa)
        const playerPos = this.player.mesh.position;
        const burjX = size / 2 + ((-playerPos.x - 0) / range) * size;
        const burjY = size / 2 + ((-playerPos.z - (-100)) / range) * size;

        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(burjX, burjY, 4, 0, Math.PI * 2);
        ctx.fill();

        // Jugador (siempre en el centro, rotado)
        ctx.save();
        ctx.translate(size / 2, size / 2);
        ctx.rotate(-this.player.mesh.rotation.y);

        // Triángulo del coche
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.moveTo(0, -8);
        ctx.lineTo(-5, 5);
        ctx.lineTo(5, 5);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = 'white';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.restore();

        // Marco
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2 - 2, 0, Math.PI * 2);
        ctx.stroke();
    }
}
