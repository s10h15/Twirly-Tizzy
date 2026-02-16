import { getWall } from "../Objects/wall.js";
import { getFire } from "../Objects/fire.js";
import { getWood } from "../Objects/wood.js";
import { getRandomInt, getRandomFloat, isChance } from "../Helpers/random.js";
import { playEffect } from "../Helpers/audio.js";
import { getBlackHole } from "../Objects/blackHole.js";
import { getSprite } from "../Objects/sprite.js";
import { getTinyMushroom } from "../Objects/tinyMushroom.js";
import { getNormalMushroom } from "../Objects/normalMushroom.js";
import { getQuestion } from "../Objects/question.js";
import { getCheese } from "../Objects/cheese.js";
import { getPortal } from "../Objects/portal.js";
import { getSaw } from "../Objects/saw.js";
import { getTree } from "../Objects/tree.js";
import { getCatChaser } from "../Objects/catChaser.js";
import { getPusher } from "../Objects/pusher.js";
import { getBomb } from "../Objects/bomb.js";
import { getLazer } from "../Objects/lazer.js";
import { getCatShooter } from "../Objects/catShooter.js";
import { getSeed } from "../Objects/seed.js";
import { getBullet } from "../Objects/bullet.js";
import { getCatnip } from "../Objects/catnip.js";
import { getTornado } from "../Objects/tornado.js";
import { getApple } from "../Objects/apple.js";
import { getBananaPeel } from "../Objects/bananaPeel.js";
import { getBinoculars } from "../Objects/binoculars.js";
import { getCatSeller } from "../Objects/catSeller.js";
import { getCoin } from "../Objects/coin.js";
import { getCatStealer } from "../Objects/catStealer.js";
import { getPotion } from "../Objects/potion.js";
import { getNoose } from "../Objects/noose.js";
import { getHook } from "../Objects/hook.js";

import { getRectangleVertexes, getRectangleVertexesRotated, getCircleVertexes, isShapeCollidesCircle, isPointInsideShape, isPointInsideCircle, isShapeCollidesShape, getShapeCenter } from "../math.js";

const twoPI = Math.PI * 2;

