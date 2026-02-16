export function getConsole(config) {
    const DEFAULT_FADE_DELAY = 4000;
    const FADE_DURATION_MS = 500;

    const gameConsole = {
        canvasWidth: config.canvasWidth,
        canvasHeight: config.canvasHeight,
        posX: config.isInLeftCorner ? 0 : (config.canvasWidth - config.width),
        posY: 0,
        sizeX: config.width,
        sizeY: config.height,
        scaleRate: config.scaleRate,

        messages: [],
        maxMessages: config.maxMessages,
        fontName: "Monospace",
        backgroundColor: "rgba(0, 0, 0, 0)",
        borderColor: "rgba(116, 116, 116, 0)",

        padding: 10 * config.scaleRate,

        clear() {
            this.messages.length = 0;
        },

        clearAndTell(text, fadeDelay = DEFAULT_FADE_DELAY, color = "white") {
            this.clear();
            this.addMessage(text, fadeDelay, color);
        },

        addMessage(text, fadeDelay = DEFAULT_FADE_DELAY, color = "white") {
            let selection = text;

            if (Array.isArray(text)) {
                selection = text[Math.floor(Math.random() * text.length)];
            }

            const linesToAdd = Array.isArray(selection) ? selection : [selection];

            linesToAdd.forEach(line => {
                this.messages.push({
                    text: line,
                    creationTime: performance.now(),
                    fadeDelay: fadeDelay,
                    opacity: 1,
                    color: color,
                });
            });

            while (this.messages.length > this.maxMessages) {
                this.messages.shift();
            }
        },

        draw(ctx) {
            ctx.save();
            const now = performance.now();

            this.messages = this.messages.filter(msg => msg.opacity > 0);

            ctx.fillStyle = this.backgroundColor;
            ctx.fillRect(this.posX, this.posY, this.sizeX, this.sizeY);

            ctx.strokeStyle = this.borderColor;
            ctx.lineWidth = 2 * this.scaleRate;
            ctx.strokeRect(this.posX, this.posY, this.sizeX, this.sizeY);

            const fontSize = 40 * config.scaleRate;
            ctx.font = `${fontSize}px ${this.fontName}`;
            ctx.textAlign = "left";
            ctx.textBaseline = "top";

            for (let i = 0; i < this.messages.length; i++) {
                const msg = this.messages[i];
                const timeElapsed = now - msg.creationTime;

                if (timeElapsed >= msg.fadeDelay) {
                    const fadeTimeElapsed = timeElapsed - msg.fadeDelay;
                    msg.opacity = 1 - (fadeTimeElapsed / FADE_DURATION_MS);

                    if (msg.opacity < 0) msg.opacity = 0;
                }

                ctx.fillStyle = msg.color;
                ctx.globalAlpha = msg.opacity;

                const msgY = this.posY + this.padding + (i * fontSize);
                const maxWidth = this.sizeX - (this.padding * 2);
                ctx.fillText(msg.text, this.posX + this.padding, msgY, maxWidth);
                ctx.globalAlpha = 1;
            }
            ctx.restore();
        }
    };

    return gameConsole;
}