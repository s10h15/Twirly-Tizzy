import { createTexture } from "../Helpers/textures.js";
import { getAutoResizedShapeTextureVaiables, getDistance } from "../math.js";
import { normalIsCollidesCircle, normalIsPointInside } from "../Helpers/collision.js";
import { getShapeCenter } from "../math.js";
export function getCatStealer(vertexes, images) {
    const shapeCenter = getShapeCenter(vertexes);
    const catStealer = {
        vertexes: vertexes,
        name: "catStealer",
        isShouldDisappear: false,
        id: Math.random() * Number.MAX_SAFE_INTEGER,
        gridIndexes: [],
        isMovedLastStep: false,

        textureX: 0,
        textureY: 0,
        texture: null,
        textureWidth: 0,
        textureHeight: 0,
        imageForTexture: images.catStealer ?? null,

        speed: 20,
        opacity: 0,
        isReady: false,

        x: shapeCenter[0] - ((vertexes[1][0] - vertexes[0][0]) * 0.5),
        y: shapeCenter[1] - ((vertexes[2][1] - vertexes[1][1]) * 0.5),
        targetAngle: Math.random() * Math.PI * 2,
        currentAngle: Math.random() * Math.PI * 2,
        isSlowlyVanishing: false,
        lastStepMoved: 0,
        directionChangeTimerSteps: 60,
        isLookingLeft: false,
        rotationSpeed: 0.045,

        directionOffset: 0,
        offsetChangeSpeed: 0.3,
        maxOffsetRange: 1,

        baseRotationSpeed: 0.04,
        rotationFluctuation: 0.03,
        rotationFrequency: 0.03,

        lastStepSawCoins: 0,
        stepsToSeekCoins: 60 * 5,

        framesAlive: 0,
        knowsWherePlayerIs: true,

        isPointInside(x, y) {
            return normalIsPointInside(this.vertexes, x, y);
        },

        isCollidesCircle(x, y, radius) {
            return normalIsCollidesCircle(this.vertexes, x, y, radius);
        },

        draw(ctx, offsetX, offsetY, zoomInRate) {
            if (this.texture == null) return;

            const width = this.textureWidth * zoomInRate;
            const height = this.textureHeight * zoomInRate;

            const centerX = (this.textureX - offsetX) * zoomInRate + width / 2;
            const centerY = (this.textureY - offsetY) * zoomInRate + height / 2;

            // 1. Draw the Entity
            ctx.save();
            ctx.globalAlpha = this.opacity;
            ctx.translate(centerX, centerY);

            const movingLeft = Math.cos(this.currentAngle) < 0;
            if (movingLeft) {
                ctx.rotate(this.currentAngle);
                ctx.scale(1, -1);
            } else {
                ctx.rotate(this.currentAngle);
            }

            ctx.drawImage(this.texture, -width / 2, -height / 2, width, height);
            ctx.restore(); // Restore here so the "?" doesn't rotate or flip
            ctx.globalAlpha = 1;

            // 2. Draw the Indicator (staying upright)
            if (!this.knowsWherePlayerIs) {
                const offset = 10 * zoomInRate;

                console.log(123)

                // Since centerX/Y is the middle, the top-right is:
                // Center + half width (right) and Center - half height (top)
                const markX = centerX + (width / 2) + offset;
                const markY = centerY - (height / 2) - offset;

                ctx.fillStyle = "white";
                ctx.font = `bold ${75 * zoomInRate}px Arial`;
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";

                ctx.fillText("?", markX, markY);
            }
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

        updateAI(player, world, gameStepsCount, inventory) {
            const hasCoins = inventory.countItem("coin") > 0;
            const isPlayerVisible = player.isVisible && getDistance(player.x, player.y, this.x, this.y) < 2000;
            this.knowsWherePlayerIs = isPlayerVisible;

            if (!hasCoins || !isPlayerVisible) {

                if (gameStepsCount % 5 === 0 || !this.wanderAngle) {
                    this.wanderAngle = Math.random() * Math.PI * 2;
                }
                this.targetAngle = this.wanderAngle;

                const crazyTurnStrength = 0.1;
                const angleDiff = this.targetAngle - this.currentAngle;
                const shortAngleDiff = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff));
                this.currentAngle += shortAngleDiff * crazyTurnStrength;

                if (!hasCoins) {
                    if (gameStepsCount - this.lastStepSawCoins > this.stepsToSeekCoins) {
                        this.isSlowlyVanishing = true;
                        return;
                    }
                } else {
                    this.lastStepSawCoins = gameStepsCount;
                }
            }
            else {
                this.lastStepSawCoins = gameStepsCount;

                const dx = player.x - (this.x + this.textureWidth * 0.5);
                const dy = player.y - (this.y + this.textureHeight * 0.5);
                const perfectAngle = Math.atan2(dy, dx);

                this.directionOffset = Math.sin((gameStepsCount + this.id) * this.offsetChangeSpeed) * this.maxOffsetRange;
                this.targetAngle = perfectAngle + this.directionOffset;

                const turnStrength = this.baseRotationSpeed + Math.sin(gameStepsCount * this.rotationFrequency) * this.rotationFluctuation;
                const angleDiff = this.targetAngle - this.currentAngle;
                const shortAngleDiff = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff));
                this.currentAngle += shortAngleDiff * turnStrength;
            }

            this.x += Math.cos(this.currentAngle) * this.speed;
            this.y += Math.sin(this.currentAngle) * this.speed;

            if (Math.cos(this.currentAngle) !== 0) {
                this.isLookingLeft = Math.cos(this.currentAngle) < 0;
            }

            if (gameStepsCount % 30 == 0) {
                this.isMovedLastStep = true;
            }
        },

        updateFrame(player, world, inventory, mouse, images, gameStepsCount) {
            this.moveTexture();
        },

        updateStep(player, world, inventory, mouse, images, gameStepsCount) {
            if (!this.isReady) {
                this.opacity += 0.01;

                if (this.opacity >= 1) {
                    this.opacity = 1;
                    this.isReady = true;

                    if (!player.isVisible || inventory.countItem("coin") <= 0) {
                        this.isSlowlyVanishing = true;
                        this.isReady = true;
                    }

                    this.lastStepSawCoins = (inventory.countItem("coin") > 0)
                        ? gameStepsCount
                        : (gameStepsCount - this.stepsToSeekCoins - 1);
                }
            }
            else if (this.isSlowlyVanishing) {
                this.opacity -= 0.01;
                if (this.opacity <= 0) {
                    this.isShouldDisappear = true;
                    world.isStrictUpdateGrid = true;
                    return;
                }
            }
            else if (!player.isDead) {
                this.updateAI(player, world, gameStepsCount, inventory);

                if (!this.isSlowlyVanishing) {
                    const dist = getDistance(player.x, player.y, this.x + this.textureWidth * 0.5, this.y + this.textureHeight * 0.5);
                    if (dist < player.radius) {
                        inventory.takeItem("coin", 9999999999);
                        this.isSlowlyVanishing = true;
                    }
                }
            }

            this.updateVertexes();
        },
        updateVertexes() {
            this.vertexes = [
                [this.x, this.y],
                [this.x + this.textureWidth, this.y],
                [this.x + this.textureWidth, this.y + this.textureHeight],
                [this.x, this.y + this.textureHeight]
            ];
        }
    }
    catStealer.generateTexture();
    return catStealer;
}