export function generateChallenge(world, player, scaleRate, images) {
    const worldSize = 2000;
    const thickness = 10;
    const fullSize = worldSize * 2;

    world.objects.walls.push(getWall(getRectangleVertexes(-worldSize, -worldSize, fullSize, thickness), 1));
    world.objects.walls.push(getWall(getRectangleVertexes(-worldSize, worldSize - thickness, fullSize, thickness), 1));
    world.objects.walls.push(getWall(getRectangleVertexes(-worldSize, -worldSize, thickness, fullSize), 1));
    world.objects.walls.push(getWall(getRectangleVertexes(worldSize - thickness, -worldSize, thickness, fullSize), 1));

    world.objects.walls.push(getWall(getRectangleVertexes(-1500, -1900, 1200, 100), 1, true));
    world.objects.walls.push(getWall(getRectangleVertexes(-1500, -1500, 1200, 100), 1, true));
    world.objects.walls.push(getWall(getRectangleVertexes(-1500, -2000, 50, 100), 1, true));

    world.objects.walls.push(getWall(getRectangleVertexes(-1200, -1375, 350, 350), 1, true, true));

    world.objects.blackHoles.push(getBlackHole(getRectangleVertexes(-1600, -2000, 500, 500), 1));
    world.objects.blackHoles.push(getBlackHole(getRectangleVertexes(-850, -1575, 100, 100), 1));
    world.objects.blackHoles.push(getBlackHole(getRectangleVertexes(-850, -1825, 100, 100), 1));
    world.objects.blackHoles.push(getBlackHole(getRectangleVertexes(-500, (-1575 + -1825) * 0.5, 100, 100), 1));

    world.objects.saws.push(getSaw(50, images, -500, -1490, 400, -1490, 25));

    world.objects.walls.push(getWall(getRectangleVertexesRotated(-1500 + 900, -1500 + 230, 450, 10, -15), 1, true, true));
    world.objects.walls.push(getWall(getRectangleVertexesRotated(-1500 + 900, -1500 + 450, 450, 10, -15), 1, true, true));
    world.objects.walls.push(getWall(getCircleVertexes(-1500 + 2400, -1500 + 450, 300, 6), 1, true, true));
    world.objects.walls.push(getWall(getCircleVertexes(-1500 + 1850, -1500 - 210, 10, 6), 1, true, true));
    world.objects.walls.push(getWall(getCircleVertexes(-1500 + 1330, -1500 - 250, 100, 32), 1, true, true));

    const numTurns = 2;
    const pointsPerTurn = 30;
    const spiralSpacing = 250;
    const pathThickness = 30;
    const centerX = 200;
    const centerY = -1500;
    const totalPoints = numTurns * pointsPerTurn;
    const outerVertices = [];
    const innerVertices = [];
    for (let i = 0; i <= totalPoints; i++) {
        const angle = (i / pointsPerTurn) * Math.PI * 2;
        const radius = (i / totalPoints) * (numTurns * spiralSpacing);
        const xOuter = centerX + (radius + pathThickness / 2) * Math.cos(angle);
        const yOuter = centerY + (radius + pathThickness / 2) * Math.sin(angle);
        outerVertices.push([xOuter, yOuter]);
        const xInner = centerX + (radius - pathThickness / 2) * Math.cos(angle);
        const yInner = centerY + (radius - pathThickness / 2) * Math.sin(angle);
        innerVertices.push([xInner, yInner]);
    }
    const spiralPolygonVertices = [...outerVertices, ...innerVertices.reverse()];
    world.objects.blackHoles.push(
        getWall(spiralPolygonVertices, 1, true, true)
    );

    world.objects.saws.push(getSaw(50, images, 200, -1000, 870, -1900, 700));

    world.objects.portals.push(getPortal(getRectangleVertexes(centerX - 50, centerY - 50, 100, 100), images, true, "spiralPortal", "outsidePortal"));
    world.objects.portals.push(getPortal(getRectangleVertexes(centerX + 800, centerY - 50, 100, 100), images, false, "outsidePortal", "spiralPortal"));

    world.objects.walls.push(getWall(getRectangleVertexes(900, -2000, 5, 1000), 1, true, false));

    world.objects.saws.push(getSaw(100, images, 1000, -2000, 1000, -1000, 5));
    world.objects.saws.push(getSaw(100, images, 1800, -2000, 1300, -1000, 10));
    world.objects.saws.push(getSaw(100, images, 1900, -2000, 1400, -1000, 10));
    world.objects.saws.push(getSaw(100, images, 2000, -2000, 1500, -1000, 10));
    world.objects.saws.push(getSaw(100, images, 2100, -2000, 1600, -1000, 10));
    world.objects.saws.push(getSaw(100, images, 2200, -2000, 1700, -1000, 10));

    world.objects.saws.push(getSaw(100, images, 2000, -2000, 1500, -1000, 15));
    world.objects.saws.push(getSaw(100, images, 2200, -2000, 1700, -1000, 5));

    world.objects.portals.push(getPortal(getRectangleVertexes(1900, -1100, 100, 100), images, true, "section1", "section2"));
    world.objects.portals.push(getPortal(getRectangleVertexes(-1800, -900, 100, 100), images, false, "section2", "section1"));

    world.objects.walls.push(getWall(getRectangleVertexes(-2000, -1000, 4000, 50), 1, true));

    world.objects.blackHoles.push(getBlackHole(getRectangleVertexes(-1200, -1200, 950, 950), 1));
    world.objects.blackHoles.push(getBlackHole(getRectangleVertexes(-300, -1200, 950, 950), 1));
    world.objects.blackHoles.push(getBlackHole(getRectangleVertexes(650, -1200, 950, 950), 1));

    world.objects.blackHoles.push(getBlackHole(getRectangleVertexes(-1200, -700, 950, 950), 1));
    world.objects.blackHoles.push(getBlackHole(getRectangleVertexes(-300, -700, 950, 950), 1));
    world.objects.blackHoles.push(getBlackHole(getRectangleVertexes(650, -700, 950, 950), 1));

    world.objects.walls.push(getWall(getRectangleVertexes(-2000, -100, 4000, 50), 1, true));

    world.objects.portals.push(getPortal(getRectangleVertexes(1900, -800, 100, 100), images, false, "portalsStart", "section3"));
    world.objects.portals.push(getPortal(getRectangleVertexes(1900, -800, 100, 100), images, false, "portalsStart", "section3"));
    world.objects.portals.push(getPortal(getRectangleVertexes(1900, -800, 100, 100), images, false, "portalsStart", "section3"));
    world.objects.portals.push(getPortal(getRectangleVertexes(1900, -800, 100, 100), images, false, "portalsStart", "section3"));
    world.objects.portals.push(getPortal(getRectangleVertexes(1900, -800, 100, 100), images, false, "portalsStart", "section3"));
    world.objects.portals.push(getPortal(getRectangleVertexes(-1900, 100, 100, 100), images, true, "section3", "portalsStart"));

    for (let i = 0; i < 250; ++i) {
        world.objects.walls.push(getWall(getRectangleVertexes(getRandomInt(-2000, 2000), getRandomInt(400, 1500), 10, 10), 1, true, true));
    }

    world.objects.cheese.push(getCheese(getRectangleVertexes(0, 1800, 100, 100), images));
    return {
        isSuccessful: true,
        playerSpawnX: -1900,
        playerSpawnY: -1900,
        // playerSpawnX: -100,
        // playerSpawnY: -1200
        levelName: "challenge",
        shouldShowSeed: false,
    };
}

