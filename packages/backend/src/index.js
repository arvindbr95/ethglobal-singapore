// packages/backend/src/index.js

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const port = 3001;

// Middleware for parsing JSON bodies
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:3000",
  })
);
// MongoDB connection
mongoose
  .connect("mongodb://localhost:27017/lerna-backend", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB", err));

const AuditReportSchema = new mongoose.Schema({
  smartContractId: String,
  ownerWalletId: String,
  reportContent: Object,
  verified: Boolean,
});

const AuditReport = mongoose.model("AuditReport", AuditReportSchema);

// Example endpoint to create a user
app.post("/report", async (req, res) => {
  const { smartContractId, ownerWalletId, reportContent, verified } = req.body;
  const user = new AuditReport({
    smartContractId,
    ownerWalletId,
    reportContent,
    verified,
  });

  try {
    const savedAuditReport = await user.save();
    res.status(201).send(savedAuditReport);
  } catch (err) {
    res.status(400).send(err);
  }
});

app.get("/report/:id", async (req, res) => {
  try {
    const user = await AuditReport.findById(req.params.id, null, {
      _id: -1,
    });
    res.send(user);
  } catch (err) {
    res.status(500).send(err);
  }
});

app.get("/reportIdForSmartContract/:smartContractId", async (req, res) => {
  try {
    console.log("req.params.smartContractId", req.params.smartContractId);
    const users = await AuditReport.find({
      smartContractId: req.params.smartContractId,
    })
      .sort({ _id: -1 }) // Sort in descending order
      .limit(1); // Limit to 1 document

    console.log("users", users);

    res.send(users[0]);
  } catch (err) {
    res.status(500).send(err);
  }
});

app.listen(port, () => {
  console.log(`Backend listening at http://localhost:${port}`);
});
