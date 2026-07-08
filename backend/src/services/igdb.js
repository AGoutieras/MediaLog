/**
 * IGDB API Service
 * IGDB uses Twitch OAuth2 for authentication: a token must be obtained
 * from Twitch before each request using client_credentials grant type.
 * Requests to IGDB use the Apicalypse query language in the POST body
 * rather than URL parameters like a standard REST API.
 */

// Fetches a short-lived Twitch access token required to authenticare IGDB requests
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
    // Apicalypse query: select only the fields needed for the frontend
    // platforms.abbreviation provides compact labels (e.g. "PS5" instead of "PlayStation 5")
    body: `search "${query}"; fields name, cover.url, first_release_date, slug, platforms.name, platforms.abbreviation;`,
  });

  const igdbData = await igdbResponse.json();

  const formattedResults = igdbData.map((game) => {
    return {
      external_id: game.id,
      title: game.name,
      // IGDB cover URLs start with // and use t_thumb by default
      // Prepend https: and replace with t_cover_big for higher resolution
      cover_url: game.cover ? `https:${game.cover.url}`.replace('t_thumb', 't_cover_big') : null,
      media_type: "game",
      // first_release_date is a Unix timestamp in seconds
      year: game.first_release_date
        ? new Date(game.first_release_date * 1000).getFullYear().toString()
        : null,
      slug: game.slug,
      // ?? ensures missing platforms data returns an empty array instead of undefined
      platforms: game.platforms ?? []
    };
  });
  return formattedResults;
}

// Fetches platform data for a single game by its IGDB ID
// Used when opening the edit modal, platform list is not stored in the DB
export async function getGameById(id) {
  const token = await getToken();

  const igdbResponse = await fetch(`https://api.igdb.com/v4/games`, {
    method: "POST",
    headers: {
      "Client-ID": process.env.TWITCH_CLIENT_ID,
      Authorization: `Bearer ${token}`,
    },
    // parseInt is required: external_id is stored as a string in the DB
    // but IGDB expects a numeric value in the where clause
    body: `fields platforms.name, platforms.abbreviation; where id = ${parseInt(id)};`
  })

  const igdbData = await igdbResponse.json();

  return igdbData[0]?.platforms ?? []
}