export function generateNothing(world, player, scaleRate, images) {
    const worldSize = 2000;
    let spawnX = -worldSize;
    let spawnY = -worldSize;
    let sizeX = 1;
    let sizeY = sizeX * (Math.random() + 0.5);
    let wallX = spawnX - sizeX * 0.5;
    let wallY = spawnY - sizeY * 0.5;
    let vertexes = [
        [wallX, wallY],
        [wallX + sizeX, wallY],
        [wallX + sizeX, wallY + sizeY],
        [wallX, wallY + sizeY]
    ];
    world.objects.walls.push(getWall(vertexes, sizeX / sizeY));
    spawnX = worldSize;
    spawnY = worldSize;
    sizeX = 1;
    sizeY = sizeX * (Math.random() + 0.5);
    wallX = spawnX - sizeX * 0.5;
    wallY = spawnY - sizeY * 0.5;
    vertexes = [
        [wallX, wallY],
        [wallX + sizeX, wallY],
        [wallX + sizeX, wallY + sizeY],
        [wallX, wallY + sizeY]
    ];
    world.objects.walls.push(getWall(vertexes, sizeX / sizeY));

    return {
        isSuccessful: true,
        playerSpawnX: 0,
        playerSpawnY: 0,
        levelName: "nothing",
        shouldShowSeed: false,
    };
}
export function generateMaze(world, player, scaleRate, images) {
    if (world.alwaysUpdateObject === undefined) return;

    const tinyMushroomVertexes = getRectangleVertexes(0, -300, 50, 50);
    world.objects.tinyMushrooms.push(getTinyMushroom(tinyMushroomVertexes, images));

    const normalMushroomVertexes = getRectangleVertexes(50, 50, 95, 95);
    world.objects.normalMushrooms.push(getNormalMushroom(normalMushroomVertexes, images));

    const questionVertexes = getRectangleVertexes(-300, -100, 100, 100);
    world.objects.questions.push(getQuestion(questionVertexes, images));

    const gridSize = 64;
    const cellSize = 120;
    const wallT = 16;

    const spawnBox = (x, y, w, h) => {
        const safeW = Math.max(1, w);
        const safeH = Math.max(1, h);
        const wallX = x - safeW * 0.5;
        const wallY = y - safeH * 0.5;
        const vertexes = [
            [wallX, wallY],
            [wallX + safeW, wallY],
            [wallX + safeW, wallY + safeH],
            [wallX, wallY + safeH]
        ];
        world.objects.walls.push(getWall(vertexes, safeW / safeH, true));
    };

    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            const posX = x * cellSize;
            const posY = y * cellSize;
            let carveNorth = Math.random() > 0.5;

            if (y === 0) carveNorth = false;
            if (x === 0) carveNorth = true;
            if (x === 0 && y === 0) continue;

            if (carveNorth) {
                spawnBox(posX, posY + cellSize / 2, wallT, cellSize);
            } else {
                spawnBox(posX + cellSize / 2, posY, cellSize, wallT);
            }
        }
    }

    const totalSize = gridSize * cellSize;
    spawnBox((totalSize + cellSize) / 2, 0, totalSize - cellSize, wallT);
    spawnBox((totalSize - cellSize) / 2, totalSize, totalSize - cellSize, wallT);
    spawnBox(0, totalSize / 2, wallT, totalSize);
    spawnBox(totalSize, totalSize / 2, wallT, totalSize);
    const buffer = cellSize * 2;
    const height = cellSize * 8;
    const topY = -height;
    spawnBox(0 - (buffer / 2), topY + (height / 2), wallT, height);
    spawnBox(0, topY, buffer, wallT);
    spawnBox(0 + (buffer / 2), topY + (height / 2), wallT, height);
    const wallWidth = buffer * 0.75;
    const wallX = (0 - buffer / 2) + (wallWidth / 2);

    spawnBox(wallX, 0, wallWidth, wallT);

    return {
        isSuccessful: true,
        playerSpawnX: 0,
        playerSpawnY: -100,
        levelName: "maze",
        shouldShowSeed: false,
    };
}
export function generateImageGenerator(world, player, scaleRate, images, walkingSprites) {
    if (world.alwaysUpdateObject === undefined) return;

    const spawnGrid = (sourceImages, startX, startY, gridWidth = 5) => {
        const keys = Object.keys(sourceImages);
        const spacing = 750;
        const size = 700;

        keys.forEach((key, index) => {
            const col = index % gridWidth;
            const row = Math.floor(index / gridWidth);

            const x = startX + (col * spacing);
            const y = startY + (row * spacing);

            const vertexes = [
                [x, y],
                [x + size, y],
                [x + size, y + size],
                [x, y + size]
            ];

            world.objects.sprites.push(getSprite(vertexes, sourceImages[key]));
        });
    };

    spawnGrid(images, -1500, 500);

    spawnGrid(walkingSprites, 2750, 500);

    for (let i = 0; i < 20; ++i) {
        const binoculars = getBinoculars(getRectangleVertexes(0 + 100 * i, -1200 + i * 100, 85, 85), images);
        binoculars.numToGive = 1488;
        world.objects.binoculars.push(binoculars);
    }

    return {
        isSuccessful: true,
        playerSpawnX: 0,
        playerSpawnY: 0,
        levelName: "images",
        shouldShowSeed: false,
    };
}
export function generateTest(world, player, scaleRate, images) {
    if (world.alwaysUpdateObject === undefined) {
        return;
    }
    let walls = [];
    const sizeM = 300;
    const x = 100;
    const y = sizeM * -0.5;
    let fires = [
        getFire([
            [x, y],
            [x + sizeM, y],
            [x + sizeM, y + sizeM],
            [x, y + sizeM]
        ], scaleRate, images, x + sizeM * 0.5, y + sizeM * 0.5)
    ];
    for (let i = 0; i < walls.length; ++i) {
        world.objects.walls.push(walls[i]);
    }
    for (let i = 0; i < fires.length; ++i) {
        fires[i].generateTexture();
        world.objects.fires.push(fires[i]);
        world.alwaysUpdateObject(fires[i]);
    }
    const woodCount = 250;
    for (let i = 0; i < woodCount; i++) {
        const sizeType = getRandomInt(0, 2);
        let woodWidth;
        if (sizeType == 0) {
            woodWidth = 80;
        } else if (sizeType == 1) {
            woodWidth = 80;
        } else if (sizeType == 2) {
            woodWidth = 105;
        }
        const woodHeight = woodWidth;
        const maxRadius = 10000;
        const radius = Math.pow(getRandomFloat(0, 1), 0.4) * maxRadius;

        const angle = getRandomFloat(0, Math.PI * 2);
        const randX = Math.cos(angle) * radius;
        const randY = Math.sin(angle) * radius;
        const vertices = [
            [randX, randY],
            [randX + woodWidth, randY],
            [randX + woodWidth, randY + woodHeight],
            [randX, randY + woodHeight]
        ];
        world.objects.wood.push(getWood(vertices, images, sizeType));
    }

    const worldSize = 10000;
    let spawnX = -worldSize;
    let spawnY = -worldSize;
    let sizeX = 1;
    let sizeY = sizeX * getRandomFloat(0.5, 1.5);
    let wallX = spawnX - sizeX * 0.5;
    let wallY = spawnY - sizeY * 0.5;
    let vertexes = [
        [wallX, wallY],
        [wallX + sizeX, wallY],
        [wallX + sizeX, wallY + sizeY],
        [wallX, wallY + sizeY]
    ];
    world.objects.walls.push(getWall(vertexes, sizeX / sizeY));
    spawnX = worldSize;
    spawnY = worldSize;
    sizeX = 1;
    sizeY = sizeX * getRandomFloat(0.5, 1.5);
    wallX = spawnX - sizeX * 0.5;
    wallY = spawnY - sizeY * 0.5;
    vertexes = [
        [wallX, wallY],
        [wallX + sizeX, wallY],
        [wallX + sizeX, wallY + sizeY],
        [wallX, wallY + sizeY]
    ];
    world.objects.walls.push(getWall(vertexes, sizeX / sizeY));

    const treeCount = 500;
    const maxTreeRadius = 10000;
    const treeSize = 500;
    for (let i = 0; i < treeCount; i++) {
        const radius = Math.pow(getRandomFloat(0, 1), 0.4) * maxTreeRadius;
        const angle = getRandomFloat(0, Math.PI * 2);
        const randX = Math.cos(angle) * radius;
        const randY = Math.sin(angle) * radius;
        const vertices = [
            [randX, randY],
            [randX + treeSize, randY],
            [randX + treeSize, randY + treeSize],
            [randX, randY + treeSize]
        ];
        if (isShapeCollidesShape(world.objects.fires[0].vertexes, vertices)) {
            continue;
        }
        const hasApples = i < 10 ? true : isChance(0.075);
        world.objects.trees.push(getTree(vertices, images, hasApples));
    }

    // const peelCount = 100;       // Set how many peels you want
    // const peelSize = 50;         // Standard size for a peel
    // for (let i = 0; i < peelCount; i++) {
    //     // Re-use the same math logic to spread them around the world
    //     const radius = Math.pow(Math.random(), 0.4) * maxTreeRadius;
    //     const angle = Math.random() * Math.PI * 2;
    //     const randX = Math.cos(angle) * radius;
    //     const randY = Math.sin(angle) * radius;

    //     // Use your getRectangleVertexes helper to build the collision box
    //     const peelVertices = getRectangleVertexes(randX, randY, peelSize, peelSize);

    //     // Skip if it spawns inside the fire
    //     if (isShapeCollidesShape(world.objects.fires[0].vertexes, peelVertices)) {
    //         continue;
    //     }

    //     // Push into the bananaPeels array
    //     world.objects.bananaPeels.push(getBananaPeel(peelVertices, images));
    // }

    // const catChaserCount = 500;
    // const maxCatRadius = 10000;
    // const catSize = 150;
    // for (let i = 0; i < catChaserCount; i++) {
    //     const radius = Math.pow(Math.random(), 0.4) * maxCatRadius;
    //     const angle = Math.random() * Math.PI * 2;
    //     const randX = Math.cos(angle) * radius;
    //     const randY = Math.sin(angle) * radius;
    //     world.objects.catChasers.push(getCatChaser(randX, randY, catSize, images));
    // }

    // world.objects.catStealers.push(getCatStealer(getRectangleVertexes(200, -300, 300, 300), images));

    // for (let i = 0; i < 20; ++i) {
    //     const coin = getCoin(getRectangleVertexes(0 + 100 * i, -200, 85, 85), images);
    //     coin.numToGive = 64;
    //     world.objects.coins.push(coin);
    // }

    // for (let i = 0; i < 20; ++i) {
    //     world.objects.seeds.push(getSeed(getRectangleVertexes(0 + 100 * i, 200, 50, 50), images));
    // }
    // for (let i = 0; i < 20; ++i) {
    //     world.objects.binoculars.push(getBinoculars(getRectangleVertexes(0 + 100 * i, -600, 85, 85), images));
    // }

    // world.objects.catSellers.push(getCatSeller(getRectangleVertexes(-700, -300, 150, 150), images));
    // world.objects.pushers.push(getPusher(getRectangleVertexes(-900, -300, 1200, 1200), images, 3));

    // for (let i = 0; i < 20; ++i) {
    //     world.objects.catChasers.push(getCatChaser(getRectangleVertexes(800, -300, 100, 100), images));
    // }

    // for (let i = 0; i < 20; ++i) {
    //     world.objects.potions.push(getPotion(getRectangleVertexes(0 + 100 * i, 600, 65, 65), images));
    // }

    // for (let i = 0; i < 50; ++i) {
    //     world.objects.catShooters.push(getCatShooter(getRectangleVertexes(0 + 100 * i, 700, 65, 65), images));
    // }
    // for (let i = 0; i < 50; ++i) {
    //     world.objects.catStealers.push(getCatStealer(getRectangleVertexes(0 + 100 * i, 700, 300, 300), images));
    // }
    // for (let i = 0; i < 20; ++i) {
    //     world.objects.nooses.push(getNoose(getRectangleVertexes(0 + 100 * i, 200, 150, 150), images));
    // }
    // for (let i = 0; i < 20; ++i) {
    //     world.objects.hooks.push(getHook(getRectangleVertexes(0 + 100 * i, 200, 85, 85), images));
    // }

    return {
        isSuccessful: true,
        playerSpawnX: 0,
        playerSpawnY: 0,
        levelName: "main",
        shouldShowSeed: true,
    };
}

