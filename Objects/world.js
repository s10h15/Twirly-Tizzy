import { getRandomInt, getRandomFloat, setStringSeed, isChance } from "../Helpers/random.js";

const twoPI = Math.PI * 2;
const PI180 = Math.PI / 180;

export class World {
	constructor() {
		this.objects = {
			walls: [],
			fires: [],
			wood: [],
			catKillers: [],
			sprites: [],
			blackHoles: [],
			tinyMushrooms: [],
			normalMushrooms: [],
			questions: [],
			cheese: [],
			portals: [],
			saws: [],
			trees: [],
			apples: [],
			catChasers: [],
			pushers: [],
			bombs: [],
			lazers: [],
			catShooters: [],
			bullets: [],
			seeds: [],
			catnips: [],
			tornados: [],
			bananaPeels: [],
			binoculars: [],
			catSellers: [],
			coins: [],
			catStealers: [],
			potions: [],
			nooses: [],
			hooks: []
		};

		this.grid = [];
		this.gridCellsSizeX;
		this.gridCellsSizeY;
		this.gridNumCells;
		this.gridStartX;
		this.gridStartY;
		this.gridEndX;
		this.gridEndY;
		this.gridSizeX;
		this.gridSizeY;

		this.lastRetrievedGridIndexXDraw;
		this.lastRetrievedGridIndexYDraw;
		this.lastRetrievedGridIndexXUpdate;
		this.lastRetrievedGridIndexYUpdate;
		this.lastRetrievedGridObjectsDraw = [];
		this.lastRetrievedGridObjectsUpdate = [];
		this.objectsToAlwaysUpdate = [];

		this.didAnObjectSwitchCells = false;
		this.isStrictUpdateGrid = false;
		this.isPaused = false;
		this.objectFetchingRange = 1200;
	}

	countObjects() {
		return Object.values(this.objects).reduce((count, obj) => count + obj.length, 0);
	}
	countVisibleObjects() {
		return this.lastRetrievedGridObjectsDraw.length;
	}
	countUpdatedObjects() {
		return this.lastRetrievedGridObjectsUpdate.length;
	}
	countObjectsToAlwaysUpdate() {
		return this.objectsToAlwaysUpdate.length;
	}

	setup(maxDimension) {

	}

	alwaysUpdateObject(object, objectsToAlwaysUpdate = null) {
		if (objectsToAlwaysUpdate === null) {
			objectsToAlwaysUpdate = this.objectsToAlwaysUpdate;
		}
		if (object?.alwaysUpdate === true) {
			let isThisObjectAlwaysUpdated = false;
			for (let i = 0; i < objectsToAlwaysUpdate.length; ++i) {
				const objectToAlwaysUpdate = objectsToAlwaysUpdate[i];
				if (objectToAlwaysUpdate.id == object.id) {
					isThisObjectAlwaysUpdated = true;
					break;
				}
			}
			if (!isThisObjectAlwaysUpdated) {
				objectsToAlwaysUpdate.push(object);
			}
		}
	}

