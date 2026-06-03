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

export default router;
