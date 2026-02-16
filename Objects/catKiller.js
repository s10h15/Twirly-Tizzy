import { createTexture } from "../Helpers/textures.js";
import { getAutoResizedShapeTextureVaiables } from "../math.js";
import { normalIsCollidesCircle, normalIsPointInside } from "../Helpers/collision.js";

export function getCatKiller(posX, posY, scaleRate, images) {
    const defaultVertexes = [
        [posX, posY],
        [posX + 100, posY],
        [posX + 100, posY + 100],
        [posX, posY + 100]
    ];

    const catKiller = {
        vertexes: defaultVertexes,
        x: posX - ((defaultVertexes[1][0] - defaultVertexes[0][0]) * 0.5),
        y: posY - ((defaultVertexes[2][1] - defaultVertexes[1][1]) * 0.5),
        name: "catKiller",
        isShouldDisappear: false,
        id: Math.random() * Number.MAX_SAFE_INTEGER,
        gridIndexes: [],
        textureX: 0,
        textureY: 0,
        texture: null,
        textureWidth: 0,
        textureHeight: 0,
        alwaysUpdate: true,
        imageForTexture: images?.catKiller1 ?? null,
        speed: 30,
        opacity: 0,
        isMovedLastStep: false,

        isPointInside(x, y) {
            return normalIsPointInside(this.vertexes, x, y);
        },

        isCollidesCircle(x, y, radius) {
            return normalIsCollidesCircle(this.vertexes, x, y, radius);
        },

        draw(ctx, offsetX, offsetY, zoomInRate) {
            if (this.texture == null) {
                return;
            }
            const x = (this.textureX - offsetX) * zoomInRate;
            const y = (this.textureY - offsetY) * zoomInRate;
            ctx.globalAlpha = this.opacity;
            ctx.drawImage(this.texture, x, y, this.textureWidth * zoomInRate, this.textureHeight * zoomInRate);
            ctx.globalAlpha = 1;
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

        moveTexture() {
            const shapePosition = getAutoResizedShapeTextureVaiables(this.vertexes);
            this.textureX = shapePosition.x;
            this.textureY = shapePosition.y;
            this.textureWidth = shapePosition.size;
            this.textureHeight = shapePosition.size;
        },

        generateTexture() {
            if (this.imageForTexture == null) {
                return;
            }
            this.texture = createTexture(64, 64, (ctx) => {
                const size = 64;
                ctx.clearRect(0, 0, size, size);
                ctx.drawImage(this.imageForTexture, 0, 0, 64, 64);
            });
            this.moveTexture();
        },

        updateAI(player) {
            const aiCenterX = this.x + (this.textureWidth / 2);
            const aiCenterY = this.y + (this.textureHeight / 2);

            const dx = player.x - aiCenterX;
            const dy = player.y - aiCenterY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance > this.speed) {
                this.x += (dx / distance) * this.speed * this.opacity;
                this.y += (dy / distance) * this.speed * this.opacity;
            } else {
                this.x = player.x - (this.textureWidth / 2);
                this.y = player.y - (this.textureHeight / 2);
            }
        },

        updateFrame(player, world, inventory) {
            this.moveTexture();
        },
        updateStep(player, world, inventory) {
            if (!player.isDead) {
                this.updateAI(player);
                if (this.isCollidesCircle(player.x, player.y, player.radius)) {
                    player.isDead = true;
                }
            }
            this.vertexes = [
                [this.x, this.y],
                [this.x + this.textureWidth, this.y],
                [this.x + this.textureWidth, this.y + this.textureWidth],
                [this.x, this.y + this.textureWidth]
            ];
            this.opacity += 0.003;
            if (this.opacity > 1) {
                this.opacity = 1;
            }
            this.isMovedLastStep = true;
        },
    }
    catKiller.generateTexture();
    return catKiller;
}