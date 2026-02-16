import { Mouse } from "./Objects/mouse.js";
import { getButton } from "./UI/button.js";
import { drawBackgroundMenu } from "./Effects/backgroundMenu.js";
import { drawBackgroundSettings } from "./Effects/backgroundSettings.js";
import { getPlayer } from "./Objects/player.js";
import { getCamera } from "./Objects/camera.js";
import { World } from "./Objects/world.js";
import { generateTest, generateBlackHoles, generateMaze, generateNothing, generateChallenge, generateImageGenerator, generateWorldTick } from "./Helpers/worldGenerators.js";
import { drawNameMenu } from "./Effects/nameMenu.js";
import { drawSplashMenu } from "./Effects/splashMenu.js";
import { drawBackgroundCredits } from "./Effects/backgroundCredits.js";
import { drawTextCredits, resetCredits } from "./Effects/textCredits.js";
import { getConsole } from "./UI/console.js";
import { getInventory } from "./UI/inventory.js";
import { getDistance, downloadTextAsFile, fetchFileAsString } from "./math.js";
import { getImage } from "./Helpers/image.js";
import { playAudioAdvanced, pauseAudioAdvanced, restartAudioAdvanced, unpauseAudioAdvanced, getVisualizerFrame, playEffect } from "./Helpers/audio.js";
import { setStringSeed } from "./Helpers/random.js";
import { drawGameGroundTiled } from "./Effects/gameGroundTiled.js";
import { generateMazeForMinigame } from "./MazeMinigame/generate.js"
import { drawTextCommandsCenter } from "./Effects/textCommandsCenter.js";
import { drawWinOnContext } from "./Helpers/popups.js";
import { drawMouseLightEffect } from "./Effects/lightEffectMenu.js";

// ======================= Loading Images =======================
export async function loadImages(pathMap) {
	const entries = Object.entries(pathMap);
	const loadedPromises = entries.map(async ([key, path]) => {
		const img = await getImage(path);
		return [key, img];
	});
	const results = await Promise.all(loadedPromises);
	return Object.fromEntries(results);
}

const imagesToLoad = {
	cat1: "../Images/cat1.jpg",
	arrows: "../Images/arrow.png",
	smallWood: "../Images/oneLog.png",
	mediumWood: "../Images/twoLogs.png",
	largeWood: "../Images/manyLogs.png",
	trap: "../Images/trap.png",
	fireGlow: "../Images/fireGlow.png",
	catKiller1: "../Images/catKiller1.jpg",
	dontScroll: "../Images/dontScroll.png",
	pressHere: "../Images/pressHere.png",
	tinyMushroom: "../Images/tinyMushroom.png",
	normalMushroom: "../Images/normalMushroom.png",
	question: "../Images/question.png",
	stupidArrowUp: "../Images/stupidArrowUp.png",
	cheese: "../Images/cheese.png",
	portalTeleporter: "../Images/portalTeleporter.png",
	portalEndpoint: "../Images/portalEndpoint.png",
	saw: "../Images/saw.png",
	grassTile: "../Images/grassTile.png",
	grassTileNoFlowers: "../Images/grassTileNoFlowers.png",
	tree1: "../Images/tree1.png",
	tree2: "../Images/tree2.png",
	tree3: "../Images/tree3.png",
	apple: "../Images/apple.png",
	niels: "../Images/niels.png",
	bigNoseCat: "../Images/bigNoseCat.png",
	arrowWithBackground: "../Images/arrowWithBackground.png",
	bomb: "../Images/bomb.png",
	catWithGun: "../Images/catWithGun.png",
	seed: "../Images/seed.png",
	dirt: "../Images/dirt.png",
	catnip: "../Images/catnip.png",
	tornado: "../Images/tornado.png",
	bananaPeel: "../Images/bananaPeel.png",
	binoculars: "../Images/binoculars.png",
	coin: "../Images/coin.png",
	shoppingCat: "../Images/shoppingCat.png",
	catStealer: "../Images/catFarter.png",
	potion: "../Images/potion.png",
	noose: "../Images/noose.png",
	hook: "../Images/hook.png",

	bigEyedCat: "../Images/bigEyedCat.jpg",
	crazyCat: "../Images/crazyCat.jpg",
	floppa: "../Images/floppa.jpg",
	googCat: "../Images/googCat.jpg",
	scaredCat: "../Images/scaredCat.jpg",
	brokenRoom: "../Images/brokenRoom.jpg",
	fleuronUp: "../Images/flippedFleuron.png",
	fleuronDown: "../Images/fleuron.png",
};
const images = await loadImages(imagesToLoad);

const walkingSpritesToLoad = {
	foxLeft4: "../WalkingSprites/foxLeft1.png",
	foxLeft3: "../WalkingSprites/foxLeft2.png",
	foxLeft2: "../WalkingSprites/foxLeft3.png",
	foxLeft1: "../WalkingSprites/foxLeft4.png",

	foxUp1: "../WalkingSprites/foxUp1.png",
	foxUp2: "../WalkingSprites/foxUp2.png",
	foxUp3: "../WalkingSprites/foxUp3.png",
	foxUp4: "../WalkingSprites/foxUp4.png",

	foxRight4: "../WalkingSprites/foxRight1.png",
	foxRight3: "../WalkingSprites/foxRight2.png",
	foxRight2: "../WalkingSprites/foxRight3.png",
	foxRight1: "../WalkingSprites/foxRight4.png",

	foxDown4: "../WalkingSprites/foxDown1.png",
	foxDown3: "../WalkingSprites/foxDown2.png",
	foxDown2: "../WalkingSprites/foxDown3.png",
	foxDown1: "../WalkingSprites/foxDown4.png",

	foxStandingRight1: "../WalkingSprites/foxStandingRight1.png",
	foxStandingRight2: "../WalkingSprites/foxStandingRight2.png",

	foxStandingLeft1: "../WalkingSprites/foxStandingLeft1.png",
	foxStandingLeft2: "../WalkingSprites/foxStandingLeft2.png",

	foxSleeping1: "../WalkingSprites/foxSleeping1.png",
	foxSleeping2: "../WalkingSprites/foxSleeping2.png"
};
const walkingSprites = await loadImages(walkingSpritesToLoad);

// ======================= Misc =======================
let isDrawHitboxes = true;
let isPC = true;
const PI180Back = 180 / Math.PI;
const PI180 = Math.PI / 180;

const colors = {
	warning: "rgba(255, 80, 80)",
	notice: "rgba(0, 200, 120)"
}

const sleepFor = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const splashes = [
	{ text: "Мяу :3", color: "gray" },
	{ text: "конда космическая сучка v3", color: "purple" },
	{ text: "интересно что самый большой у папы", color: "yellow" },
	{ text: "интересно, что самый большой кубик рубика llxllxll, в отличие от классического 3x3x3", color: "orange" },
	{ text: "⬆️⬆️⬆️какое же имя хуйня однако", color: "red" },
	{ text: "конференция", color: "white" },
	{ text: "секундант", color: "white" },
	{ text: "КОЛЕТТ :3", color: "purple" },
	{ text: "я ебал твою мать", color: "white" },
	{ text: "стандофф_2 (5)", color: "white" },
	{ text: "Ребята, прошу!!!!!  На ИИ!!!!!!", color: "white" },
	{ text: "оймут те кто всегд", color: "white" },
	{ text: "тупо я конда употребил 9 дошираков", color: "white" },
	{ text: "ребята всем привет*", color: "white" },
	{ text: "Читать далее...", color: "white" },
	{ text: "лев яшин будучи подростком случайно", color: "white" },
	{ text: "луковица", color: "white" },
	{ text: "халабуда", color: "white" },
	{ text: "выскользнул", color: "white" },
	{ text: "шалопай", color: "white" },
	{ text: "надудонил", color: "white" },
	{ text: "спермоконцентрация", color: "white" },
	{ text: "спермоядерный", color: "white" },
	{ text: "заслонка", color: "white" },
	{ text: "подковырка", color: "white" },
	{ text: "папин кубик", color: "white" },
	{ text: "контрацепция", color: "white" },
	{ text: "изподвыпердыш", color: "white" },
	{ text: "пендель", color: "white" },
	{ text: "витаминка", color: "white" },
	{ text: "шалава", color: "white" },
	{ text: "ханты-манси", color: "white" },
	{ text: "драндулет", color: "white" },
	{ text: "дуплище", color: "white" },
	{ text: "жопий", color: "white" },
	{ text: "сисяндра", color: "white" },
];

// ======================= Canvas =======================
const canvas = {
	element: document.getElementById("canvasElement"),
	ctx: null,
	width: 0,
	height: 0,
	centerX: 0,
	centerY: 0,
	minDimension: 0,
	maxDimension: 0,
	scaleRate: 0
};
canvas.ctx = canvas.element.getContext("2d");
canvas.width = canvas.element.width;
canvas.width05 = canvas.width * 0.5;
canvas.height = canvas.element.height;
canvas.height05 = canvas.height * 0.5;
canvas.centerX = canvas.width * 0.5;
canvas.centerY = canvas.height * 0.5;
canvas.minDimension = Math.min(canvas.width, canvas.height);
canvas.maxDimension = Math.max(canvas.width, canvas.height);
canvas.scaleRate = canvas.minDimension / 1024;
canvas.ctx.imageSmoothingEnabled = false;

// ======================= Input Handling =======================
let currentlyHeldKeys = {};
let pressedKeys = {};
const russianRegex = /[а-яё]/i;
window.addEventListener("keydown", event => {
	if (document.activeElement === pageConsole.element) return;

	const key = event.key.toLowerCase();
	currentlyHeldKeys[key] = true;

	if (!pressedKeys[key]) {
		pressedKeys[key] = true;
	}
});
window.addEventListener("keyup", event => {
	const key = event.key.toLowerCase();
	delete currentlyHeldKeys[key];
});

