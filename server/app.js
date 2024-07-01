
import { connect } from "./db/connection.js";
import { setupMiddlewares } from "./initmiddleware.js";
import fs from "fs";
import { upload } from "./db/connection.js";
import { convertXlsxToCsv } from "./utils/xlstocsv.js";
import express from "express";
import csvtojson from 'csvtojson';
import { Company,Contact } from "./db/schemas.js";

const app = express();
setupMiddlewares(app);
app.use("/sheets",express.static("sheets"));


app.post("/upload-files-company", upload.single("file"), async (req, res) => {
  const filePath = "./sheets/" + req.file.filename;
  console.log("File Uploaded:", filePath);

  try {
    const fileExtension = req.file.originalname.split(".").pop().toLowerCase();

    if (fileExtension === "xlsx" || fileExtension === "xls") {
      const csvFilePath = filePath.replace(".xlsx", ".csv");
      convertXlsxToCsv(filePath, csvFilePath);
      console.log("XLSX converted to CSV:", csvFilePath);
      const source = await csvtojson().fromFile(csvFilePath);
  
      const arrayToInsert = source.map((row) => ({
        name: row["Company Name"],
        address: row["Company Address"],
        phone: row["Company Phone"], // Changed from mobileNo to phone to match schema
        email: row["Company Email"], // Added to match schema
        website: row["Company Website"], // Added to match schema
        Number_of_Employees: parseInt(row["Number of Employees"], 10), // Added to match schema, ensure integer
        Founded_Date: row["Founded Date"] ? new Date(row["Founded Date"]) : null, // Added to match schema, ensure Date object
        IndustryType: row["Industry Type"], // Added to match 
      }));

      const result=await Company.insertMany(arrayToInsert);
      console.log(result);

      res.statusCode = 200;
      res.json("succes");
    } else {
      res.json("unsupported file type");
    }
  } catch (err) {
    console.error(err);
    res.json("Internal Server Error");
  }
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error("Error deleting file:", err);
    } else {
      console.log("File deleted successfully:", filePath);
    }
  });
  
});

app.post("/upload-files-contact", upload.single("file"), async (req, res) => {
  const filePath = "./sheets/" + req.file.filename;
  console.log("File Uploaded:", filePath);

  try {
    const fileExtension = req.file.originalname.split(".").pop().toLowerCase();

    if (fileExtension === "xlsx" || fileExtension === "xls") {
      const csvFilePath = filePath.replace(".xlsx", ".csv");
      convertXlsxToCsv(filePath, csvFilePath);
      console.log("XLSX converted to CSV:", csvFilePath);
      const source = await csvtojson().fromFile(csvFilePath);

      for (const row of source) {
        const companyName = row["Company Name"];
        const company = await Company.findOne({ name: companyName });

        if (!company) {
          throw new Error(`Company ${companyName} does not exist in the database.`);
        }

        const contactToInsert = {
          company_id: company._id, // Adjusted to match the schema field name
          name: row["Contact Name"],
          email: row["Contact Email"],
          phone: row["Contact Phone"] || null, // Ensuring default null if phone is not provided
          birthdate: row["Date of Birth"] ? new Date(row["Date of birth"]) : null, // Converting to Date object and ensuring default null
          contact_type: row["Contact Type"], // Assuming "Contact Type" is correctly provided as 'Primary', 'Secondary', or 'Other'
        };
        console.log(row["Date of Birth"])

        const result = await Contact.create(contactToInsert);
        console.log("Contact inserted:", result);
        
      }

      res.json("Contacts uploaded and linked to companies successfully.");
    } else {
      res.json("Unsupported file type");
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("Internal Server Error");
  }

  fs.unlink(filePath, (err) => {
    if (err) {
      console.error("Error deleting file:", err);
    } else {
      console.log("File deleted successfully:", filePath);
    }
  });
 
});
app.get("/", async (req, res) => {
  try {
    const company = await Company.find();
    console.log("Candidates:", candidates);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/", (req, res) => res.send("Hello World"));

const PORT = process.env.PORT;
app.listen(PORT, async () => {
  const connected = await connect();
  connected
    ? console.log(`Server is running on PORT: ${PORT}`)
    : console.log("Server starting failed");
});
