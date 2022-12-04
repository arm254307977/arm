const express = require("express");
const app = express();
const mysql = require("mysql");
const _ = require("lodash");
const bodyParser = require("body-parser");
const cors = require('cors');
const dayjs = require('dayjs');
let today = dayjs().format('DD/MM/YYYY HH:mm:ss');

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const server = app.listen(3000, () => {
  console.log("Node JS. is running on port 3000!!");
});

const db = mysql.createConnection({
  host: "localhost",
  user: "armm",
  password: "123456",
  database: "armm",
});

db.connect(function (err) {
  if (err) throw err;
  console.log("Connected!");
});

app.post("/arm/post", async (req, res) => {
  const license = _.get(req, ["body", "license"]);
  const duration = _.get(req, ["body", "duration"]);
  const id = _.get(req, ["body", "id"]);
  let timein = _.get(req, ["body", "timein"]);
  
  try {
    let timein = today;
    if (license || duration || id) {
      //insert ลงดาต้าเบส 

      console.log(dayjs())
      await db.query("insert into data (license, duration, id, timein) value (?,?,?,?)", [
        license,
        duration,
        id,
        timein
      ]);
      
      res.status(200).json({
        Message: "successfully added information.",
        RespCode: 200
      });
    }else{
        res.status(200).json({
            Message: "Please add complete information.",
          });
    }
  } catch (err) {
    console.log("ERR!! : ", err);
    return res.status(400).json({
      Message: "Failed",
    });
  }
});

//get
app.get("/arm/get", (req, res) => {
  try {
    db.query("select * from data", [], (err, req, fil) => {
      
      console.log(req);
      console.log(today);
      return res.status(200).json({
        RespCode: 200,
        Message: 'Success',
        Result: req
      });
      
    });
  } catch (err) {
    console.log("ERR!! : ", err);
    return res.status(400).json({
      Message: "Failed",
    });
  }
});

//Get By Id
app.get("/arm/getById", (req, res) => {
  const id = _.get(req, ["body", "id"]);

  try {
    if (id) {
        db.query("select * from data where id = ?", [
            id
        ],(err, data, fil) => {
            if (data == "") {
                return res.status(400).json({
                Message: "No Data"
            });
            } else {
                res.send(data);
            }
        
        });
    }
    
    else {
      console.log("No ID");
      return res.status(400).json({
        Message: "Input ID",
      });
    }

  }
  
  catch (err) {
    console.log("ERR!! : ", err);
    return res.status(400).json({
      Message: "failed",
    });
  }
});

//put แก้ไขข้อมูล
app.put("/arm/put", async (req, res) => {
  const id = _.get(req, ["body", "id"]);
  const license = _.get(req, ["body", "license"]);
  const duration = _.get(req, ["body", "duration"]);

  try {
    if (id && license || duration) {

        db.query("select * from data where id = ?", [
            id
        ],(err, req, fil) => {
            if (req == "") {
                console.log("No Data");
                res.status(400).json({
                    Message: "No information found.",
                  });
            } else {
                db.query("update data set license = ?, duration = ? where id = ?", [
                    license,
                    duration,
                    parseInt(id)
                ]);
                return res.status(200).json({
                  RespCode: 200,
                  Message: 'Completed data editing.',
                });
                
            }
        }
        );
    }
    
    else {
      console.log("ไม่มี license & duration");
      return res.status(400).json({
        Message: "failed 1",
      });
    }
  } catch (err) {
    console.log("ERR!! : ", err);
    return res.status(400).json({
      Message: "failed 0",
    });
  }
});

//delete
app.delete("/arm/delete", (req, res) => {
    const id = _.get(req, ["body", "id"]);

    try {
        
        if (id) {
            db.query("select * from data where id = ?", [
                id
            ],(err, req, fill) => {
                if (req === "") {
                    res.end("No ID")
                } else {
                    db.query("delete from data where id = ?", [
                        parseInt(id)
                    ]);
                    
                    return res.status(200).json({
                        RespCode: 200,
                        Message: "Delete : success"
                      });
                }
            });
        }
        
        else {
            console.log("No Data");
            return res.status(400).json({
            Message: "Failed 1",
            });
        }
    }
    
    catch (err) {
        console.log("ERR!! : ", err);
        return res.status(400).json({
        Message: "Failed 0",
        });
    }
});

module.exports = app;