function getRandomPointInRadius(centerX, centerY, maxRadius, bias = 0.8) {
    const angle = Math.random() * 2 * Math.PI;
    const distance = Math.pow(Math.random(), bias) * maxRadius;
    const x = centerX + distance * Math.cos(angle);
    const y = centerY + distance * Math.sin(angle);
    return [x, y];
}

function spawnWall(world, player) {
    const sizeX = getRandomInt(200, 1200);
    const sizeY = sizeX;

    const diagonalRadius = Math.sqrt(sizeX * sizeX + sizeY * sizeY) * 0.5;
    const generatedEmptyPos = world.getEmptyPosForCircle(diagonalRadius, player, "all");

    if (generatedEmptyPos === null) return;

    const [spawnX, spawnY] = generatedEmptyPos;

    const x = spawnX - sizeX * 0.5;
    const y = spawnY - sizeY * 0.5;

    const vertexes = [
        [x, y],
        [x + sizeX, y],
        [x + sizeX, y + sizeY],
        [x, y + sizeY]
    ];

    const wall = getWall(vertexes, sizeX / sizeY);
    world.objects.walls.push(wall);
    world.isStrictUpdateGrid = true;
}
function spawnBlackHole(world, player, size) {
    const sizeX = (size === undefined) ? getRandomInt(500, 1200) : size;
    const sizeY = sizeX;

    const diagonalRadius = Math.sqrt(sizeX * sizeX + sizeY * sizeY) * 0.5;
    const generatedEmptyPos = world.getEmptyPosForCircle(diagonalRadius, player, "all");

    if (generatedEmptyPos === null) return;

    const [spawnX, spawnY] = generatedEmptyPos;

    const x = spawnX - sizeX * 0.5;
    const y = spawnY - sizeY * 0.5;

    const vertexes = [
        [x, y],
        [x + sizeX, y],
        [x + sizeX, y + sizeY],
        [x, y + sizeY]
    ];

    world.objects.blackHoles.push(getBlackHole(vertexes, sizeX / sizeY));
    world.isStrictUpdateGrid = true;
}

