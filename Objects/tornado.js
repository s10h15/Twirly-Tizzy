import { createTexture } from "../Helpers/textures.js";
import { getAutoResizedShapeTextureVaiables, isShapeCollidesShape } from "../math.js";
import { normalIsCollidesCircle, normalIsPointInside } from "../Helpers/collision.js";
import { getShapeCenter } from "../math.js";

export function getTornado(vertexes, images) {
    const shapeCenter = getShapeCenter(vertexes);
    const tornado = {
        vertexes: vertexes,
        name: "tornado",
        isShouldDisappear: false,
        id: Math.random() * Number.MAX_SAFE_INTEGER,
        gridIndexes: [],
        isMovedLastStep: false,

        textureX: 0,
        textureY: 0,
        texture: null,
        textureWidth: 0,
        textureHeight: 0,
        imageForTexture: images.tornado ?? null,

        speed: 100,
        opacity: 0,
        isReady: false,

        x: shapeCenter[0] - ((vertexes[1][0] - vertexes[0][0]) * 0.5),
        y: shapeCenter[1] - ((vertexes[2][1] - vertexes[1][1]) * 0.5),
        targetAngle: Math.random() * Math.PI * 2,
        isSlowlyVanishing: false,
        lastStepMoved: 0,
        directionChangeTimerSteps: 25,
        isSpinningLeft: false,

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
            const width = this.textureWidth * zoomInRate;
            const height = this.textureHeight * zoomInRate;

            ctx.save();
            ctx.globalAlpha = this.opacity;

            if (this.isSpinningLeft) {
                ctx.translate(x + width, y);
                ctx.scale(-1, 1);
                ctx.drawImage(this.texture, 0, 0, width, height);
            } else {
                ctx.drawImage(this.texture, x, y, width, height);
            }

            ctx.restore();
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
            const size = 256;
            this.texture = createTexture(size, size, (ctx) => {
                ctx.clearRect(0, 0, size, size);
                ctx.drawImage(this.imageForTexture, 0, 0, size, size);
            });
            this.moveTexture();
        },

        updateAI(player, world, gameStepsCount) {
            if (Math.hypot(this.x, this.y) > 9000) {
                this.isSlowlyVanishing = true;
                return;
            }

            this.x += Math.cos(this.targetAngle) * this.speed;
            this.y += Math.sin(this.targetAngle) * this.speed;

            if (gameStepsCount - this.lastStepMoved > this.directionChangeTimerSteps) {
                this.targetAngle = Math.random() * Math.PI * 2;
                this.lastStepMoved = gameStepsCount;
                const min = 25;
                const max = 45;
                this.speed = Math.floor(Math.random() * (max - min + 1)) + min;
                this.isSpinningLeft = !this.isSpinningLeft;
            }
        },

        updateFrame(player, world, inventory, mouse, images, gameStepsCount) {
            this.moveTexture();
        },

        movePlayerAround(player) {
            player.flinge(null, null);

            const centerX = this.x + (this.textureWidth / 2);
            const centerY = this.y + (this.textureWidth / 2);
            const diffX = player.x - centerX;
            const diffY = player.y - centerY;
            const distance = Math.sqrt(diffX * diffX + diffY * diffY) || 1;

            const dirX = diffX / distance;
            const dirY = diffY / distance;

            const spinForce = 9;
            const suctionForce = 30;
            const turbulence = 0;
            const maxSpeed = 1200;

            const spinDir = this.isSpinningLeft ? -1 : 1;

            player.speedX += (-dirY * spinForce) * spinDir;
            player.speedY += (dirX * spinForce) * spinDir;
            player.speedX -= (dirX * suctionForce);
            player.speedY -= (dirY * suctionForce);

            player.speedX += (Math.random() - 0.5) * turbulence;
            player.speedY += (Math.random() - 0.5) * turbulence;

            const currentSpeed = Math.sqrt(player.speedX ** 2 + player.speedY ** 2);
            if (currentSpeed > maxSpeed) {
                player.speedX = (player.speedX / currentSpeed) * maxSpeed;
                player.speedY = (player.speedY / currentSpeed) * maxSpeed;
            }
        },

        updateStep(player, world, inventory, mouse, images, gameStepsCount) {
            if (!player.isDead && this.isReady && !this.isSlowlyVanishing) {
                this.updateAI(player, world, gameStepsCount);
                this.isMovedLastStep = true;
                if (!player.isStandingStill && (this.isCollidesCircle(player.x, player.y, player.radius) || this.isPointInside(player.x, player.y))) {
                    this.movePlayerAround(player);
                }
            }
            if (this.isReady) {
                if (this.isSlowlyVanishing) {
                    this.opacity -= 0.01;
                    if (this.opacity < 0) {
                        this.isShouldDisappear = true;
                        world.isStrictUpdateGrid = true;
                        return;
                    }
                }
            } else {
                if (this.opacity >= 1) {
                    this.isReady = true;
                    this.lastStepMoved = gameStepsCount;
                } else {
                    this.opacity += 0.01;
                }
            }
            this.vertexes = [
                [this.x, this.y],
                [this.x + this.textureWidth, this.y],
                [this.x + this.textureWidth, this.y + this.textureWidth],
                [this.x, this.y + this.textureWidth]
            ];
        },
    }
    tornado.generateTexture();
    return tornado;
}