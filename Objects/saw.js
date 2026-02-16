import { createTexture } from "../Helpers/textures.js";
import { getAutoResizedShapeTextureVaiables, getDistance, getRectangleVertexes } from "../math.js";
import { closestSegmentPoint } from "../Helpers/collision.js";
import { normalIsCollidesCircle, normalIsPointInside } from "../Helpers/collision.js";

export function getSaw(size, images, startX, startY, endX, endY, speed) {
    const saw = {
        vertexes: getRectangleVertexes(startX, startY, size, size),
        name: "saw",
        isShouldDisappear: false,
        id: Math.random() * Number.MAX_SAFE_INTEGER,
        gridIndexes: [],
        isMovedLastStep: false,

        textureX: 0,
        textureY: 0,
        texture: null,
        textureWidth: 0,
        textureHeight: 0,
        imageToUseInTexture: images.saw ?? null,
        textureRotation: 0,

        isSelected: false,

        startX: startX,
        startY: startY,
        endX: endX,
        endY: endY,
        speed: speed || null,
        progress: 0,
        movingForward: true,

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
            const y = (this.textureY - offsetY + textureOffsetY) * zoomInRate;
            const w = this.textureWidth * zoomInRate;
            const h = this.textureHeight * zoomInRate;

            ctx.save();
            ctx.translate(x + w / 2, y + h / 2);
            ctx.rotate((this.textureRotation * Math.PI) / 180);
            ctx.drawImage(this.texture, -w / 2, -h / 2, w, h);
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

        updateTexturePosition() {
            const shapePosition = getAutoResizedShapeTextureVaiables(this.vertexes);
            this.textureX = shapePosition.x;
            this.textureY = shapePosition.y;
            this.textureWidth = shapePosition.size;
            this.textureHeight = shapePosition.size;
        },

        generateTexture() {
            const size = 1024;
            this.texture = createTexture(size, size, (ctx) => {
                ctx.clearRect(0, 0, size, size);

                if (this.imageToUseInTexture !== null) {
                    ctx.drawImage(this.imageToUseInTexture, 0, 0, size, size);
                }
            });
            this.updateTexturePosition();
        },

        updateFrame(player, world, inventory, mouse, images, gameStepsCount, console) {
            this.updateTexturePosition();
        },
        updateStep(player, world, inventory, mouse, images, gameStepsCount, console) {
            if (this.isCollidesCircle(player.x, player.y, player.radius)) {
                player.isDead = true;
                console.addMessage("\"Приду тебе бошку отпилю\" ahh saw", 3000, "white");
            }
            this.textureRotation += 35;

            if (this.speed !== null) {
                const totalDist = getDistance(this.startX, this.startY, this.endX, this.endY);

                const step = this.speed / totalDist;

                if (this.movingForward) {
                    this.progress += step;
                    if (this.progress >= 1) {
                        this.progress = 1;
                        this.movingForward = false;
                    }
                } else {
                    this.progress -= step;
                    if (this.progress <= 0) {
                        this.progress = 0;
                        this.movingForward = true;
                    }
                }

                const currentX = this.startX + (this.endX - this.startX) * this.progress;
                const currentY = this.startY + (this.endY - this.startY) * this.progress;

                this.vertexes = getRectangleVertexes(currentX, currentY, size, size);

                this.isMovedLastStep = true;

                this.updateTexturePosition();
            }
        }
    }
    saw.generateTexture();
    return saw;
}