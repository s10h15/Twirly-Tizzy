import { createTexture } from "../Helpers/textures.js";
import { getAutoResizedShapeTextureVaiables, isShapeCollidesShape, getDistance, getShapeCenter } from "../math.js";
import { normalIsCollidesCircle, normalIsPointInside } from "../Helpers/collision.js";

const imagesToUse = ["catKiller1", "bigEyedCat", "bigNoseCat", "niels"];

export function getCatChaser(vertexes, images) {
    const shapeCenter = getShapeCenter(vertexes);
    const catChaser = {
        vertexes: vertexes,
        name: "catChaser",
        isShouldDisappear: false,
        id: Math.random() * Number.MAX_SAFE_INTEGER,
        gridIndexes: [],

        textureX: 0,
        textureY: 0,
        texture: null,
        textureWidth: 0,
        textureHeight: 0,
        alwaysUpdate: true,
        imageForTexture: images[imagesToUse[Math.floor(Math.random() * imagesToUse.length)]] ?? null,

        isMovedLastStep: false,
        lastStepMoved: 0,
        delayToMoveAgainSteps: 30,
        opacity: 0,
        isReady: false,

        x: shapeCenter[0] - ((vertexes[1][0] - vertexes[0][0]) * 0.5),
        y: shapeCenter[1] - ((vertexes[2][1] - vertexes[1][1]) * 0.5),
        speedX: 0,
        speedY: 0,
        burstStrength: 22.5,
        isSlowlyVanishing: false,

        moodState: "zoomies",
        lastMoodSwitch: 0,
        knowsWherePlayerIs: true,

        isPointInside(x, y) {
            return normalIsPointInside(this.vertexes, x, y);
        },

        isCollidesCircle(x, y, radius) {
            return normalIsCollidesCircle(this.vertexes, x, y, radius);
        },

        draw(ctx, offsetX, offsetY, zoomInRate) {
            if (this.texture == null) return;

            const x = (this.textureX - offsetX) * zoomInRate;
            const y = (this.textureY - offsetY) * zoomInRate;
            const w = this.textureWidth * zoomInRate;
            const h = this.textureHeight * zoomInRate;

            ctx.globalAlpha = this.opacity;
            ctx.drawImage(this.texture, x, y, w, h);
            ctx.globalAlpha = 1;

            if (!this.knowsWherePlayerIs) {
                const offset = 10 * zoomInRate;

                ctx.fillStyle = "white";
                ctx.font = `bold ${50 * zoomInRate}px Arial`;

                ctx.textAlign = "center";
                ctx.textBaseline = "middle";

                ctx.fillText("?", x + w + offset, y - offset);

                ctx.textAlign = "start";
                ctx.textBaseline = "alphabetic";
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
            this.texture = createTexture(64, 64, (ctx) => {
                const size = 64;
                ctx.clearRect(0, 0, size, size);
                ctx.drawImage(this.imageForTexture, 0, 0, 64, 64);
            });
            this.moveTexture();
        },

        updateAI(player, world, inventory, gameStepsCount) {
            const aiCenterX = this.x + (this.textureWidth / 2);
            const aiCenterY = this.y + (this.textureHeight / 2);

            this.knowsWherePlayerIs = player.isVisible && getDistance(player.x, player.y, this.x, this.y) < 2000;

            this.x += this.speedX;
            this.y += this.speedY;

            if (world.objects.catnips && world.objectsToAlwaysUpdate.length > 0) {
                world.objectsToAlwaysUpdate.forEach(nip => {
                    if (nip.name == "catnip" && nip.hasGrown) {
                        if (nip.isPointInside(this.x, this.y) || isShapeCollidesShape(nip.vertexes, this.vertexes)) {
                            nip.isShouldDisappear = true;
                            world.isStrictUpdateGrid = true;
                            this.isSlowlyVanishing = true;
                        }
                    }
                });
            }

            const hasSeeds = inventory.countItem("seed") > 0;
            const currentDelay = hasSeeds ? 7 : this.delayToMoveAgainSteps;

            if (gameStepsCount - this.lastStepMoved > currentDelay) {

                if (!this.knowsWherePlayerIs) {
                    const randomAngle = Math.random() * Math.PI * 2;
                    const wanderSpeed = this.burstStrength * 0.6;
                    this.speedX = Math.cos(randomAngle) * wanderSpeed;
                    this.speedY = Math.sin(randomAngle) * wanderSpeed;

                } else if (hasSeeds) {
                    if (gameStepsCount - this.lastMoodSwitch > 90) {
                        this.moodState = Math.random() > 0.4 ? "zoomies" : "chase";
                        this.lastMoodSwitch = gameStepsCount;
                    }

                    const dx = player.x - aiCenterX;
                    const dy = player.y - aiCenterY;
                    const angleToPlayer = Math.atan2(dy, dx);
                    let finalAngle;

                    if (this.moodState === "zoomies") {
                        finalAngle = Math.random() * Math.PI * 2;
                    } else {
                        const wobble = (Math.random() - 0.5) * (300 * Math.PI / 180);
                        finalAngle = angleToPlayer + wobble;
                    }

                    const fastSpeed = this.burstStrength * 2.3;
                    this.speedX = Math.cos(finalAngle) * fastSpeed;
                    this.speedY = Math.sin(finalAngle) * fastSpeed;

                } else {
                    let targetX = player.x;
                    let targetY = player.y;
                    let minDistance = 1500;

                    if (world.objects.catnips && world.objectsToAlwaysUpdate.length > 0) {
                        world.objectsToAlwaysUpdate.forEach(nip => {
                            if (nip.name == "catnip" && nip.hasGrown) {
                                const dist = Math.sqrt(Math.pow(nip.centerX - aiCenterX, 2) + Math.pow(nip.centerY - aiCenterY, 2));
                                if (dist < minDistance) {
                                    minDistance = dist;
                                    targetX = nip.centerX;
                                    targetY = nip.centerY;
                                }
                            }
                        });
                    }

                    const dx = targetX - aiCenterX;
                    const dy = targetY - aiCenterY;

                    let correctDir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up");

                    if (Math.random() < 0.35) {
                        const dirs = ["up", "down", "left", "right"].filter(d => d !== correctDir);
                        const rd = dirs[Math.floor(Math.random() * 3)];
                        this.speedX = rd === "left" ? -this.burstStrength * 0.4 : (rd === "right" ? this.burstStrength * 0.4 : 0);
                        this.speedY = rd === "up" ? -this.burstStrength * 0.4 : (rd === "down" ? this.burstStrength * 0.4 : 0);
                    } else {
                        const pwr = this.burstStrength * (0.7 + Math.random() * 0.6);
                        this.speedX = (correctDir === "left" || correctDir === "right") ? (dx > 0 ? pwr : -pwr) : 0;
                        this.speedY = (correctDir === "up" || correctDir === "down") ? (dy > 0 ? pwr : -pwr) : 0;
                    }
                }

                this.lastStepMoved = gameStepsCount;
            }

            const damp = hasSeeds ? 0.97 : 0.9;
            this.speedX *= damp;
            this.speedY *= damp;
        },

        updateFrame(player, world, inventory, mouse, images, gameStepsCount) {
            this.moveTexture();
        },
        updateStep(player, world, inventory, mouse, images, gameStepsCount) {
            if (!player.isDead && this.isReady && !this.isSlowlyVanishing) {
                this.updateAI(player, world, inventory, gameStepsCount);
                if (this.isCollidesCircle(player.x, player.y, player.radius)) {
                    player.isDead = true;
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
                } else {
                    this.opacity += 0.003;
                }
            }
            this.vertexes = [
                [this.x, this.y],
                [this.x + this.textureWidth, this.y],
                [this.x + this.textureWidth, this.y + this.textureWidth],
                [this.x, this.y + this.textureWidth]
            ];
            if (gameStepsCount % 30 == 0) {
                this.isMovedLastStep = true;
            }
        },
    }
    catChaser.generateTexture();
    return catChaser;
}