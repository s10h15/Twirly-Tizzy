// ======================= Loading Music =======================
let audioContext, analyser, dataArray, sourceNode;
let currentAudioElement = null;

export function initAudioSystem(audioElement) {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        dataArray = new Uint8Array(analyser.frequencyBinCount);
    }

    if (currentAudioElement !== audioElement) {
        if (sourceNode) sourceNode.disconnect();
        currentAudioElement = audioElement;
        sourceNode = audioContext.createMediaElementSource(audioElement);
        sourceNode.connect(analyser);
        analyser.connect(audioContext.destination);
    }
}

const visualBuffer = document.createElement("canvas");
const bCtx = visualBuffer.getContext("2d");
export function getVisualizerFrame(width, height) {
    if (!analyser) return null;
    if (visualBuffer.width !== width || visualBuffer.height !== height) {
        visualBuffer.width = width;
        visualBuffer.height = height;
    }
    analyser.getByteFrequencyData(dataArray);
    bCtx.clearRect(0, 0, width, height);
    let grad = bCtx.createLinearGradient(0, 0, width, 0);
    grad.addColorStop(0, "#D3D3D3");
    grad.addColorStop(0.25, "#545352");
    grad.addColorStop(0.5, "#D3D3D3");
    grad.addColorStop(0.75, "#545352");
    grad.addColorStop(1, "#D3D3D3");
    bCtx.fillStyle = grad;
    const barWidth = width / dataArray.length;
    for (let i = 0; i < dataArray.length; i++) {
        const barHeight = (dataArray[i] / 255) * height;
        bCtx.fillRect(i * barWidth, height - barHeight, barWidth + 1, barHeight);
    }
    return visualBuffer;
}

export function pauseAudioAdvanced() {
    if (currentAudioElement) {
        currentAudioElement.pause();
    }
}
export function unpauseAudioAdvanced() {
    if (currentAudioElement) {
        currentAudioElement.play();
    }
}

export function restartAudioAdvanced() {
    if (currentAudioElement) {
        currentAudioElement.currentTime = 0;
        currentAudioElement.play();
    }
}

// export function playAudioAdvanced(path, shouldLoop = false, onEndCallback = null, fadeDuration = 0) {
//     if (currentAudioElement) {
//         currentAudioElement.pause();
//         currentAudioElement.onended = null;
//     }

//     const audio = new Audio(path);
//     audio.crossOrigin = "anonymous";
//     audio.loop = shouldLoop;

//     if (fadeDuration > 0) {
//         audio.volume = 0;
//         const step = 0.001;
//         const intervalTime = fadeDuration * step;

//         const fadeInInterval = setInterval(() => {
//             if (audio.volume < 1 - step) {
//                 audio.volume += step;
//             } else {
//                 audio.volume = 1;
//                 clearInterval(fadeInInterval);
//             }
//         }, intervalTime);
//     }

//     audio.onended = () => {
//         if (onEndCallback) onEndCallback();
//     };

//     initAudioSystem(audio);
//     audio.play();
// }

export async function playAudioAdvanced(path, shouldLoop = false, onEndCallback = null, fadeDuration = 0) {
    if (currentAudioElement) {
        currentAudioElement.pause();
        currentAudioElement.onended = null;
    }

    const audio = new Audio(path);
    audio.crossOrigin = "anonymous";
    audio.loop = shouldLoop;
    audio.onended = () => { if (onEndCallback) onEndCallback(); };

    if (fadeDuration > 0) {
        audio.volume = 0;
    }

    initAudioSystem(audio);

    try {
        await audio.play();

        if (fadeDuration > 0) {
            const step = 0.001;
            const intervalTime = fadeDuration * step;

            const fadeInInterval = setInterval(() => {
                if (audio.volume < 1 - step) {
                    audio.volume += step;
                } else {
                    audio.volume = 1;
                    clearInterval(fadeInInterval);
                }
            }, intervalTime);
        }
    } catch (error) {
        console.error("Playback failed or was interrupted:", error);
    }
}

// ======================= Loading Sound Effects =======================
function getAudio(path) {
    return new Promise((resolve, reject) => {
        const audio = new Audio(path);
        audio.addEventListener("canplaythrough", () => resolve(audio), { once: true });
        audio.addEventListener("error", (e) => reject(`Failed to load audio: ${path}`));
    });
}
export async function loadAudioFiles(pathMap) {
    const entries = Object.entries(pathMap);
    const loadedPromises = entries.map(async ([key, path]) => {
        const audio = await getAudio(path);
        return [key, audio];
    });
    const results = await Promise.all(loadedPromises);
    return Object.fromEntries(results);
}
const soundsToLoad = {
    meow: "../SoundEffects/meow.wav",
    click1: "../SoundEffects/click1.mp3",
    hush: "../SoundEffects/hush.mp3",
    scream: "../SoundEffects/scream.mp3",
    stretch1: "../SoundEffects/stretch1.mp3",
    stretch2: "../SoundEffects/stretch2.mp3"
};
const sounds = await loadAudioFiles(soundsToLoad);
export function playEffect(soundKey) {
    const sound = sounds[soundKey];
    if (sound) {
        const soundClone = sound.cloneNode(true);
        soundClone.play();
    }
}