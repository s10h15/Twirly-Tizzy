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
    ...
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