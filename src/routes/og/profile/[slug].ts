import { PlayerEntity } from "@entities";
import { renderAsync } from "@resvg/resvg-js";
import type { RequestHandler } from "@sveltejs/kit";
import { createCanvas, loadImage, registerFont } from "canvas";
import { fillTextWithTwemoji as fillTextWithEmoji } from "node-canvas-with-twemoji-and-discord-emoji";

registerFont("./static/font/soopafresh.ttf", { family: "Soopafresh" });
registerFont("./static/font/Roboto-Bold.ttf", { family: "Roboto", weight: "bold" });
registerFont("./static/font/Roboto-Medium.ttf", { family: "Roboto", weight: "medium" });
registerFont("./static/font/Roboto-Regular.ttf", { family: "Roboto", weight: "normal" });
registerFont("./static/font/Roboto-Thin.ttf", { family: "Roboto", weight: "thin" });

// use this method for now to convert from SVG to PNG instead of showing the SVG directly on the canvas
// there's a bug that causes node-canvas not showing the full path of the SVG
const render = async (look: string): Promise<Buffer> => {
	const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/dressroom/mouse/${look}`);
	const svg = await response.text();

	const buffer = await renderAsync(svg, {
		imageRendering: 1,
		fitTo: {
			mode: "width",
			value: 225,
		},
	});
	return buffer;
};

export const get: RequestHandler = async ({ params }) => {
	const { slug } = params;

	// fetch data from API
	const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/players/${slug}`);
	if (response.status !== 200) return { status: response.status };
	const profile = new PlayerEntity(await response.json());
	const [title, outfit] = await Promise.all([profile.getTitle(), render(profile.shop.look)]);

	// create canvas
	const canvas = createCanvas(1200, 600);
	const ctx = canvas.getContext("2d");

	// draw background
	ctx.fillStyle = "#ebebeb";
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	const leftMargin = 50;
	const topMargin = 100;

	// draw outfit
	const outfitWidth = 225;
	const outfitHeight = 300;
	const outfitImage = await loadImage(outfit);
	ctx.drawImage(outfitImage, leftMargin, 0, outfitWidth, outfitHeight);

	// draw name
	const [name, tag] = profile.name.split("#");
	ctx.shadowColor = "black";
	ctx.shadowBlur = 6;
	ctx.strokeStyle = "#1E1E1E";
	ctx.lineWidth = 6;

	// draw name
	const nameFontSize = 64;
	const nameX = leftMargin + outfitWidth + 24;
	const nameY = topMargin;
	ctx.fillStyle = "#009C9C";
	ctx.font = `${nameFontSize}px Soopafresh`;
	ctx.strokeText(name, nameX, topMargin);
	ctx.fillText(name, nameX, nameY);
	const { width: nameWidth } = ctx.measureText(name);

	// draw tag
	const tagFontSize = nameFontSize * 0.65;
	const tagX = nameX + nameWidth + 10;
	const tagY = nameY;
	ctx.fillStyle = "#5F5F8E";
	ctx.font = `${tagFontSize}px Soopafresh`;
	ctx.strokeText("#" + tag, tagX, tagY);
	ctx.fillText("#" + tag, tagX, tagY);

	ctx.fillStyle = "#5D646D";
	ctx.shadowBlur = 0;
	ctx.lineWidth = 0;

	// draw title
	const titleFontSize = 32;
	const titleX = nameX;
	const titleY = topMargin + titleFontSize + 32;
	ctx.font = `bold ${titleFontSize}px Roboto`;
	ctx.fillText(`« ${title} »`, titleX, titleY);

	// draw soulmate
	const soulmateX = nameX;
	let soulmateY = titleY;
	if (profile.soulmate) {
		const soulmateFontSize = 32;
		soulmateY += +soulmateFontSize + 16;
		ctx.font = `light ${soulmateFontSize}px Roboto`;
		await fillTextWithEmoji(ctx, `♥ ${profile.soulmate.name}`, soulmateX, soulmateY);
	}

	// draw tribe
	if (profile.tribe) {
		const tribeFontSize = 32;
		const tribeX = nameX;
		const tribeY = soulmateY + tribeFontSize + 16;
		ctx.fillStyle = "#5D646D";
		ctx.font = `light ${tribeFontSize}px Roboto`;
		await fillTextWithEmoji(ctx, `🏠 ${profile.tribe.name}`, tribeX, tribeY);
	}

	// draw bottom bg & icon
	const [backgroundImage, cheese] = await Promise.all([
		loadImage("./static/img/x_bar.jpg"),
		loadImage("./static/img/cheese.png"),
	]);
	ctx.drawImage(backgroundImage, -100, 310, 1400, 700);
	const iconX = 1025;
	const iconY = 25;
	ctx.drawImage(cheese, iconX, iconY, 80, 48);

	// draw cfm
	ctx.font = `24px Soopafresh`;
	ctx.fillStyle = "#BC249A";
	ctx.shadowColor = "black";
	ctx.shadowBlur = 4;
	ctx.strokeStyle = "#1E1E1E";
	ctx.lineWidth = 4;

	const { width: cfmWidth } = ctx.measureText(name);
	const cfmX = iconX - cfmWidth;
	const cfmY = iconY + 50;
	ctx.strokeText("CheeseForMice", cfmX, cfmY);
	ctx.fillText("CheeseForMice", cfmX, cfmY);

	// TODO implement stats
	// shaman stats
	// const shamanFontSize = 28;
	// const shamanX = leftMargin;
	// const shamanY = 380;
	// ctx.font = `light ${shamanFontSize}px Roboto`;
	// ctx.fillText("Shaman Saves", shamanX, shamanY);

	const buffer = canvas.toBuffer("image/png", { compressionLevel: 1 });

	return {
		headers: {
			"Content-Type": "image/png",
			"Cache-Control": "public, max-age=144400",
		},
		body: buffer,
	};
};