	addObjectOntoGrid(object) {
		const gridNumCellsMinusOne = this.gridNumCells - 1;
		const objectVertexes = object.getVertexes();
		const len = objectVertexes.length;
		object.gridIndexes = [];
		const addedCells = new Set();

		const addToCell = (gx, gy) => {
			const x = Math.max(0, Math.min(gridNumCellsMinusOne, gx));
			const y = Math.max(0, Math.min(gridNumCellsMinusOne, gy));
			const key = `${x},${y}`;
			if (!addedCells.has(key)) {
				this.grid[y][x].push(object);
				object.gridIndexes.push([x, y]);
				addedCells.add(key);
			}
		};

		if (len === 0) return;
		if (len === 1) {
			const gx = Math.floor((objectVertexes[0][0] - this.gridStartX) / this.gridCellsSizeX);
			const gy = Math.floor((objectVertexes[0][1] - this.gridStartY) / this.gridCellsSizeY);
			addToCell(gx, gy);
			return;
		}

		for (let i = 0; i < len; i++) {
			const [x0, y0] = objectVertexes[i];
			const [x1, y1] = objectVertexes[(i + 1) % len];

			let gx = Math.floor((x0 - this.gridStartX) / this.gridCellsSizeX);
			let gy = Math.floor((y0 - this.gridStartY) / this.gridCellsSizeY);
			const targetGx = Math.floor((x1 - this.gridStartX) / this.gridCellsSizeX);
			const targetGy = Math.floor((y1 - this.gridStartY) / this.gridCellsSizeY);

			const dx = Math.abs(x1 - x0);
			const dy = Math.abs(y1 - y0);
			const stepX = x1 > x0 ? 1 : -1;
			const stepY = y1 > y0 ? 1 : -1;

			const tDeltaX = dx === 0 ? Infinity : this.gridCellsSizeX / dx;
			const tDeltaY = dy === 0 ? Infinity : this.gridCellsSizeY / dy;

			const getTMax = (pos, start, size, step, dist) => {
				if (dist === 0) return Infinity;
				const relPos = (pos - start) / size;
				const nextBoundary = step > 0 ? Math.floor(relPos + 1) : Math.ceil(relPos - 1);
				return Math.abs(nextBoundary - relPos) * (size / dist);
			};

			let tMaxX = getTMax(x0, this.gridStartX, this.gridCellsSizeX, stepX, dx);
			let tMaxY = getTMax(y0, this.gridStartY, this.gridCellsSizeY, stepY, dy);

			addToCell(gx, gy);

			while (gx !== targetGx || gy !== targetGy) {
				if (tMaxX < tMaxY) {
					tMaxX += tDeltaX;
					gx += stepX;
				} else {
					tMaxY += tDeltaY;
					gy += stepY;
				}
				addToCell(gx, gy);
				if (gx < 0 || gx > gridNumCellsMinusOne || gy < 0 || gy > gridNumCellsMinusOne) break;
			}
		}
	}

	getGridIndexFromPoint(x, y) {
		const gridNumCellsMinusOne = this.gridNumCells - 1;
		const gridIndexX = Math.min(gridNumCellsMinusOne, Math.floor((x - this.gridStartX) / this.gridCellsSizeX));
		const gridIndexY = Math.min(gridNumCellsMinusOne, Math.floor((y - this.gridStartY) / this.gridCellsSizeY));
		return [gridIndexX, gridIndexY];
	}

	getClosestObjectsToPoint(x, y, rangePixels) {
		const uniqueObjects = new Map();
		const [gridIndexX, gridIndexY] = this.getGridIndexFromPoint(x, y);

		const rangeCellsX = Math.max(1, Math.ceil(rangePixels / this.gridCellsSizeX));
		const rangeCellsY = Math.max(1, Math.ceil(rangePixels / this.gridCellsSizeY));
		const endY = gridIndexY + rangeCellsY;
		const endX = gridIndexX + rangeCellsX;

		for (let y = gridIndexY - rangeCellsY; y < endY; ++y) {
			for (let x = gridIndexX - rangeCellsX; x < endX; ++x) {
				if (x < 0 || y < 0 || x >= this.gridNumCells || y >= this.gridNumCells) {
					continue;
				}
				const cell = this.grid[y][x];
				for (let cellObjectIndex = 0; cellObjectIndex < cell.length; ++cellObjectIndex) {
					const object = cell[cellObjectIndex];
					uniqueObjects.set(object.id, object);
				}
			}
		}
		return Array.from(uniqueObjects.values());
	}