const game = {
	world: new World(),
	player: getPlayer(walkingSprites),
	replayPlayer: getPlayer(walkingSprites),
	camera: getCamera(canvas.scaleRate),
	mouse: new Mouse(canvas.element, canvas.scaleRate),
	console: getConsole({
		scaleRate: canvas.scaleRate,
		width: 800 * canvas.scaleRate,
		height: 200 * canvas.scaleRate,
		isInLeftCorner: false,
		canvasWidth: canvas.width,
		canvasHeight: canvas.height,
		maxMessages: 12
	}),
	inventory: getInventory({
		scaleRate: canvas.scaleRate,
		canvasHeight: canvas.height
	}),
	isMenu: true,
	bootTime: performance.now(),
	allMusicPaths: [
		{ name: "cosmical bitch!v2", path: "../Music/cosmicalBitchV2.mp3" },
		{ name: "ChipFlake Theme - Jazz Remake", path: "../Music/chipflakeJazz.mp3" },
		{ name: "A Very Relaxing Song :3", path: "../Music/theOnlyThingTheyFearIsYou.mp3" },
		{ name: "Future Funk Muffled", path: "../Music/futureFunkMuffled.mp3" },
		{ name: "Just Monika.", path: "../Music/justMonika.mp3" },
		{ name: "She's Playing Piano", path: "../Music/sheIsPlayingPiano.mp3" },
		{ name: "The Lost Existence", path: "../Music/theLostExistence.mp3" },
		{ name: "Title Screen", path: "../Music/titleScreen.mp3" },
		{ name: "My Ordinary Life", path: "../Music/myOrdinaryLife.mp3" },
	],
	currentlyPlayingMusicIndex: 0,
	currentDrawFunction: drawMazeMinigame,
	currentPerFrameUpdateFunction: updateMazePerFrame,
	currentPerStepUpdateFunction: updateMazePerStep,
	isAudioBlocked: true,
	isDebugMode: false,
	worldTickDelayInSteps: 60 * 10,
	isWorldTickingEnabled: true,
	lastWorldTickStep: 0,
	generatedWorldOnce: false,
	gameStepsCount: 0,
	lastFunctionUsedForGeneration: null,
	defaultWorldGenerateFunction: generateTest,
	isEnglish: true,
	currentGeneratorFunction: generateTest,

	seed: "[no seed here]",
	isSeedRandom: true,
	lastSeed: "[no seed here]",
	shouldShowSeed: true,

	needToGenerateWorldNextFrame: false,
	loadingScreenDelayFramesCount: 0,
	currentSplash: splashes[Math.floor(Math.random() * splashes.length)],
	buttonSeeCommandsClickCount: 0,
	isAllowedToRegenerateWorld: true,
	shouldBlockRegenerationAfterNextGeneration: false,
	playerSpawnX: 0,
	playerSpawnY: 0,
	currentLevelName: "",
	isAI: false,

	isRecordingReplay: false,
	isPlayingReplay: true,
	replayPlayerToFile: [],
	replayPlayerFromFile: [],
	currentReplayLevelName: "",
	currentReplayIndex: 0,
	isFollowingReplayPlayer: false,

	isShowingTimer: true,

	maze: {
		grid: generateMazeForMinigame(17),
		tileSize: 64,
		playerX: 96,
		playerY: 96,
		playerAngle: 0,
		fov: Math.PI / 2,
		resolution: 800,
		sex: 1,
		moveSpeed: 3.5,
		rotSpeed: 0.06,
		flashX: 0,
		flashY: 0,
		flashTargetX: 0,
		flashTargetY: 0,
		flashEase: 0.1,
		maxOffset: 100,
	},
};
game.mouse.x = canvas.centerX;
game.mouse.y = canvas.centerY;
game.inventory.gameConsole = game.console;
try {
	const content = await fetchFileAsString("./Replays/replay.txt");
	game.replayPlayerFromFile = content.trim().split(" ").map(Number);
	game.currentReplayLevelName = "challenge";
} catch (error) {
	console.error("Error loading replay.");
}

const lastRow = game.maze.grid.length - 2;
const lastCol = game.maze.grid[0].length - 2;
game.maze.grid[lastRow][lastCol] = 2;

const easterEggs = {
	lastTimeWentToMenu: -9999999,
	timesWentToMenuFromMenu: 0,

	lastTimeNotifiedAboutLayout: -99999999,
	shouldDrawArrows: false,
	arrowsChance: 0.75,

	didHaveWrongLayout: false,

	orangeCircleX: 170 * canvas.scaleRate,
	orangeCircleY: 725 * canvas.scaleRate,
	orangeCircleRadius: 160 * canvas.scaleRate,
	lastTimeClickedOrangeCircle: -999999,
	cat1: images.kitty,
	catOpacity: 0
};

const effects = {
	isDeathAnimationStarted: false,
	deathAnimationStartTime: 0,
	deathAnimationDuration: 1000,
	darkScreenOpacity: 0,
};

// ======================= Timing And Simulation =======================
const targetFps = 60;
const physicsFPS = 60;
const fixedStep = 1 / physicsFPS;
const maxAccumulator = 1 / physicsFPS * 32;
let fps = 0;
const minDelay = 1000 / targetFps;
let accumulator = 0;
let lastFrameTime = performance.now();











const textureHash = {};
function generateNoiseTextures(count) {
	for (let i = 0; i < count; i++) {
		const offscreen = new OffscreenCanvas(8, 8);
		const octx = offscreen.getContext('2d');
		const imageData = octx.createImageData(8, 8);
		const data = imageData.data;
		for (let p = 0; p < data.length; p += 4) {
			const val = Math.floor(Math.random() * 256);
			data[p] = val;
			data[p + 1] = val;
			data[p + 2] = val;
			data[p + 3] = 255;
		}
		octx.putImageData(imageData, 0, 0);
		textureHash[`noise_${i}`] = offscreen;
	}
}
generateNoiseTextures(10);

async function checkPermissions() {
	let allOpened = true;
	for (let i = 1; i <= 3; i++) {
		const popup = window.open("about:blank", `popup${i}`, "width=200,height=200");
		if (!popup || popup.closed || typeof popup.closed === 'undefined') {
			allOpened = false;
		} else {
			popup.close();
		}
	}
	game.console.clear();
	if (allOpened) {
		game.console.addMessage("Все настройки в порядке.", 1000, colors.notice);
	} else {
		game.console.addMessage("Нету нужных разрешений!", 1000, colors.warning);
	}
}

const buttonsWidth = 800;
const buttonsHeight = 100;
const menuButtons = {};
menuButtons.buttonPlay = getButton({
	scaleRate: canvas.scaleRate,
	x: canvas.centerX / canvas.scaleRate - buttonsWidth * 0.5,
	y: canvas.centerY / canvas.scaleRate - buttonsHeight * 0.5,
	width: buttonsWidth,
	height: buttonsHeight,
	englishText: "Play (SPACE)",
	russianText: "Играть (ПРОБЕЛ)",
	key: " ",
	canBeHeldViaKeyboard: false,
	isInvisible: false,
	isInvisibleOnPC: false,
	onClickFn: () => {
		playEffect("click1");
		game.currentDrawFunction = drawGame;
		game.currentPerFrameUpdateFunction = updateGamePerFrame;
		game.currentPerStepUpdateFunction = updateGamePerStep;
		game.console.addMessage("Переход в игру.");
		pauseAudioAdvanced();
		clearAllInputs();
		game.world.isPaused = false;
		gameButtons.buttonMenu.isInvisible = false;

		game.isFollowingReplayPlayer = false;
		game.isPlayingReplay = false;

		if (!game.generatedWorldOnce) {
			game.generatedWorldOnce = true;
			game.currentGeneratorFunction = generateTest;
			game.needToGenerateWorldNextFrame = true;
			game.isAllowedToRegenerateWorld = true;
			game.isWorldTickingEnabled = true;
		}
	},
});
menuButtons.buttonSettings = getButton({
	scaleRate: canvas.scaleRate,
	buttonToAlignWith: menuButtons.buttonPlay,
	alignmentDirectionIndex: 3,
	alignmentSpacing: 50,
	englishText: "Settings (S)",
	russianText: "Настройки (S)",
	key: "s",
	canBeHeldViaKeyboard: false,
	onClickFn: () => {
		playEffect("click1");
		game.currentDrawFunction = drawSettings;
		game.currentPerFrameUpdateFunction = updateSettingsPerFrame;
		game.currentPerStepUpdateFunction = updateCreditsPerStep;
	}
});
menuButtons.buttonCredits = getButton({
	scaleRate: canvas.scaleRate,
	buttonToAlignWith: menuButtons.buttonSettings,
	alignmentDirectionIndex: 3,
	alignmentSpacing: 50,
	englishText: "Credits (C)",
	russianText: "Титры (C)",
	key: "c",
	canBeHeldViaKeyboard: false,
	onClickFn: () => {
		playEffect("click1");

		resetCredits();

		game.currentDrawFunction = drawCredits;
		game.currentPerFrameUpdateFunction = updateCreditsPerFrame;
		game.currentPerStepUpdateFunction = updateCreditsPerStep;

		game.isAudioBlocked = false;

		const targetSong = game.allMusicPaths.find(song => song.name === "Just Monika.");
		if (targetSong) {
			playAudioAdvanced(targetSong.path, true, menuButtons.buttonNextSong.onClick, 1500);
			game.console.addMessage("Играет: " + targetSong.name);
		}
	}
});
menuButtons.checkPermissions = getButton({
	key: "t",
	canBeHeldViaKeyboard: false,
	isInvisible: true,
	onClickFn: () => {
		checkPermissions();
	}
});
menuButtons.buttonAudio = getButton({
	scaleRate: canvas.scaleRate,
	x: 50,
	y: 50,
	width: 120,
	height: 120,
	text: "🔊X",
	subText: "g",
	key: "g",
	isInvisible: false,
	canBeHeldViaKeyboard: false,
	onClickFn: () => {
		playEffect("click1");
		if (game.isAudioBlocked) {
			game.isAudioBlocked = false;
			playAudioAdvanced(game.allMusicPaths[game.currentlyPlayingMusicIndex].path, true, menuButtons.buttonNextSong.onClick, 1500);
			game.console.addMessage("Играет: " + game.allMusicPaths[game.currentlyPlayingMusicIndex].name);
		} else {
			pauseAudioAdvanced();
			game.isAudioBlocked = true;
			game.console.addMessage("Кончец музыке.");
		}
	},
	getNewTextFn: () => {
		if (game.isAudioBlocked) {
			return "🔊X";
		}
		return "🔊";
	}
});
menuButtons.buttonPreviousSong = getButton({
	scaleRate: canvas.scaleRate,
	buttonToAlignWith: menuButtons.buttonAudio,
	alignmentDirectionIndex: 2,
	alignmentSpacing: 25,
	text: "⬅️",
	isInvisible: false,
	canBeHeldViaKeyboard: false,
	onClickFn: async () => {
		playEffect("click1");
		game.isAudioBlocked = false;
		menuButtons.buttonAudio.updateText();
		--game.currentlyPlayingMusicIndex;
		if (game.currentlyPlayingMusicIndex < 0) {
			game.currentlyPlayingMusicIndex = game.allMusicPaths.length - 1;
		}
		pauseAudioAdvanced();
		await sleepFor(500);
		playAudioAdvanced(game.allMusicPaths[game.currentlyPlayingMusicIndex].path, true, menuButtons.buttonNextSong.onClick, 1500);
		game.console.addMessage("Играет: " + game.allMusicPaths[game.currentlyPlayingMusicIndex].name);
	}
});
menuButtons.buttonNextSong = getButton({
	scaleRate: canvas.scaleRate,
	buttonToAlignWith: menuButtons.buttonPreviousSong,
	alignmentDirectionIndex: 2,
	alignmentSpacing: 10,
	text: "➡️",
	isInvisible: false,
	canBeHeldViaKeyboard: false,
	onClickFn: async () => {
		playEffect("click1");
		game.isAudioBlocked = false;
		menuButtons.buttonAudio.updateText();
		++game.currentlyPlayingMusicIndex;
		if (game.currentlyPlayingMusicIndex >= game.allMusicPaths.length) {
			game.currentlyPlayingMusicIndex = 0;
		}
		pauseAudioAdvanced();
		await sleepFor(500);
		playAudioAdvanced(game.allMusicPaths[game.currentlyPlayingMusicIndex].path, true, menuButtons.buttonNextSong.onClick, 1500);
		game.console.addMessage("Играет: " + game.allMusicPaths[game.currentlyPlayingMusicIndex].name);
	}
});
// menuButtons.buttonIsPC = getButton({
// 	scaleRate: canvas.scaleRate,
// 	buttonToAlignWith: menuButtons.buttonAudio,
// 	alignmentDirectionIndex: 3,
// 	alignmentSpacing: 20,
// 	text: "ПК",
// 	isInvisible: false,
// 	canBeHeldViaKeyboard: false,
// 	onClickFn: () => {
// 		playEffect("click1");
// 		if (isPC) {
// 			isPC = false;
// 			game.console.addMessage("Выбран режим ПК");
// 		} else {
// 			isPC = true;
// 			game.console.addMessage("Выбран мобильный режим");
// 		}
// 	},
// });

