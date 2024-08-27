// // FireEntityVisuals.js
class FireEntityVisuals {
    constructor(scene, position, isChild = false) {
        this.scene = scene;
        this.position = position;
        this.isChild = isChild;
        this.createMesh();
    }

    createMesh() {
        this.createDiamondFireEffect();
    }

    createDiamondFireEffect() {
        const particleCount = 2000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            const t = Math.random();
            const u = Math.random() * Math.PI * 2;

            // Diamond shape
            if (t < 0.5) {
                // Lower half
                const r = t * 2;
                positions[i3] = r * Math.cos(u) * 0.5;
                positions[i3 + 1] = t - 0.5;
                positions[i3 + 2] = r * Math.sin(u) * 0.5;
            } else {
                // Upper half
                const r = (1 - t) * 2;
                positions[i3] = r * Math.cos(u) * 0.5;
                positions[i3 + 1] = t - 0.5;
                positions[i3 + 2] = r * Math.sin(u) * 0.5;
            }

            // Color mix: more blue for child entities
            if (this.isChild) {
                colors[i3] = Math.random() * 0.5;     // Less Red
                colors[i3 + 1] = Math.random() * 0.5; // Less Green
                colors[i3 + 2] = Math.random() * 0.8 + 0.2; // More Blue
            } else {
                colors[i3] = Math.random();           // Red
                colors[i3 + 1] = Math.random() * 0.7; // Green (for yellow)
                colors[i3 + 2] = Math.random() * 0.5; // Blue
            }
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 0.1,
            vertexColors: true,
            blending: THREE.AdditiveBlending,
            transparent: true,
            opacity: 0.8
        });

        this.particleSystem = new THREE.Points(geometry, material);
        this.particleSystem.position.copy(this.position);
        this.scene.add(this.particleSystem);
    }

    updatePosition(newPosition) {
        this.position.copy(newPosition);
        this.particleSystem.position.copy(newPosition);
    }

    animate(time) {
        const positions = this.particleSystem.geometry.attributes.position.array;
        const colors = this.particleSystem.geometry.attributes.color.array;

        for (let i = 0; i < positions.length; i += 3) {
            // Move particles
            const angle = Math.atan2(positions[i], positions[i + 2]);
            const radius = Math.sqrt(positions[i] ** 2 + positions[i + 2] ** 2);
            const speed = 0.01 + Math.random() * 0.02;

            positions[i] += Math.sin(angle) * speed;
            positions[i + 1] += speed * 2;
            positions[i + 2] += Math.cos(angle) * speed;

            // Reset particles that move too far
            if (positions[i + 1] > 1 || radius > 0.5) {
                const t = Math.random() * 0.5;
                const u = Math.random() * Math.PI * 2;
                const r = t * 2;

                positions[i] = r * Math.cos(u) * 0.5;
                positions[i + 1] = -0.5;
                positions[i + 2] = r * Math.sin(u) * 0.5;

                // Reset color
                if (this.isChild) {
                    colors[i] = Math.random() * 0.5;     // Less Red
                    colors[i + 1] = Math.random() * 0.5; // Less Green
                    colors[i + 2] = Math.random() * 0.8 + 0.2; // More Blue
                } else {
                    colors[i] = Math.random();           // Red
                    colors[i + 1] = Math.random() * 0.7; // Green (for yellow)
                    colors[i + 2] = Math.random() * 0.5; // Blue
                }
            }

            // Fade out particles as they rise
            colors[i] *= 0.99;
            colors[i + 1] *= 0.99;
            colors[i + 2] *= 0.99;
        }

        this.particleSystem.geometry.attributes.position.needsUpdate = true;
        this.particleSystem.geometry.attributes.color.needsUpdate = true;

        // Rotate the particle system
        this.particleSystem.rotation.y += 0.005;
    }
}