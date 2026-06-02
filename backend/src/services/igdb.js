async function getToken() {
  const tokenResponse = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${process.env.TWITCH_CLIENT_ID}&client_secret=${process.env.TWITCH_CLIENT_SECRET}&grant_type=client_credentials`,
    {
      method: "POST",
    },
  );

  const tokenData = await tokenResponse.json();

  return tokenData.access_token;
}

export default async function searchGames(query) {
  const token = await getToken();

  const igdbResponse = await fetch(`https://api.igdb.com/v4/games`, {
    method: "POST",
    headers: {
      "Client-ID": process.env.TWITCH_CLIENT_ID,
      Authorization: `Bearer ${token}`,
    },
    body: `search "${query}"; fields name, cover.url, first_release_date;`,
  });

  const igdbData = await igdbResponse.json();

  const formattedResults = igdbData.map((game) => {
    return {
      external_id: game.id,
      title: game.name,
      cover_url: game.cover ? `https:${game.cover.url}`.replace('t_thumb', 't_cover_big') : null,
      media_type: "game",
      year: game.first_release_date
        ? new Date(game.first_release_date * 1000).getFullYear().toString()
        : null,
    };
  });
  return formattedResults;
}