	updateRelevantObjects(offsetX, offsetY, zoomInRate, halfWidth, halfHeight, maxDimension, player, bypassOptimizations = false) {
		const [gridIndexX, gridIndexY] = this.getGridIndexFromPoint(offsetX, offsetY);
		if (bypassOptimizations || this.didAnObjectSwitchCells || gridIndexX != this.lastRetrievedGridIndexXDraw || gridIndexY != this.lastRetrievedGridIndexYDraw || !this.lastRetrievedGridIndexXDraw || !this.lastRetrievedGridIndexYDraw) {
			this.didAnObjectSwitchCells = false;
			this.lastRetrievedGridObjectsDraw.length = 0;
			this.lastRetrievedGridObjectsDraw = this.getClosestObjectsToPoint(offsetX + halfWidth / zoomInRate, offsetY + halfHeight / zoomInRate, this.objectFetchingRange);
			//this.lastRetrievedGridObjectsDraw = this.getClosestObjectsToPoint(offsetX, offsetY, 1000);
			this.lastRetrievedGridIndexXDraw = gridIndexX;
			this.lastRetrievedGridIndexYDraw = gridIndexY;
		}
		if (bypassOptimizations || this.didAnObjectSwitchCells || gridIndexX != this.lastRetrievedGridIndexXUpdate || gridIndexY != this.lastRetrievedGridIndexYUpdate || !this.lastRetrievedGridIndexXUpdate || !this.lastRetrievedGridIndexYUpdate) {
			this.lastRetrievedGridObjectsUpdate.length = 0;
			//this.lastRetrievedGridObjectsUpdate = this.getClosestObjectsToPoint(player.x + halfWidth / zoomInRate, player.y + halfHeight / zoomInRate, (maxDimension / zoomInRate) * 0.5);
			this.lastRetrievedGridIndexXUpdate = gridIndexX;
			this.lastRetrievedGridIndexYUpdate = gridIndexY;
		}
	}

	updateAreaPositions() {
		let smallestObjectX = Number.MAX_SAFE_INTEGER;
		let smallestObjectY = Number.MAX_SAFE_INTEGER;
		let largestObjectX = -Number.MAX_SAFE_INTEGER;
		let largestObjectY = -Number.MAX_SAFE_INTEGER;

		for (const objectsOfSomeTypeKey in this.objects) {
			const objectsOfSomeType = this.objects[objectsOfSomeTypeKey];
			for (let objectIndex = 0; objectIndex < objectsOfSomeType.length; ++objectIndex) {
				const object = objectsOfSomeType[objectIndex];
				const objectVertexes = object.getVertexes();

				for (let vertexIndex = 0; vertexIndex < objectVertexes.length; ++vertexIndex) {
					const point = objectVertexes[vertexIndex];
					if (point[0] < smallestObjectX) {
						smallestObjectX = point[0];
					}
					if (point[1] < smallestObjectY) {
						smallestObjectY = point[1];
					}
					if (point[0] > largestObjectX) {
						largestObjectX = point[0];
					}
					if (point[1] > largestObjectY) {
						largestObjectY = point[1];
					}
				}
			}
		}

		this.gridSizeX = largestObjectX - smallestObjectX;
		this.gridSizeY = largestObjectY - smallestObjectY;
		this.gridStartX = smallestObjectX;
		this.gridStartY = smallestObjectY;
		this.gridEndX = largestObjectX;
		this.gridEndY = largestObjectY;
	}

	updateGrid() {
		//this.updateAreaPositions();

		this.gridNumCells = Math.max(1, Math.floor(Math.max(this.gridSizeX, this.gridSizeY) / 50));

		this.gridCellsSizeX = this.gridSizeX / this.gridNumCells;
		this.gridCellsSizeY = this.gridSizeY / this.gridNumCells;

		this.grid.length = 0;
		for (let y = 0; y < this.gridNumCells; ++y) {
			let row = [];
			for (let x = 0; x < this.gridNumCells; ++x) {
				row.push([]);
			}
			this.grid.push(row);
		}

		for (const objectsOfSomeTypeKey in this.objects) {
			const objectsOfSomeType = this.objects[objectsOfSomeTypeKey];
			for (let objectIndex = 0; objectIndex < objectsOfSomeType.length; ++objectIndex) {
				this.addObjectOntoGrid(objectsOfSomeType[objectIndex]);
			}
		}
	}

	clear() {
		for (const objectsOfSomeTypeKey in this.objects) {
			this.objects[objectsOfSomeTypeKey].length = 0;
		}
		this.lastRetrievedGridIndexXDraw = 0;
		this.lastRetrievedGridIndexYDraw = 0;
		this.lastRetrievedGridIndexXUpdate = 0;
		this.lastRetrievedGridIndexYUpdate = 0;
		this.lastRetrievedGridObjectsDraw.length = 0;
		this.lastRetrievedGridObjectsUpdate.length = 0;
		this.didAnObjectSwitchCells = false;
		this.objectsToAlwaysUpdate.length = 0;
		this.isPaused = false;
	}

