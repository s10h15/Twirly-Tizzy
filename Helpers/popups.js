export function drawWinOnContext(ctx, width, height, scaleRate, bootTime) {
    const elapsed = performance.now() - bootTime;
    const rectW = width * 0.7;
    const rectH = height * 0.5;
    const x = (width - rectW) / 2;
    const y = (height - rectH) / 2;
    const centerX = width / 2;
    const centerY = height / 2;

    ctx.save();
    ctx.shadowBlur = 30;
    ctx.shadowColor = "rgba(138, 43, 226, 0.7)";

    const panelGrad = ctx.createLinearGradient(x, y, x + rectW, y + rectH);
    panelGrad.addColorStop(0, "rgba(20, 0, 40, 0.9)");
    panelGrad.addColorStop(1, "rgba(5, 0, 15, 0.95)");

    ctx.fillStyle = panelGrad;
    ctx.beginPath();
    ctx.roundRect(x, y, rectW, rectH, 24);
    ctx.fill();

    ctx.lineWidth = 2;
    ctx.strokeStyle = `hsla(${(elapsed * 0.05) % 360}, 70%, 60%, 0.8)`;
    ctx.stroke();
    ctx.restore();

    const perimeter = (rectW + rectH) * 2;
    const particleCount = 40;

    for (let i = 0; i < particleCount; i++) {
        const speed = 0.15;
        const offset = (i / particleCount) * perimeter;
        let distance = (elapsed * speed + offset) % perimeter;

        let px, py;
        if (distance < rectW) {
            px = x + distance;
            py = y;
        } else if (distance < rectW + rectH) {
            px = x + rectW;
            py = y + (distance - rectW);
        } else if (distance < rectW * 2 + rectH) {
            px = x + rectW - (distance - (rectW + rectH));
            py = y + rectH;
        } else {
            px = x;
            py = y + rectH - (distance - (rectW * 2 + rectH));
        }

        const size = 2 + Math.sin(elapsed * 0.01 + i) * 1.5;
        ctx.fillStyle = `hsla(${(elapsed * 0.1 + i * 10) % 360}, 100%, 75%, 0.6)`;
        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fill();
    }

    const fontSize = rectW * 0.09;
    ctx.font = `italic 900 ${fontSize}px "Segoe UI", Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const text = "ТЫ ПОБЕДИЛ :333!111";
    const textWidth = ctx.measureText(text).width;
    let startX = centerX - textWidth / 2;

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const charWidth = ctx.measureText(char).width;

        const yOffset = Math.sin(elapsed * 0.005 + i * 0.5) * 8;
        const hue = (elapsed * 0.1 + i * 20) % 360;

        ctx.save();
        ctx.shadowBlur = 15;
        ctx.shadowColor = `hsl(${hue}, 100%, 50%)`;
        ctx.fillStyle = `hsl(${hue}, 80%, 70%)`;
        ctx.fillText(char, startX + charWidth / 2, centerY + yOffset);
        ctx.restore();

        startX += charWidth;
    }

    ctx.font = `500 ${fontSize * 0.3}px Monospace`;
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.fillText("я ебал твою мать", centerX, centerY + fontSize * 1.2);
}
