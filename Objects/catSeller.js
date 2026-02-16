import { createTexture } from "../Helpers/textures.js";
import { getAutoResizedShapeTextureVaiables, getDistance, getRectangleVertexes, getShapeCenter } from "../math.js";
import { normalIsCollidesCircle, normalIsPointInside } from "../Helpers/collision.js";
import { getApple } from "../Objects/apple.js";
import { getSeed } from "../Objects/seed.js";
import { getBinoculars } from "../Objects/binoculars.js";
import { getPotion } from "../Objects/potion.js";
import { getHook } from "../Objects/hook.js";

export function getCatSeller(vertexes, images) {
    const catSeller = {
        vertexes: vertexes,
        name: "catSeller",
        isShouldDisappear: false,
        id: Math.random() * Number.MAX_SAFE_INTEGER,
        gridIndexes: [],

        slotSize: 70,
        padding: 50,
        innerPadding: 10,
        spawnOffset: 200,

        textureX: 0,
        textureY: 0,
        texture: null,
        textureWidth: 0,
        textureHeight: 0,
        imageToUseInTexture: images.shoppingCat ?? null,

        isSelected: false,
        showItems: true,
        itemsToSell: ["apple", "seed", "binoculars", "potion", "hook"],
        numItemsToSell: 3,
        generatedItemsYet: false,
        itemsCurrentlyBeingSold: [],

        centerX: 0,
        centerY: 0,

        opacity: 0,
        isReady: false,
        isSlowlyVanishing: false,

        getVertexes() { return this.vertexes; },
        resolveCollisionCircle(x, y, radius) { },

        updateCenter() {
            [this.centerX, this.centerY] = getShapeCenter(this.vertexes);
        },

        generateObjectFromName(name, x, y) {
            if (name === "apple") {
                return getApple(getRectangleVertexes(x, y, 50, 50), images);
            } else if (name === "seed") {
                return getSeed(getRectangleVertexes(x, y, 50, 50), images);
            } else if (name === "binoculars") {
                return getBinoculars(getRectangleVertexes(x, y, 85, 85), images);
            } else if (name === "potion") {
                return getPotion(getRectangleVertexes(x, y, 65, 65), images);
            } else if (name === "hook") {
                return getHook(getRectangleVertexes(x, y, 85, 85), images);
            }
            return null;
        },

        getUIItemAtPosition(px, py) {
            let startX = this.textureX + this.textureWidth;
            let startY = this.textureY;

            for (let i = 0; i < this.itemsCurrentlyBeingSold.length; i++) {
                const itemX = startX + (i * (this.slotSize + this.padding));
                const itemY = startY;

                if (px >= itemX && px <= itemX + this.slotSize && py >= itemY && py <= itemY + this.slotSize) {
                    return this.itemsCurrentlyBeingSold[i];
                }
            }
            return null;
        },

        spawnItemIntoWorld(item, world) {
            if (item.name === "apple") {
                world.objects.apples.push(item);
            } else if (item.name === "seed") {
                world.objects.seeds.push(item);
            } else if (item.name === "binoculars") {
                world.objects.binoculars.push(item);
            } else if (item.name === "potion") {
                world.objects.potions.push(item);
            } else if (item.name === "hook") {
                world.objects.hooks.push(item);
            }
        },

        draw(ctx, offsetX, offsetY, zoomInRate) {
            if (this.texture == null) return;
            let selectionOffset = this.isSelected ? -(35 * zoomInRate) : 0;

            const x = (this.textureX - offsetX) * zoomInRate;
            const y = (this.textureY - offsetY) * zoomInRate;

            ctx.globalAlpha = this.opacity;
            ctx.drawImage(
                this.texture,
                x,
                y + (selectionOffset * zoomInRate),
                this.textureWidth * zoomInRate,
                this.textureHeight * zoomInRate
            );

            if (this.showItems) this.drawTradingUI(ctx, offsetX, offsetY, zoomInRate);

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

        drawTradingUI(ctx, offsetX, offsetY, zoomInRate) {
            const scaledSlot = this.slotSize * zoomInRate;
            const scaledPadding = this.padding * zoomInRate;
            const scaledInnerPadding = this.innerPadding * zoomInRate;

            let startX = (this.textureX + this.textureWidth - offsetX) * zoomInRate;
            let startY = (this.textureY - offsetY) * zoomInRate;

            this.itemsCurrentlyBeingSold.forEach((item, index) => {
                const posX = startX + (index * (scaledSlot + scaledPadding));
                const posY = startY;

                ctx.fillStyle = "rgba(255, 201, 65, 0.32)";
                ctx.fillRect(posX, posY, scaledSlot, scaledSlot);

                if (item.miniatureTexture) {
                    ctx.drawImage(item.miniatureTexture, posX + scaledInnerPadding, posY + scaledInnerPadding, scaledSlot - (scaledInnerPadding * 2), scaledSlot - (scaledInnerPadding * 2));
                }

                ctx.fillStyle = "#FFD700";
                ctx.font = `bold ${Math.floor(40 * zoomInRate)}px Arial`;
                ctx.textAlign = "right";
                ctx.textBaseline = "bottom";

                const cornerMargin = -15 * zoomInRate;
                ctx.fillText(`x${item.numToGive}`, posX + scaledSlot - cornerMargin, posY + scaledSlot - cornerMargin);

                ctx.fillStyle = "white";
                ctx.font = `${Math.floor(40 * zoomInRate)}px Arial`;
                ctx.textAlign = "center";
                ctx.textBaseline = "top";
                ctx.fillText(`🪙${item.cost}`, posX + (scaledSlot / 2), posY + scaledSlot + (20 * zoomInRate));
            });
        },

        getCoinPlural(n) {
            n = Math.abs(n) % 100;
            const n1 = n % 10;
            if (n > 10 && n < 20) return "монеток";
            if (n1 > 1 && n1 < 5) return "монетки";
            if (n1 === 1) return "монетка";
            return "монеток";
        },

        updateFrame(player, world, inventory, mouse, images, gameStepsCount, console) {
        },

        updateStep(player, world, inventory, mouse, images, gameStepsCount, console) {
            if (!this.generatedItemsYet) {
                this.generatedItemsYet = true;
                const priceMap = {
                    "apple": 1,
                    "seed": 2,
                    "binoculars": 3,
                    "potion": 2,
                    "hook": 4,
                };

                for (let i = 0; i < this.numItemsToSell; ++i) {
                    const randomName = this.itemsToSell[Math.floor(Math.random() * this.itemsToSell.length)];
                    const itemObj = this.generateObjectFromName(randomName, 0, 0);
                    if (itemObj) {
                        const randomQty = Math.floor(Math.random() * 6) + 3;
                        itemObj.numToGive = randomQty;
                        itemObj.miniatureTexture = itemObj.generateMiniatureTexture();
                        const basePrice = priceMap[randomName] || 1;
                        itemObj.cost = Math.ceil(basePrice * randomQty * 0.3);
                        this.itemsCurrentlyBeingSold.push(itemObj);
                    }
                }
            }

            this.isSelected = this.isPointInside(player.x, player.y);
            if (player.isInteracting && this.showItems) {
                const clickedItem = this.getUIItemAtPosition(player.x, player.y);
                if (clickedItem) {
                    const coinCount = inventory.countItem("coin");

                    if (coinCount >= clickedItem.cost) {
                        inventory.takeItem("coin", clickedItem.cost);

                        const newItem = this.generateObjectFromName(
                            clickedItem.name,
                            player.x + this.spawnOffset,
                            player.y + this.spawnOffset
                        );
                        newItem.numToGive = clickedItem.numToGive;
                        this.spawnItemIntoWorld(newItem, world);

                        this.showItems = false;
                        this.generatedItemsYet = false;
                        this.itemsCurrentlyBeingSold = [];
                        world.isStrictUpdateGrid = true;
                        this.isSlowlyVanishing = true;

                        player.isInteracting = false;

                        console.addMessage("Транзакция завершена! Муррр...", 2000, "pink");
                        console.addMessage("Держи свою хуету.", 2000, "pink");
                    } else {
                        const cost = clickedItem.cost;
                        const costText = this.getCoinPlural(cost);

                        const extension = coinCount === 0
                            ? " А у тебя их нету..."
                            : ` А у тебя их ${coinCount}...`;

                        console.addMessage(
                            `Нужно ${cost} ${costText}!${extension}`,
                            2000,
                            "pink"
                        );

                        player.isInteracting = false;
                    }
                }

                if (this.isSelected) {
                    const originalMaxMessages = console.maxMessages;
                    console.maxMessages = 999;
                    for (let i = 0; i < 50; ++i) {
                        console.addMessage("мя" + "у".repeat(Math.floor(Math.random() * 25) + 1) + "~".repeat(Math.floor(Math.random() * 25) + 1), 500, "pink");
                    }
                    console.maxMessages = originalMaxMessages;
                    player.isInteracting = false;
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
                    this.opacity += 0.01;
                }
            }

            if (world.objects.catSellers.length > 1) {
                for (let i = 0; i < world.objects.catSellers.length - 1; ++i) {
                    const seller = world.objects.catSellers[i];
                    if (seller.isReady && getDistance(player.x, player.y, seller.centerX, seller.centerY) > 650) {
                        seller.isSlowlyVanishing = true;
                    }
                }
            }
        },

        generateTexture() {
            const size = 256;
            this.texture = createTexture(size, size, (ctx) => {
                ctx.clearRect(0, 0, size, size);
                if (this.imageToUseInTexture !== null) ctx.drawImage(this.imageToUseInTexture, 0, 0, size, size);
            });
            const shapePosition = getAutoResizedShapeTextureVaiables(this.vertexes);
            this.textureX = shapePosition.x;
            this.textureY = shapePosition.y;
            this.textureWidth = shapePosition.size;
            this.textureHeight = shapePosition.size;
        },

        isPointInside(x, y) { return normalIsPointInside(this.vertexes, x, y); },
        isCollidesCircle(x, y, radius) { return normalIsCollidesCircle(this.vertexes, x, y, radius); }
    }
    catSeller.updateCenter();
    catSeller.generateTexture();
    return catSeller;
}