function generateFittingRectangleShape(sizeX, sizeY, vertexesToAvoid, gridStartX, gridStartY, gridEndX, gridEndY, playerX, playerY, playerRadius) {
    const maxAttempts = 500;

    for (let attempt = 0; attempt < maxAttempts; ++attempt) {
        const spawnX = getRandomFloat(gridStartX, gridEndX);
        const spawnY = getRandomFloat(gridStartY, gridEndY);
        const halfX = sizeX / 2;
        const halfY = sizeY / 2;
        const candidateVertexes = [
            [spawnX - halfX, spawnY - halfY],
            [spawnX + halfX, spawnY - halfY],
            [spawnX + halfX, spawnY + halfY],
            [spawnX - halfX, spawnY + halfY]
        ];

        const fakePlayerBox = [
            [playerX - playerRadius, playerY - playerRadius],
            [playerX + playerRadius, playerY - playerRadius],
            [playerX + playerRadius, playerY + playerRadius],
            [playerX - playerRadius, playerY + playerRadius]
        ];

        const isPlayerCenterInside = isShapeCollidesShape(candidateVertexes, fakePlayerBox);
        const isTouchingEdge = isShapeCollidesCircle(candidateVertexes, playerX, playerY, playerRadius);
        if (isPlayerCenterInside || isTouchingEdge) {
            continue;
        }

        let isValidPosition = true;
        for (let i = 0; i < vertexesToAvoid.length; ++i) {
            const shape = vertexesToAvoid[i];
            if (isShapeCollidesShape(shape, candidateVertexes)) {
                isValidPosition = false;
                break;
            }
        }

        if (isValidPosition) {
            return candidateVertexes;
        }
    }
    return null;
}
export function generateBlackHoles(world, player, scaleRate, images) {
    if (world.alwaysUpdateObject === undefined) {
        return;
    }
    const worldSize = 2000;
    let spawnX = -worldSize;
    let spawnY = -worldSize;
    let sizeX = 1;
    let sizeY = sizeX * (Math.random() + 0.5);
    let wallX = spawnX - sizeX * 0.5;
    let wallY = spawnY - sizeY * 0.5;
    let vertexes = [
        [wallX, wallY],
        [wallX + sizeX, wallY],
        [wallX + sizeX, wallY + sizeY],
        [wallX, wallY + sizeY]
    ];
    world.objects.walls.push(getWall(vertexes, sizeX / sizeY));
    spawnX = worldSize;
    spawnY = worldSize;
    sizeX = 1;
    sizeY = sizeX * (Math.random() + 0.5);
    wallX = spawnX - sizeX * 0.5;
    wallY = spawnY - sizeY * 0.5;
    vertexes = [
        [wallX, wallY],
        [wallX + sizeX, wallY],
        [wallX + sizeX, wallY + sizeY],
        [wallX, wallY + sizeY]
    ];
    world.objects.walls.push(getWall(vertexes, sizeX / sizeY));

    const fakePlayerBox = [
        [player.x - player.radius, player.y - player.radius],
        [player.x + player.radius, player.y - player.radius],
        [player.x + player.radius, player.y + player.radius],
        [player.x - player.radius, player.y + player.radius]
    ];
    let vertexesToAvoid = [];
    for (let i = 0; i < 100; ++i) {
        const size = getRandomInt(200, 1200);
        const shape = generateFittingRectangleShape(size, size, vertexesToAvoid, world.gridStartX, world.gridStartY, world.gridEndX, world.gridEndY, player.x, player.y, player.radius);
        if (shape !== null && !isShapeCollidesShape(shape, fakePlayerBox)) {
            world.objects.blackHoles.push(getBlackHole(shape, 1));
            vertexesToAvoid.push(shape);
        }
    }

    return true;
}

