import { createTexture } from "../Helpers/textures.js";
import { getAutoResizedShapeTextureVaiables, getRectangleVertexes } from "../math.js";
import { closestSegmentPoint } from "../Helpers/collision.js";
import { normalIsCollidesCircle, normalIsPointInside } from "../Helpers/collision.js";

export function getBananaPeel(vertexes, images) {
    const bananaPeel = {
        vertexes: vertexes,
        name: "bananaPeel",
        isShouldDisappear: false,
        id: Math.random() * Number.MAX_SAFE_INTEGER,
        gridIndexes: [],

        textureX: 0,
        textureY: 0,
        texture: null,
        textureWidth: 0,
        textureHeight: 0,
        imageToUseInTexture: images.bananaPeel ?? null,

        slipyness: 11,

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
        generateMiniatureTexture() {
            const size = 64;
            return createTexture(size, size, (ctx) => {
                ctx.clearRect(0, 0, size, size);
                if (this.imageToUseInTexture == null) {
                    return;
                }
                ctx.drawImage(this.imageToUseInTexture, 0, 0, size, size);
            });
        },

        updateFrame(player, world, inventory, mouse, images, gameStepsCount) {
        },
        updateStep(player, world, inventory, mouse, images, gameStepsCount) {
            if (this.isPointInside(player.x, player.y) || this.isCollidesCircle(player.x, player.y, player.radius)) {
                this.isShouldDisappear = true;

                let dx = player.x - player.prevX;
                let dy = player.y - player.prevY;

                let magnitude = Math.sqrt(dx * dx + dy * dy);

                let vx = 0;
                let vy = 0;
                if (magnitude > 0) {
                    vx = (dx / magnitude) * this.slipyness;
                    vy = (dy / magnitude) * this.slipyness;
                }

                const maxRotation = 60 * (Math.PI / 180);
                const randomAngle = (Math.random() - 0.5) * 2 * maxRotation;

                player.slide(vx * Math.cos(randomAngle) - vy * Math.sin(randomAngle), vx * Math.sin(randomAngle) + vy * Math.cos(randomAngle), gameStepsCount, 60 * 4);
            }
        },
    }
    bananaPeel.generateTexture();
    return bananaPeel;
}