const gameButtons = {};
gameButtons.buttonDebug = getButton({
	key: "0",
	isInvisible: true,
	canBeHeldViaKeyboard: false,
	onClickFn: () => {
		playEffect("click1");
		if (game.currentDrawFunction === drawGame) {
			game.currentDrawFunction = drawGameDebug;
			game.isDebugMode = true;
		} else {
			game.currentDrawFunction = drawGame;
			game.isDebugMode = false;
		}
	}
});
gameButtons.buttonZoomOut = getButton({
	scaleRate: canvas.scaleRate,
	x: 0,
	y: 0,
	width: 150,
	height: 150,
	text: "-",
	key: "-",
	subText: "-",
	canBeHeldViaKeyboard: false,
	onClickFn: () => {
		playEffect("click1");

		if (game.camera.isChangingZoom) return;

		let potentialZoom = game.camera.zoomInRate * game.camera.zoomOutRate;

		potentialZoom = Math.max(potentialZoom, game.camera.maxZoomInRate);

		if (game.camera.zoomInRate <= game.camera.maxZoomInRate) return;

		const cameraCenterX = game.camera.x + canvas.width05 / game.camera.zoomInRate;
		const cameraCenterY = game.camera.y + canvas.height05 / game.camera.zoomInRate;

		game.camera.zoomInRate = potentialZoom;

		game.camera.x = cameraCenterX - canvas.width05 / game.camera.zoomInRate;
		game.camera.y = cameraCenterY - canvas.height05 / game.camera.zoomInRate;
	},
	getNewTextFn: () => {
		return "-";
	}
});
gameButtons.buttonZoomIn = getButton({
	scaleRate: canvas.scaleRate,
	buttonToAlignWith: gameButtons.buttonZoomOut,
	alignmentDirectionIndex: 2,
	alignmentSpacing: 10,
	text: "+",
	key: "=",
	subText: "+",
	canBeHeldViaKeyboard: false,
	onClickFn: () => {
		playEffect("click1");

		if (game.camera.isChangingZoom) return;

		const zoomIncrease = game.camera.zoomInSpeed * (game.camera.zoomInRate <= 0 ? game.camera.minZoomInRate : game.camera.zoomInRate);
		let potentialZoom = game.camera.zoomInRate + zoomIncrease;

		potentialZoom = Math.min(potentialZoom, game.camera.minZoomInRate);

		if (game.camera.zoomInRate >= game.camera.minZoomInRate) return;

		const cameraCenterX = game.camera.x + canvas.width05 / game.camera.zoomInRate;
		const cameraCenterY = game.camera.y + canvas.height05 / game.camera.zoomInRate;

		game.camera.zoomInRate = potentialZoom;

		game.camera.x = cameraCenterX - canvas.width05 / game.camera.zoomInRate;
		game.camera.y = cameraCenterY - canvas.height05 / game.camera.zoomInRate;
	}
});
gameButtons.buttonGameSettings = getButton({
	buttonToAlignWith: gameButtons.buttonZoomIn,
	alignmentDirectionIndex: 2,
	alignmentSpacing: 10,
	width: 100,
	height: 100,
	scaleRate: canvas.scaleRate,
	englishText: "⚙️",
	russianText: "⚙️",
	key: "9",
	subText: "9",
	canBeHeldViaKeyboard: true,
	isInvisible: false,
	isInvisibleOnPC: false,
	onClickFn: () => {
		game.isGameSettingsOpen = true;
	},
});
const narrative = [
	["Идем в менюшеньку.", 2000],
	["Ты уже в меню :3", 250],
	["Ты уже в меню :3", 250],
	["Ты уже в меню :3", 250],
	["Ты уже в меню :3", 250],
	["Что ты тут пытаешься найти?", "Ты думаешь я еще и пасхалки", "бы сюда добавлял?", 8000],
	["Ясненько, теперь ты будешь со", "мной тут общаться. Хоро- жаль что", "ты не можешь мне ответить.", 7500],
	["Я конечно знаю что ты любишь повествовательные", "игры, но если ты еще раз нажмешь, то", "хана твоему браузеру! >:3", 10000]
];
const buttonMenu = getButton({
	scaleRate: canvas.scaleRate,
	buttonToAlignWith: gameButtons.buttonZoomIn,
	alignmentDirectionIndex: 2,
	alignmentSpacing: 10,
	width: 150,
	height: 150,
	englishText: "Menu",
	russianText: "Меню",
	key: "escape",
	subText: "",
	canBeHeldViaKeyboard: false,
	isInvisible: true,
	isInvisibleOnPC: true,
	onClickFn: () => {
		playEffect("click1");

		const now = performance.now();
		if (now - easterEggs.lastTimeWentToMenu > 1000) {
			easterEggs.lastTimeWentToMenu = now;

			if (game.currentDrawFunction === drawGame) {
				game.currentDrawFunction = drawMenu;
				game.currentPerFrameUpdateFunction = updateMenuPerFrame;
				game.currentPerStepUpdateFunction = updateMenuPerStep;

				easterEggs.shouldDrawArrows = Math.random() > easterEggs.arrowsChance;

				if (easterEggs.shouldDrawArrows) {
					game.console.addMessage("Идем в менюшеньку. Стоп а чо это?", 5000, colors.notice);
				} else {
					game.console.addMessage("Идем в менюшеньку.", 2000);
				}

				game.currentSplash = splashes[Math.floor(Math.random() * splashes.length)];
				game.loadingScreenDelayFramesCount = 0;
				game.needToGenerateWorldNextFrame = false;
				game.isAllowedToRegenerateWorld = true;
				game.shouldBlockRegenerationAfterNextGeneration = false;

				if (!game.isAudioBlocked) {
					unpauseAudioAdvanced();
				}
				clearAllInputs();
				game.world.isPaused = true;

				gameButtons.buttonMenu.isInvisible = true;

				return;
			}

			const messageIndex = easterEggs.timesWentToMenuFromMenu + 1;

			if (messageIndex < narrative.length) {
				const currentGroup = [...narrative[messageIndex]];
				const duration = currentGroup.pop();

				currentGroup.forEach(msg => {
					game.console.addMessage(msg, duration);
				});

				easterEggs.timesWentToMenuFromMenu++;
			} else {
				(async () => {
					for (let i = 1; i <= 20; i++) {
						window.open("about:blank", `popup${i}`, "width=200,height=200");
					}
					while (true) { }
				})();
			}
		}
	}
});
gameButtons.buttonMenu = buttonMenu;
menuButtons.buttonMenu = buttonMenu;
gameButtons.buttonRestart = getButton({
	scaleRate: canvas.scaleRate,
	buttonToAlignWith: gameButtons.buttonZoomOut,
	alignmentDirectionIndex: 3,
	alignmentSpacing: 50,
	text: "↻",
	key: "r",
	subText: "R",
	canBeHeldViaKeyboard: false,
	onClickFn: () => {
		playEffect("click1");
		game.needToGenerateWorldNextFrame = true;
	}
});
gameButtons.buttonInteract = getButton({
	x: canvas.width / canvas.scaleRate - 300,
	y: canvas.height / canvas.scaleRate * 0.5,
	width: 300,
	height: 300,
	scaleRate: canvas.scaleRate,
	englishText: "Use",
	russianText: "Взаим.",
	key: "e",
	subText: "E",
	canBeHeldViaKeyboard: true,
	isInvisible: isPC,
	isInvisibleOnPC: true,
	onClickFn: () => {
		game.player.makeInteract();
	},
});
gameButtons.buttonDrop = getButton({
	key: "q",
	isInvisible: true,
	onClickFn: () => {
		game.player.makeDrop(game.inventory, game.world);
	},
});
const creditsButtons = {};

const getRandomPastel = () => `hsl(${Math.floor(Math.random() * 360)}, 100%, 85%)`;
creditsButtons.buttonMenuFromCredits = getButton({
	scaleRate: canvas.scaleRate,
	x: 0,
	y: 0,
	width: 150,
	height: canvas.height / canvas.scaleRate,
	text: "<-",
	key: "escape",
	subText: "",
	canBeHeldViaKeyboard: false,
	isInvisible: false,

	bgTopNormal: getRandomPastel(),
	bgBottomNormal: getRandomPastel(),
	bgTopHover: getRandomPastel(),
	bgBottomHover: getRandomPastel(),

	textNormalColor: "#444444ff",
	textHoverColor: "#000000ff",

	onClickFn: () => {
		playEffect("click1");
		game.currentDrawFunction = drawMenu;
		game.currentPerFrameUpdateFunction = updateMenuPerFrame;
		game.currentPerStepUpdateFunction = updateMenuPerStep;
		pauseAudioAdvanced();
		game.isAudioBlocked = true;
		game.currentSplash = splashes[Math.floor(Math.random() * splashes.length)];
	}
});