function projectShape(shape, axis) {
    let min = Infinity;
    let max = -Infinity;
    for (let i = 0; i < shape.length; i++) {
        const dot = shape[i][0] * axis[0] + shape[i][1] * axis[1];
        if (dot < min) min = dot;
        if (dot > max) max = dot;
    }
    return [min, max];
}
function hasSeparatingAxis(shape1, shape2) {
    for (let i = 0; i < shape1.length; i++) {
        const p1 = shape1[i];
        const p2 = shape1[(i + 1) % shape1.length];
        const axis = [-(p2[1] - p1[1]), p2[0] - p1[0]];
        const [min1, max1] = projectShape(shape1, axis);
        const [min2, max2] = projectShape(shape2, axis);
        if (max1 < min2 || max2 < min1) {
            return true;
        }
    }
    return false;
}


















const webWorker = new Worker("./WebWorkers/worldTicker.js", { type: "module" });

let isWorkerBusy = false;
let currentWorldRef = null;
let currentPLayerRef = null;
let currentObjectName = null;
let currentImagesRef = null;

const objectNameToActions = {
    wall: {
        spawnFunction: (vertexes, textureAspectRatio) => {
            currentWorldRef.objects.walls.push(getWall(vertexes, textureAspectRatio, false, false, false));
        },
        objectsItAvoids: ["fires", "walls", "wood", "binoculars", "seeds", "coins", "apples"],
        spawnAmount: 8,
    },
    blackHole: {
        spawnFunction: (vertexes, textureAspectRatio) => {
            currentWorldRef.objects.blackHoles.push(getBlackHole(vertexes, textureAspectRatio));
        }, objectsItAvoids: ["fires", "blackHoles", "wood"],
        spawnAmount: 7,
    },
    catChaser: {
        spawnFunction: (vertexes, textureAspectRatio, images) => {
            currentWorldRef.objects.catChasers.push(getCatChaser(vertexes, images));
        }, objectsItAvoids: [],
        spawnAmount: 4,
    },
    saw: {
        spawnFunction: (vertexes, textureAspectRatio, images) => {
            if (isChance(0.5)) {
                currentWorldRef.objects.saws.push(getSaw(85, images, vertexes[0][0], vertexes[0][1], vertexes[2][0], vertexes[2][1], getRandomInt(5, 35)));
            } else {
                currentWorldRef.objects.saws.push(getSaw(85, images, vertexes[1][0], vertexes[1][1], vertexes[3][0], vertexes[3][1], getRandomInt(5, 35)));
            }
        }, objectsItAvoids: ["fires"],
        spawnAmount: 5,
    },
    pusher: {
        spawnFunction: (vertexes, textureAspectRatio, images) => {
            currentWorldRef.objects.pushers.push(getPusher(vertexes, images, getRandomInt(0, 3)));
        }, objectsItAvoids: ["fires"],
        spawnAmount: 10,
    },
    bomb: {
        spawnFunction: (vertexes, textureAspectRatio, images) => {
            currentWorldRef.objects.bombs.push(getBomb(vertexes, images, getRandomInt(100, 850)));
        }, objectsItAvoids: [],
        spawnAmount: 25,
    },
    lazer: {
        spawnFunction: (vertexes, textureAspectRatio, images) => {
            currentWorldRef.objects.lazers.push(getLazer(vertexes));
        }, objectsItAvoids: [],
        spawnAmount: 7,
    },
    portal: {
        spawnFunction: (vertexes, textureAspectRatio, images) => {
            const portalNameFirst = getRandomInt(0, 99999999999).toString();
            const portalNameSecond = getRandomInt(0, 99999999999).toString();
            if (isChance(0.5)) {
                currentWorldRef.objects.portals.push(getPortal(getRectangleVertexes(vertexes[0][0], vertexes[0][1], 100, 100), images, true, portalNameFirst, portalNameSecond));
                currentWorldRef.objects.portals.push(getPortal(getRectangleVertexes(vertexes[2][0], vertexes[2][1], 100, 100), images, false, portalNameSecond, portalNameFirst));
            } else {
                currentWorldRef.objects.portals.push(getPortal(getRectangleVertexes(vertexes[1][0], vertexes[1][1], 100, 100), images, false, portalNameFirst, portalNameSecond));
                currentWorldRef.objects.portals.push(getPortal(getRectangleVertexes(vertexes[3][0], vertexes[3][1], 100, 100), images, true, portalNameSecond, portalNameFirst));
            }
        }, objectsItAvoids: ["fires", "walls"],
        spawnAmount: 4,
    },
    catShooter: {
        spawnFunction: (vertexes, textureAspectRatio, images) => {
            currentWorldRef.objects.catShooters.push(getCatShooter(vertexes, images));
        }, objectsItAvoids: [],
        spawnAmount: 4,
    },
    seed: {
        spawnFunction: (vertexes, textureAspectRatio, images) => {
            currentWorldRef.objects.seeds.push(getSeed(vertexes, images));
        }, objectsItAvoids: ["fires", "trees", "walls"],
        spawnAmount: 10,
    },
    tornado: {
        spawnFunction: (vertexes, textureAspectRatio, images) => {
            currentWorldRef.objects.tornados.push(getTornado(vertexes, images));
        }, objectsItAvoids: [],
        spawnAmount: 3,
    },
    bananaPeel: {
        spawnFunction: (vertexes, textureAspectRatio, images) => {
            currentWorldRef.objects.bananaPeels.push(getBananaPeel(vertexes, images));
        }, objectsItAvoids: ["fires", "trees", "walls"],
        spawnAmount: 8,
    },
    binoculars: {
        spawnFunction: (vertexes, textureAspectRatio, images) => {
            currentWorldRef.objects.binoculars.push(getBinoculars(vertexes, images));
        }, objectsItAvoids: ["fires", "trees", "walls"],
        spawnAmount: 4,
    },
    catSeller: {
        spawnFunction: (vertexes, textureAspectRatio, images) => {
            currentWorldRef.objects.catSellers.push(getCatSeller(vertexes, images));
        }, objectsItAvoids: ["fires", "trees", "wood", "walls"],
        spawnAmount: 1,
    },
    coin: {
        spawnFunction: (vertexes, textureAspectRatio, images) => {
            currentWorldRef.objects.coins.push(getCoin(vertexes, images, 3));
        }, objectsItAvoids: ["fires", "trees", "walls"],
        spawnAmount: 3,
    },
    catStealer: {
        spawnFunction: (vertexes, textureAspectRatio, images) => {
            currentWorldRef.objects.catStealers.push(getCatStealer(vertexes, images));
        }, objectsItAvoids: [],
        spawnAmount: 6,
    },
    potion: {
        spawnFunction: (vertexes, textureAspectRatio, images) => {
            currentWorldRef.objects.potions.push(getPotion(vertexes, images));
        }, objectsItAvoids: ["fires", "trees", "walls"],
        spawnAmount: 6,
    },
    noose: {
        spawnFunction: (vertexes, textureAspectRatio, images) => {
            currentWorldRef.objects.nooses.push(getNoose(vertexes, images));
        }, objectsItAvoids: ["fires", "trees", "walls", "blackHoles"],
        spawnAmount: 1,
    },
    hook: {
        spawnFunction: (vertexes, textureAspectRatio, images) => {
            currentWorldRef.objects.hooks.push(getHook(vertexes, images));
        }, objectsItAvoids: ["fires", "trees", "walls", "blackHoles"],
        spawnAmount: 4,
    },
};

