const express = require("express");
const { MongoClient,ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
const uri = "mongodb://localhost:27017";

app.use(express.json());
app.use(cors());


const run = async () => {
  try {
    const client = new MongoClient(uri,  {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        }
    }
    );
    let db = client.db("task_management");
    let taskCollection = db.collection("tasks");
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    // GET tasks for a specific user
    app.get("/api/tasks", async (req, res) => {
      try {
        const { email } = req.query;
        if (!email) {
          return res.status(400).json({ message: "Email is required" });
        }
        const tasks = await taskCollection.find({ email }).toArray();
        res.json(tasks);
      } catch (error) {
        res.status(500).json({ message: "Error fetching tasks", error });
      }
    });

    // POST new task
    app.post("/api/tasks", async (req, res) => {
      try {
        const { title, description, category, email } = req.body;
        if (!title || !category || !email) {
          return res
            .status(400)
            .json({ message: "Title, category, and email are required" });
        }
        const newTask = {
          title,
          description,
          category,
          email,
          timestamp: new Date(),
        };
        const result = await taskCollection.insertOne(newTask);
        res.status(201).json({ ...newTask, id: result.insertedId });
      } catch (error) {
        res.status(500).json({ message: "Error adding task", error });
      }
    });

    // PUT update task
    app.put("/api/tasks/:id", async (req, res) => {
      try {
        const { id } = req.params;
        
        const updatedTask = { $set: { ...req.body } };
        await db
          .collection("tasks")
          .updateOne({ _id: new ObjectId(id) }, updatedTask);
        res.json({ message: "Task updated successfully" });
      } catch (error) {
        res.status(500).json({ message: "Error updating task", error });
      }
    });

    // DELETE task
    app.delete("/api/tasks/:id", async (req, res) => {
      try {
        const { id } = req.params;
        await taskCollection.deleteOne({ _id: new ObjectId(id) });
        res.json({ message: "Task deleted successfully" });
      } catch (error) {
        res.status(500).json({ message: "Error deleting task", error });
      }
    });
  } catch (err) {
    console.log(err);
  }
};

run();
app.get("/", async (req, res) => {
  res.send("server running");
});
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
