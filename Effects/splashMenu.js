export function drawSplashMenu(ctx, width, height, yFraction, bootTime, shouldDrawExtra, images, splash) {
    const elapsed = (performance.now() - bootTime) / 1000;

    const splashColor = (splash.color !== undefined) ? splash.color : "#ffffffff";
    const splashText = splash.text || "";

    const fontSize = Math.min(Math.floor(height * 0.05), Math.floor(height * 0.05) / (splash.text.length * 0.05));
    ctx.font = `900 ${fontSize}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const pulse = 1 + 0.05 * Math.sin(elapsed * 1 * Math.PI * 2);

    const centerX = width * 0.7;
    const centerY = height * yFraction + height * 0.08;

    ctx.save();

    ctx.translate(centerX, centerY);
    ctx.rotate(-20 * Math.PI / 180);
    ctx.scale(pulse, pulse);

    ctx.fillStyle = splash.color;
    ctx.globalAlpha = 0.3;
    ctx.fillText(splashText, 2, 2);
    ctx.globalAlpha = 1;

    ctx.fillStyle = splashColor;
    ctx.fillText(splashText, 0, 0);

    ctx.restore();

    if (shouldDrawExtra) {
        ctx.drawImage(images.arrows, 0, 0, width, height);
    }
}
