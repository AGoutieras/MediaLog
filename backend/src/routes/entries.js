import express from "express";
import { pool } from "../db/index.js";

const router = express.Router();

// ------ GET /entries ------------------------------------------

router.get('/', async (req, res) => {
  try {
    // JOIN across 3 tables to reconstruct full entry data:
    // user_media holds user-specific state (status, rating, note, dates...)
    // medias holds shared metadata (title, cover, year, slug)
    // media_types resolves the type ID to a readable string (game/movie/series)
    const result = await pool.query(
      `SELECT user_media.*, medias.external_id, medias.slug, medias.title, medias.year, medias.cover_url, media_types.name AS media_type
       FROM user_media
       JOIN medias ON user_media.media_id = medias.id
       JOIN media_types ON medias.media_type_id = media_types.id
       WHERE user_media.user_id = $1
       ORDER BY user_media.created_at DESC`,
      [req.user.id]
    )
    return res.status(200).json(result.rows)
  } catch (err) {
    return res.status(500).json({ message: 'Internal server error' })
  }
})

// ------ POST /entries ------------------------------------------

router.post("/", async (req, res) => {
  try {
    const {
      external_id,
      slug,
      media_type,
      title,
      year,
      cover_url,
      status,
      note,
      rating,
      start_date,
      end_date,
      watched_before,
      platform,
      completion_percentage,
      playtime_hours
    } = req.body;

    // Resolve the media type name to its UUID in the media_types lookup table
    const result = await pool.query(
      "SELECT id FROM media_types WHERE name = $1",
      [media_type],
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        message: "Invalid media type",
      });
    }

    const mediaTypeId = result.rows[0].id;

    // Upsert the media record: if the same external_id + media_type already exists
    // (e.g. another user added the same game), update cover_url and slug instead of
    // inserting a duplicate, media metadata is shared across all users
    const mediaEntry = await pool.query(
      "INSERT INTO medias (external_id, slug, media_type_id, title, year, cover_url) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (external_id, media_type_id) DO UPDATE SET cover_url = EXCLUDED.cover_url, slug = EXCLUDED.slug RETURNING *",
      [external_id, slug, mediaTypeId, title, year, cover_url],
    );

    const mediaId = mediaEntry.rows[0].id

    // Insert the user-specific entry, DO NOTHING on conflict means the same user
    // cannot add the same media twice; an empty result triggers a 409 response
    // ?? (nullish coalescing) is used instead of || to avoid overwriting valid
    // falsy values like 0 (completion_percentage, playtime hours)
    const insertMedia = await pool.query(
      `INSERT INTO user_media 
        (user_id, media_id, status, note, rating, start_date, end_date, watched_before, platform, completion_percentage, playtime_hours) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
      ON CONFLICT (user_id, media_id) DO NOTHING RETURNING *`,
      [
        req.user.id,
        mediaId,
        status,
        note,
        rating,
        start_date ?? null,
        end_date ?? null,
        watched_before ?? false,
        platform ?? null,
        completion_percentage ?? null,
        playtime_hours ?? null
      ],
    );

    if (insertMedia.rows.length === 0) {
      return res.status(409).json({ message: "Media already in your list" });
    }

    return res.status(201).json({ entry: insertMedia.rows[0] });
  } catch (err) {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

// ------ PUT /entries/:id ------------------------------------------

router.put("/:id", async (req, res) => {
  try {
    const {
      status,
      rating,
      note,
      start_date,
      end_date,
      watched_before,
      platform,
      completion_percentage,
      playtime_hours,
    } = req.body;
    const id = req.params.id;

    // WHERE user_id = $10 ensures a user can only update their own entries
    const updatedEntry = await pool.query(
      `UPDATE user_media SET 
        status = $1, 
        rating = $2, 
        note = $3, 
        start_date = $4, 
        end_date = $5, 
        watched_before = $6, 
        platform = $7, 
        completion_percentage = $8,
        playtime_hours = $9
      WHERE user_id = $10 AND id = $11 RETURNING *`,
      [
        status,
        rating,
        note,
        start_date ?? null,
        end_date ?? null,
        watched_before ?? false,
        platform ?? null,
        completion_percentage ?? null,
        playtime_hours ?? null,
        req.user.id,
        id,
      ],
    );

    if (updatedEntry.rows.length === 0) {
      return res.status(404).json({ message: "entry not found" });
    }

    return res.status(200).json({ entry: updatedEntry.rows[0] });
  } catch (err) {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

// ------ DELETE /entries/:id ------------------------------------------

router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;

    // WHERE user_id = $1 prevents a user from deleting another user's entries
    // The medias record is intentionally kept, it may still be referenced by other users
    const result = await pool.query(
      "DELETE FROM user_media WHERE user_id = $1 AND id = $2 RETURNING *",
      [req.user.id, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Entry not found" });
    }

    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;