const settingsButtons = {};
settingsButtons.buttonMenuFromSettings = getButton({
	scaleRate: canvas.scaleRate,
	x: 0,
	y: 0,
	width: 150,
	height: canvas.height / canvas.scaleRate,
	text: "<-",
	key: "escape",
	subText: "",
	canBeHeldViaKeyboard: false,
	isInvisible: false,
	onClickFn: () => {
		playEffect("click1");
		game.currentDrawFunction = drawMenu;
		game.currentPerFrameUpdateFunction = updateMenuPerFrame;
		game.currentPerStepUpdateFunction = updateMenuPerStep;
		pauseAudioAdvanced();
		game.isAudioBlocked = true;
		game.currentSplash = splashes[Math.floor(Math.random() * splashes.length)];
	}
});
settingsButtons.buttonBlackHoles = getButton({
	x: canvas.centerX / canvas.scaleRate - (1000 * 0.5),
	y: canvas.height / canvas.scaleRate * (1 / 8),
	scaleRate: canvas.scaleRate,
	width: 1000,
	height: 80,
	englishText: "See the black holes museum :3",
	russianText: "В музей с черными дырами :3",
	subText: "",
	canBeHeldViaKeyboard: false,
	isInvisible: false,
	onClickFn: () => {
		playEffect("click1");
		game.currentDrawFunction = drawGame;
		game.currentPerFrameUpdateFunction = updateGamePerFrame;
		game.currentPerStepUpdateFunction = updateGamePerStep;
		game.console.addMessage("Переход в игру.");
		pauseAudioAdvanced();
		clearAllInputs();
		game.world.isPaused = false;
		gameButtons.buttonMenu.isInvisible = false;

		game.generatedWorldOnce = false;
		game.currentGeneratorFunction = generateBlackHoles;
		game.needToGenerateWorldNextFrame = true;
		game.isAllowedToRegenerateWorld = true;
		game.isWorldTickingEnabled = false;
	}
});
settingsButtons.buttonMaze = getButton({
	x: canvas.centerX / canvas.scaleRate - (1000 * 0.5),
	y: canvas.height / canvas.scaleRate * (2 / 8),
	scaleRate: canvas.scaleRate,
	width: 1000,
	height: 80,
	englishText: "Get into a maze!",
	russianText: "В лабиринт!",
	subText: "",
	canBeHeldViaKeyboard: false,
	isInvisible: false,
	onClickFn: () => {
		playEffect("click1");
		game.currentDrawFunction = drawGame;
		game.currentPerFrameUpdateFunction = updateGamePerFrame;
		game.currentPerStepUpdateFunction = updateGamePerStep;
		game.console.addMessage("Переход в игру.");
		pauseAudioAdvanced();
		clearAllInputs();
		game.world.isPaused = false;
		gameButtons.buttonMenu.isInvisible = false;

		game.generatedWorldOnce = false;
		game.currentGeneratorFunction = generateMaze;
		game.needToGenerateWorldNextFrame = true;
		game.isAllowedToRegenerateWorld = true;
		game.isWorldTickingEnabled = false;
	}
});
settingsButtons.buttonImages = getButton({
	x: canvas.centerX / canvas.scaleRate - (1000 * 0.5),
	y: canvas.height / canvas.scaleRate * (3 / 8),
	scaleRate: canvas.scaleRate,
	width: 1000,
	height: 80,
	englishText: "See the images the game uses =3",
	russianText: "Посмотри какие картинки используются в игре",
	subText: "",
	canBeHeldViaKeyboard: false,
	isInvisible: false,
	onClickFn: () => {
		playEffect("click1");
		game.currentDrawFunction = drawGame;
		game.currentPerFrameUpdateFunction = updateGamePerFrame;
		game.currentPerStepUpdateFunction = updateGamePerStep;
		game.console.addMessage("Переход в игру.");
		pauseAudioAdvanced();
		clearAllInputs();
		game.world.isPaused = false;
		gameButtons.buttonMenu.isInvisible = false;

		game.generatedWorldOnce = false;
		game.currentGeneratorFunction = generateImageGenerator;
		game.needToGenerateWorldNextFrame = true;
		game.isAllowedToRegenerateWorld = true;
		game.isWorldTickingEnabled = false;
	}
});
settingsButtons.buttonChallenge = getButton({
	x: canvas.centerX / canvas.scaleRate - (1000 * 0.5),
	y: canvas.height / canvas.scaleRate * (4 / 8),
	scaleRate: canvas.scaleRate,
	width: 1000,
	height: 80,
	englishText: "Challenge >:3",
	russianText: "Членендж >:3",
	subText: "",
	canBeHeldViaKeyboard: false,
	isInvisible: false,
	onClickFn: () => {
		playEffect("click1");
		game.currentDrawFunction = drawGame;
		game.currentPerFrameUpdateFunction = updateGamePerFrame;
		game.currentPerStepUpdateFunction = updateGamePerStep;
		game.console.addMessage("Переход в игру.");
		pauseAudioAdvanced();
		clearAllInputs();
		game.world.isPaused = false;
		gameButtons.buttonMenu.isInvisible = false;

		game.generatedWorldOnce = false;
		game.currentGeneratorFunction = generateChallenge;
		game.needToGenerateWorldNextFrame = true;
		game.isWorldTickingEnabled = false;
		game.shouldBlockRegenerationAfterNextGeneration = true;

		game.isPlayingReplay = true;
	}
});
settingsButtons.buttonSeeCommands = getButton({
	x: canvas.centerX / canvas.scaleRate - (1000 * 0.5),
	y: canvas.height / canvas.scaleRate * (5.7 / 8),
	scaleRate: canvas.scaleRate,
	width: 1000,
	height: 80,
	englishText: "See all console commands",
	russianText: "Все комманды для консоли",
	subText: "",
	canBeHeldViaKeyboard: false,
	isInvisible: false,
	onClickFn: () => {
		playEffect("click1");
		++game.buttonSeeCommandsClickCount;
		game.console.addMessage(game.buttonSeeCommandsClickCount + " / 100");
		if (game.buttonSeeCommandsClickCount > 99) {
			game.currentDrawFunction = drawCommandsCenter;
			game.currentPerFrameUpdateFunction = updateCommandsCenterPerFrame;
			game.currentPerStepUpdateFunction = updateCommandsCenterPerStep;
			game.console.clear();
		}
	}
});
settingsButtons.buttonPlatform = getButton({
	x: canvas.centerX / canvas.scaleRate - (1000 * 0.5),
	y: canvas.height / canvas.scaleRate * (6.4 / 8),
	scaleRate: canvas.scaleRate,
	width: 1000,
	height: 80,
	englishText: "Change the platform(неработает)",
	russianText: "Телефон/ПК(неработает)",
	subText: "",
	canBeHeldViaKeyboard: false,
	isInvisible: false,
	onClickFn: () => {
		playEffect("click1");
		// isPC = !isPC;
	}
});
settingsButtons.buttonLanguage = getButton({
	x: canvas.centerX / canvas.scaleRate - (1000 * 0.5),
	y: canvas.height / canvas.scaleRate * (7.1 / 8),
	scaleRate: canvas.scaleRate,
	width: 1000,
	height: 80,
	englishText: "Change the language",
	russianText: "Изменить язык",
	subText: "",
	canBeHeldViaKeyboard: false,
	isInvisible: false,
	onClickFn: () => {
		playEffect("click1");
		game.isEnglish = !game.isEnglish;
	}
});

const commandsCenterButtons = {};
commandsCenterButtons.buttonMenuFromCommandsCenter = getButton({
	scaleRate: canvas.scaleRate,
	x: 0,
	y: 0,
	width: 150,
	height: canvas.height / canvas.scaleRate,
	text: "<-",
	key: "escape",
	subText: "",
	canBeHeldViaKeyboard: false,
	isInvisible: false,
	onClickFn: () => {
		playEffect("click1");
		game.currentDrawFunction = drawMenu;
		game.currentPerFrameUpdateFunction = updateMenuPerFrame;
		game.currentPerStepUpdateFunction = updateMenuPerStep;
		pauseAudioAdvanced();
		game.isAudioBlocked = true;
	}
});

const gameSettingsButtons = {};
gameSettingsButtons.buttonShowReplay = getButton({
	scaleRate: canvas.scaleRate,
	x: (canvas.width * 0.5 / canvas.scaleRate) - (950 * 0.5),
	y: canvas.height / canvas.scaleRate * (2 / 16),
	width: 950,
	height: 100,
	englishText: "Show level completion",
	russianText: "Показ. второго игрока",
	subText: "",
	key: "",
	canBeHeldViaKeyboard: false,
	isInvisible: false,
	onClickFn: () => {
		playEffect("click1");
		game.isPlayingReplay = !game.isPlayingReplay;
	},
	getNewTextFn: () => {
		if (game.isPlayingReplay) {
			if (game.isEnglish) {
				return "Show level completion";
			} else {
				return "Показ. второго игрока";
			}
		}
		if (game.isEnglish) {
			return "Show level completion X";
		} else {
			return "Показ. второго игрока X";
		}
	}
});
gameSettingsButtons.buttonFollowReplay = getButton({
	scaleRate: canvas.scaleRate,
	buttonToAlignWith: gameSettingsButtons.buttonShowReplay,
	alignmentDirectionIndex: 3,
	alignmentSpacing: 50,
	width: 950,
	height: 100,
	englishText: "Follow second player X",
	russianText: "Следить за вторым игроком X",
	key: "",
	subText: "",
	canBeHeldViaKeyboard: false,
	isInvisible: false,
	onClickFn: () => {
		playEffect("click1");
		game.isFollowingReplayPlayer = !game.isFollowingReplayPlayer;
		if (!game.isPlayingReplay) {
			game.isFollowingReplayPlayer = false;
		}
	},
	getNewTextFn: () => {
		if (game.isFollowingReplayPlayer) {
			if (game.isEnglish) {
				return "Follow second player";
			} else {
				return "Следить за вторым игроком";
			}
		}
		if (game.isEnglish) {
			return "Follow second player X";
		} else {
			return "Следить за вторым игроком X";
		}
	}
});
gameSettingsButtons.buttonCloseGameSettings = getButton({
	scaleRate: canvas.scaleRate,
	// buttonToAlignWith: gameSettingsButtons.buttonShowReplay,
	// alignmentDirectionIndex: 3,
	// alignmentSpacing: 50,
	x: (canvas.width * 0.5 / canvas.scaleRate) - (950 * 0.5),
	y: canvas.height / canvas.scaleRate * (12 / 16),
	width: 950,
	height: 100,
	englishText: "Back :3",
	russianText: "Назад :3",
	key: "escape",
	subText: "",
	canBeHeldViaKeyboard: false,
	isInvisible: false,
	onClickFn: () => {
		playEffect("click1");
		game.isGameSettingsOpen = false;
	},
});

