import express from "express";
import { pool } from "../db/index.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM user_media JOIN medias ON user_media.media_id = medias.id WHERE user_media.user_id = $1",
      [req.user.id],
    );

    return res.status(200).json(result.rows);
  } catch (err) {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const { external_id, media_type, title, year, cover_url, status } =
      req.body;

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

    const mediaEntry = await pool.query(
      "INSERT INTO medias (external_id, media_type_id, title, year, cover_url) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (external_id, media_type_id) DO NOTHING RETURNING *",
      [external_id, mediaTypeId, title, year, cover_url],
    );

    let mediaId;

    if (mediaEntry.rows.length > 0) {
      mediaId = mediaEntry.rows[0].id;
    } else {
      const existingMedia = await pool.query(
        "SELECT id FROM medias WHERE external_id = $1 AND media_type_id = $2",
        [external_id, mediaTypeId],
      );
      mediaId = existingMedia.rows[0].id;
    }

    const insertMedia = await pool.query(
      "INSERT INTO user_media (user_id, media_id, status) VALUES ($1, $2, $3) ON CONFLICT (user_id, media_id) DO NOTHING RETURNING *",
      [req.user.id, mediaId, status],
    );

    if (insertMedia.rows.length === 0) {
      return res.status(409).json({ message: "Media already in your list" });
    }

    return res.status(201).json({ entry: insertMedia.rows[0] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

export default router;
