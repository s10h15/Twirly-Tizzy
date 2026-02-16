import { getDistance } from "../math.js";

const twoPI = Math.PI * 2;

const keyToDirection = {
	"w": [0, -1],
	"a": [-1, 0],
	"s": [0, 1],
	"d": [1, 0],

	"arrowup": [0, -1],
	"arrowleft": [-1, 0],
	"arrowdown": [0, 1],
	"arrowright": [1, 0],
};

export function getPlayer(walkingSprites) {
	return {
		x: 0,
		y: 0,
		prevX: 0,
		prevY: 0,
		speed: 9,
		defaultSpeed: 9,
		radius: 50,
		tinyRadius: 25,
		defaultRadius: 50,
		fastSpeed: 18,
		tinySpeed: 4.5,
		isDead: false,
		isWon: false,
		isInteracting: false,
		heldItem: null,
		itemBubbleSeed: 0,
		lastItemBubbleUpdateTime: null,
		lastTimeStartedInteracting: null,
		walkingDirection: 0,
		isLastWalkingLeft: true,
		isStandingStill: true,
		walkingSprites: {
			left: [walkingSprites.foxLeft1, walkingSprites.foxLeft2, walkingSprites.foxLeft3, walkingSprites.foxLeft4],
			up: [walkingSprites.foxUp1, walkingSprites.foxUp2, walkingSprites.foxUp3, walkingSprites.foxUp4],
			right: [walkingSprites.foxRight1, walkingSprites.foxRight2, walkingSprites.foxRight3, walkingSprites.foxRight4],
			down: [walkingSprites.foxDown1, walkingSprites.foxDown2, walkingSprites.foxDown3, walkingSprites.foxDown4]
		},
		standingSpritesRight: [walkingSprites.foxStandingRight1, walkingSprites.foxStandingRight2],
		standingSpritesLeft: [walkingSprites.foxStandingLeft1, walkingSprites.foxStandingLeft2],
		sleepingSprites: [walkingSprites.foxSleeping1, walkingSprites.foxSleeping2],
		currentWalkingSpriteIndex: 0,
		currentStandingSpriteIndex: 0,
		currentSleepingSpriteIndex: 0,
		lastTimeUpdatedSprite: 0,
		currentSpriteUpdateDelay: 84,
		spriteUpdateDelayWalking: 84,
		spriteUpdateDelayWalkingDefault: 84,
		spriteUpdateDelayWalkingSLow: 500,
		spriteUpdateDelayStanding: 250,
		spriteUpdateDelaySleeping: 1000,
		lastTimeStartedStandingStill: 0,
		sleepingDelay: 3000,
		isSleeping: true,
		interactionDelay: 500,
		lastTimeInteractWasCalled: 0,
		isInteractLocked: false,
		isSpedUp: false,
		lastStepChangedSpeed: 0,
		stepsToChangeSpeed: 60 * 8,

		isMovingWithAcceleration: false,
		speedX: 50,
		speedY: 50,
		slowdownRatio: 0.96,

		isMovingOutOfControl: false,
		stepLostControl: 0,
		stepsToLoseControl: 0,

		isVisible: true,
		isTurningInvisible: false,
		isTurningVisible: false,
		invisibilitySpeed: 0.05,
		opacity: 1,
		stepTurnedInvisible: 0,
		stepsToKeepInvisible: 60 * 15,

		hookX: 0,
		hookY: 0,
		isHooking: false,
		startDistance: null,
		hookVelocity: 0,

		// AI Variables
		timesZoomedOut: 0,
		currentRandomDirection: "wasd"[Math.floor(Math.random() * 4)],
		state: "collecting wood",
		interactionCount: 0,

		// Normal Functions
		hookTo() {
			let dx = this.x - this.prevX;
			let dy = this.y - this.prevY;

			const distance = Math.sqrt(dx * dx + dy * dy);

			const velocityThreshold = 0.1;
			let magicNumber = 1200;

			if (distance < velocityThreshold) {
				const randomAngle = Math.random() * Math.PI * 2;
				dx = Math.cos(randomAngle);
				dy = Math.sin(randomAngle);
				magicNumber = 2000;
			} else {
				dx /= distance;
				dy /= distance;
			}

			this.hookX = this.x + (dx * magicNumber);
			this.hookY = this.y + (dy * magicNumber);

			this.isHooking = true;
			this.startDistance = null;
			this.hookVelocity = 0.5;
		},
		makeInvisible(gameStepsCount) {
			this.isTurningInvisible = true;
		},
		flinge(speedX, speedY) {
			this.isMovingWithAcceleration = true;
			this.isMovingOutOfControl = false;
			if (speedX !== null && speedY !== null) {
				this.speedX = speedX;
				this.speedY = speedY;
			}
		},
		slide(speedX, speedY, stepStarted, durationSteps) {
			this.isMovingWithAcceleration = false;
			this.isMovingOutOfControl = true;
			this.speedX = speedX;
			this.speedY = speedY;
			this.stepLostControl = stepStarted;
			this.stepsToLoseControl = durationSteps;
		},

		speedUp(gameStepsCount, stepsToChangeSpeed = 60 * 8) {
			this.speed = this.fastSpeed;
			this.isSpedUp = true;
			this.lastStepChangedSpeed = gameStepsCount;
			this.stepsToChangeSpeed = stepsToChangeSpeed;
		},

		getCurrentDirectionName() {
			const directionToItsName = ["left", "up", "right", "down"];
			return directionToItsName[this.walkingDirection];
		},

		getInteractionReadiness() {
			if (this.isInteractLocked) {
				return 0.0;
			}

			if (this.lastTimeStartedInteracting === null) {
				return 1.0;
			}

			const elapsed = performance.now() - this.lastTimeStartedInteracting;
			const readiness = elapsed / this.interactionDelay;

			return Math.min(Math.max(readiness, 0.0), 1.0);
		},

		drawCooldownCircle(ctx, readiness, x, y, radius, zoomInRate) {
			if (readiness < 0.01 || readiness > 0.99) {
				return;
			}
			radius = radius * zoomInRate;
			const thickness = 10 * zoomInRate;
			const startAngle = -Math.PI / 2;
			const endAngle = startAngle + (Math.PI * 2 * readiness);

			ctx.beginPath();
			ctx.arc(x, y, radius, 0, Math.PI * 2);
			ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
			ctx.lineWidth = thickness;
			ctx.stroke();

			if (readiness > 0) {
				ctx.beginPath();
				ctx.arc(x, y, radius, startAngle, endAngle);
				ctx.strokeStyle = readiness === 1.0 ? "#00FF00" : "#FFFFFF";
				ctx.lineWidth = thickness;
				ctx.lineCap = "round";
				ctx.stroke();
			}
		},

		draw(ctx, offsetX, offsetY, zoomInRate) {
			const radius = this.radius * zoomInRate;
			const x = (this.x - offsetX) * zoomInRate;
			const y = (this.y - offsetY) * zoomInRate;

			if (this.isHooking) {
				const targetX = (this.hookX - offsetX) * zoomInRate;
				const targetY = (this.hookY - offsetY) * zoomInRate;

				ctx.save();

				ctx.beginPath();
				ctx.moveTo(x, y);
				ctx.lineTo(targetX, targetY);

				ctx.strokeStyle = "#898989ff";
				ctx.lineWidth = 6 * zoomInRate;
				ctx.setLineDash([15 * zoomInRate, 10 * zoomInRate]);
				ctx.lineCap = "round";
				ctx.stroke();

				const angle = Math.atan2(targetY - y, targetX - x);
				const perpAngle = angle + Math.PI / 2;
				const hookWidth = 15 * zoomInRate;

				ctx.beginPath();
				ctx.setLineDash([]);
				ctx.strokeStyle = "#FFFFFF";
				ctx.lineWidth = 4 * zoomInRate;

				ctx.moveTo(
					targetX + Math.cos(perpAngle) * hookWidth,
					targetY + Math.sin(perpAngle) * hookWidth
				);
				ctx.lineTo(
					targetX - Math.cos(perpAngle) * hookWidth,
					targetY - Math.sin(perpAngle) * hookWidth
				);

				ctx.stroke();
				ctx.restore();
			}

			const glowAlpha = 1 - this.opacity;

			if (glowAlpha > 0) {
				ctx.save();
				ctx.globalAlpha = glowAlpha;

				const speed = 0.003;
				const time = performance.now();

				const pulseOpacity = 0.1425 + Math.sin(time * speed) * 0.0425;

				const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius * 2.5);

				gradient.addColorStop(0, `rgba(255, 255, 255, ${pulseOpacity})`);
				gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

				ctx.fillStyle = gradient;
				ctx.beginPath();
				ctx.arc(x, y, radius * 2.5, 0, Math.PI * 2);
				ctx.fill();
				ctx.restore();
			}

			if (!this.isVisible) {
				return;
			}

			ctx.globalAlpha = this.opacity;

			if (this.isStandingStill) {
				if (this.isSleeping) {
					const currentSprite = this.sleepingSprites[this.currentSleepingSpriteIndex];
					const drawHeight = radius * 2;
					const aspectRatio = currentSprite.width / currentSprite.height;
					const drawWidth = drawHeight * aspectRatio;
					ctx.drawImage(
						currentSprite,
						x - (drawWidth / 2),
						y - (drawHeight / 2),
						drawWidth,
						drawHeight
					);
				} else if (this.isLastWalkingLeft) {
					const currentSprite = this.standingSpritesLeft[this.currentStandingSpriteIndex];
					const drawHeight = radius * 2;
					const aspectRatio = currentSprite.width / currentSprite.height;
					const drawWidth = drawHeight * aspectRatio;
					ctx.drawImage(
						currentSprite,
						x - (drawWidth / 2),
						y - (drawHeight / 2),
						drawWidth,
						drawHeight
					);
				} else {
					const currentSprite = this.standingSpritesRight[this.currentStandingSpriteIndex];
					const drawHeight = radius * 2;
					const aspectRatio = currentSprite.width / currentSprite.height;
					const drawWidth = drawHeight * aspectRatio;
					ctx.drawImage(
						currentSprite,
						x - (drawWidth / 2),
						y - (drawHeight / 2),
						drawWidth,
						drawHeight
					);
				}
			} else {
				const currentSprite = this.walkingSprites[this.getCurrentDirectionName()][this.currentWalkingSpriteIndex];
				const drawHeight = radius * 2;
				const aspectRatio = currentSprite.width / currentSprite.height;
				const drawWidth = drawHeight * aspectRatio;
				ctx.drawImage(
					currentSprite,
					x - (drawWidth / 2),
					y - (drawHeight / 2),
					drawWidth,
					drawHeight
				);
			}

			this.drawCooldownCircle(ctx, this.getInteractionReadiness(), x + radius, y - radius, 25, zoomInRate);

			ctx.globalAlpha = 1;
		},

		drawHitbox(ctx, offsetX, offsetY, zoomInRate) {
			if (!this.isVisible) {
				return;
			}
			ctx.beginPath();
			const radius = this.radius * zoomInRate - 5 * zoomInRate;
			const x = (this.x - offsetX) * zoomInRate;
			const y = (this.y - offsetY) * zoomInRate;
			ctx.arc(x, y, radius, 0, twoPI);
			ctx.lineWidth = 10 * zoomInRate;
			ctx.stroke()
		},

		controlSpriteBasedOnDirection(directionX, directionY) {
			if (directionX < 0) {
				this.walkingDirection = 0;
				this.isLastWalkingLeft = true;
				this.isSleeping = false;
			}
			if (directionX > 0) {
				this.walkingDirection = 2;
				this.isLastWalkingLeft = false;
				this.isSleeping = false;
			}
			if (directionY < 0) {
				this.walkingDirection = 1;
				this.isSleeping = false;
			}
			if (directionY > 0) {
				this.walkingDirection = 3;
				this.isSleeping = false;
			}
			const previousIsStandingStill = this.isStandingStill;
			this.isStandingStill = directionX == 0 && directionY == 0;
			if (previousIsStandingStill == false && this.isStandingStill == true) {
				this.lastTimeStartedStandingStill = performance.now();
			}
			this.currentSpriteUpdateDelay = this.isStandingStill ? (this.isSleeping ? this.spriteUpdateDelaySleeping : this.spriteUpdateDelayStanding) : this.spriteUpdateDelayWalking;
		},

		controlMovementDirection(directionX, directionY) {
			if (this.isMovingWithAcceleration || this.isMovingOutOfControl) {
				return;
			}

			this.prevX = this.x;
			this.prevY = this.y;

			this.x += directionX * this.speed;
			this.y += directionY * this.speed;
			this.controlSpriteBasedOnDirection(directionX, directionY);
		},
		controlMovementKeys(heldKeys) {
			let directionSumX = 0;
			let directionSumY = 0;
			for (const key in heldKeys) {
				const keyDirection = keyToDirection[key];
				if (keyDirection) {
					directionSumX += keyDirection[0];
					directionSumY += keyDirection[1];
				}
			}

			if (directionSumX !== 0 && directionSumY != 0) {
				const magnitude = Math.sqrt(directionSumX * directionSumX + directionSumY * directionSumY);
				directionSumX = directionSumX / magnitude;
				directionSumY = directionSumY / magnitude;
			}

			this.controlMovementDirection(directionSumX, directionSumY);
		},

		restart() {
			this.isDead = false;
			this.isWon = false;
			this.isVisible = true;
			this.heldItem = null;
			this.lastItemBubbleUpdateTime = null;
			this.itemBubbleSeed = 0;
			this.speed = this.defaultSpeed;
			this.radius = this.defaultRadius;
			this.spriteUpdateDelayWalking = this.spriteUpdateDelayWalkingDefault;
			this.isSleeping = true;
			this.isMovingWithAcceleration = false;
			this.isMovingOutOfControl = false;
			this.speedX = 0;
			this.speedY = 0;
			this.state == "collecting wood";
			this.isSpedUp = false;
			this.opacity = 1;
			this.isTurningInvisible = false;
			this.isTurningVisible = false;
			this.isHooking = false;
		},

		giveItem(item) {
			if (this.heldItem == null) {
				this.heldItem = item;
			}
		},

		makeInteract() {
			const now = performance.now();
			this.lastTimeInteractWasCalled = now;

			if (!this.isDead && !this.isInteractLocked && (now - this.lastTimeStartedInteracting > this.interactionDelay)) {
				this.isInteracting = true;
				this.lastTimeStartedInteracting = now;
				this.isInteractLocked = true;
				this.isSleeping = false;
				this.isStandingStill = false;
			}
		},
		makeDrop(inventory, world) {
			inventory.dropSelectedItem(world, this);
		},

		updateFrame() {
			if (this.isInteracting && performance.now() - this.lastTimeStartedInteracting > 500) {
				this.isInteracting = false;
			}

			const now = performance.now();
			if (now - this.lastTimeInteractWasCalled > 50) {
				this.isInteractLocked = false;
			}

			if (now - this.lastTimeUpdatedSprite > this.currentSpriteUpdateDelay) {
				this.lastTimeUpdatedSprite = now;
				++this.currentWalkingSpriteIndex;
				if (this.currentWalkingSpriteIndex >= this.walkingSprites[this.getCurrentDirectionName()].length) {
					this.currentWalkingSpriteIndex = 0;
				}
				++this.currentStandingSpriteIndex;
				if (this.currentStandingSpriteIndex >= this.standingSpritesRight.length) {
					this.currentStandingSpriteIndex = 0;
				}
				++this.currentSleepingSpriteIndex;
				if (this.currentSleepingSpriteIndex >= this.sleepingSprites.length) {
					this.currentSleepingSpriteIndex = 0;
				}
			}
			if (this.isStandingStill && now - this.lastTimeStartedStandingStill > this.sleepingDelay) {
				this.isSleeping = true;
			}
		},

		updateStep(gameStepsCount) {
			if (this.isSpedUp && gameStepsCount - this.lastStepChangedSpeed > this.stepsToChangeSpeed) {
				this.isSpedUp = false;
				this.speed = this.defaultSpeed;
			}
			if (this.isMovingWithAcceleration) {
				this.x += this.speedX;
				this.y += this.speedY;

				this.speedX *= this.slowdownRatio;
				this.speedY *= this.slowdownRatio;

				if (Math.abs(this.speedX) + Math.abs(this.speedY) < 8) {
					this.isMovingWithAcceleration = false;
					this.speedX = 0;
					this.speedY = 0;
				}
			} else if (this.isMovingOutOfControl) {
				this.x += this.speedX;
				this.y += this.speedY;

				if (gameStepsCount - this.stepLostControl > this.stepsToLoseControl) {
					this.isMovingOutOfControl = false;
				}
			} else if (this.isHooking) {
				const dx = this.hookX - this.x;
				const dy = this.hookY - this.y;
				const dist = Math.sqrt(dx * dx + dy * dy);

				this.hookVelocity *= 1.1;

				const moveX = (dx / dist) * this.hookVelocity;
				const moveY = (dy / dist) * this.hookVelocity;

				this.x += moveX;
				this.y += moveY;

				if (dist < this.radius + this.hookVelocity) {
					this.isHooking = false;

					const flingStrength = 1.5;
					this.flinge(moveX * flingStrength, moveY * flingStrength);

					this.hookVelocity = 0;
				}
			}

			if (this.isTurningInvisible) {
				this.opacity -= this.invisibilitySpeed;
				if (this.opacity <= 0) {
					this.isVisible = false;
					this.isTurningInvisible = false;
					this.opacity = 0;
					this.stepTurnedInvisible = gameStepsCount;
				}
			} else if (this.isTurningVisible) {
				this.opacity += this.invisibilitySpeed;
				if (this.opacity >= 1) {
					this.opacity = 1;
					this.isTurningVisible = false;
					this.isTurningInvisible = false;
					this.isVisible = true;
				}
			} else if (!this.isVisible && gameStepsCount - this.stepTurnedInvisible > this.stepsToKeepInvisible) {
				this.isTurningVisible = true;
				this.isVisible = true;
			}
		},

		// AI Functions
		toInputs(arr) {
			return arr.reduce((acc, str) => ({ ...acc, [str]: true }), {});
		},

		handleInitialZoom() {
			if (this.timesZoomedOut < 5) {
				++this.timesZoomedOut;
				return this.toInputs(["-"]);
			}
			return null;
		},

		hasEnoughWood(inventory, limit = 10) {
			return inventory.slotData.some(slot => slot.itemName === "wood" && slot.quantity > limit);
		},

		findClosestObject(world, name) {
			let closest = undefined;
			let minDistance = Infinity;
			world.lastRetrievedGridObjectsDraw.forEach(obj => {
				if (obj.name === name) {
					const dist = getDistance(this.x, this.y, obj.centerX, obj.centerY);
					if (dist < minDistance) {
						minDistance = dist;
						closest = obj;
					}
				}
			});
			return closest;
		},

		findMatchingObject(world, name, predicate) {
			let closest = null;
			let minDistance = Infinity;

			world.lastRetrievedGridObjectsDraw.forEach(obj => {
				if (obj.name === name && predicate(obj)) {
					const dist = getDistance(this.x, this.y, obj.centerX, obj.centerY);
					if (dist < minDistance) {
						minDistance = dist;
						closest = obj;
					}
				}
			});

			return closest;
		},

		moveTowards(targetX, targetY) {
			const dx = targetX - this.x;
			const dy = targetY - this.y;
			const threshold = 20;

			if (Math.abs(dx) > threshold) return this.toInputs(dx < 0 ? ["a"] : ["d"]);
			if (Math.abs(dy) > threshold) return this.toInputs(dy < 0 ? ["w"] : ["s"]);
			return null;
		},

		checkSafety(fire) {
			if (getDistance(this.x, this.y, fire.centerX, fire.centerY) > 9000 || fire.remainingStrength < 10) {
				this.state = "bringing";
				return;
			}
		},

		controlWithAI(camera, world, inventory) {
			const fire = world.objects.fires[0];

			const zoomInput = this.handleInitialZoom();
			if (zoomInput) return zoomInput;

			if (!this.isSpedUp && inventory.countItem("apple") > 0) {
				if (this.interactionCount % 10 == 0) {
					++this.interactionCount;
					for (let i = 0; i < inventory.slotData.length; ++i) {
						const slot = inventory.slotData[i];
						if (slot.itemName == "apple") {
							return this.toInputs([(i + 1).toString(), "e"]);
						}
					}
				} else {
					++this.interactionCount;
				}
			}

			if (this.state == "collecting wood") {
				if (this.hasEnoughWood(inventory)) {
					this.state = "bringing";
				} else {
					const wood = this.findClosestObject(world, "wood");
					return wood ? this.moveTowards(wood.centerX, wood.centerY) : this.toInputs([this.currentRandomDirection]);
				}
			} else if (this.state == "search apple tree") {
				this.checkSafety(fire);

				const apple = this.findClosestObject(world, "apple");
				if (apple) {
					this.state = "collecting apples";
				}

				const appleTree = this.findMatchingObject(world, "tree", (tree) => {
					return tree.hasApples;
				});
				if (appleTree) {
					if (appleTree.isPointInside(this.x, this.y)) {
						if (this.interactionCount % 10 == 0) {
							++this.interactionCount;
							return this.toInputs(["e"]);
						}
						++this.interactionCount;
						return this.toInputs([]);
					}

					return this.moveTowards(appleTree.centerX, appleTree.centerY)
				} else {
					this.checkSafety(fire);
					return this.toInputs([this.currentRandomDirection]);
				}
			} else if (this.state == "collecting apples") {
				this.checkSafety(fire);

				const apple = this.findClosestObject(world, "apple");
				if (apple) {
					const inputs = this.moveTowards(apple.centerX, apple.centerY) || this.toInputs([]);
					if (this.interactionCount % 10 == 0) {
						++this.interactionCount;
						inputs.e = true;
					}
					++this.interactionCount;
					return inputs;
				} else {
					//this.state = "collecting wood";
				}
			}

			if (fire.isPointInside(this.x, this.y)) {
				this.state = "collecting wood";
			}
			if (fire.remainingStrength > 15 && inventory.countItem("apple") == 0 && !this.isSpedUp) {
				this.state = "search apple tree";
				return;
			}

			return this.moveTowards(fire.centerX, fire.centerY);
		}
	}
}