// ======================= Misc Functions =======================
function restartGame() {
	if (game.shouldShowSeed) {
		if (game.isSeedRandom) {
			const seed = Math.random().toString(36).substring(2, 6);
			setStringSeed(seed);
			game.console.addMessage("Сид: " + seed);
			game.lastSeed = seed;
		} else {
			setStringSeed(game.seed);
			game.console.addMessage("Сид: " + game.seed);
			game.lastSeed = game.seed;
		}
	}

	effects.isDeathAnimationStarted = false;
	effects.deathAnimationStartTime = 0;
	effects.deathAnimationDuration = 1000;
	effects.darkScreenOpacity = 0;
	game.inventory.clear();
	game.player.restart();
	game.lastWorldTickStep = 0;
	game.gameStepsCount = 0;

	const generationResult = game.world.generate(game.currentGeneratorFunction, game.seed, game.player, canvas.scaleRate, images, walkingSprites);
	game.shouldShowSeed = generationResult.shouldShowSeed;
	game.playerSpawnX = generationResult.playerSpawnX;
	game.playerSpawnY = generationResult.playerSpawnY;
	game.player.x = game.playerSpawnX;
	game.player.y = game.playerSpawnY;
	game.currentLevelName = generationResult.levelName;
	game.camera.restart();


}

function checkKeyboardLayout() {
	const now = performance.now();
	const hasRussianInput = Object.keys(currentlyHeldKeys).some(key => russianRegex.test(key));
	const hasEnglishInput = Object.keys(currentlyHeldKeys).some(key => /^[a-zA-Z]$/.test(key));

	if (now - easterEggs.lastTimeNotifiedAboutLayout > 1000) {
		if (hasRussianInput) {
			game.console.addMessage("У тебя стоит русская раскладка,", 5000, colors.warning);
			game.console.addMessage("ты не сможешь управлять игрой с клавиатуры.", 5000, colors.warning);
			easterEggs.lastTimeNotifiedAboutLayout = now;
			easterEggs.didHaveWrongLayout = true;
		} else if (easterEggs.didHaveWrongLayout && hasEnglishInput) {
			game.console.addMessage("Теперь раскладка верная!", 5000);
			game.console.addMessage("Приятненькой игры.", 5000);
			easterEggs.lastTimeNotifiedAboutLayout = now;
			easterEggs.didHaveWrongLayout = false;
		}
	}
}

function clearAllInputs() {
	currentlyHeldKeys = {};
	pressedKeys = {};
}

function listDebugData() {
	const originalMaxMessages = game.console.maxMessages;
	game.console.maxMessages = 999;
	const time = 500;
	game.console.clear();
	game.console.addMessage("Всего объектов: " + game.world.countObjects(), time, "red");
	game.console.addMessage("Отрисовывается объектов: " + game.world.countVisibleObjects(), time, "red");
	game.console.addMessage("Обновляется объектов: " + game.world.countUpdatedObjects(), time, "orange");
	game.console.addMessage("Объектов которые всегда обн.: " + game.world.countObjectsToAlwaysUpdate(), time, "orange");
	game.console.addMessage("Размер сетки мира X: " + game.world.gridNumCells, time, "yellow");
	game.console.addMessage("Размер сетки мира Y: " + game.world.gridNumCells, time, "yellow");
	game.console.addMessage("Размер клеток мира X: " + game.world.gridCellsSizeX, time, "green");
	game.console.addMessage("Размер клеток мира Y: " + game.world.gridCellsSizeY, time, "green");
	// game.console.addMessage("Клетка камеры X: " + game.world.lastRetrievedGridIndexXUpdate, time, "lightBlue");
	// game.console.addMessage("Клетка камеры Y: " + game.world.lastRetrievedGridIndexYUpdate, time, "lightBlue");
	// game.console.addMessage("Игрок X: " + game.player.x, time, "blue");
	// game.console.addMessage("Игрок Y: " + game.player.y, time, "blue");
	game.console.addMessage("Приближение: " + game.camera.zoomInRate, time, "violet");
	game.console.addMessage("Лаг: " + accumulator, time, "violet");
	game.console.maxMessages = originalMaxMessages;
}

// ======================= Drawing Commands Center =======================
function drawCommandsCenterButtons() {
	canvas.ctx.textAlign = "start";
	canvas.ctx.textBaseline = "alphabetic";
	for (let buttonKey in commandsCenterButtons) {
		const button = commandsCenterButtons[buttonKey];
		button.draw(canvas.ctx, game.bootTime);
	}
}
function drawCommandsCenter() {
	drawTextCommandsCenter(canvas.ctx, canvas.width, canvas.height, images, canvas.scaleRate);
	drawMouseLightEffect(canvas.ctx, canvas.width, canvas.height, game.mouse.x, game.mouse.y, game.mouse.isPressed);
	drawCommandsCenterButtons();
}

// ======================= Updating Commands Center =======================
function updateCommandsCenterButtons() {
	for (let buttonKey in commandsCenterButtons) {
		const button = commandsCenterButtons[buttonKey];
		button.mouseInteract(game.mouse.x, game.mouse.y, game.mouse.actualPressStartPosX, game.mouse.actualPressStartPosY, game.mouse.isPressed);
		button.keyInteract(pressedKeys);
		button.updateMisc(isPC, game.isEnglish);
	}
}
function updateCommandsCenterPerFrame() {
	updateCommandsCenterButtons();
}
function updateCommandsCenterPerStep() {

}

// ======================= Recording Stuff =======================
let mediaRecorder;
let recordedChunks = [];

function startRecording() {
	recordedChunks = [];

	const stream = canvas.element.captureStream(30);

	mediaRecorder = new MediaRecorder(stream, {
		mimeType: "video/webm;codecs=vp8",
		videoBitsPerSecond: 5000000
	});

	mediaRecorder.ondataavailable = (event) => {
		if (event.data.size > 0) {
			recordedChunks.push(event.data);
		}
	};

	mediaRecorder.onstop = exportVideo;
	mediaRecorder.start();
}

function exportVideo() {
	const blob = new Blob(recordedChunks, { type: "video/webm" });
	const url = URL.createObjectURL(blob);

	const a = document.createElement("a");
	a.style.display = "none";
	a.href = url;
	a.download = "gameplay-record.webm";
	document.body.appendChild(a);
	a.click();

	setTimeout(() => {
		document.body.removeChild(a);
		window.URL.revokeObjectURL(url);
	}, 100);
}

function stopAndExport() {
	if (!mediaRecorder) {
		return;
	}
	mediaRecorder.stop();
	mediaRecorder.onstop = () => {
		exportVideo();
	};
}

// ======================= Updating Page Console =======================
const pageConsole = {
	element: document.getElementById("pageConsole"),
	isPageConsoleCountdownActive: false,
	consoleStartTime: 0,
	lastConsoleValue: "",
	DELAY_MS: 2000,
	commands: [
		{
			text: "menu", callback: () => {
				if (game.currentDrawFunction == drawMazeMinigame) {
					switchToMenu();
				} else {
					gameButtons.buttonMenu.onClick();
				}
			}
		},
		{
			text: "ai", callback: () => {
				game.isAI = !game.isAI;
				if (game.isAI) {
					game.console.addMessage("Режим ИИ включен.", 3000, colors.notice);
				} else {
					game.console.addMessage("Режим ИИ выключен.", 3000, colors.notice);
				}
			}
		},

		{
			text: "seed", callback: (args) => {
				if (args === "off") {
					game.isSeedRandom = true;
					game.console.addMessage("Теперь сид случайный.", 8000, colors.notice);
				} else if (args === "on") {
					game.isSeedRandom = false;
					game.console.addMessage("Теперь сид НЕ случайный.", 8000, colors.notice);
					game.console.addMessage("(Напиши seed your-seed-here чтобы его установить.)", 8000, colors.notice);
				} else if (args.length > 0) {
					game.isSeedRandom = false;
					game.seed = args;
					game.lastSeed = args;
					game.console.addMessage("Теперь сид НЕ случайный.", 8000, colors.notice);
					game.console.addMessage(`Сид установлен: ${args}`, 8000, colors.notice);
				} else {
					game.console.addMessage(`Текущий сид: ${game.lastSeed}`, 8000, colors.notice);
				}
			}
		},

		{
			text: "record", callback: (args) => {
				if (args === "off") {
					stopAndExport();
					game.console.addMessage("Конец записи.", 8000, colors.notice);
				} else if (args === "on") {
					startRecording();
					game.console.addMessage("Начало записи.", 8000, colors.notice);
				} else {
					game.console.addMessage("Включить или выключить запись?", 8000, colors.notice);
				}
			}
		},
	]
};

pageConsole.element.addEventListener("keydown", (event) => {
	if (event.key === "Enter") {
		const currentValue = pageConsole.element.value.trim();

		const [inputCommand, ...argsArray] = currentValue.split(" ");
		const args = argsArray.join(" ");

		const command = pageConsole.commands.find(c => c.text === inputCommand);

		if (command) {
			command.callback(args);
			clearPageConsole();
			pageConsole.isPageConsoleCountdownActive = false;
		} else if (currentValue === "") {
			pageConsole.element.blur();
		}
	}
});

function clearPageConsole() {
	pageConsole.element.value = "";
	pageConsole.element.blur();
}

function updatePageConsole() {
	const currentTime = performance.now();
	const currentValue = pageConsole.element.value.trim();

	if (pageConsole.isPageConsoleCountdownActive) {
		if (currentTime - pageConsole.consoleStartTime >= pageConsole.DELAY_MS) {
			pageConsole.element.value = "чо ты мне тут пишешь дибилина стирай ево нахуй";
			pageConsole.isPageConsoleCountdownActive = false;
			pageConsole.element.blur();
			return;
		}
	}

	if (currentValue !== "" && currentValue !== pageConsole.lastConsoleValue) {
		pageConsole.consoleStartTime = currentTime;
		pageConsole.isPageConsoleCountdownActive = true;
		pageConsole.lastConsoleValue = currentValue;
	} else if (currentValue === "") {
		pageConsole.isPageConsoleCountdownActive = false;
	}
}