	getEmptyPosForCircle = (radius, player, filter = "all") => {
		const maxAttempts = 500;
		const safeBuffer = 20;

		for (let attempt = 0; attempt < maxAttempts; ++attempt) {
			const spawnX = getRandomFloat(this.gridStartX, this.gridEndX);
			const spawnY = getRandomFloat(this.gridStartY, this.gridEndY);

			const distToPlayer = Math.hypot(spawnX - player.x, spawnY - player.y);
			if (distToPlayer < (radius + player.radius + safeBuffer)) continue;

			let isValidPosition = true;

			const categoriesToCheck = (filter === "all")
				? Object.keys(this.objects)
				: (Array.isArray(filter) ? filter : []);

			for (const category of categoriesToCheck) {
				const objectList = this.objects[category];
				if (!objectList) {
					continue;
				}

				for (const object of objectList) {
					if (object.isPointInside(spawnX, spawnY) ||
						object.isCollidesCircle(spawnX, spawnY, radius)) {
						isValidPosition = false;
						break;
					}
				}
				if (!isValidPosition) {
					break
				};
			}

			if (isValidPosition) {
				return [spawnX, spawnY];
			}
		}
		return null;
	}

	getBoolSceneRepresentation = (size) => {
		const cellsSizeX = this.gridSizeX / size;
		const cellsSizeY = this.gridSizeY / size;
		const halfCellX = cellsSizeX * 0.5;
		const halfCellY = cellsSizeY * 0.5;
		const radius = (cellsSizeX + cellsSizeY) * 0.5;
		let grid = [];
		for (let y = 0; y < size; ++y) {
			let row = [];
			for (let x = 0; x < size; ++x) {
				const posX = x * cellsSizeX + this.gridStartX + halfCellX;
				const posY = y * cellsSizeY + this.gridStartY + halfCellY;
				let isInside = false;
				objectsLoop: for (const objects of Object.values(this.objects)) {
					for (let i = 0; i < objects.length; ++i) {
						const object = objects[i];
						if (object.isPointInside(posX, posY) || object.isCollidesCircle(posX, posY, radius)) {
							isInside = true;
							break objectsLoop;
						}
					}
				}
				row.push(isInside);
			}
			grid.push(row);
		}
		return { grid: grid, cellsSizeX: cellsSizeX, cellsSizeY: cellsSizeY, gridStartX: this.gridStartX, gridStartY: this.gridStartY };
	}

	doesHaveAnyObjects() {
		let count = 0;
		for (const category of Object.keys(this.objects)) {
			const objectList = this.objects[category];
			if (objectList) {
				count += objectList.length;
			}
		}
		return count > 2;
	}

	generate(generatorFn, seed, player, scaleRate, images, walkingSprites) {
		//setStringSeed(seed);

		let playerSpawnX = 0;
		let playerSpawnY = 0;
		let levelName = "";
		let shouldShowSeed = true;
		for (let attempt = 0; attempt < 10; ++attempt) {
			this.clear();
			const generationResult = generatorFn(this, player, scaleRate, images, walkingSprites);
			if (generationResult.isSuccessful && this.doesHaveAnyObjects()) {
				playerSpawnX = generationResult.playerSpawnX;
				playerSpawnY = generationResult.playerSpawnY;
				levelName = generationResult.levelName;
				shouldShowSeed = generationResult.shouldShowSeed;
				break;
			}
		}

		this.updateAreaPositions();
		this.updateGrid();

		return { playerSpawnX, playerSpawnY, levelName, shouldShowSeed };
	}

	drawTexture(ctx, offsetX, offsetY, zoomInRate, halfWidth, halfHeight, width, height, maxDimension) {

	}

