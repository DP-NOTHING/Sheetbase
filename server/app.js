
import { connect } from "./db/connection.js";
import { setupMiddlewares } from "./initmiddleware.js";
import fs from "fs";
import { upload } from "./db/connection.js";
import { convertXlsxToCsv } from "./utils/xlstocsv.js";
import express from "express";
import csvtojson from 'csvtojson';
import { Company,Contact } from "./db/schemas.js";
import moment from "moment";
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
        phone: row["Company Phone"], 
        email: row["Company Email"], 
        website: row["Company Website"], 
        Number_of_Employees: parseInt(row["Number of Employees"], 10), 
        Founded_Date: row["Founded Date"] ? new Date(row["Founded Date"]) : null, 
        IndustryType: row["Industry Type"], 
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

        let birthdate = null;
    if (row["Date of Birth"]) {
        
        const parsedDate = moment(row["Date of Birth"], "MM/DD/YY");
        if (parsedDate.isValid()) {
            birthdate = parsedDate.toDate();
        } else {
            console.error(`Invalid date format for ${row["Contact Name"]}: ${row["Date of Birth"]}`);
            
        }
    }

    const contactToInsert = {
      company_id: company._id,
      name: row["Contact Name"],
      email: row["Contact Email"],
      phone: row["Contact Phone"] || null,
      birthdate: birthdate,
      contact_type: row["Contact Type"],
    };
        
        console.log(row["Date of Birth"])

        const result = await Contact.create(contactToInsert);
        console.log("Contact inserted:", result);
        
      }

      res.statusCode = 200;
      res.json("succes");
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
