// index.js
const express = require("express");
const axios = require("axios");
const connectDB = require("./connect");
const { Parser } = require("json2csv");
const PDFDocument = require("pdfkit");
const User = require("./models/User");

const app = express();
const port = 3000;

// Connect to MongoDB
connectDB();

// Middleware for JSON requests
app.use(express.json());

//api for end point ('/')
app.get("/", (req, res) => {
  console.log("welcome to the project");
  res.status(200).json({ message: "welcome to the project" });
});

//////////////////////////////////////////////////////////////////////////////////////////////////
////// Extract and load users into MongoDB////////////////////////////////////////////////////////
app.get("/api/fetch-users", async (req, res) => {
  try {
    const response = await axios.get("https://dummyjson.com/users");
    const users = response.data.users;

    // Load users into MongoDB
    await User.insertMany(users);
    res.status(200).json({ message: "Users fetched and stored in MongoDB" });
  } catch (error) {
    console.error("Error fetching users:", error.message);
    res.status(500).json({ message: "Error fetching users" });
  }
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////
// Extract, Transform, and Load (ETL process) for user metrics /////////////////////////////////////////
app.get("/api/users/metrics", async (req, res) => {
  try {
    // Extract users from MongoDB
    const users = await User.find();

    // Transform: Calculate metrics (e.g., average age, gender distribution)
    const totalUsers = users.length;
    const totalAge = users.reduce((acc, user) => acc + user.age, 0);
    const avgAge = totalUsers ? totalAge / totalUsers : 0;

    const genderDistribution = users.reduce((acc, user) => {
      acc[user.gender] = (acc[user.gender] || 0) + 1;
      return acc;
    }, {});

    // Load: Return transformed data (metrics)
    res.status(200).json({
      totalUsers,
      avgAge,
      genderDistribution,
    });
  } catch (error) {
    console.error("Error fetching metrics:", error.message);
    res.status(500).json({ message: "Error fetching metrics" });
  }
});

///////////////////////////////////////////////////////////////////////////////////////
// CSV Report Endpoint/////////////////////////////////////////////////////////////////
app.get("/api/report/csv", async (req, res) => {
  try {
    const users = await User.find(); // Fetch users from MongoDB

    const fields = [
      "id",
      "firstName",
      "lastName",
      "age",
      "email",
      "gender",
      "phone",
    ];
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(users);

    // Set the response header to force download the file
    res.header("Content-Type", "text/csv");
    res.attachment("users-report.csv");
    res.send(csv);
  } catch (error) {
    console.error("Error generating CSV report:", error.message);
    res.status(500).json({ message: "Error generating CSV report" });
  }
});

///////////////////////////////////////////////////////////////////////////////////////
////////////////////CSV Report Endpoint///////////////////////////////////////////////
app.get("/api/report/pdf", async (req, res) => {
  try {
    const users = await User.find(); // Fetch users from MongoDB

    const doc = new PDFDocument();
    let filename = "users-report";
    filename = encodeURIComponent(filename) + ".pdf";

    // Set the response header to force download
    res.setHeader("Content-disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-type", "application/pdf");

    // Write some basic info into the PDF
    doc.fontSize(16).text("Users Report", {
      align: "center",
    });

    users.forEach((user) => {
      doc
        .fontSize(12)
        .text(`ID: ${user.id}`)
        .text(`Name: ${user.firstName} ${user.lastName}`)
        .text(`Age: ${user.age}`)
        .text(`Email: ${user.email}`)
        .text(`Gender: ${user.gender}`)
        .text(`Phone: ${user.phone}`)
        .moveDown();
    });

    doc.pipe(res);
    doc.end();
  } catch (error) {
    console.error("Error generating PDF report:", error.message);
    res.status(500).json({ message: "Error generating PDF report" });
  }
});

/////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////mail alert///////////////////////////////////////////////////////////

const { sendEmail } = require("./email");

// Example: Alert when a specific condition is met
app.get("/api/check-users", async (req, res) => {
  try {
    const userCount = await User.countDocuments();

    if (userCount > 100) {
      sendEmail(
        "User Count Alert",
        `The number of users has exceeded 100. Current count: ${userCount}`
      );
    }

    res.status(200).json({
      message: "User count checked",
      userCount,
    });
  } catch (error) {
    console.error("Error checking user count:", error.message);
    res.status(500).json({ message: "Error checking user count" });
  }
});


/////////////////////////////////////////////////////////////////////////////////////
// Start the server//////////////////////////////////////////////////////////////////
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
