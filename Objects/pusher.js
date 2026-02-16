import { createTexture } from "../Helpers/textures.js";
import { getAutoResizedShapeTextureVaiables } from "../math.js";
import { normalIsCollidesCircle, normalIsPointInside } from "../Helpers/collision.js";

export function getPusher(vertexes, images, direction = 0) {
    const x1 = vertexes[0][0];
    const y1 = vertexes[0][1];
    const x2 = vertexes[2][0];
    const y2 = vertexes[2][1];
    const width = x2 - x1;
    const height = y2 - y1;

    const particlesScaleFactor = Math.min(width, height) / 1024;

    const pusher = {
        vertexes: vertexes,
        name: "pusher",
        isShouldDisappear: false,
        id: Math.random() * Number.MAX_SAFE_INTEGER,
        gridIndexes: [],

        direction: direction,
        strength: 5,

        offset: 0,
        particles: Array.from({ length: 64 * particlesScaleFactor }, () => ({
            x: Math.random(),
            y: Math.random(),
            size: 3 + Math.random() * 10
        })),

        isPointInside(x, y) {
            return normalIsPointInside(this.vertexes, x, y);
        },

        draw(ctx, offsetX, offsetY, zoomInRate) {
            const screenX = (x1 - offsetX) * zoomInRate;
            const screenY = (y1 - offsetY) * zoomInRate;
            const screenW = width * zoomInRate;
            const screenH = height * zoomInRate;

            ctx.save();

            ctx.beginPath();
            ctx.rect(screenX, screenY, screenW, screenH);
            ctx.clip();

            ctx.fillStyle = "rgba(255, 255, 255, 0.7)";

            this.particles.forEach(p => {
                let relX = p.x * width;
                let relY = p.y * height;

                if (this.direction === 0) relX = (relX - this.offset) % width;
                if (this.direction === 1) relY = (relY - this.offset) % height;
                if (this.direction === 2) relX = (relX + this.offset) % width;
                if (this.direction === 3) relY = (relY + this.offset) % height;

                if (relX < 0) relX += width;
                if (relY < 0) relY += height;

                const drawX = screenX + (relX * zoomInRate);
                const drawY = screenY + (relY * zoomInRate);
                const drawRadius = p.size * zoomInRate;

                ctx.beginPath();
                ctx.arc(drawX, drawY, drawRadius, 0, Math.PI * 2);
                ctx.fill();
            });

            ctx.restore();
        },
        drawHitbox(ctx, offsetX, offsetY, zoomInRate) {
            ctx.beginPath();
            ctx.moveTo((this.vertexes[0][0] - offsetX) * zoomInRate, (this.vertexes[0][1] - offsetY) * zoomInRate);

            for (let i = 1; i < this.vertexes.length; ++i) {
                ctx.lineTo((this.vertexes[i][0] - offsetX) * zoomInRate, (this.vertexes[i][1] - offsetY) * zoomInRate);
            }
            ctx.closePath();
            ctx.fillStyle = "gray";
            ctx.fill();
        },

        resolveCollisionCircle(x, y, radius) { },

        isCollidesCircle(x, y, radius) {
            return normalIsCollidesCircle(this.vertexes, x, y, radius);
        },

        getVertexes() {
            return this.vertexes;
        },

        updateFrame(player, world, inventory, mouse, images, gameStepsCount) { },

        updateStep(player, world, inventory, mouse, images, gameStepsCount) {
            if (this.isCollidesCircle(player.x, player.y, player.radius) || this.isPointInside(player.x, player.y)) {
                switch (this.direction) {
                    case 0:
                        player.x -= this.strength;
                        break;
                    case 1:
                        player.y -= this.strength;
                        break;
                    case 2:
                        player.x += this.strength;
                        break;
                    case 3:
                        player.y += this.strength;
                        break;
                }
            }

            this.offset += 10;
        }
    }
    return pusher;
}