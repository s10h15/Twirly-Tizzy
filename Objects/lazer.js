import { createTexture } from "../Helpers/textures.js";
import { getAutoResizedShapeTextureVaiables, getShapeCenter } from "../math.js";
import { closestSegmentPoint } from "../Helpers/collision.js";
import { normalIsCollidesCircle, normalIsPointInside } from "../Helpers/collision.js";
import { isChance } from "../Helpers/random.js";

export function getLazer(vertexes) {
    const lazer = {
        vertexes: vertexes,
        name: "lazer",
        isShouldDisappear: false,
        id: Math.random() * Number.MAX_SAFE_INTEGER,
        gridIndexes: [],

        centerX: 0,
        centerY: 0,
        angle: 0,
        length: 1200,
        color: isChance(0.5) ? "red" : "blue",
        rotationSpeed: isChance(0.5) ? -0.005 : 0.005,

        isPointInside(x, y) {
            return normalIsPointInside(this.vertexes, x, y);
        },

        draw(ctx, offsetX, offsetY, zoomInRate) {
            const startX = (this.centerX - offsetX) * zoomInRate;
            const startY = (this.centerY - offsetY) * zoomInRate;
            const endX = (this.centerX + Math.cos(this.angle) * this.length - offsetX) * zoomInRate;
            const endY = (this.centerY + Math.sin(this.angle) * this.length - offsetY) * zoomInRate;

            const ghostOffset = 10000;

            ctx.save();
            ctx.shadowBlur = 20 * zoomInRate;
            ctx.shadowColor = this.color;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = ghostOffset;
            ctx.lineWidth = 25 * zoomInRate;
            ctx.strokeStyle = this.color;
            ctx.beginPath();
            ctx.moveTo(startX, startY - ghostOffset);
            ctx.lineTo(endX, endY - ghostOffset);
            ctx.stroke();
            ctx.restore();

            ctx.beginPath();
            ctx.lineWidth = 2 * zoomInRate;
            ctx.strokeStyle = "white";
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();

            ctx.save();
            ctx.translate(startX, startY);
            ctx.rotate(this.angle);

            ctx.fillStyle = "#444";
            ctx.fillRect(-45 * zoomInRate, -25 * zoomInRate, 40 * zoomInRate, 50 * zoomInRate);

            ctx.fillStyle = "#666";
            ctx.fillRect(-5 * zoomInRate, -15 * zoomInRate, 30 * zoomInRate, 30 * zoomInRate);

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

        updateCenter() {
            [this.centerX, this.centerY] = getShapeCenter(this.vertexes);
        },

        resolveCollisionCircle(x, y, radius) { },

        isCollidesCircle(x, y, radius) {
            return normalIsCollidesCircle(this.vertexes, x, y, radius);
        },

        getVertexes() {
            return this.vertexes;
        },

        updateFrame(player, world, inventory, mouse, images) {
            
        },
        updateStep(player, world, inventory, mouse, images) {
            this.angle += this.rotationSpeed;

            const x1 = this.centerX;
            const y1 = this.centerY;
            const x2 = this.centerX + Math.cos(this.angle) * this.length;
            const y2 = this.centerY + Math.sin(this.angle) * this.length;

            const dx = x2 - x1;
            const dy = y2 - y1;
            const t = ((player.x - x1) * dx + (player.y - y1) * dy) / (dx * dx + dy * dy);

            const closestT = Math.max(0, Math.min(1, t));

            const closestX = x1 + closestT * dx;
            const closestY = y1 + closestT * dy;

            const distDX = player.x - closestX;
            const distDY = player.y - closestY;
            const distance = Math.sqrt(distDX * distDX + distDY * distDY);

            if (distance < player.radius) {
                player.isDead = true;
            }
        }
    }
    lazer.updateCenter();
    return lazer;
}