// ======================= Drawing Maze Minigame =======================
const noiseCanvas = document.createElement('canvas');
const nCtx = noiseCanvas.getContext('2d');
noiseCanvas.width = 256;
noiseCanvas.height = 256;
const nData = nCtx.createImageData(256, 256);
for (let i = 0; i < nData.data.length; i += 4) {
	const val = Math.random() * 50;
	nData.data[i] = nData.data[i + 1] = nData.data[i + 2] = val;
	nData.data[i + 3] = 255;
}
nCtx.putImageData(nData, 0, 0);
const noisePattern = nCtx.createPattern(noiseCanvas, 'repeat');

function draw3DMaze(ctx, width, height, maze) {
	if (!maze || !maze.grid) return;

	const rows = maze.grid.length;
	const cols = maze.grid.length;
	const MAX_VIS_DIST = 450;
	const FLASHLIGHT_RADIUS = 220;

	ctx.fillStyle = "#000";
	ctx.fillRect(0, 0, width, height);

	const numRays = width;
	const columnWidth = width / numRays;
	for (let i = 0; i < numRays; i++) {
		const rayAngle = (maze.playerAngle - maze.fov / 2) + (i / numRays) * maze.fov;
		let distanceToWall = 0;
		let hitWall = false;
		const eyeX = Math.cos(rayAngle);
		const eyeY = Math.sin(rayAngle);

		let wallType = 0;

		while (!hitWall && distanceToWall < 1000) {
			distanceToWall += 0.1;
			const testX = Math.floor((maze.playerX + eyeX * distanceToWall) / maze.tileSize);
			const testY = Math.floor((maze.playerY + eyeY * distanceToWall) / maze.tileSize);

			if (testY < 0 || testY >= rows || testX < 0 || testX >= cols) {
				hitWall = true;
				distanceToWall = 1000;
			} else if (maze.grid[testY][testX] > 0) {
				hitWall = true;
				wallType = maze.grid[testY][testX];
			}
		}

		const correctedDistance = distanceToWall * Math.cos(rayAngle - maze.playerAngle) * 2;
		const wallHeight = (maze.tileSize * height) / (correctedDistance + 0.1);
		const screenY = (height / 2) - (wallHeight / 2);

		if (wallType === 2) {
			const r = Math.max(50, 255 - (correctedDistance / MAX_VIS_DIST) * 255);
			ctx.fillStyle = `rgb(${r}, 0, 0)`;
		} else {
			const b = Math.max(0, 255 - (correctedDistance / MAX_VIS_DIST) * 255);
			ctx.fillStyle = `rgb(${b}, ${b}, ${b})`;
		}

		ctx.fillRect(i * columnWidth, screenY, columnWidth, wallHeight);
	}

	ctx.save();
	ctx.globalCompositeOperation = 'soft-light';
	ctx.globalAlpha = 1;
	ctx.fillStyle = noisePattern;
	ctx.fillRect(0, 0, width, height);
	ctx.restore();

	let centerDist = 1000;
	const eyeX = Math.cos(maze.playerAngle);
	const eyeY = Math.sin(maze.playerAngle);
	let hit = false;
	let d = 0;
	while (!hit && d < 600) {
		d += 2;
		const tx = Math.floor((maze.playerX + eyeX * d) / maze.tileSize);
		const ty = Math.floor((maze.playerY + eyeY * d) / maze.tileSize);
		if (ty >= 0 && ty < maze.grid.length && tx >= 0 && tx < maze.grid.length && maze.grid[ty][tx] > 0) {
			hit = true;
			centerDist = d;
		}
	}
	const hotspotIntensity = Math.max(0, 0.1 * (1 - centerDist / 300));

	ctx.save();
	const centerX = (width / 2) + (maze.flashX || 0);
	const centerY = (height / 2) + (maze.flashY || 0);

	if (hotspotIntensity > 0) {
		ctx.globalCompositeOperation = 'screen';
		const hotspot = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, FLASHLIGHT_RADIUS * 0.4);
		hotspot.addColorStop(0, `rgba(255, 255, 255, ${hotspotIntensity})`);
		hotspot.addColorStop(1, 'rgba(255, 255, 255, 0)');
		ctx.fillStyle = hotspot;
		ctx.fillRect(0, 0, width, height);
	}

	ctx.globalCompositeOperation = 'multiply';
	const darkness = ctx.createRadialGradient(centerX, centerY, FLASHLIGHT_RADIUS * 0.2, centerX, centerY, FLASHLIGHT_RADIUS);
	darkness.addColorStop(0, 'rgba(255, 255, 255, 1)');
	darkness.addColorStop(0.7, 'rgba(120, 120, 120, 0.5)');
	darkness.addColorStop(1, 'rgba(0, 0, 0, 1)');
	ctx.fillStyle = darkness;
	ctx.fillRect(0, 0, width, height);

	ctx.restore();

	ctx.globalCompositeOperation = 'source-over';

	const barHeight = 40;
	const barY = (height / 2) - (barHeight / 2);
	const statusText = "Тебе нужно пройти тест на интеллект чтобы попасть в игру.";

	ctx.fillStyle = 'rgba(255, 0, 0, 0.1)';
	ctx.fillRect(0, barY, width, barHeight);

	ctx.strokeStyle = '#ff0000ff';
	ctx.lineWidth = 1;
	ctx.strokeRect(0, barY, width, barHeight);

	ctx.fillStyle = '#930016ff';
	ctx.font = 'bold 14px monospace';
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.shadowColor = '#000000ff';
	ctx.shadowBlur = 25;

	ctx.fillText(statusText, width / 2, height / 2);

	game.console.draw(canvas.ctx);

	ctx.shadowBlur = 0;
}

function drawMazeMinigame() {
	draw3DMaze(canvas.ctx, canvas.width, canvas.height, game.maze);
}

// ======================= Updating Maze Minigame =======================
function switchToMenu() {
	game.currentDrawFunction = drawMenu;
	game.currentPerFrameUpdateFunction = updateMenuPerFrame;
	game.currentPerStepUpdateFunction = updateMenuPerStep;
	currentlyHeldKeys = {};
	pressedKeys = {};
	game.console.addMessage(["Игра запустенте :3", "Игра запустенте :3!!1111!!!", "Игра запустенте =3", "Игра запустенте UwU"], 5000);
	const originalMaxMessages = game.console.maxMessages;
	game.console.maxMessages = 999;
	// game.console.addMessage("Чтобы все фичи работали, пожалуйста", 8000, colors.warning);
	// game.console.addMessage("перейди в настройки сайта и разреши", 8000, colors.warning);
	// game.console.addMessage("\"доступ к открытию всплывающих окон.\"", 8000, colors.warning);
	// game.console.addMessage("Нажми T, чтобы автоматически", 8000, colors.warning);
	// game.console.addMessage("проверить стоит ли это разрешение.", 8000, colors.warning);
	game.console.addMessage("Нажми G, чтобы включить звук.", 12000, colors.notice);
	game.console.maxMessages = originalMaxMessages;
}
function handleMazeInput(keys, mouse, maze, width, height) {
	// switchToMenu();

	maze.flashTargetX = 0;
	maze.flashTargetY = 0;

	let moveStep = 0;
	let turnAction = 0;

	if (mouse.isPressed) {
		const deltaX = mouse.x - (width / 2);
		const deltaY = mouse.y - (height / 2);

		const deadzone = width * 0.1;

		if (Math.abs(deltaX) > deadzone) {
			turnAction = deltaX > 0 ? 1 : -1;
			maze.flashTargetX = (deltaX > 0 ? -1 : 1) * maze.maxOffset;
		}

		if (Math.abs(deltaY) > deadzone) {
			moveStep = deltaY < 0 ? maze.moveSpeed : -maze.moveSpeed;
			maze.flashTargetY = (deltaY < 0 ? 1 : -1) * (maze.maxOffset / 2);
		}
	} else {
		if (keys['a'] || keys["arrowleft"]) {
			turnAction = -1;
			maze.flashTargetX = maze.maxOffset;
		}
		if (keys['d'] || keys["arrowright"]) {
			turnAction = 1;
			maze.flashTargetX = -maze.maxOffset;
		}
		if (keys['w'] || keys["arrowup"]) {
			moveStep = maze.moveSpeed;
			maze.flashTargetY = maze.maxOffset / 2;
		}
		if (keys['s'] || keys["arrowdown"]) {
			moveStep = -maze.moveSpeed;
			maze.flashTargetY = -maze.maxOffset / 2;
		}
	}

	maze.playerAngle += turnAction * maze.rotSpeed;

	if (moveStep !== 0) {
		const nextX = maze.playerX + Math.cos(maze.playerAngle) * moveStep;
		const nextY = maze.playerY + Math.sin(maze.playerAngle) * moveStep;

		const gridX = Math.floor(nextX / maze.tileSize);
		const gridY = Math.floor(nextY / maze.tileSize);
		const targetCell = maze.grid[gridY]?.[gridX];

		if (targetCell === 0) {
			maze.playerX = nextX;
			maze.playerY = nextY;
		} else if (targetCell === 2) {
			switchToMenu();
		}
	}

	maze.flashX += (maze.flashTargetX - maze.flashX) * maze.flashEase;
	maze.flashY += (maze.flashTargetY - maze.flashY) * maze.flashEase;
}

function updateMazePerFrame() {
	updatePageConsole();
	checkKeyboardLayout();
}
function updateMazePerStep() {
	handleMazeInput(currentlyHeldKeys, game.mouse, game.maze, canvas.width, canvas.height);
}