function spawnCorrespondingObject(vertexes, textureAspectRatio, images) {
    const objectActions = objectNameToActions[currentObjectName];
    objectActions.spawnFunction(vertexes, textureAspectRatio, images);
}

webWorker.onmessage = function (inputData) {
    isWorkerBusy = false;

    if (!inputData.data.isSuccessful || !currentWorldRef || !currentPLayerRef || !currentObjectName || !currentImagesRef) {
        return;
    }

    const textureAspectRatios = inputData.data.textureAspectRatios;
    const newObjectVertexes = inputData.data.newObjectVertexes;
    const fakePlayerBox = [
        [currentPLayerRef.x - currentPLayerRef.radius, currentPLayerRef.y - currentPLayerRef.radius],
        [currentPLayerRef.x + currentPLayerRef.radius, currentPLayerRef.y - currentPLayerRef.radius],
        [currentPLayerRef.x + currentPLayerRef.radius, currentPLayerRef.y + currentPLayerRef.radius],
        [currentPLayerRef.x - currentPLayerRef.radius, currentPLayerRef.y + currentPLayerRef.radius]
    ];

    let spawnedCount = 0;
    for (let i = 0; i < newObjectVertexes.length; ++i) {
        const shape = newObjectVertexes[i];
        const textureAspectRatio = textureAspectRatios[i];
        if (!isShapeCollidesShape(shape, fakePlayerBox)) {
            spawnCorrespondingObject(shape, textureAspectRatio, currentImagesRef);
            ++spawnedCount;
        }
    }
    currentWorldRef.isStrictUpdateGrid = true;

    playEffect("hush");
};

