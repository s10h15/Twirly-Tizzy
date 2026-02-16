import { createTexture } from "../Helpers/textures.js";
import { getAutoResizedShapeTextureVaiables } from "../math.js";
import { normalIsCollidesCircle, normalIsPointInside } from "../Helpers/collision.js";
import { playEffect } from "../Helpers/audio.js";

export function getNormalMushroom(vertexes, images) {
    const wood = {
        vertexes: vertexes,
        name: "normalMushroom",
        isShouldDisappear: false,
        id: Math.random() * Number.MAX_SAFE_INTEGER,
        gridIndexes: [],

        textureX: 0,
        textureY: 0,
        texture: null,
        textureWidth: 0,
        textureHeight: 0,
        imageToUseInTexture: images.normalMushroom || null,

        isPointInside(x, y) {
            return normalIsPointInside(this.vertexes, x, y);
        },

        draw(ctx, offsetX, offsetY, zoomInRate) {
            if (this.texture == null) {
                return;
            }
            const x = (this.textureX - offsetX) * zoomInRate;
            const y = (this.textureY - offsetY) * zoomInRate;
            ctx.drawImage(this.texture, x, y, this.textureWidth * zoomInRate, this.textureHeight * zoomInRate);
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
            this.texture = createTexture(40, 40, (ctx) => {
                const size = 40;
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

        updateFrame(player, world, inventory) {
        },
        updateStep(player, world, inventory) {
            if (this.isCollidesCircle(player.x, player.y, player.radius)) {
                player.radius = player.defaultRadius;
                player.speed = player.defaultSpeed;
                this.isShouldDisappear = true;
                playEffect("stretch2");
            }
        }
    }
    wood.generateTexture();
    return wood;
}