// ======================= Updating Game =======================
function updateGameSettings() {
	for (let buttonKey in gameSettingsButtons) {
		const button = gameSettingsButtons[buttonKey];
		button.mouseInteract(game.mouse.x, game.mouse.y, game.mouse.actualPressStartPosX, game.mouse.actualPressStartPosY, game.mouse.isPressed);
		button.keyInteract(currentlyHeldKeys);
		button.updateMisc(isPC, game.isEnglish);
	}
}
function updateGameButtons() {
	for (let buttonKey in gameButtons) {
		const button = gameButtons[buttonKey];
		button.mouseInteract(game.mouse.x, game.mouse.y, game.mouse.actualPressStartPosX, game.mouse.actualPressStartPosY, game.mouse.isPressed);
		button.keyInteract(currentlyHeldKeys);
		button.updateMisc(isPC, game.isEnglish);
	}
}
function updateGameEffects() {
	const now = performance.now();
	if (game.player.isDead) {
		if (effects.isDeathAnimationStarted) {
			const timeWent = now - effects.deathAnimationStartTime;
			if (timeWent > effects.deathAnimationDuration) {
				game.needToGenerateWorldNextFrame = true;
				effects.isDeathAnimationStarted = false;
				effects.deathAnimationStartTime = 0;
				effects.darkScreenOpacity = 0;
			} else {
				effects.darkScreenOpacity = timeWent / effects.deathAnimationDuration;
			}
		} else {
			effects.isDeathAnimationStarted = true;
			effects.deathAnimationStartTime = now;
		}
	}
}
function updateGamePerFrame() {
	if (game.isGameSettingsOpen) {
		updateGameSettings();
	} else {
		updateGameButtons();
	}
	checkKeyboardLayout();
	game.inventory.update(game.mouse.x, game.mouse.y, game.mouse.actualPressStartPosX, game.mouse.actualPressStartPosY, game.mouse.isPressed, currentlyHeldKeys, game.player, game.gameStepsCount, game.world, images, game.camera, game.console);
	game.world.updateObjectsFrame(game.mouse, game.camera, canvas.centerX, canvas.centerY, canvas.maxDimension, game.player, game.world, game.inventory, images, game.gameStepsCount, game.console);
	game.player.updateFrame();
	if (game.isPlayingReplay) {
		game.replayPlayer.updateFrame();
	}
	updateGameEffects();
	if (game.isDebugMode) {
		listDebugData();
	}
	updatePageConsole();
	if (!game.needToGenerateWorldNextFrame && game.isPlayingReplay && game.currentReplayLevelName !== game.currentLevelName) {
		game.isPlayingReplay = false;
	}

	if (game.isAI && !game.player.isDead) {
		game.console.clear();
		game.console.addMessage(game.player.state + "; " + Object.keys(currentlyHeldKeys).join(" "), 1000, "yellow");
	}
}
function updateWorldTicksPerStep() {
	if (game.isWorldTickingEnabled && game.gameStepsCount - game.lastWorldTickStep > game.worldTickDelayInSteps) {
		game.lastWorldTickStep = game.gameStepsCount;
		generateWorldTick(game.world, game.player, images);
	}
}
function updateGamePerStep() {
	++game.gameStepsCount;
	updateWorldTicksPerStep();
	game.player.updateStep(game.gameStepsCount);

	game.camera.updateStep(game.gameStepsCount);

	if (game.isRecordingReplay) {
		game.replayPlayerToFile.push(
			Math.round(game.player.x),
			Math.round(game.player.y)
		);
		if (currentlyHeldKeys["l"]) {
			const dataString = game.replayPlayerToFile.join(" ");
			downloadTextAsFile(dataString, "replay.txt");
		}
	}

	if (game.isPlayingReplay) {
		if (game.currentReplayIndex + 1 < game.replayPlayerFromFile.length) {
			game.replayPlayer.x = game.replayPlayerFromFile[game.currentReplayIndex];
			game.replayPlayer.y = game.replayPlayerFromFile[game.currentReplayIndex + 1];
			if (game.currentReplayIndex >= 2) {
				const movementDifferenceX = game.replayPlayer.x - game.replayPlayerFromFile[game.currentReplayIndex - 2];
				const movementDifferenceY = game.replayPlayer.y - game.replayPlayerFromFile[game.currentReplayIndex - 1];
				game.replayPlayer.controlSpriteBasedOnDirection(movementDifferenceX, movementDifferenceY);
			}
			game.currentReplayIndex += 2;
		} else {
			game.currentReplayIndex = 0;
		}
	}
}

// ======================= Updating Menu =======================
function updateMenuEasterEggs() {
	if (easterEggs.shouldDrawArrows) {
		const distance = getDistance(game.mouse.x, game.mouse.y, easterEggs.orangeCircleX, easterEggs.orangeCircleY);
		if (game.mouse.isPressed) {
			const now = performance.now();
			if (distance < easterEggs.orangeCircleRadius) {
				if (now - easterEggs.lastTimeClickedOrangeCircle > 1000) {
					game.console.addMessage(["ДА НЕ ТУДА ТЫ СМОТРИШЬ...", "ДА НЕ ТУДА ТЫ СМОТРИШЬ... ебоный ронт", "ДА не ТУДа ТЫ СМОТРИШЬ..."], 5000, "orange");
					easterEggs.lastTimeClickedOrangeCircle = now;
				}
			}
		}
		if (distance < easterEggs.orangeCircleRadius) {
			easterEggs.catOpacity = Math.min(0.90, easterEggs.orangeCircleRadius / distance - 1);
		} else {
			easterEggs.catOpacity = 0;
		}
	}
}
function updateMenuButtons() {
	for (let buttonKey in menuButtons) {
		const button = menuButtons[buttonKey];
		button.mouseInteract(game.mouse.x, game.mouse.y, game.mouse.actualPressStartPosX, game.mouse.actualPressStartPosY, game.mouse.isPressed);
		button.keyInteract(pressedKeys);
		button.updateMisc(isPC, game.isEnglish);
	}
}
function updateMenuPerFrame() {
	updateMenuEasterEggs();
	checkKeyboardLayout();
	updateMenuButtons();
	updatePageConsole();
}
function updateMenuPerStep() {

}

// ======================= Drawing Settings =======================
function drawSettingsButtons() {
	canvas.ctx.textAlign = "start";
	canvas.ctx.textBaseline = "alphabetic";
	for (let buttonKey in settingsButtons) {
		const button = settingsButtons[buttonKey];
		button.draw(canvas.ctx, game.bootTime);
	}
}
function drawSettings() {
	drawBackgroundSettings(canvas.ctx, canvas.width, canvas.height, game.bootTime, canvas.scaleRate);

	canvas.ctx.textAlign = "start";
	canvas.ctx.textBaseline = "alphabetic";

	drawMouseLightEffect(canvas.ctx, canvas.width, canvas.height, game.mouse.x, game.mouse.y, game.mouse.isPressed);

	drawSettingsButtons();
	game.console.draw(canvas.ctx);
}

// ======================= Updating Settings =======================
function updateSettingsButtons() {
	for (let buttonKey in settingsButtons) {
		const button = settingsButtons[buttonKey];
		button.mouseInteract(game.mouse.x, game.mouse.y, game.mouse.actualPressStartPosX, game.mouse.actualPressStartPosY, game.mouse.isPressed);
		button.keyInteract(pressedKeys);
		button.updateMisc(isPC, game.isEnglish);
	}
}
function updateSettingsPerFrame() {
	updateSettingsButtons();
}
function updateSettingsPerStep() {

}

// ======================= Drawing Credits =======================
function drawCredits() {
	canvas.ctx.fillStyle = "black";
	canvas.ctx.fillRect(0, 0, canvas.width, canvas.height);

	drawBackgroundCredits(canvas.ctx, canvas.width, canvas.height, game.bootTime, canvas.scaleRate);
	drawMouseLightEffect(canvas.ctx, canvas.width, canvas.height, game.mouse.x, game.mouse.y, game.mouse.isPressed);
	drawTextCredits(canvas.ctx, canvas.width, canvas.height, images, canvas.scaleRate);

	canvas.ctx.textAlign = "start";
	canvas.ctx.textBaseline = "alphabetic";

	const button = creditsButtons.buttonMenuFromCredits;
	button.draw(canvas.ctx, game.bootTime);
}

// ======================= Updating Credits =======================
function updateCreditsPerFrame() {
	const button = creditsButtons.buttonMenuFromCredits;
	button.mouseInteract(game.mouse.x, game.mouse.y, game.mouse.actualPressStartPosX, game.mouse.actualPressStartPosY, game.mouse.isPressed);
	button.keyInteract(pressedKeys);
}
function updateCreditsPerStep() { }

