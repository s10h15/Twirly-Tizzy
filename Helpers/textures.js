export function createTexture(width, height, drawCallback) {
    const offscreen = new OffscreenCanvas(width, height);
    const ctx = offscreen.getContext("2d");
    ctx.imageSmoothingEnabled = false; 
    drawCallback(ctx);
    return offscreen; 
}
