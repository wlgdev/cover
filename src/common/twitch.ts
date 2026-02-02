import { Twitch } from "@shevernitskiy/scraperator";

export type CategoryMetadata = { name: string; cover: string; tags: string[] };

const twitch = new Twitch("welovegames");

export async function search(query: string[], boxart_quality = "285x380"): Promise<CategoryMetadata[][]> {
  const result = await twitch.searchGames(query, boxart_quality);

  return result.map((game) => {
    return game.map((item) => {
      return {
        name: item.name,
        cover: item.thumbnail,
        tags: [],
      };
    });
  });
}
