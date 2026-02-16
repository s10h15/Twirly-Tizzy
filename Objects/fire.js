import { createTexture } from "../Helpers/textures.js";
import { getAutoResizedShapeTextureVaiables, getShapeCenter } from "../math.js";
import { normalIsCollidesCircle, normalIsPointInside } from "../Helpers/collision.js";
import { getCatKiller } from "../Objects/catKiller.js";

export function getFire(vertexes, scaleRate, images, catX, catY) {
    const fire = {
        vertexes: vertexes,
        name: "fire",
        isShouldDisappear: false,
        id: Math.random() * Number.MAX_SAFE_INTEGER,
        gridIndexes: [],
        textureX: 0,
        textureY: 0,
        texture: null,
        textureWidth: 0,
        textureHeight: 0,
        textureRegenerationDelay: 500,
        lastTimeRegeneratedTexture: -99999999,
        remainingStrength: 40,
        fontSize: 80 * scaleRate,
        rectWidth: 150 * scaleRate,
        rectHeight: 110 * scaleRate,
        glowImage: images?.fireGlow ?? null,
        alwaysUpdate: true,
        catKillerSpawned: false,
        catKillerSpawnX: catX,
        catKillerSpawnY: catY,
        isClicked: false,

        centerX: 0,
        centerY: 0,

        isPlayerAboveVisually(player) {
            return player.y < this.textureY + this.textureHeight * 0.7;
        },

        isPointInside(x, y) {
            return normalIsPointInside(this.vertexes, x, y);
        },

        draw(ctx, offsetX, offsetY, zoomInRate) {
            if (this.texture == null || this.isClicked) {
                return;
            }

            ctx.globalAlpha = 0.05;
            let glowScale = 50;
            let glowSize = this.textureWidth * zoomInRate * glowScale;
            let centerX = (this.textureX - offsetX) * zoomInRate + (this.textureWidth * zoomInRate) * 0.5;
            let centerY = (this.textureY + 50 - offsetY) * zoomInRate + (this.textureWidth * zoomInRate) * 0.5;
            let glowX = centerX - (glowSize * 0.5);
            let glowY = centerY - (glowSize * 0.5);
            ctx.drawImage(this.glowImage, glowX, glowY, glowSize, glowSize);
            ctx.globalAlpha = 0.35;
            glowScale = Math.min(this.remainingStrength, 15);
            glowSize = this.textureWidth * zoomInRate * glowScale;
            centerX = (this.textureX - offsetX) * zoomInRate + (this.textureWidth * zoomInRate) * 0.5;
            centerY = (this.textureY + 50 - offsetY) * zoomInRate + (this.textureWidth * zoomInRate) * 0.5;
            glowX = centerX - (glowSize * 0.5);
            glowY = centerY - (glowSize * 0.5);
            ctx.drawImage(this.glowImage, glowX, glowY, glowSize, glowSize);
            ctx.globalAlpha = 1;

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
            const now = performance.now();
            if (now - this.lastTimeRegeneratedTexture < this.textureRegenerationDelay) {
                return;
            }

            this.lastTimeRegeneratedTexture = now;
            this.texture = createTexture(64, 64, (ctx) => {
                const size = 64;
                const pSize = 2;
                const scaleFactor = Math.min(1.0, Math.max(0.0, this.remainingStrength / 10));

                ctx.clearRect(0, 0, size, size);
                if (scaleFactor <= 0) return;

                const rawSway = Math.sin(now * 0.004) * 6;
                const globalSway = Math.round(rawSway / pSize) * pSize;

                for (let x = 0; x < size; x += pSize) {
                    const rawSwayX = Math.sin((now * 0.005) + (x * 0.15)) * 4;
                    const swayX = Math.round(rawSwayX / pSize) * pSize;

                    const centerDist = Math.abs(x - (size / 2 + swayX));

                    const baseHeight = Math.max(0, (size * 0.9 * scaleFactor) - (centerDist * (2.0 / Math.max(0.1, scaleFactor))));
                    const randomHeightRaw = baseHeight * (0.6 + Math.random() * 0.5);
                    const randomHeight = Math.floor(randomHeightRaw / pSize) * pSize;

                    for (let y = 0; y < randomHeight; y += pSize) {
                        let color;
                        if (y < 16 * scaleFactor) {
                            color = "#FFEC00";
                        } else if (y < 36 * scaleFactor) {
                            color = "#FF8C00";
                        } else if (y < 50 * scaleFactor) {
                            color = "#E10E0E"
                        } else {
                            color = "#801100";
                        }

                        if (Math.random() > 0.8) {
                            if (y > 14 && y < 18) color = "#FFD700";
                            if (y > 34 && y < 38) color = "#B62203";
                        }

                        if (Math.random() > (y / size) * 0.85) {
                            ctx.fillStyle = color;
                            ctx.fillRect(x + globalSway, size - y, pSize, pSize);
                        }
                    }
                }
            });

            const shapePosition = getAutoResizedShapeTextureVaiables(this.vertexes);
            this.textureX = shapePosition.x;
            this.textureY = shapePosition.y;
            this.textureWidth = shapePosition.size;
            this.textureHeight = shapePosition.size;
        },
        
        checkMouse(mouse, console) { },

        updateCenter() {
            [this.centerX, this.centerY] = getShapeCenter(this.vertexes);
        },

        updateFrame(player, world, inventory, mouse, images, gameStepsCount, console) {
            this.generateTexture();
            this.checkMouse(mouse, console);
        },
        updateStep(player, world, inventory, mouse, images, gameStepsCount, console) {
            this.remainingStrength -= 0.0125;
            const isCollidesPlayer = this.isCollidesCircle(player.x, player.y, player.radius) || this.isPointInside(player.x, player.y);

            if (this.remainingStrength > 0 && isCollidesPlayer) {
                const woodCollected = inventory.countItem("wood");
                inventory.takeItem("wood", woodCollected);
                this.remainingStrength += woodCollected;

                if (player.isInteracting) {
                    console.addMessage("Очень приятный огонек не правда ли?", 1000, "yellow");
                    player.isInteracting = false;
                }
            }

            if (this.remainingStrength < 0) {
                if (player.isInteracting && isCollidesPlayer) {
                    console.addMessage("Теперь это лишь кучка пепла.", 1000, "yellow");
                    player.isInteracting = false;
                }

                this.remainingStrength = 0;
                if (!this.catKillerSpawned) {
                    this.textureRegenerationDelay = 2000;
                    player.speed = 0.8;
                    player.spriteUpdateDelayWalking = player.spriteUpdateDelayWalkingSLow;
                    const catSize = 100;
                    const catX = 100;
                    const catY = catSize * -0.5;
                    const catKiller = getCatKiller(this.catKillerSpawnX, this.catKillerSpawnY, scaleRate, images);
                    world.alwaysUpdateObject(catKiller);
                    world.isStrictUpdateGrid = true;
                    this.catKillerSpawned = true;
                    if (gameStepsCount < 60 * 120) {
                        console.addMessage(" ", 5000, "red");
                        console.addMessage([
                            ["Я правильно понимаю что ты скипнул тест", "на интеллект в начале?"],
                            ["Смотрю на тебя как будто в", "зеркало"],
                            ["Вроде дифа больше нету,", "но кто тогда играет?"],
                            ["Вроде рудлекса больше нету,", "но кто тогда играет?"],
                            ["Омские докторы рекомендуют играть", "в данную игру чем либо иным", "кроме лица"],
                            ["Омские повадки - умирать за", "две минуты"],
                            ["Давай ты больше не будешь", "играть в омские члененджи", "по типу 'умереть за две минуты'"],
                            ["Перезайди в игру в другой день"],
                            ["Я не вижу твой экран но", "почему то мне все равно стыдно"],
                            ["После этого омичи выглядят", "как люди, да еще и умные"],
                            ["Средняя жизнь омича дольше", "чем то что ты сейчас наиграл"],
                            ["Ты не можешь удалить игру", "но хотябы закрой страницу", "хпхахпахпх"],
                            ["Я это предвидел как", "омич видит свою смерть"],
                        ], 5000, "red");
                    }
                }
            }
        },
    }
    fire.updateCenter();
    fire.generateTexture();
    return fire;
}