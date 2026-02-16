export function drawNameMenu(ctx, width, height, yFraction, bootTime, shouldDrawExtra, images) {
    const text = "Twirly-Tizzy";
    const elapsed = (performance.now() - bootTime) / 1000;

    const fontSize = Math.floor(height * 0.14);
    ctx.font = `900 ${fontSize}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.lineJoin = "round";
    ctx.lineWidth = fontSize * 0.08;

    const centerY = height * yFraction;
    const totalWidth = ctx.measureText(text).width;
    let currentX = (width - totalWidth) / 2;

    const colorPhase = Math.sin(elapsed * 4) > 0;

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const charWidth = ctx.measureText(char).width;

        const direction = i % 2 === 0 ? 1 : -1;
        const wiggle = Math.sin(elapsed * 3) * 4 * direction;

        const isLetterEven = i % 2 === 0;
        const useWhiteFill = colorPhase ? isLetterEven : !isLetterEven;

        const fillStyle = useWhiteFill ? "white" : "black";
        const strokeStyle = useWhiteFill ? "black" : "white";

        ctx.save();
        ctx.translate(currentX + charWidth / 2, centerY + wiggle);

        ctx.strokeStyle = strokeStyle;
        ctx.strokeText(char, 0, 0);

        ctx.fillStyle = fillStyle;
        ctx.fillText(char, 0, 0);

        ctx.restore();
        currentX += charWidth;
    }

    if (shouldDrawExtra) {
        ctx.drawImage(images.arrows, 0, 0, width, height);
    }
}
