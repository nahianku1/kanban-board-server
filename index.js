let express = require("express");
let cors = require("cors");
let dotenv = require("dotenv");
dotenv.config();

let app = express();

app.use(express.json());
app.use(
  cors({
    origin: "*",
    methods: ["GET", "PUT", "POST", "DELETE", "PATCH"],
  })
);

let PORT = process.env.PORT || 5000;

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const uri = process.env.DB_URL;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

app.get("/", async (req, res) => {
  res.send(`Server Running!`);
});

app.post("/create-todos", async (req, res) => {
  try {
    // console.log(req.body);
    await client.connect();
    let result = await client
      .db("kanban-board")
      .collection(`${req.query.collection}`)
      .insertOne({ ...req.body });
    res.send(result);
  } catch (error) {
    console.log(error);
  } finally {
    await client.close();
  }
});

app.put("/update-todos/:id", async (req, res) => {
  try {
    console.log(req.body);
    console.log(req.query);
    await client.connect();
    let result = await client
      .db("kanban-board")
      .collection(`${req.query.collection}`)
      .updateOne({ _id: `${req.params.id}` }, { $set: { ...req.body } });
    if (result.modifiedCount) {
      res.send(result);
    }
  } catch (error) {
    console.log(error);
  } finally {
    await client.close();
  }
});

app.get("/get-todos", async (req, res) => {
  // console.log(req.query.collection);
  try {
    await client.connect();
    let result = await client
      .db("kanban-board")
      .collection(`${req.query.collection}`)
      .find({})
      .toArray();
    // console.log(result);
    res.send(result);
  } catch (error) {
    console.log(error);
  } finally {
    await client.close();
  }
});

app.post("/sorting", async (req, res) => {
  if (req.body.from === req.body.to) {
    try {
      await client.connect();
      let result = await client
        .db("kanban-board")
        .collection(`${req.query.collection}`)
        .deleteMany({});
      if (result.deletedCount) {
        await client.connect();
        let result = await client
          .db("kanban-board")
          .collection(`${req.query.collection}`)
          .insertMany(req.body.list);
        if (result.insertedCount) {
          res.send(`result`);
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      await client.close();
    }
  } else if (req.body.from !== req.body.to && req.body.list?.length > 0) {
    console.log(94, req.body);
    try {
      await client.connect();
      let result = await client
        .db("kanban-board")
        .collection(req.body.from)
        .deleteOne({ _id: `${req.body.item.id}` });
      if (result.deletedCount) {
        await client.db("kanban-board").collection(req.body.to).deleteMany({});

        let result = await client
          .db("kanban-board")
          .collection(req.body.to)
          .insertMany(req.body.list);
        if (result.insertedCount) {
          res.send(`result`);
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      await client.close();
    }
  }
});

app.delete(`/delete-todos/:id`, async (req, res) => {
  console.log(113, req.params.id);
  try {
    await client.connect();
    let result = await client
      .db("kanban-board")
      .collection(req.query.collection)
      .deleteOne({ _id: `${req.params.id}` });
    if (result.deletedCount) {
      res.send(`Deleted ${result.deletedCount} Todo`);
    }
  } catch (error) {
    console.log(error);
  } finally {
    await client.close();
  }
});

app.listen(PORT, () => {
  console.log(`server is running at http://localhost:${PORT}`);
});
