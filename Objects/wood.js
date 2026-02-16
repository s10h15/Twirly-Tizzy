import { createTexture } from "../Helpers/textures.js";
import { getAutoResizedShapeTextureVaiables, getShapeCenter } from "../math.js";
import { normalIsCollidesCircle, normalIsPointInside, normalRecenterVertexes, closestSegmentPoint } from "../Helpers/collision.js";
import { drawEquipableObject } from "../Helpers/repetitiveDraws.js";

function determineTextureImage(sizeType, images) {
    if (!images) {
        return null;
    }
    if (sizeType == 0) {
        return images.smallWood;
    } else if (sizeType == 1) {
        return images.mediumWood;
    } else if (sizeType == 2) {
        return images.largeWood;
    } else {
        return null;
    }
}

export function getWood(vertexes, images, sizeType) {
    const imageToUse = determineTextureImage(sizeType, images);

    const amounts = { 0: 1, 1: 2, 2: 5 };
    const numToGive = amounts[sizeType] || 1;

    const wood = {
        vertexes: vertexes,
        name: "wood",
        isShouldDisappear: false,
        id: Math.random() * Number.MAX_SAFE_INTEGER,
        gridIndexes: [],

        textureX: 0,
        textureY: 0,
        texture: null,
        textureWidth: 0,
        textureHeight: 0,
        sizeType: sizeType,
        imageToUseInTexture: imageToUse || null,
        imageToUseInMiniature: images?.mediumWood ?? null,
        numToGive: numToGive,
        hasBeenDropped: false,

        centerX: 0,
        centerY: 0,

        recenterVertexes(x, y) {
            this.vertexes = normalRecenterVertexes(x, y, this.textureWidth, this.textureHeight);
            this.moveTexture();
        },
        moveTexture() {
            const shapePosition = getAutoResizedShapeTextureVaiables(this.vertexes);
            this.textureX = shapePosition.x;
            this.textureY = shapePosition.y;
            this.textureWidth = shapePosition.size;
            this.textureHeight = shapePosition.size;
        },

        isPointInside(x, y) {
            return normalIsPointInside(this.vertexes, x, y);
        },

        draw(ctx, offsetX, offsetY, zoomInRate) {
            const numberToDraw = this.hasBeenDropped ? this.numToGive : 0;
            drawEquipableObject(ctx, offsetX, offsetY, zoomInRate, this.texture, this.textureX, this.textureY, this.textureWidth, this.textureHeight, numberToDraw, false);
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

        updateCenter() {
            [this.centerX, this.centerY] = getShapeCenter(this.vertexes);
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
        generateMiniatureTexture() {
            return createTexture(80, 80, (ctx) => {
                const size = 80;
                ctx.clearRect(0, 0, size, size);

                if (this.imageToUseInMiniature == null) {
                    return;
                }
                ctx.drawImage(this.imageToUseInMiniature, 0, 0, size, size);
            });
        },

        updateFrame(player, world, inventory) { },
        updateStep(player, world, inventory) {
            if (this.isCollidesCircle(player.x, player.y, player.radius) && inventory.canPickUp(this.name)) {
                this.isShouldDisappear = true;

                inventory.giveItem(this, this.numToGive);

                const nextSizeType = Math.round(Math.random() * 2);
                const woodSize = 85 + nextSizeType * 10;
                const woodRadius = Math.hypot(woodSize, woodSize) * 0.5;

                const spawnPos = world.getEmptyPosForCircle(woodRadius, player, ["walls", "spawners"]);

                if (spawnPos) {
                    const [rx, ry] = spawnPos;
                    const x = rx - woodSize * 0.5;
                    const y = ry - woodSize * 0.5;

                    const vertices = [
                        [x, y],
                        [x + woodSize, y],
                        [x + woodSize, y + woodSize],
                        [x, y + woodSize]
                    ];

                    world.objects.wood.push(getWood(vertices, images, nextSizeType));
                    world.isStrictUpdateGrid = true;
                }
            }
        }
    }
    wood.updateCenter();
    wood.generateTexture();
    return wood;
}