import { createTexture } from "../Helpers/textures.js";
import { getAutoResizedShapeTextureVaiables, getShapeCenter } from "../math.js";
import { closestSegmentPoint } from "../Helpers/collision.js";
import { normalIsCollidesCircle, normalIsPointInside } from "../Helpers/collision.js";
import { playEffect } from "../Helpers/audio.js";

export function getBomb(vertexes, images, explosionRadius = 500) {
    const bomb = {
        vertexes: vertexes,
        name: "bomb",
        isShouldDisappear: false,
        id: Math.random() * Number.MAX_SAFE_INTEGER,
        gridIndexes: [],

        textureX: 0,
        textureY: 0,
        texture: null,
        textureWidth: 0,
        textureHeight: 0,
        imageToUseInTexture: images.bomb || null,
        strength: 135,
        centerX: 0,
        centerY: 0,
        explosionRadius: explosionRadius,

        updateCenter() {
            [this.centerX, this.centerY] = getShapeCenter(this.vertexes);
        },
        isPointInside(x, y) {
            return normalIsPointInside(this.vertexes, x, y);
        },

        draw(ctx, offsetX, offsetY, zoomInRate) {
            if (this.texture == null) return;

            const x = (this.textureX - offsetX) * zoomInRate;
            const y = (this.textureY - offsetY) * zoomInRate;
            ctx.drawImage(this.texture, x, y, this.textureWidth * zoomInRate, this.textureHeight * zoomInRate);

            const centerX = (this.centerX - offsetX) * zoomInRate;
            const centerY = (this.centerY - offsetY) * zoomInRate;
            const radius = this.explosionRadius * zoomInRate;

            if (radius > 0) {
                ctx.save();
                ctx.beginPath();
                ctx.setLineDash([0.05 * this.explosionRadius]);
                ctx.strokeStyle = "white";
                ctx.lineWidth = 3 * zoomInRate;
                ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
            }
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

        generateTexture() {
            const size = 64;
            this.texture = createTexture(size, size, (ctx) => {
                ctx.clearRect(0, 0, size, size);
                if (this.imageToUseInTexture !== null) {
                    ctx.drawImage(this.imageToUseInTexture, 0, 0, size, size);
                }
            });

            const shapePosition = getAutoResizedShapeTextureVaiables(this.vertexes);
            this.textureX = shapePosition.x;
            this.textureY = shapePosition.y;
            this.textureWidth = shapePosition.size;
            this.textureHeight = shapePosition.size;
        },

        updateFrame(player, world, inventory, mouse, images, gameStepsCount) { },

        updateStep(player, world, inventory, mouse, images, gameStepsCount) {
            let dx = player.x - this.centerX;
            let dy = player.y - this.centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance <= this.explosionRadius + player.radius) {
                if (distance > 0.1) {
                    player.flinge((dx / distance) * this.strength, (dy / distance) * this.strength)
                } else {
                    player.flinge(0, -this.strength);
                }
                this.isShouldDisappear = true;
            }
        }
    }
    bomb.generateTexture();
    bomb.updateCenter();
    return bomb;
}