export default async function searchGames(query)
{
  const rawgResponse = await fetch(`https://api.rawg.io/api/games?search=${query}&key=${process.env.RAWG_API_KEY}`)
  const rawgData = await rawgResponse.json()
  const formattedResults = rawgData.results.map((game) =>
  {
    return {
      external_id: game.id,
      title: game.name,
      cover_url: game.background_image,
      media_type: "game",
      year: game.released?.slice(0, 4)
    }
  })
  return formattedResults
}
