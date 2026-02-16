import { getRandomInt, getRandomFloat } from "../Helpers/random.js";
import { isShapeCollidesCircle, isShapeCollidesShape } from "../math.js";

function generateFittingRectangleShape(sizeX, sizeY, vertexesToAvoid, gridStartX, gridStartY, gridEndX, gridEndY, playerX, playerY, playerRadius) {
    const maxAttempts = 50;

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

function getNewWallVertexes(vertexesToAvoid, gridStartX, gridStartY, gridEndX, gridEndY, playerX, playerY, playerRadius) {
    const sizeX = getRandomInt(185, 900);
    const sizeY = sizeX;

    const shapeThatDoesntInterfereWithOthers = generateFittingRectangleShape(sizeX, sizeY, vertexesToAvoid, gridStartX, gridStartY, gridEndX, gridEndY, playerX, playerY, playerRadius);
    if (shapeThatDoesntInterfereWithOthers === null) {
        return null;
    }

    return {
        shape: shapeThatDoesntInterfereWithOthers,
        recommendedTextureAspectRatio: 1,
    }
}

function getNewBlackHoleVertexes(vertexesToAvoid, gridStartX, gridStartY, gridEndX, gridEndY, playerX, playerY, playerRadius) {
    const sizeX = getRandomInt(250, 1200);
    const sizeY = sizeX;

    const shapeThatDoesntInterfereWithOthers = generateFittingRectangleShape(sizeX, sizeY, vertexesToAvoid, gridStartX, gridStartY, gridEndX, gridEndY, playerX, playerY, playerRadius);
    if (shapeThatDoesntInterfereWithOthers === null) {
        return null;
    }

    return {
        shape: shapeThatDoesntInterfereWithOthers,
        recommendedTextureAspectRatio: 1,
    }
}
function getNewCatChaserVertexes(vertexesToAvoid, gridStartX, gridStartY, gridEndX, gridEndY, playerX, playerY, playerRadius) {
    const sizeX = getRandomInt(50, 150);
    const sizeY = sizeX;

    const shapeThatDoesntInterfereWithOthers = generateFittingRectangleShape(sizeX, sizeY, vertexesToAvoid, gridStartX, gridStartY, gridEndX, gridEndY, playerX, playerY, playerRadius);
    if (shapeThatDoesntInterfereWithOthers === null) {
        return null;
    }

    return {
        shape: shapeThatDoesntInterfereWithOthers,
        recommendedTextureAspectRatio: 1,
    }
}
function getNewSawVertexes(vertexesToAvoid, gridStartX, gridStartY, gridEndX, gridEndY, playerX, playerY, playerRadius) {
    const sizeX = getRandomInt(200, 2000);
    const sizeY = sizeX;

    const shapeThatDoesntInterfereWithOthers = generateFittingRectangleShape(sizeX, sizeY, vertexesToAvoid, gridStartX, gridStartY, gridEndX, gridEndY, playerX, playerY, playerRadius);
    if (shapeThatDoesntInterfereWithOthers === null) {
        return null;
    }

    return {
        shape: shapeThatDoesntInterfereWithOthers,
        recommendedTextureAspectRatio: 1,
    }
}
function getNewPusherVertexes(vertexesToAvoid, gridStartX, gridStartY, gridEndX, gridEndY, playerX, playerY, playerRadius) {
    const sizeX = getRandomInt(200, 1200);
    const sizeY = sizeX;

    const shapeThatDoesntInterfereWithOthers = generateFittingRectangleShape(sizeX, sizeY, vertexesToAvoid, gridStartX, gridStartY, gridEndX, gridEndY, playerX, playerY, playerRadius);
    if (shapeThatDoesntInterfereWithOthers === null) {
        return null;
    }

    return {
        shape: shapeThatDoesntInterfereWithOthers,
        recommendedTextureAspectRatio: 1,
    }
}
function getNewBombVertexes(vertexesToAvoid, gridStartX, gridStartY, gridEndX, gridEndY, playerX, playerY, playerRadius) {
    const sizeX = 125;
    const sizeY = sizeX;

    const shapeThatDoesntInterfereWithOthers = generateFittingRectangleShape(sizeX, sizeY, vertexesToAvoid, gridStartX, gridStartY, gridEndX, gridEndY, playerX, playerY, playerRadius + 850);
    if (shapeThatDoesntInterfereWithOthers === null) {
        return null;
    }

    return {
        shape: shapeThatDoesntInterfereWithOthers,
        recommendedTextureAspectRatio: 1,
    }
}
function getNewLazerVertexes(vertexesToAvoid, gridStartX, gridStartY, gridEndX, gridEndY, playerX, playerY, playerRadius) {
    const sizeX = 1200;
    const sizeY = sizeX;

    const shapeThatDoesntInterfereWithOthers = generateFittingRectangleShape(sizeX, sizeY, vertexesToAvoid, gridStartX, gridStartY, gridEndX, gridEndY, playerX, playerY, playerRadius + 850);
    if (shapeThatDoesntInterfereWithOthers === null) {
        return null;
    }

    return {
        shape: shapeThatDoesntInterfereWithOthers,
        recommendedTextureAspectRatio: 1,
    }
}
function getNewPortalVertexes(vertexesToAvoid, gridStartX, gridStartY, gridEndX, gridEndY, playerX, playerY, playerRadius) {
    const sizeX = 4500;
    const sizeY = sizeX;

    const shapeThatDoesntInterfereWithOthers = generateFittingRectangleShape(sizeX, sizeY, vertexesToAvoid, gridStartX, gridStartY, gridEndX, gridEndY, playerX, playerY, playerRadius + 850);
    if (shapeThatDoesntInterfereWithOthers === null) {
        return null;
    }

    return {
        shape: shapeThatDoesntInterfereWithOthers,
        recommendedTextureAspectRatio: 1,
    }
}
function getNewCatShooterVertexes(vertexesToAvoid, gridStartX, gridStartY, gridEndX, gridEndY, playerX, playerY, playerRadius) {
    const sizeX = getRandomInt(85, 150);
    const sizeY = sizeX;

    const shapeThatDoesntInterfereWithOthers = generateFittingRectangleShape(sizeX, sizeY, vertexesToAvoid, gridStartX, gridStartY, gridEndX, gridEndY, playerX, playerY, playerRadius);
    if (shapeThatDoesntInterfereWithOthers === null) {
        return null;
    }

    return {
        shape: shapeThatDoesntInterfereWithOthers,
        recommendedTextureAspectRatio: 1,
    }
}
function getNewSeedVertexes(vertexesToAvoid, gridStartX, gridStartY, gridEndX, gridEndY, playerX, playerY, playerRadius) {
    const sizeX = 50;
    const sizeY = sizeX;

    const shapeThatDoesntInterfereWithOthers = generateFittingRectangleShape(sizeX, sizeY, vertexesToAvoid, gridStartX, gridStartY, gridEndX, gridEndY, playerX, playerY, playerRadius);
    if (shapeThatDoesntInterfereWithOthers === null) {
        return null;
    }

    return {
        shape: shapeThatDoesntInterfereWithOthers,
        recommendedTextureAspectRatio: 1,
    }
}
function getNewTornadoVertexes(vertexesToAvoid, gridStartX, gridStartY, gridEndX, gridEndY, playerX, playerY, playerRadius) {
    const sizeX = 650;
    const sizeY = sizeX;

    const shapeThatDoesntInterfereWithOthers = generateFittingRectangleShape(sizeX, sizeY, vertexesToAvoid, gridStartX, gridStartY, gridEndX, gridEndY, playerX, playerY, playerRadius);
    if (shapeThatDoesntInterfereWithOthers === null) {
        return null;
    }

    return {
        shape: shapeThatDoesntInterfereWithOthers,
        recommendedTextureAspectRatio: 1,
    }
}
function getNewBananaPeelVertexes(vertexesToAvoid, gridStartX, gridStartY, gridEndX, gridEndY, playerX, playerY, playerRadius) {
    const sizeX = 50;
    const sizeY = sizeX;

    const shapeThatDoesntInterfereWithOthers = generateFittingRectangleShape(sizeX, sizeY, vertexesToAvoid, gridStartX, gridStartY, gridEndX, gridEndY, playerX, playerY, playerRadius);
    if (shapeThatDoesntInterfereWithOthers === null) {
        return null;
    }

    return {
        shape: shapeThatDoesntInterfereWithOthers,
        recommendedTextureAspectRatio: 1,
    }
}
function getNewBinocularsVertexes(vertexesToAvoid, gridStartX, gridStartY, gridEndX, gridEndY, playerX, playerY, playerRadius) {
    const sizeX = 85;
    const sizeY = sizeX;

    const shapeThatDoesntInterfereWithOthers = generateFittingRectangleShape(sizeX, sizeY, vertexesToAvoid, gridStartX, gridStartY, gridEndX, gridEndY, playerX, playerY, playerRadius);
    if (shapeThatDoesntInterfereWithOthers === null) {
        return null;
    }

    return {
        shape: shapeThatDoesntInterfereWithOthers,
        recommendedTextureAspectRatio: 1,
    }
}
function getNewCatSellerVertexes(vertexesToAvoid, gridStartX, gridStartY, gridEndX, gridEndY, playerX, playerY, playerRadius) {
    const sizeX = 150;
    const sizeY = sizeX;

    const shapeThatDoesntInterfereWithOthers = generateFittingRectangleShape(sizeX, sizeY, vertexesToAvoid, gridStartX, gridStartY, gridEndX, gridEndY, playerX, playerY, playerRadius);
    if (shapeThatDoesntInterfereWithOthers === null) {
        return null;
    }

    return {
        shape: shapeThatDoesntInterfereWithOthers,
        recommendedTextureAspectRatio: 1,
    }
}
function getNewCoinVertexes(vertexesToAvoid, gridStartX, gridStartY, gridEndX, gridEndY, playerX, playerY, playerRadius) {
    const sizeX = 85;
    const sizeY = sizeX;

    const shapeThatDoesntInterfereWithOthers = generateFittingRectangleShape(sizeX, sizeY, vertexesToAvoid, gridStartX, gridStartY, gridEndX, gridEndY, playerX, playerY, playerRadius);
    if (shapeThatDoesntInterfereWithOthers === null) {
        return null;
    }

    return {
        shape: shapeThatDoesntInterfereWithOthers,
        recommendedTextureAspectRatio: 1,
    }
}
function getNewCatStealerVertexes(vertexesToAvoid, gridStartX, gridStartY, gridEndX, gridEndY, playerX, playerY, playerRadius) {
    const sizeX = 300;
    const sizeY = sizeX;

    const shapeThatDoesntInterfereWithOthers = generateFittingRectangleShape(sizeX, sizeY, vertexesToAvoid, gridStartX, gridStartY, gridEndX, gridEndY, playerX, playerY, playerRadius);
    if (shapeThatDoesntInterfereWithOthers === null) {
        return null;
    }

    return {
        shape: shapeThatDoesntInterfereWithOthers,
        recommendedTextureAspectRatio: 1,
    }
}
function getNewPotionVertexes(vertexesToAvoid, gridStartX, gridStartY, gridEndX, gridEndY, playerX, playerY, playerRadius) {
    const sizeX = 65;
    const sizeY = sizeX;

    const shapeThatDoesntInterfereWithOthers = generateFittingRectangleShape(sizeX, sizeY, vertexesToAvoid, gridStartX, gridStartY, gridEndX, gridEndY, playerX, playerY, playerRadius);
    if (shapeThatDoesntInterfereWithOthers === null) {
        return null;
    }

    return {
        shape: shapeThatDoesntInterfereWithOthers,
        recommendedTextureAspectRatio: 1,
    }
}
function getNewNooseVertexes(vertexesToAvoid, gridStartX, gridStartY, gridEndX, gridEndY, playerX, playerY, playerRadius) {
    const sizeX = 150;
    const sizeY = sizeX;

    const shapeThatDoesntInterfereWithOthers = generateFittingRectangleShape(sizeX, sizeY, vertexesToAvoid, gridStartX, gridStartY, gridEndX, gridEndY, playerX, playerY, playerRadius);
    if (shapeThatDoesntInterfereWithOthers === null) {
        return null;
    }

    return {
        shape: shapeThatDoesntInterfereWithOthers,
        recommendedTextureAspectRatio: 1,
    }
}
function getNewHookVertexes(vertexesToAvoid, gridStartX, gridStartY, gridEndX, gridEndY, playerX, playerY, playerRadius) {
    const sizeX = 85;
    const sizeY = sizeX;

    const shapeThatDoesntInterfereWithOthers = generateFittingRectangleShape(sizeX, sizeY, vertexesToAvoid, gridStartX, gridStartY, gridEndX, gridEndY, playerX, playerY, playerRadius);
    if (shapeThatDoesntInterfereWithOthers === null) {
        return null;
    }

    return {
        shape: shapeThatDoesntInterfereWithOthers,
        recommendedTextureAspectRatio: 1,
    }
}

const spawnFunctions = {
    wall: getNewWallVertexes,
    blackHole: getNewBlackHoleVertexes,
    catChaser: getNewCatChaserVertexes,
    saw: getNewSawVertexes,
    pusher: getNewPusherVertexes,
    bomb: getNewBombVertexes,
    lazer: getNewLazerVertexes,
    portal: getNewPortalVertexes,
    catShooter: getNewCatShooterVertexes,
    seed: getNewSeedVertexes,
    tornado: getNewTornadoVertexes,
    bananaPeel: getNewBananaPeelVertexes,
    binoculars: getNewBinocularsVertexes,
    catSeller: getNewCatSellerVertexes,
    coin: getNewCoinVertexes,
    catStealer: getNewCatStealerVertexes,
    potion: getNewPotionVertexes,
    noose: getNewNooseVertexes,
    hook: getNewHookVertexes
};

self.onmessage = function (inputData) {
    let vertexesToAvoid = [...inputData.data.vertexesToAvoid];

    const objectToSpawnName = inputData.data.objectToSpawnName;
    const gridStartX = inputData.data.gridStartX;
    const gridStartY = inputData.data.gridStartY;
    const gridEndX = inputData.data.gridEndX;
    const gridEndY = inputData.data.gridEndY;
    const amountRequested = inputData.data.amountRequested;
    const playerX = inputData.data.playerX;
    const playerY = inputData.data.playerY;
    const playerRadius = inputData.data.playerRadius;

    const spawningFunction = spawnFunctions[objectToSpawnName];

    let allNewShapes = [];
    let allNewRecommendedTextureAspectRatios = [];

    for (let i = 0; i < amountRequested; ++i) {
        const spawningResult = spawningFunction(vertexesToAvoid, gridStartX, gridStartY, gridEndX, gridEndY, playerX, playerY, playerRadius);

        if (spawningResult === null) {
            continue;
        }

        const newWallVertexes = spawningResult.shape;
        const recommendedTextureAspectRatio = spawningResult.recommendedTextureAspectRatio;
        allNewShapes.push(newWallVertexes);
        allNewRecommendedTextureAspectRatios.push(recommendedTextureAspectRatio);
        vertexesToAvoid.push(newWallVertexes);
    }

    if (allNewShapes.length == 0) {
        self.postMessage({ isSuccessful: false });
    } else {
        self.postMessage({
            isSuccessful: true,
            newObjectVertexes: allNewShapes,
            textureAspectRatios: allNewRecommendedTextureAspectRatios,
        });
    }
};