	drawObjectsBelowPLayer(ctx, offsetX, offsetY, zoomInRate, halfWidth, halfHeight, width, height, maxDimension, player) {
		const cameraX = offsetX + halfWidth / zoomInRate;
		const cameraY = offsetY + halfHeight / zoomInRate;
		if (true) {
			for (let objectIndex = 0; objectIndex < this.lastRetrievedGridObjectsDraw.length; ++objectIndex) {
				const object = this.lastRetrievedGridObjectsDraw[objectIndex];
				if (object.isPlayerAboveVisually === undefined || !object.isPlayerAboveVisually(player)) {
					object.draw(ctx, offsetX, offsetY, zoomInRate);
				}
			}
		}
	}
	drawObjectsAbovePLayer(ctx, offsetX, offsetY, zoomInRate, halfWidth, halfHeight, width, height, maxDimension, player) {
		const cameraX = offsetX + halfWidth / zoomInRate;
		const cameraY = offsetY + halfHeight / zoomInRate;
		if (true) {
			for (let objectIndex = 0; objectIndex < this.lastRetrievedGridObjectsDraw.length; ++objectIndex) {
				const object = this.lastRetrievedGridObjectsDraw[objectIndex];
				if (object.isPlayerAboveVisually?.(player)) {
					object.draw(ctx, offsetX, offsetY, zoomInRate);
				}
			}
		}
	}
	drawHitboxes(ctx, offsetX, offsetY, zoomInRate, halfWidth, halfHeight, width, height, maxDimension) {
		const cameraX = offsetX + halfWidth / zoomInRate;
		const cameraY = offsetY + halfHeight / zoomInRate;
		ctx.globalAlpha = 0.8;
		for (let objectIndex = 0; objectIndex < this.lastRetrievedGridObjectsDraw.length; ++objectIndex) {
			const object = this.lastRetrievedGridObjectsDraw[objectIndex];
			object.drawHitbox(ctx, offsetX, offsetY, zoomInRate);
		}
		ctx.globalAlpha = 1;

		const x = (this.gridStartX - offsetX) * zoomInRate;
		const y = (this.gridStartY - offsetY) * zoomInRate;
		ctx.fillStyle = "rgba(20,20,20,0.6)";
		ctx.fillRect(x, y, this.gridSizeX * zoomInRate, this.gridSizeY * zoomInRate);

		ctx.font = `${Math.floor(50 * zoomInRate)}px Arial`;
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		for (let y = 0; y < this.grid.length; ++y) {
			for (let x = 0; x < this.grid[y].length; ++x) {
				const worldX = this.gridStartX + (x * this.gridCellsSizeX);
				const worldY = this.gridStartY + (y * this.gridCellsSizeY);
				const screenX = (worldX - offsetX) * zoomInRate;
				const screenY = (worldY - offsetY) * zoomInRate;
				const sizeX = this.gridCellsSizeX * zoomInRate;
				const sizeY = this.gridCellsSizeY * zoomInRate;

				const cellData = this.grid[y][x];
				const count = cellData ? cellData.length : 0;

				ctx.fillStyle = "red";
				ctx.globalAlpha = 0.6;
				if (count > 0) {
					ctx.fillRect(screenX, screenY, sizeX, sizeY);
				}

				ctx.fillStyle = "black";
				ctx.fillText(
					count,
					screenX + (sizeX / 2),
					screenY + (sizeY / 2)
				);
				ctx.globalAlpha = 1;
			}
		}

		ctx.fillStyle = "yellow";
		const size123 = 10 * zoomInRate;
		const posX = (0 - offsetX) * zoomInRate;
		const posY = (0 - offsetY) * zoomInRate;
		ctx.fillRect(posX, posY, size123, size123);

		ctx.strokeStyle = "rgba(255,255,255,0.1)";
		ctx.lineWidth = 2;
		const size = this.objectFetchingRange * 2 * zoomInRate;
		const x2 = halfWidth - size / 2;
		const y2 = halfHeight - size / 2;
		ctx.strokeRect(x2, y2, size, size);
	}

