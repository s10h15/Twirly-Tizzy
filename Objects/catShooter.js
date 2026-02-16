import { createTexture } from "../Helpers/textures.js";
import { getAutoResizedShapeTextureVaiables, getDistance, isShapeCollidesShape, getShapeCenter } from "../math.js";
import { normalIsCollidesCircle, normalIsPointInside } from "../Helpers/collision.js";
import { getBullet } from "../Objects/bullet.js";
import { getRandomInt } from "../Helpers/random.js";

export function getCatShooter(vertexes, images) {
    const shapeCenter = getShapeCenter(vertexes);
    const catShooter = {
        vertexes: vertexes,
        name: "catShooter",
        isShouldDisappear: false,
        id: Math.random() * Number.MAX_SAFE_INTEGER,
        gridIndexes: [],

        textureX: 0,
        textureY: 0,
        texture: null,
        textureWidth: 0,
        textureHeight: 0,
        alwaysUpdate: true,
        imageForTexture: images.catWithGun ?? null,

        speed: 5,
        isMovedLastStep: false,
        lastStepMoved: 0,
        delayToMoveAgainSteps: 30,
        opacity: 0,
        isReady: false,

        x: shapeCenter[0] - ((vertexes[1][0] - vertexes[0][0]) * 0.5),
        y: shapeCenter[1] - ((vertexes[2][1] - vertexes[1][1]) * 0.5),
        targetAngle: 0,
        bulletSpeed: 15,
        drunkStepTimer: 50,
        lastTimeSpawnedBullet: 0,
        bulletDelay: 17,
        bulletsShot: 0,
        phase: getRandomInt(0, 5000),
        seesCatnip: false,
        isSlowlyVanishing: false,
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

        updateAI(player, world, gameStepsCount) {
            this.x += Math.cos(this.targetAngle) * this.speed;
            this.y += Math.sin(this.targetAngle) * this.speed;

            this.knowsWherePlayerIs = player.isVisible && getDistance(player.x, player.y, this.x, this.y) < 2000;

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

            if (gameStepsCount - this.lastStepMoved > this.drunkStepTimer) {
                const aiCenterX = this.x + (this.textureWidth / 2);
                const aiCenterY = this.y + (this.textureHeight / 2);

                this.seesCatnip = false;

                let targetX = null;
                let targetY = null;
                let minDistance = 3000;

                world.objectsToAlwaysUpdate.forEach(nip => {
                    if (nip.name == "catnip" && nip.hasGrown) {
                        const dx = nip.centerX - aiCenterX;
                        const dy = nip.centerY - aiCenterY;
                        const distance = Math.sqrt(dx * dx + dy * dy);

                        if (distance < minDistance) {
                            minDistance = distance;
                            targetX = nip.centerX;
                            targetY = nip.centerY;
                            this.seesCatnip = true;
                        }
                    }
                });

                if (this.seesCatnip) {
                    const dx = targetX - aiCenterX;
                    const dy = targetY - aiCenterY;
                    const trueAngle = Math.atan2(dy, dx);
                    this.targetAngle = trueAngle + (Math.random() - 0.5) * 0.5;
                }
                else if (this.knowsWherePlayerIs) {
                    const dx = player.x - aiCenterX;
                    const dy = player.y - aiCenterY;
                    const trueAngle = Math.atan2(dy, dx);
                    this.targetAngle = trueAngle + (Math.random() - 0.5) * 2.0;
                }
                else {
                    this.targetAngle += (Math.random() - 0.5) * Math.PI;
                }

                this.lastStepMoved = gameStepsCount;
            }
        },

        updateFrame(player, world, inventory, mouse, images, gameStepsCount) {
            this.moveTexture();
        },

        updateStep(player, world, inventory, mouse, images, gameStepsCount) {
            if (!player.isDead && this.isReady && !this.isSlowlyVanishing) {
                this.updateAI(player, world, gameStepsCount);
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

            const waveFrequency = 0.02;
            const isShootingWindow = Math.sin((gameStepsCount + this.phase) * waveFrequency) > 0;

            if (!this.isSlowlyVanishing && !this.seesCatnip && this.knowsWherePlayerIs && isShootingWindow && this.isReady && gameStepsCount - this.lastTimeSpawnedBullet > this.bulletDelay) {
                const centerX = this.x + this.textureWidth / 2;
                const centerY = this.y + (this.textureHeight / 2);
                const bulletVX = Math.cos(this.targetAngle) * this.bulletSpeed;
                const bulletVY = Math.sin(this.targetAngle) * this.bulletSpeed;

                const colorWave = (Math.sin(this.bulletsShot * 0.1) + 1) / 2;
                const greenValue = Math.floor(colorWave * 255);
                const bulletColor = `rgb(255, ${greenValue}, 0)`;

                world.objects.bullets.push(
                    getBullet(centerX, centerY, 10, bulletVX, bulletVY, 500, bulletColor)
                );
                world.isStrictUpdateGrid = true;

                this.lastTimeSpawnedBullet = gameStepsCount;
                ++this.bulletsShot;
            }
        },
    }
    catShooter.generateTexture();
    return catShooter;
}