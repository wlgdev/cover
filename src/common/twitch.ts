const GQL_URL = "https://gql.twitch.tv/gql" as const;
const CLIENT_ID = "kimne78kx3ncx6brgo4mv6wki5h1ko" as const;

export type CategoryMetadata = { name: string; cover: string; tags: string[] };

export async function search(query: string[], boxart_quality = "285x380"): Promise<CategoryMetadata[][]> {
  const data = await gql(query.map((item) => request.SearchResultsPage_SearchResults(item)));
  const out = data.map((item) => response.SearchResultsPage_SearchResults(item));

  const sorted = out.map((game, index) => {
    if (!game || game.length === 0)
      return [
        {
          name: "Nothing found",
          cover: "https://static-cdn.jtvnw.net/ttv-static/404_boxart.jpg",
          tags: [],
        },
      ];
    const target_index = game.findIndex((item: any) => item.name.toLowerCase() === query[index].toLowerCase());
    if (target_index) {
      const target = game.splice(target_index, 1)[0];
      game.unshift(target);
    }
    game.forEach((item: any) => {
      if (!item) return;
      item.cover = item?.cover
        ? item.cover.replace("90x120", boxart_quality)
        : "https://static-cdn.jtvnw.net/ttv-static/404_boxart.jpg";
    });

    return game;
  });

  return sorted;
}

async function gql(execute: any[]): Promise<any[]> {
  const res = await fetch(GQL_URL, {
    headers: {
      "Client-Id": CLIENT_ID,
    },
    method: "POST",
    body: JSON.stringify(execute),
  });

  const data = await res.json();
  return data;
}

const ext = (sha: string, version = 1) => {
  return {
    extensions: {
      persistedQuery: {
        version: version,
        sha256Hash: sha,
      },
    },
  };
};

const request = {
  SearchResultsPage_SearchResults: (query: string) => {
    return {
      operationName: "SearchResultsPage_SearchResults",
      variables: {
        query: query,
        options: null,
        requestID: crypto.randomUUID(),
      },
      ...ext("6ea6e6f66006485e41dbe3ebd69d5674c5b22896ce7b595d7fce6411a3790138"),
    };
  },
};

const response = {
  SearchResultsPage_SearchResults: (data: any) => {
    const edgdes = data.data.searchFor?.games?.edges;
    if (!edgdes) return [];
    const out = edgdes?.map((edge: any) => ({
      name: edge.item.name as string,
      cover: edge.item.boxArtURL as string,
      tags: edge.item.tags.map((tag: any) => tag.tagName) as string[],
    }));

    return out;
  },
};
