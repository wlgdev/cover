// import { GradientElement, ImageElement, RectElement, TextElement, Badge, BadgeStack } from "./draw.ts";
// import { twitch } from "../services/twitch.ts";
// import { loadImage } from "../app/common.ts";

// const WIDTH = 1280;
// const HEIGHT = 720;
// const WLG_LOGO = "https://pic.rutubelist.ru/user/e7/1c/e71cd9b5bba98ce443fc6ab55a2af7cb.jpg";
// const BG = "https://i.redd.it/ligi1xnkzwe41.jpg";

// const GAMES = ["just chating", "cyberpunk 2077"];
// const HEADING = "Cyberpunk\n2077";
// const DATETIME = ["Пятница", "17:00 МСК"];
// const ROLES = [
//   ["WELOVEGAMES", "Жопэ"],
//   ["Новиночки", "Лось"],
// ];
// const STRIPE_COLOR = "#9047fe";

// export async function renderStreamCanvas(): Promise<HTMLCanvasElement> {
//   const [wlg_logo, bg] = await Promise.all([loadImage(WLG_LOGO), loadImage(BG)]);

//   const canvas = document.createElement("canvas")!;
//   canvas.width = WIDTH;
//   canvas.height = HEIGHT;
//   const ctx = canvas.getContext("2d")!;
//   ctx.imageSmoothingQuality = "high";
//   ctx.imageSmoothingEnabled = true;

//   const root = new ImageElement(ctx)
//     .background(bg, 0, 0)
//     .size([WIDTH, HEIGHT])
//     .add(
//       new GradientElement(ctx)
//         .coord([0, -10])
//         .size([WIDTH * 0.7, HEIGHT + 10])
//         .gradient([
//           [0, "#121212DD"],
//           [0.7, "#00000077"],
//           [1, "#00000000"],
//         ]),
//     )
//     .add(new ImageElement(ctx).background(wlg_logo).coord([1100, 0]).size([180, 180]))
//     .add(new RectElement(ctx).background(STRIPE_COLOR).coord([0, 0]).size([60, HEIGHT]));

//   const heading_y = 360 - (HEADING.split("\n").length - 1) * 120;
//   const heading = new TextElement(ctx)
//     .coord([120, heading_y])
//     .size([700, 0])
//     .lineHeight(120)
//     .text(HEADING, "700 90px Jost");

//   root.add(heading);

//   const datetime = new BadgeStack(ctx)
//     .coord([120, 60])
//     .padding([10, 10])
//     .elements([DATETIME.map((text) => new Badge(ctx).text(text).font("500 35px Jost").background("#AAAAAA50"))]);

//   root.add(datetime);

//   const roles = new BadgeStack(ctx)
//     .coord([120, 490])
//     .padding([20, 20])
//     .elements(
//       ROLES.map((line) => line.map((role) => new Badge(ctx).text(role).font("500 35px Jost").background("#22222288"))),
//     );

//   root.add(new TextElement(ctx).coord([120, 465]).lineHeight(60).text("В ролях", "400 25px Jost"));
//   root.add(roles);

//   let games_block_x = roles.measure()[0] + 120 + 40;
//   root.add(new TextElement(ctx).coord([games_block_x, 465]).lineHeight(60).text("В планах", "400 25px Jost"));

//   const games_cover = await twitch.gameSearch(GAMES);
//   const imgs = await Promise.all(games_cover.map((game: any) => loadImage(game.cover)));

//   console.log(games_cover);

//   for (const img of imgs) {
//     root.add(new ImageElement(ctx).background(img, 14, 0.5).size([130, 170]).coord([games_block_x, 490]));
//     games_block_x += 150;
//   }

//   root.render();
//   return canvas;
// }
