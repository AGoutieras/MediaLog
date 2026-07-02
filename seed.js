// seed.js
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjhmYjY4MjNjLWZkNTMtNDE3Zi04ZGYxLTlkMTMzZmI4ZWZhZiIsImVtYWlsIjoiYWRtaW4yQG1lZGlhbG9nLmlvIiwidXNlcm5hbWUiOiJBZG1pbjIiLCJpYXQiOjE3ODI5OTQwMjAsImV4cCI6MTc4MzA4MDQyMH0.3ODUP-FMx1Pi9fdtUPjB6f-I_WiwK0m6FrxpwozDRsY'

const entries = [
  {
    external_id: '1942',
    slug: 'the-witcher-3-wild-hunt',
    media_type: 'game',
    title: 'The Witcher 3: Wild Hunt',
    year: '2015',
    cover_url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1wyy.jpg',
    status: 'Done',
    rating: 5,
    platform: 'PC',
    playtime_hours: 120,
    completion_percentage: 85,
  },
  {
    external_id: '11397',
    slug: 'yakuza-0',
    media_type: 'game',
    title: 'Yakuza 0',
    year: '2015',
    cover_url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co252x.jpg',
    status: 'Done',
    rating: 4.5,
    platform: 'PS4',
    playtime_hours: 60,
  },
  {
    external_id: '121',
    slug: 'hades',
    media_type: 'game',
    title: 'Hades',
    year: '2020',
    cover_url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co7jfe.jpg',
    status: 'In Progress',
    platform: 'PC',
    playtime_hours: 30,
    completion_percentage: 40,
  },
  {
    external_id: '119388',
    slug: 'elden-ring',
    media_type: 'game',
    title: 'Elden Ring',
    year: '2022',
    cover_url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co4jni.jpg',
    status: 'Planned',
    platform: 'PS5',
  },
  {
    external_id: '550',
    slug: null,
    media_type: 'movie',
    title: 'Fight Club',
    year: '1999',
    cover_url: 'https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
    status: 'Done',
    rating: 5,
    start_date: '2024-03-15',
  },
  {
    external_id: '238',
    slug: null,
    media_type: 'movie',
    title: 'The Godfather',
    year: '1972',
    cover_url: 'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsLMdL73KsPyd.jpg',
    status: 'Done',
    rating: 4.5,
    start_date: '2023-11-20',
  },
  {
    external_id: '27205',
    slug: null,
    media_type: 'movie',
    title: 'Inception',
    year: '2010',
    cover_url: 'https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg',
    status: 'In Progress',
  },
  {
    external_id: '680',
    slug: null,
    media_type: 'movie',
    title: 'Pulp Fiction',
    year: '1994',
    cover_url: 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
    status: 'Planned',
  },
  {
    external_id: '1396',
    slug: null,
    media_type: 'series',
    title: 'Breaking Bad',
    year: '2008',
    cover_url: 'https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
    status: 'Done',
    rating: 5,
    start_date: '2023-01-10',
    end_date: '2023-02-28',
  },
  {
    external_id: '1399',
    slug: null,
    media_type: 'series',
    title: 'Game of Thrones',
    year: '2011',
    cover_url: 'https://image.tmdb.org/t/p/w500/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg',
    status: 'Done',
    rating: 4,
    start_date: '2022-06-01',
    end_date: '2022-09-15',
  },
  {
    external_id: '66732',
    slug: null,
    media_type: 'series',
    title: 'Stranger Things',
    year: '2016',
    cover_url: 'https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg',
    status: 'In Progress',
    start_date: '2024-06-01',
    watched_before: true,
  },
  {
    external_id: '1418',
    slug: null,
    media_type: 'series',
    title: 'The Big Bang Theory',
    year: '2007',
    cover_url: 'https://image.tmdb.org/t/p/w500/ooBGRQBdbGzBV2NT1fRs9suQvDp.jpg',
    status: 'Planned',
  },
]

async function seed() {
  for (const entry of entries) {
    try {
      const res = await fetch('http://localhost:3000/entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${TOKEN}`,
        },
        body: JSON.stringify(entry),
      })
      const data = await res.json()
      if (res.status === 201) {
        console.log(`✅ ${entry.title}`)
      } else {
        console.log(`⚠️  ${entry.title}: ${data.message}`)
      }
    } catch (err) {
      console.log(`❌ ${entry.title}: ${err.message}`)
    }
  }
}

seed()