import 'dotenv/config';
import express from "express";
import * as fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import handleReaction from './reactions';
import { getGroupByRoomId, getPostsByGroupId, insertPost, deletePost } from './duckdb';

const port = 5058;

const moduleRegistration = {
  id: "publish",
  uuid: uuidv4(),
  url: `http://localhost:${port}`,
  emoji: "🌐",
  introduction: "React to messages with 🌐 to add them to your public api",
  title: "Publish to Web",
  description: "Creates source of posts to the web",
  event_types: [
    "m.reaction"
  ]
}

function generateRegistrationFile() {
  fs.writeFileSync(`./${moduleRegistration.id}.json`, JSON.stringify(moduleRegistration, null, 2));
}

async function start() {

  const app = express();
  app.use(express.json());

  app.get("/", async (req, res) => {
    const htmlPath = path.resolve(__dirname, "../../web/dist/index.html")

    res.sendFile(htmlPath);
  })

  app.post("/", async (req, res) => {
    const { event, botUserId } = req.body;

    let response: { message?: string } | undefined = {};

    console.log("event come through", event)

    if (event.type === "m.reaction")
      response = await handleReaction(event, botUserId);

    console.log(response)

    res.send({ success: true, response });
  });

  app.get("/api/group", async (req, res) => {
    const { roomId } = req.query;

    const group = await getGroupByRoomId(roomId as string);
    console.log(group)

    res.send(group);
  })

  app.get("/api/posts", async (req, res) => {
    const { groupId } = req.query;

    const posts = await getPostsByGroupId(groupId as string);

    res.send(posts);
  })

  app.post("/api/post", async (req, res) => {
    const { groupId } = req.query;
    const { text } = req.body;

    await insertPost(groupId as string, text);

    res.send({ success: true })
  })

  app.delete("/api/post", async (req, res) => {
    const { groupId } = req.query;
    const { text } = req.body;

    await deletePost(groupId as string, text);

    res.send({ success: true })
  })

  app.listen(port);
};

generateRegistrationFile();
start();