export function drawBackgroundCredits(ctx, width, height, bootTime, scaleRate) {
    const elapsed = (performance.now() - bootTime) * 0.001 * scaleRate;

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, width, height);

    const waveCount = 8;
    ctx.globalCompositeOperation = 'screen';

    const centerX = width / 2;
    const centerY = height / 2;
    const maxLen = Math.max(width, height) * 1.2;

    for (let i = 0; i < waveCount; i++) {
        const hue = (i * 40 + elapsed * 40) % 360;
        const baseAngle = (i / waveCount) * Math.PI * 2 + (elapsed * 0.15);

        ctx.strokeStyle = `hsla(${hue}, 80%, 50%, 0.4)`;
        ctx.lineWidth = 40 + Math.sin(elapsed + i) * 20;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();

        let first = true;
        const segments = 6;

        for (let j = 0; j <= segments; j++) {
            const dist = (j / segments) * maxLen - (maxLen / 2);

            const waveFreq = 0.003;
            const primaryOffset = Math.sin(dist * waveFreq + elapsed + i) * 120;
            const secondaryOffset = Math.cos(elapsed * 0.5 + i) * 50;
            const totalOffset = primaryOffset + secondaryOffset;

            const x = centerX + Math.cos(baseAngle) * dist - Math.sin(baseAngle) * totalOffset;
            const y = centerY + Math.sin(baseAngle) * dist + Math.cos(baseAngle) * totalOffset;

            if (first) {
                ctx.moveTo(x, y);
                first = false;
            } else {
                ctx.quadraticCurveTo(centerX + Math.cos(baseAngle) * (dist - 20), centerY + Math.sin(baseAngle) * (dist - 20), x, y);
            }
        }
        ctx.stroke();
    }

    ctx.globalCompositeOperation = 'source-over';
    const grad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, maxLen / 1.5);
    grad.addColorStop(0, 'transparent');
    grad.addColorStop(1, 'black');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
}
