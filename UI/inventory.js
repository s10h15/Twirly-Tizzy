import { getButton } from "./button.js";

class Slot {
    constructor() {
        this.itemName = null;
        this.itemObject = null;
        this.quantity = 0;
    }
}

export function getInventory(config) {
    const scaleRate = config.scaleRate;
    const slotCount = 3;
    const slotSize = 120 * scaleRate;
    const padding = 20 * scaleRate;
    const gap = 15 * scaleRate;
    const canvasHeight = config.canvasHeight;

    const bgWidth = (padding * 2) + (slotSize * slotCount) + (gap * (slotCount - 1));
    const bgHeight = (padding * 2) + slotSize;

    const inventory = {
        buttons: [],
        selectedIndex: 0,
        bgWidth: bgWidth,
        bgHeight: bgHeight,
        bgX: 20 * scaleRate,
        bgY: canvasHeight - (bgHeight) - 20 * scaleRate,
        slotData: [],
        gameConsole: config.gameConsole || null,
        lastStepUsedItem: 0,
        stepsToUseItemAgain: 60,

        pushObjectToWorld(object, world, player) {
            const name = object.name;

            if (object.recenterVertexes) {
                object.recenterVertexes(player.x + 200, player.y + 200);
            }

            if (name === "coin") {
                world.objects.coins.push(object);
                this.removeItemOnIndex(this.selectedIndex);
                world.isStrictUpdateGrid = true;
            } else if (name === "binoculars") {
                world.objects.binoculars.push(object);
                this.removeItemOnIndex(this.selectedIndex);
                world.isStrictUpdateGrid = true;
            } else if (name === "apple") {
                world.objects.apples.push(object);
                this.removeItemOnIndex(this.selectedIndex);
                world.isStrictUpdateGrid = true;
            } else if (name === "seed") {
                world.objects.apples.push(object);
                this.removeItemOnIndex(this.selectedIndex);
                world.isStrictUpdateGrid = true;
            } else if (name === "wood") {
                object.hasBeenDropped = true;
                world.objects.wood.push(object);
                this.removeItemOnIndex(this.selectedIndex);
                world.isStrictUpdateGrid = true;
            } else if (name === "potion") {
                world.objects.potions.push(object);
                this.removeItemOnIndex(this.selectedIndex);
                world.isStrictUpdateGrid = true;
            } else if (name === "noose") {
                world.objects.nooses.push(object);
                this.removeItemOnIndex(this.selectedIndex);
                world.isStrictUpdateGrid = true;
            } else if (name === "hook") {
                world.objects.nooses.push(object);
                this.removeItemOnIndex(this.selectedIndex);
                world.isStrictUpdateGrid = true;
            }
        },

        dropSelectedItem(world, player) {
            if (this.selectedIndex === null || this.selectedIndex >= this.slotData.length) {
                return;
            }

            const objectToRemove = this.slotData[this.selectedIndex].itemObject;
            if (objectToRemove !== null) {
                objectToRemove.numToGive = this.slotData[this.selectedIndex].quantity;
                this.pushObjectToWorld(objectToRemove, world, player);
            }
        },

        initialize() {
            for (let i = 0; i < slotCount; i++) {
                this.slotData.push(new Slot());

                const slotX = (this.bgX + padding + (i * (slotSize + gap))) / scaleRate;
                const slotY = (this.bgY + padding) / scaleRate;

                this.buttons.push(getButton({
                    x: slotX,
                    y: slotY,
                    width: slotSize / scaleRate,
                    height: slotSize / scaleRate,
                    key: (i + 1).toString(),
                    iconTextureImage: null,
                    scaleRate: scaleRate,
                    isExtraOutlineActive: i == 0,
                    subText: "",
                    fontName: "Sans Serif",
                    subTextColorNormal: "white",
                    subTextColorHovered: "white",
                    bgTopNormal: "#1a1a1a7b",
                    bgBottomNormal: "#1515154c",
                    bgBottomHover: "#51515108",
                    bgTopHover: "#77777703",
                    outlineExtraColor: "#ff26f4ff",
                    onClickFn: () => {
                        this.selectedIndex = i;
                        for (let j = 0; j < this.buttons.length; ++j) {
                            this.buttons[j].isExtraOutlineActive = (i === j);
                        }
                        if (this.gameConsole === null) {
                            return;
                        }
                        if (this.slotData[i].itemName == "wood") {
                            this.gameConsole.addMessage("Деревяшенька", 500, "orange");
                        }
                        else if (this.slotData[i].itemName == "apple") {
                            this.gameConsole.addMessage("Яблоченько", 500, "red");
                        }
                        else if (this.slotData[i].itemName == "binoculars") {
                            this.gameConsole.addMessage("Бинокуляры", 500, "purple");
                        }
                        else if (this.slotData[i].itemName == "coin") {
                            this.gameConsole.addMessage("Монетонька", 500, "purple");
                        }
                        else if (this.slotData[i].itemName == "seed") {
                            this.gameConsole.addMessage("Семенько валерьянки", 500, "purple");
                        }
                        else if (this.slotData[i].itemName == "potion") {
                            this.gameConsole.addMessage("Зельешность", 500, "purple");
                        }
                        else if (this.slotData[i].itemName == "noose") {
                            this.gameConsole.addMessage("Омская приспособа", 500, "purple");
                        }
                        else if (this.slotData[i].itemName == "hook") {
                            this.gameConsole.addMessage("Крюк", 500, "purple");
                        }
                    }
                }));
            }
        },

        giveItem(originalItemObject, quantity = 1) {
            for (let i = 0; i < this.buttons.length; i++) {
                if (this.slotData[i].itemName === originalItemObject.name) {
                    this.slotData[i].quantity += quantity;
                    this.buttons[i].subText = this.slotData[i].quantity.toString();
                    return;
                }
            }

            for (let i = 0; i < this.buttons.length; i++) {
                if (this.slotData[i].itemName === null) {
                    const texture = originalItemObject.generateMiniatureTexture();
                    this.slotData[i].itemName = originalItemObject.name;
                    this.slotData[i].itemObject = originalItemObject;
                    this.slotData[i].quantity = quantity;
                    this.buttons[i].iconTextureImage = texture;
                    this.buttons[i].subText = quantity.toString();
                    return;
                }
            }
        },

        removeItem(name) {
            for (let i = 0; i < this.buttons.length; i++) {
                if (this.slotData[i].itemName === name) {
                    this.slotData[i].itemName = null;
                    this.slotData[i].itemObject = null;
                    this.slotData[i].quantity = 0;
                    this.buttons[i].iconTextureImage = null;
                    this.buttons[i].subText = "";
                    return;
                }
            }
        },
        removeItemOnIndex(index) {
            this.slotData[index].itemName = null;
            this.slotData[index].itemObject = null;
            this.slotData[index].quantity = 0;
            this.buttons[index].iconTextureImage = null;
            this.buttons[index].subText = "";
        },

        clear() {
            for (let i = 0; i < this.buttons.length; i++) {
                this.slotData[i].itemName = null;
                this.slotData[i].itemObject = null;
                this.slotData[i].quantity = 0;
                this.buttons[i].subText = "";
                this.buttons[i].iconTextureImage = null;
            }
            this.lastStepUsedItem = 0;
        },

        countItem(name) {
            for (let i = 0; i < this.buttons.length; i++) {
                if (this.slotData[i].itemName == name) {
                    return this.slotData[i].quantity;
                }
            }
            return 0;
        },

        canPickUp(name) {
            const alreadyHasItem = this.slotData.some(slot => slot.itemName === name);
            const hasEmptySlot = this.slotData.some(slot => slot.itemName === null);
            return alreadyHasItem || hasEmptySlot;
        },

        takeItem(name, quantity = 1) {
            for (let i = 0; i < this.buttons.length; i++) {
                if (this.slotData[i] && this.slotData[i].itemName === name) {
                    this.slotData[i].quantity = Math.max(0, this.slotData[i].quantity - quantity);
                    if (this.slotData[i].quantity < 1) {
                        this.removeItem(name);
                    } else {
                        this.buttons[i].subText = this.slotData[i].quantity.toString();
                    }
                    return;
                }
            }
        },

        update(mouseX, mouseY, mousePressStartX, mousePressStartY, isMouseDown, heldKeys, player, gameStepsCount, world, images, camera, console) {
            for (let k = 1; k <= 8; k++) {
                if (heldKeys[k.toString()]) {
                    if (k > this.buttons.length) {
                        this.selectedIndex = null;
                        this.buttons.forEach(b => b.isExtraOutlineActive = false);
                    }
                }
            }

            if (player.isInteracting && gameStepsCount - this.lastStepUsedItem > this.stepsToUseItemAgain && heldKeys["e"]) {
                const slot = this.selectedIndex !== null ? this.slotData[this.selectedIndex] : null;
                if (slot && slot.itemObject && slot.itemObject.isUsable === true) {
                    let result = false;

                    if (typeof slot.itemObject.use === "function") {
                        result = slot.itemObject.use(player, gameStepsCount, world, images, camera, console);
                    }
                    if (result === true) {
                        this.takeItem(slot.itemName, 1);
                        this.lastStepUsedItem = gameStepsCount;
                    }
                    heldKeys["e"] = false;
                } else {
                    heldKeys["e"] = false;
                }
            }

            this.buttons.forEach((slot, index) => {
                if (heldKeys[slot.key]) {
                    this.selectedIndex = index;
                    this.buttons.forEach((b, i) => b.isExtraOutlineActive = (i === index));
                }
                slot.mouseInteract(mouseX, mouseY, mousePressStartX, mousePressStartY, isMouseDown);
                slot.keyInteract(heldKeys);
                slot.outlineColor = (this.selectedIndex === index) ? "#00ff00ff" : "#b3b3b3ff";
            });
        },

        draw(ctx, bootTime) {
            ctx.save();
            ctx.beginPath();
            ctx.roundRect(this.bgX, this.bgY, this.bgWidth, this.bgHeight, 50 * scaleRate);
            ctx.fillStyle = "rgba(40, 40, 40, 0.5)";
            ctx.fill();
            ctx.lineWidth = 5 * scaleRate;
            ctx.strokeStyle = "rgba(255, 255, 255, 0.24)";
            ctx.stroke();
            ctx.restore();
            this.buttons.forEach(slot => slot.draw(ctx, bootTime));
        }
    };

    inventory.initialize();
    return inventory;
}
