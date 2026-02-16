import { createTexture } from "../Helpers/textures.js";
import { getAutoResizedShapeTextureVaiables, getShapeCenter } from "../math.js";
import { normalIsCollidesCircle, normalIsPointInside, closestSegmentPoint, normalRecenterVertexes } from "../Helpers/collision.js";
import { drawEquipableObject } from "../Helpers/repetitiveDraws.js";

export function getPotion(vertexes, images) {
    const potion = {
        vertexes: vertexes,
        name: "potion",
        isShouldDisappear: false,
        id: Math.random() * Number.MAX_SAFE_INTEGER,
        gridIndexes: [],
        isUsable: true,

        textureX: 0,
        textureY: 0,
        texture: null,
        textureWidth: 0,
        textureHeight: 0,
        imageToUseInTexture: images.potion ?? null,
        numToGive: 1,

        centerX: 0,
        centerY: 0,

        isSelected: false,

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

        updateCenter() {
            [this.centerX, this.centerY] = getShapeCenter(this.vertexes);
        },

        isPointInside(x, y) {
            return normalIsPointInside(this.vertexes, x, y);
        },

        draw(ctx, offsetX, offsetY, zoomInRate) {
            drawEquipableObject(ctx, offsetX, offsetY, zoomInRate, this.texture, this.textureX, this.textureY, this.textureWidth, this.textureHeight, this.numToGive, this.isSelected);
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
            this.isSelected = this.isPointInside(player.x, player.y) || this.isCollidesCircle(player.x, player.y, player.radius);
            if (this.isSelected && player.isInteracting && inventory.canPickUp(this.name)) {
                this.isShouldDisappear = true;
                inventory.giveItem(this, this.numToGive);
                player.isInteracting = false;
            }
        },

        use(player, gameStepsCount, world, images) {
            if (!player.isVisible || player.isTurningInvisible || player.isTurningVisible || world.objects.fires[0].remainingStrength <= 0) {
                return false;
            } else {
                player.makeInvisible(gameStepsCount);
                return true;
            }
        }
    }
    potion.updateCenter();
    potion.generateTexture();
    return potion;
}