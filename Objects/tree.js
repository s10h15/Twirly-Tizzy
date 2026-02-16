import { createTexture } from "../Helpers/textures.js";
import { getAutoResizedShapeTextureVaiables, getRectangleVertexes, getShapeCenter } from "../math.js";
import { normalIsCollidesCircle, normalIsPointInside } from "../Helpers/collision.js";
import { getRandomInt } from "../Helpers/random.js";
import { getApple } from "../Objects/apple.js";

function getRandomTreeImage(images) {
    const treeImageNames = ["tree1", "tree2", "tree3"];
    const randomName = treeImageNames[getRandomInt(0, treeImageNames.length - 1)];
    return images[randomName] || null;
}

export function getTree(vertexes, images, hasApples = false) {
    const tree = {
        vertexes: vertexes,
        name: "tree",
        isShouldDisappear: false,
        id: Math.random() * Number.MAX_SAFE_INTEGER,
        gridIndexes: [],

        textureX: 0,
        textureY: 0,
        texture: null,
        textureWidth: 0,
        textureHeight: 0,
        imageToUseInTexture: getRandomTreeImage(images),
        appleImage: hasApples ? (images.apple ?? null) : null,

        isSelected: false,
        hasApples: hasApples,
        numTimesWasInteractedWith: 0,
        lastTimeGotInteracted: 0,
        isShaking: false,
        shakingDelay: 1000,

        centerX: 0,
        centerY: 0,

        lastStepCollectedApples: 0,
        stepsToRespawnApples: 60 * 120,
        numApples: getRandomInt(1, 4),

        visualOffsetX: 0,
        visualOffsetY: 0,

        isJustSpawned: true,

        updateCenter() {
            [this.centerX, this.centerY] = getShapeCenter(this.vertexes);
        },

        isPointInside(x, y) {
            return normalIsPointInside(this.vertexes, x, y);
        },

        draw(ctx, offsetX, offsetY, zoomInRate) {
            if (this.texture == null) {
                return;
            }

            const time = performance.now() * 0.002;
            const wobbleIntensity = 5;

            const wobbleX = Math.sin(time) * wobbleIntensity;
            const wobbleY = Math.cos(time * 0.7) * (wobbleIntensity * 0.5);

            let width = this.textureWidth * zoomInRate;
            let height = this.textureHeight * zoomInRate;
            let x, y;

            if (this.isShaking) {
                x = (this.textureX - offsetX + (Math.random() - 0.5) * 100) * zoomInRate;
                y = (this.textureY - offsetY + (Math.random() - 0.5) * 100) * zoomInRate;
            } else {
                x = (this.textureX + wobbleX + this.visualOffsetX - offsetX) * zoomInRate;
                y = (this.textureY + wobbleY + this.visualOffsetY - offsetY) * zoomInRate;
            }

            if (this.isSelected) {
                const expansion = 15 * zoomInRate;
                width += expansion;
                height += expansion;
                x -= expansion / 2;
                y -= expansion / 2;
            }

            ctx.drawImage(this.texture, x, y, width, height);
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

        isPlayerAboveVisually(player) {
            return player.y < this.textureY + this.textureHeight * 0.7;
        },

        isCollidesCircle(x, y, radius) {
            return normalIsCollidesCircle(this.vertexes, x, y, radius);
        },

        getVertexes() {
            return this.vertexes;
        },

        generateTexture() {
            const size = 128;
            this.texture = createTexture(size, size, (ctx) => {
                ctx.clearRect(0, 0, size, size);

                if (this.imageToUseInTexture !== null) {
                    ctx.drawImage(this.imageToUseInTexture, 0, 0, size, size);
                }

                if (this.hasApples && this.appleImage !== null) {
                    const minX = size * 0.2;
                    const maxX = size * 0.75;
                    const minY = size * 0.1;
                    const maxY = size * 0.4;

                    const appleSize = size * 0.1;
                    const appleCount = this.numApples;

                    for (let i = 0; i < appleCount; i++) {
                        const appleX = Math.floor(Math.random() * (maxX - appleSize - minX + 1)) + minX;
                        const appleY = Math.floor(Math.random() * (maxY - appleSize - minY + 1)) + minY;

                        ctx.drawImage(this.appleImage, appleX, appleY, appleSize, appleSize);
                    }
                }
            });

            const shapePosition = getAutoResizedShapeTextureVaiables(this.vertexes);
            this.textureX = shapePosition.x;
            this.textureY = shapePosition.y;
            this.textureWidth = shapePosition.size;
            this.textureHeight = shapePosition.size;
        },

        updateFrame(player, world, inventory, mouse, images, gameStepsCount) {
            if (performance.now() - this.lastTimeGotInteracted > this.shakingDelay) {
                this.isShaking = false;
            }
        },
        updateStep(player, world, inventory, mouse, images, gameStepsCount) {
            if (this.isJustSpawned) {
                this.lastStepCollectedApples = gameStepsCount;
                this.isJustSpawned = false;
                return;
            }

            if (!this.hasApples && (gameStepsCount - this.lastStepCollectedApples > this.stepsToRespawnApples)) {
                this.numApples = getRandomInt(1, 4);
                this.hasApples = true;
                this.numTimesWasInteractedWith = 0;
                this.generateTexture();
            }

            this.isSelected = this.isPointInside(player.x, player.y) || this.isCollidesCircle(player.x, player.y, player.radius);

            let targetX = 0;
            let targetY = 0;

            if (this.isSelected) {
                const pushMagnitude = 15;

                const dx = this.centerX - player.x;
                const dy = this.centerY - player.y;
                const distance = Math.sqrt(dx * dx + dy * dy) || 1;

                targetX = (dx / distance) * pushMagnitude;
                targetY = (dy / distance) * pushMagnitude;
            }

            this.visualOffsetX += (targetX - this.visualOffsetX) * 0.1;
            this.visualOffsetY += (targetY - this.visualOffsetY) * 0.1;

            if (this.isSelected && player.isInteracting && this.hasApples) {
                player.isInteracting = false;
                this.numTimesWasInteractedWith++;
                this.isShaking = true;
                this.lastTimeGotInteracted = performance.now();

                if (this.numTimesWasInteractedWith > 9) {
                    this.dropApples(world, images);

                    this.hasApples = false;
                    this.lastStepCollectedApples = gameStepsCount;
                    this.generateTexture();
                }
            }
        },
        dropApples(world, images) {
            for (let i = 0; i < this.numApples; ++i) {
                const appleSize = 50;
                const centerX = this.textureX + this.textureWidth * 0.5;
                const centerY = this.textureY + this.textureHeight * 0.5;
                const minDist = Math.max(this.textureWidth, this.textureHeight) * 0.6;
                const maxDist = minDist + 40;

                const angle = Math.random() * Math.PI * 2;
                const distance = Math.random() * (maxDist - minDist) + minDist;
                const spawnX = centerX + Math.cos(angle) * distance;
                const spawnY = centerY + Math.sin(angle) * distance;

                world.objects.apples.push(getApple(
                    getRectangleVertexes(spawnX, spawnY, appleSize, appleSize),
                    images
                ));
            }
            world.isStrictUpdateGrid = true;
        },
    }
    tree.updateCenter();
    tree.generateTexture();
    return tree;
}