	resolveCircleCollisions(x, y, radius) {
		let currentX = x;
		let currentY = y;
		for (let objectIndex = 0; objectIndex < this.lastRetrievedGridObjectsDraw.length; ++objectIndex) {
			const object = this.lastRetrievedGridObjectsDraw[objectIndex];
			const collisionResult = object.resolveCollisionCircle(currentX, currentY, radius);
			if (collisionResult != null) {
				[currentX, currentY] = collisionResult;
			}
		}
		return [currentX, currentY];
	}

	deleteObject(object) {
		for (let i = 0; i < object.gridIndexes.length; ++i) {
			const gridCell = this.grid[object.gridIndexes[i][1]][object.gridIndexes[i][0]];
			for (let gridObjectIndex = 0; gridObjectIndex < gridCell.length; ++gridObjectIndex) {
				const gridObject = gridCell[gridObjectIndex];
				if (gridObject.id == object.id) {
					gridCell.splice(gridObjectIndex, 1);
					break;
				}
			}
		}
		for (const key in this.objects) {
			const objects = this.objects[key];
			for (let i = 0; i < objects.length; ++i) {
				const anyObject = objects[i];
				if (object.id == anyObject.id) {
					objects.splice(i, 1);
					break;
				}
			}
		}
		for (let i = 0; i < this.lastRetrievedGridObjectsDraw.length; ++i) {
			const anyObject = this.lastRetrievedGridObjectsDraw[i];
			if (object.id == anyObject.id) {
				this.lastRetrievedGridObjectsDraw.splice(i, 1);
				break;
			}
		}
		for (let i = 0; i < this.lastRetrievedGridObjectsUpdate.length; ++i) {
			const anyObject = this.lastRetrievedGridObjectsUpdate[i];
			if (object.id == anyObject.id) {
				this.lastRetrievedGridObjectsUpdate.splice(i, 1);
				break;
			}
		}

		for (let i = 0; i < this.objectsToAlwaysUpdate.length; ++i) {
			const anyObject = this.objectsToAlwaysUpdate[i];
			if (object.id == anyObject.id) {
				this.objectsToAlwaysUpdate.splice(i, 1);
				break;
			}
		}

		this.didAnObjectSwitchCells = true;
	}

	updateObjectGridPlace(object) {
		let isNewPositionDiffirentFromStoredGridIndexes = false;
		const vertexes = object.getVertexes();
		for (let vertexIndex = 0; vertexIndex < vertexes.length; ++vertexIndex) {
			const [newGridIndexX, newGridIndexY] = this.getGridIndexFromPoint(vertexes[vertexIndex][0], vertexes[vertexIndex][1]);
			for (let i = 0; i < object.gridIndexes.length; ++i) {
				if (object.gridIndexes[i][0] != newGridIndexX || object.gridIndexes[i][1] != newGridIndexY) {
					isNewPositionDiffirentFromStoredGridIndexes = true;
					break;
				}
			}
		}
		if (isNewPositionDiffirentFromStoredGridIndexes) {
			this.didAnObjectSwitchCells = true;
			for (let i = 0; i < object.gridIndexes.length; ++i) {
				const gridCell = this.grid[object.gridIndexes[i][1]][object.gridIndexes[i][0]];
				for (let gridObjectIndex = 0; gridObjectIndex < gridCell.length; ++gridObjectIndex) {
					const gridObject = gridCell[gridObjectIndex];
					if (gridObject.id == object.id) {
						gridCell.splice(gridObjectIndex, 1);
						break;
					}
				}
			}
		}
		this.addObjectOntoGrid(object);
	}

