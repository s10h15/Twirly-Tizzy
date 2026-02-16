import { createTexture } from "../Helpers/textures.js";
import { getAutoResizedShapeTextureVaiables, getShapeCenter } from "../math.js";
import { closestSegmentPoint } from "../Helpers/collision.js";
import { normalIsCollidesCircle, normalIsPointInside } from "../Helpers/collision.js";

export function getCatnip(vertexes, images) {
    const catnip = {
        vertexes: vertexes,
        name: "catnip",
        isShouldDisappear: false,
        id: Math.random() * Number.MAX_SAFE_INTEGER,
        gridIndexes: [],
        alwaysUpdate: true,
        isMovedLastStep: false,

        textureX: 0,
        textureY: 0,
        texture: null,
        textureWidth: 0,
        textureHeight: 0,
        imageToUseInTexture: images.dirt ?? null,

        centerX: 0,
        centerY: 0,

        hasInitialized: false,
        stepSpawned: 0,
        stepsToGrow: 60 * 30,
        hasGrown: false,

        updateCenter() {
            [this.centerX, this.centerY] = getShapeCenter(this.vertexes);
        },

        isPlayerAboveVisually(player) {
            return this.hasGrown && player.y < (this.textureY + this.textureHeight * 0.5);
        },

        isPointInside(x, y) {
            return normalIsPointInside(this.vertexes, x, y);
        },

        draw(ctx, offsetX, offsetY, zoomInRate) {
            let textureOffsetY = 0;
            if (this.isSelected) {
                textureOffsetY = -5;
            }
            if (this.texture == null) {
                return;
            }
            const x = (this.textureX - offsetX) * zoomInRate;
            const y = (this.textureY - offsetY) * zoomInRate;
            ctx.drawImage(this.texture, x, y + textureOffsetY, this.textureWidth * zoomInRate, this.textureHeight * zoomInRate);
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

        updateFrame(player, world, inventory, mouse, images, gameStepsCount) {
        },
        updateStep(player, world, inventory, mouse, images, gameStepsCount) {
            if (!this.hasInitialized) {
                this.hasInitialized = true;
                this.stepSpawned = gameStepsCount;
                this.isMovedLastStep = true;
            }
            if (!this.hasGrown && gameStepsCount - this.stepSpawned > this.stepsToGrow) {
                this.hasGrown = true;
                this.imageToUseInTexture = images.catnip;
                this.generateTexture();
            }
            
        },
    }
    catnip.updateCenter();
    catnip.generateTexture();
    return catnip;
}