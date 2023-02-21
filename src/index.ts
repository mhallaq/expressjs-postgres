// import bodyParser from "body-parser";
// import express from "express";
// import pg from "pg";

// // Connect to the database using the DATABASE_URL environment
// //   variable injected by Railway
// const pool = new pg.Pool();

// const app = express();
// const port = process.env.PORT || 3333;

// app.use(bodyParser.json());
// app.use(bodyParser.raw({ type: "application/vnd.custom-type" }));
// app.use(bodyParser.text({ type: "text/html" }));

// app.get("/", async (req, res) => {
//   const { rows } = await pool.query("SELECT NOW()");
//   res.send(`Hello, World! The time from the DB is ${rows[0].now}`);
// });

// app.listen(port, () => {
//   console.log(`Example app listening at http://localhost:${port}`);
// });

import express, { Application, Request, Response } from "express";
import cors from "cors";
import pool from "./dbConnection";
import { Pool } from "pg";
import { json, urlencoded } from "body-parser";

const app: Application = express();
const port: number | string = process.env.PORT || 3333;

app.use(cors());
app.use(urlencoded({ extended: true }));
app.use(json()); // To parse the incoming requests with JSON payloads
// Store and retrieve your videos from here
// If you want, you can copy "exampleresponse.json" into here to have some data to work with
// let videos = require("../exampleresponse.json");

// GET "/"
app.get("/videos", async (req: Request, res: Response) => {
  try {
    const allVideos = await pool.query("SELECT * FROM videos");
    res.json(allVideos.rows);
  } catch (err: any) {
    console.error(err.message);
  }
});

// GET a video by ID

app.get("/videos/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const video = await pool.query("SELECT * FROM videos WHERE id = $1", [id]);

    if (video.rows.length === 0) {
      return res.status(404).json({ message: "No data found" });
    }

    res.json(video.rows[0]);
  } catch (err: any) {
    console.error(err.message);
  }
});

// POST a new Video

app.post("/videos", async (req: Request, res: Response) => {
  try {
    const { title, url } = req.body;
    if (!title || !url) {
      return res
        .status(400)
        .json({ result: "failure", message: "Title and URL are required" });
    }
    const newVideo = await pool.query(
      "INSERT INTO VIDEOS (title,url,rating) VALUES($1, $2, $3) RETURNING *",
      [title, url, 0]
    );
    res.json(newVideo.rows[0]);
  } catch (err: any) {
    console.log(err.message);
  }
});

// Delete a video by id

app.delete("/videos/:id", async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  try {
    const result = await pool.query("DELETE FROM videos WHERE id = $1", [id]);
    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ result: "failure", message: "Video not found" });
    }
    res.json({ result: "success" });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({
      result: "failure",
      message: "An error occurred while deleting the video",
    });
  }
});

//Change the rating of the Videos

app.put("/videos/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const vote = parseInt(req.body.vote);
    const { rows } = await pool.query(
      "UPDATE videos SET rating = rating + $1 WHERE id = $2 RETURNING *",
      [vote, id]
    );
    res.json(rows[0]);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`Video app listening at http://localhost:${port}`);
});