	updateObjectsFixedStep(mouse, player, world, inventory, images, gameStepsCount, console) {
		if (this.isPaused || player.isDead) {
			return;
		}
		for (let i = 0; i < this.objectsToAlwaysUpdate.length; ++i) {
			this.objectsToAlwaysUpdate[i].updateStep(player, world, inventory, mouse, images, gameStepsCount, console);
			if (this.objectsToAlwaysUpdate[i]?.isShouldDisappear === true) {
				this.objectsToAlwaysUpdate[i].isShouldDisappear = false;
				this.objectsToAlwaysUpdate[i].isMovedLastStep = false;
				this.deleteObject(this.objectsToAlwaysUpdate[i]);
			} else if (this.objectsToAlwaysUpdate[i]?.isMovedLastStep === true) {
				this.updateObjectGridPlace(this.objectsToAlwaysUpdate[i]);
			}
		}
		for (let objectIndex = this.lastRetrievedGridObjectsDraw.length - 1; objectIndex >= 0; --objectIndex) {
			const object = this.lastRetrievedGridObjectsDraw[objectIndex];
			let isThisObjectAlwaysUpdated = false;
			for (let i = 0; i < this.objectsToAlwaysUpdate.length; ++i) {
				const objectToAlwaysUpdate = this.objectsToAlwaysUpdate[i];
				if (objectToAlwaysUpdate.id == object.id) {
					isThisObjectAlwaysUpdated = true;
					break;
				}
			}
			if (!isThisObjectAlwaysUpdated) {
				object.updateStep(player, world, inventory, mouse, images, gameStepsCount, console);
			}

			// if (object?.alwaysUpdate === true) {
			// 	let isThisObjectAlwaysUpdated = false;
			// 	for (let i = 0; i < this.objectsToAlwaysUpdate.length; ++i) {
			// 		const objectToAlwaysUpdate = this.objectsToAlwaysUpdate[i];
			// 		if (objectToAlwaysUpdate.id == object.id) {
			// 			isThisObjectAlwaysUpdated = true;
			// 			break;
			// 		}
			// 	}
			// 	if (!isThisObjectAlwaysUpdated) {
			// 		this.objectsToAlwaysUpdate.push(object);
			// 	}
			// }

			if (object?.isShouldDisappear === true) {
				this.deleteObject(object);
				object.isShouldDisappear = false;
				object.isMovedLastStep = false;
			} else if (object?.isMovedLastStep === true) {
				this.updateObjectGridPlace(object);
			}
			// if (object.isShouldDisappear === true && object.isMovedLastStep === true) {
			// 	this.deleteObject(object);
			// 	object.isShouldDisappear = false;
			// 	object.isMovedLastStep = false;
			// } else if (object.isShouldDisappear === true && object.isMovedLastStep === false) {
			// 	object.isShouldDisappear = false;
			// 	this.deleteObject(object);
			// } else if (object.isShouldDisappear === false && object.isMovedLastStep === true) {
			// 	this.updateObjectGridPlace(object);
			// }
		}
	}

	updateObjectsFrame(mouse, camera, halfWidth, halfHeight, maxDimension, player, world, inventory, images, gameStepsCount, console) {
		if (this.isPaused || player.isDead) {
			return;
		}
		this.objectFetchingRange = 350 / camera.zoomInRate;
		this.updateRelevantObjects(camera.x, camera.y, camera.zoomInRate, halfWidth, halfHeight, maxDimension, player, false);
		if (this.isStrictUpdateGrid) {
			this.updateGrid();
			this.updateRelevantObjects(camera.x, camera.y, camera.zoomInRate, halfWidth, halfHeight, maxDimension, player, true);
			this.isStrictUpdateGrid = false;
		}
		for (let i = 0; i < this.objectsToAlwaysUpdate.length; ++i) {
			this.objectsToAlwaysUpdate[i].updateFrame(player, world, inventory, mouse, images, gameStepsCount, console);
		}
		for (let i = 0; i < this.lastRetrievedGridObjectsDraw.length; ++i) {
			const objectToBeUpdated = this.lastRetrievedGridObjectsDraw[i];
			//this.lastRetrievedGridObjectsDraw[i].updateFrame(player, world, inventory, mouse, images, gameStepsCount, console);
			let isThisObjectAlwaysUpdated = false;
			for (let i = 0; i < this.objectsToAlwaysUpdate.length; ++i) {
				const objectToAlwaysUpdate = this.objectsToAlwaysUpdate[i];
				if (objectToAlwaysUpdate.id == objectToBeUpdated.id) {
					isThisObjectAlwaysUpdated = true;
					break;
				}
			}
			if (!isThisObjectAlwaysUpdated) {
				objectToBeUpdated.updateFrame(player, world, inventory, mouse, images, gameStepsCount, console);
			}
		}
	}
}