const objectsToSpawn = [
    "saw",
    "blackHole",
    "wall",
    "catChaser",
    "pusher",
    "bomb",
    "lazer",
    "portal",
    "catShooter",
    "seed",
    "tornado",
    "bananaPeel",
    "binoculars",
    "catSeller",
    "coin",
    "catStealer",
    "potion",
    "noose",
    "hook"
];

const spawnHistory = {};
objectsToSpawn.forEach(name => spawnHistory[name] = 0);
let totalSpawns = 0;
const roundsBeforeResettingHistory = 13;

export function generateWorldTick(world, player, images) {
    if (isWorkerBusy) {
        return;
    }

    isWorkerBusy = true;
    currentWorldRef = world;
    currentPLayerRef = player;
    currentImagesRef = images;

    if (totalSpawns >= roundsBeforeResettingHistory) {
        objectsToSpawn.forEach(name => spawnHistory[name] = 0);
        totalSpawns = 0;
    }

    const weights = objectsToSpawn.map(name => ({
        name: name,
        weight: 1 / (spawnHistory[name] + 1)
    }));

    const totalWeight = weights.reduce((sum, item) => sum + item.weight, 0);

    let randomThreshold = getRandomFloat(0, totalWeight);
    let selectedName = objectsToSpawn[0];

    for (const item of weights) {
        if (randomThreshold < item.weight) {
            selectedName = item.name;
            break;
        }
        randomThreshold -= item.weight;
    }

    currentObjectName = selectedName;
    spawnHistory[currentObjectName]++;

    const objectActions = objectNameToActions[currentObjectName];
    const objectsThisObjectAvoids = objectActions.objectsItAvoids;
    const numToSpawn = objectActions.spawnAmount;

    let vertexesToAvoid = [];
    objectsThisObjectAvoids.forEach(category => {
        const list = world.objects[category];
        if (list) {
            list.forEach(obj => vertexesToAvoid.push(obj.vertexes));
        }
    });

    webWorker.postMessage({
        vertexesToAvoid,
        objectToSpawnName: currentObjectName,
        gridStartX: world.gridStartX,
        gridStartY: world.gridStartY,
        gridEndX: world.gridEndX,
        gridEndY: world.gridEndY,
        amountRequested: numToSpawn,
        playerX: player.x,
        playerY: player.y,
        playerRadius: player.radius
    });
}