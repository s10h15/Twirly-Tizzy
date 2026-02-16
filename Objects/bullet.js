import { createTexture } from "../Helpers/textures.js";
import { getAutoResizedShapeTextureVaiables, getDistance, getRectangleVertexes, getShapeCenter } from "../math.js";
import { closestSegmentPoint } from "../Helpers/collision.js";
import { normalIsCollidesCircle, normalIsPointInside } from "../Helpers/collision.js";

export function getBullet(x, y, size, speedX, speedY, lifeTime, color) {
    const bullet = {
        vertexes: getRectangleVertexes(x - size * 0.5, y - size * 0.5, size, size),
        name: "bullet",
        isShouldDisappear: false,
        id: Math.random() * Number.MAX_SAFE_INTEGER,
        gridIndexes: [],
        isMovedLastStep: false,

        trueX: x,
        trueY: y,
        trueSize: size,
        halfSize: size * 0.5,
        speedX: speedX,
        speedY: speedY,
        lifeTimeSteps: lifeTime,
        stepSpawned: 0,
        hasInitialized: false,
        color: color,

        isPointInside(x, y) {
            return normalIsPointInside(this.vertexes, x, y);
        },

        draw(ctx, offsetX, offsetY, zoomInRate) {
            const circleX = (this.trueX - offsetX) * zoomInRate;
            const circleY = (this.trueY - offsetY) * zoomInRate;
            const circleRadius = 8.5 * zoomInRate;
            ctx.beginPath();
            ctx.arc(circleX, circleY, circleRadius, 0, 2 * Math.PI);
            ctx.fillStyle = this.color;
            ctx.fill();
            ctx.closePath();
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

        updateTexturePosition() { },

        generateTexture() { },

        updateFrame(player, world, inventory, mouse, images, gameStepsCount, console) {
        },
        updateStep(player, world, inventory, mouse, images, gameStepsCount, console) {
            if (!this.hasInitialized) {
                this.hasInitialized = true;
                this.stepSpawned = gameStepsCount;
            }
            if (gameStepsCount - this.stepSpawned > this.lifeTimeSteps) {
                this.isShouldDisappear = true;
            }
            if (this.isCollidesCircle(player.x, player.y, player.radius)) {
                player.isDead = true;
            }

            this.trueX += this.speedX;
            this.trueY += this.speedY;

            this.vertexes = getRectangleVertexes(this.trueX - this.halfSize, this.trueY - this.halfSize, this.trueSize, this.trueSize);
            
            this.isMovedLastStep = true;
        }
    }
    return bullet;
}