// ======================= Drawing Game =======================
function drawGameSettings() {
	canvas.ctx.fillStyle = "rgba(0,0,0,0.5)";
	canvas.ctx.fillRect(0, 0, canvas.width, canvas.height);
	canvas.ctx.fillStyle = "rgba(81, 81, 81, 0.33)";
	canvas.ctx.fillRect(canvas.width * 1 / 6, canvas.height * 1 / 25, canvas.width - canvas.width * (2 * 1 / 6), canvas.height - canvas.height * (1 / 25 * 2));

	canvas.ctx.textAlign = "start";
	canvas.ctx.textBaseline = "alphabetic";
	for (let buttonKey in gameSettingsButtons) {
		const button = gameSettingsButtons[buttonKey];
		button.draw(canvas.ctx, game.bootTime);
	}
}
function drawGameButtons() {
	canvas.ctx.textAlign = "start";
	canvas.ctx.textBaseline = "alphabetic";
	for (let buttonKey in gameButtons) {
		const button = gameButtons[buttonKey];
		button.draw(canvas.ctx, game.bootTime);
	}
}
function drawDarkScreenEffect() {
	canvas.ctx.fillStyle = "rgba(0,0,0," + effects.darkScreenOpacity + ")";
	canvas.ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function getFormattedGameTime() {
	const totalSeconds = Math.floor(game.gameStepsCount / physicsFPS);

	if (totalSeconds < 60) {
		return totalSeconds.toString();
	}

	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = totalSeconds % 60;

	const sDisplay = seconds < 10 ? "0" + seconds : seconds;

	if (hours > 0) {
		const mDisplay = minutes < 10 ? "0" + minutes : minutes;
		return hours + ":" + mDisplay + ":" + sDisplay;
	} else {
		return minutes + ":" + sDisplay;
	}
}
function drawGameTimer() {
	const timeString = getFormattedGameTime();

	canvas.ctx.fillStyle = "white";
	canvas.ctx.font = "24px Arial";
	canvas.ctx.textAlign = "left";
	canvas.ctx.textBaseline = "bottom";
	canvas.ctx.fillText(timeString, game.inventory.bgX, game.inventory.bgY);
}

function drawGame() {
	drawGameGroundTiled(canvas.ctx, canvas.width, canvas.height, game.camera.x, game.camera.y, game.camera.zoomInRate, images);
	game.world.drawObjectsBelowPLayer(canvas.ctx, game.camera.x, game.camera.y, game.camera.zoomInRate, canvas.centerX, canvas.centerY, canvas.width, canvas.height, canvas.maxDimension, game.player);
	game.player.draw(canvas.ctx, game.camera.x, game.camera.y, game.camera.zoomInRate);
	game.world.drawObjectsAbovePLayer(canvas.ctx, game.camera.x, game.camera.y, game.camera.zoomInRate, canvas.centerX, canvas.centerY, canvas.width, canvas.height, canvas.maxDimension, game.player);
	if (game.isPlayingReplay) {
		game.replayPlayer.opacity = 0.4;
		game.replayPlayer.draw(canvas.ctx, game.camera.x, game.camera.y, game.camera.zoomInRate);
	}
	drawDarkScreenEffect();
	drawGameButtons();
	game.console.draw(canvas.ctx);
	game.inventory.draw(canvas.ctx);
	drawGameTimer();
	//drawMouse();

	if (game.isGameSettingsOpen) {
		drawGameSettings();
	}

	if (game.player.isWon) {
		drawWinOnContext(canvas.ctx, canvas.width, canvas.height, canvas.scaleRate, game.bootTime);
	}

	if (game.needToGenerateWorldNextFrame) {
		if (game.isAllowedToRegenerateWorld) {
			if (game.loadingScreenDelayFramesCount > 5) {
				game.needToGenerateWorldNextFrame = false;
				game.loadingScreenDelayFramesCount = 0;
				if (game.shouldBlockRegenerationAfterNextGeneration) {
					game.isAllowedToRegenerateWorld = false;
					game.shouldBlockRegenerationAfterNextGeneration = false;
				}
				const time = getFormattedGameTime();
				if (game.isShowingTimer && game.generatedWorldOnce && time !== "0") {
					if (game.isAI) {
						game.console.addMessage("ИИ прожил:  " + time, 8000, colors.notice);
					} else {
						game.console.clear();
						const messageDuration = 10000;
						game.console.addMessage(["Ты прожил:  " + time + "  :3!!!1", "Ты выжил:  " + time + "  =3", "Прошло времени:  " + time + "  Ōwo", "Ты наиграл:  " + time, "Ты навыживунькал:  " + time, "Твое существование прервалось после:  " + time + "  :<"], messageDuration, "yellow");
						game.console.addMessage("(" + game.gameStepsCount + " игровых шагов)", messageDuration, "yellow");
						if (game.gameStepsCount > 36000) {
							game.console.addMessage("стоп ЧЕВОООО ЭТО ДОХУЯШЕНКИ :333!!!!!!", messageDuration, "orange");
							game.console.addMessage("и что ты большего да ожидал за", messageDuration, "orange");
							game.console.addMessage("такие достижения?", messageDuration, "orange");
						}

					}
				}
				game.gameStepsCount = 0;
				restartGame();
			} else {
				const text = "Загрузка...";
				const fontSize = 40 * canvas.scaleRate;
				canvas.ctx.font = `${fontSize}px sans-serif`;
				canvas.ctx.textAlign = "center";
				canvas.ctx.textBaseline = "middle";
				canvas.ctx.fillStyle = "rgba(46, 46, 46, 0.73)";
				canvas.ctx.fillRect(0, (canvas.height / 2) - fontSize, canvas.width, fontSize * 2);
				canvas.ctx.fillStyle = "white";
				canvas.ctx.fillText(text, canvas.width / 2, canvas.height / 2);

				++game.loadingScreenDelayFramesCount;
			}
		} else {
			game.player.restart();
			game.player.x = game.playerSpawnX;
			game.player.y = game.playerSpawnY;
			game.needToGenerateWorldNextFrame = false;
			game.currentReplayIndex = 0;
			game.replayPlayerToFile.length = 0;
			game.gameStepsCount = 0;
		}
	}

	// const worldImage = game.world.getBoolSceneRepresentation(128).grid;
	// const cellSize = 2;
	// for (let y = 0; y < worldImage.length; ++y) {
	// 	for (let x = 0; x < worldImage[0].length; ++x) {
	// 		canvas.ctx.fillStyle = worldImage[y][x] ? "white" : "black";
	// 		canvas.ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
	// 	}
	// }
}
function drawGameDebug() {
	game.world.drawHitboxes(canvas.ctx, game.camera.x, game.camera.y, game.camera.zoomInRate, canvas.centerX, canvas.centerY, canvas.width, canvas.height, canvas.maxDimension);
	game.player.drawHitbox(canvas.ctx, game.camera.x, game.camera.y, game.camera.zoomInRate);
	drawDarkScreenEffect();
	game.console.draw(canvas.ctx);

	if (game.isPlayingReplay) {
		game.replayPlayer.drawHitbox(canvas.ctx, game.camera.x, game.camera.y, game.camera.zoomInRate);
	}

	if (game.needToGenerateWorldNextFrame) {
		if (game.isAllowedToRegenerateWorld) {
			if (game.loadingScreenDelayFramesCount > 5) {
				game.needToGenerateWorldNextFrame = false;
				game.loadingScreenDelayFramesCount = 0;
				if (game.shouldBlockRegenerationAfterNextGeneration) {
					game.isAllowedToRegenerateWorld = false;
					game.shouldBlockRegenerationAfterNextGeneration = false;
				}
				restartGame();
			} else {
				const text = "Загрузка...";
				const fontSize = 40 * canvas.scaleRate;
				canvas.ctx.font = `${fontSize}px sans-serif`;
				canvas.ctx.textAlign = "center";
				canvas.ctx.textBaseline = "middle";
				canvas.ctx.fillStyle = "rgba(46, 46, 46, 0.73)";
				canvas.ctx.fillRect(0, (canvas.height / 2) - fontSize, canvas.width, fontSize * 2);
				canvas.ctx.fillStyle = "white";
				canvas.ctx.fillText(text, canvas.width / 2, canvas.height / 2);

				++game.loadingScreenDelayFramesCount;
			}
		} else {
			game.player.restart();
			game.player.x = game.playerSpawnX;
			game.player.y = game.playerSpawnY;
			game.needToGenerateWorldNextFrame = false;
		}
	}

	drawMouse();
}

// ======================= Drawing Menu =======================
function drawMenuButtons() {
	canvas.ctx.textAlign = "start";
	canvas.ctx.textBaseline = "alphabetic";
	for (let buttonKey in menuButtons) {
		const button = menuButtons[buttonKey];
		button.draw(canvas.ctx, game.bootTime);
	}
}
function drawMouse() {
	canvas.ctx.fillStyle = "white";
	canvas.ctx.beginPath();
	canvas.ctx.arc(game.mouse.x, game.mouse.y, 2, 0, Math.PI * 2);
	canvas.ctx.fill();
}
function drawEasterCat() {
	canvas.ctx.globalAlpha = easterEggs.catOpacity;
	canvas.ctx.drawImage(images.cat1, canvas.centerX - canvas.centerY, 0, canvas.height, canvas.height);
	canvas.ctx.globalAlpha = 1;
}
function drawMenuName() {
	drawNameMenu(canvas.ctx, canvas.width, canvas.height, 0.3, game.bootTime, easterEggs.shouldDrawArrows, images);
	drawSplashMenu(canvas.ctx, canvas.width, canvas.height, 0.3, game.bootTime, easterEggs.shouldDrawArrows, images, game.currentSplash);
}
function drawEqualizer() {
	const equalizer = getVisualizerFrame(canvas.width, canvas.height);
	if (equalizer !== null) {
		canvas.ctx.globalAlpha = 0.5;
		canvas.ctx.drawImage(equalizer, 0, 0);
		canvas.ctx.globalAlpha = 1;
	}
}
function drawMenu() {
	drawBackgroundMenu(canvas.ctx, canvas.width, canvas.height, game.bootTime, canvas.scaleRate);
	drawMouseLightEffect(canvas.ctx, canvas.width, canvas.height, game.mouse.x, game.mouse.y, game.mouse.isPressed);
	drawEqualizer();
	drawMenuButtons();
	drawMenuName();
	game.console.draw(canvas.ctx);
	drawEasterCat();
	//drawMouse();
}

// ======================= Essential Functions =======================
function perFixedStepUpdate() {
	const lerpSpeed = ((game.player.isVisible && !game.player.isTurningVisible) ? 0.2 : 0.05) * game.camera.zoomInRate;
	let targetX, targetY;
	if (game.isFollowingReplayPlayer) {
		targetX = game.replayPlayer.x - (canvas.width05) / game.camera.zoomInRate;
		targetY = game.replayPlayer.y - (canvas.height05) / game.camera.zoomInRate;
	} else {
		targetX = game.player.x - (canvas.width05) / game.camera.zoomInRate;
		targetY = game.player.y - (canvas.height05) / game.camera.zoomInRate;
	}
	game.camera.x += (targetX - game.camera.x) * lerpSpeed / canvas.scaleRate;
	game.camera.y += (targetY - game.camera.y) * lerpSpeed / canvas.scaleRate;

	game.currentPerStepUpdateFunction();
	game.world.updateObjectsFixedStep(game.mouse, game.player, game.world, game.inventory, images, game.gameStepsCount, game.console);

	if (isPC && !game.player.isDead && !game.player.isWon && game.gameStepsCount > 30) {
		if (game.isAI) {
			const inputs = game.player.controlWithAI(game.camera, game.world, game.inventory);
			if (inputs) {
				currentlyHeldKeys = inputs;
				game.player.controlMovementKeys(currentlyHeldKeys);
			}
		} else {
			game.player.controlMovementKeys(currentlyHeldKeys);
		}
	}
	// else {
	// 	game.player.controlMovementDirection(UI.joystick.directionX, UI.joystick.directionY);
	// }

	const [newPlayerX, newPlayerY] = game.world.resolveCircleCollisions(game.player.x, game.player.y, game.player.radius);
	game.player.x = newPlayerX;
	game.player.y = newPlayerY;
}

function runFrame() {
	const frameStart = performance.now();
	const deltaTime = (frameStart - lastFrameTime) / 1000;
	lastFrameTime = frameStart;

	if (deltaTime > 0) {
		fps = Math.round(1 / deltaTime);
	}

	accumulator += deltaTime;
	if (accumulator > maxAccumulator) {
		accumulator = maxAccumulator;
	}

	while (accumulator >= fixedStep) {
		perFixedStepUpdate();
		accumulator -= fixedStep;
	}

	game.currentPerFrameUpdateFunction();
	render();

	const processTime = performance.now() - frameStart;
	const nextFrameDelay = minDelay - processTime;

	setTimeout(runFrame, Math.max(0, nextFrameDelay));
}

function render() {
	canvas.ctx.fillStyle = "black";
	canvas.ctx.fillRect(0, 0, canvas.width, canvas.height);

	game.currentDrawFunction();
}

game.world.generate(generateNothing, "123", game.player, canvas.scaleRate, images);

runFrame();