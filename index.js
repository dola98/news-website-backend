const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const { ObjectId } = require("mongodb");
const ObjectID = require("mongodb").ObjectID;
const MongoClient = require("mongodb").MongoClient;
require("dotenv").config();

const uri = `mongodb+srv://pro_dip:Ps%40131152416@cluster0.bbk7z.mongodb.net/newsPortal?retryWrites=true&w=majority`;

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(fileUpload());

const port = 8000;

app.get("/", (req, res) => {
  res.send("hello from db it's working .......");
});

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

client.connect((err) => {
  const adminCollection = client.db("newsPortal").collection("admin");
  const newsCollection = client.db("newsPortal").collection("news");


  app.post("/addAdmin", (req, res) => {
    // add admin
    adminCollection.insertOne(req.body).then((result) => {
      res.status(200).send(result.insertedCount);
    });
  });

  app.post("/isAdmin", (req, res) => {
    // check is admin or not
    // console.log(req.body.email);
    adminCollection
      .find({ email: req.body.email })
      .toArray((err, documents) => {
        res.status(200).send(documents);
      });
  });

  app.post("/addNews", (req, res) => {
    // Save Base64 on Mongodb
    // console.log(req.files)
    const file = req.files.file;
    const titleEng = req.body.titleEng;
    const titleBang = req.body.titleBang;
    const descriptionEng = req.body.descriptionEng;
    const descriptionBang = req.body.descriptionBang;

    const newImg = file.data;
    const encImg = newImg.toString("base64");

    const image = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(encImg, "base64"),
    };

    newsCollection
      .insertOne({
        titleEng,
        titleBang,
        descriptionEng,
        descriptionBang,
        image,
      })
      .then((result) => {
        console.log("Added....");
        res.status(200).send(result.insertedCount);
      });
  });

  app.get("/allNews", (req, res) => {
    console.log("----------------------------");
    newsCollection.find().toArray((err, documents) => {
      res.status(200).send(documents);
    });
  });

  app.patch("/updateNews/:id", (req, res) => {
    // Update News
    const file = req.files.file;
    const newImg = file.data;
    const encImg = newImg.toString("base64");

    const image = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(encImg, "base64"),
    };

    newsCollection
      .updateOne(
        { _id: ObjectID(req.params.id) },
        {
          $set: {
            titleEng: req.body.titleEng,
            titleBang: req.body.titleBang,
            descriptionEng: req.body.descriptionEng,
            descriptionBang: req.body.descriptionBang,
            image: image,
          },
        }
      )
      .then((result) => {
        console.log("Updated...");
        res.sendStatus(200).send(result.modifiedCount);
        // res.send(result.modifiedCount);
      });
  });

  app.get("/getNewsById", (req, res) => {
    // get news by id
    newsCollection
      .find({ _id: ObjectID(req.query.id) })
      .toArray((err, documents) => {
        res.status(200).send(documents[0]);
      });
  });

  app.delete("/deleteNews", (req, res) => {
    // delete news
    newsCollection.deleteOne({ _id: ObjectId(req.query.id) }).then((result) => {
      console.log("Deleted .....");
      res.sendStatus(200).send(result.deletedCount);
    });
  });

  
});

app.listen(port);
