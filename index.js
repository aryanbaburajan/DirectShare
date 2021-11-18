const path = require("path");
const multer = require("multer");
const express = require("express");
const fs = require("fs");
var pathComp= require("express-static");
const AdmZip = require("adm-zip");
var favicon = require('serve-favicon');

const app = express()

// View Engine Setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use("/views", pathComp(__dirname + '/views'));
app.use(favicon(path.join(__dirname, 'public', 'logo.ico')));

// let upload = multer({ dest: "Upload_folder_name" })
// If you do not want to use diskStorage then uncomment it

function deleteFile(file) {
    fs.unlink("uploads/" + file, (err) => {
        if (err) console.log(err);
    });
}

let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        lastFileID = Date.now() + path.extname(file.originalname);
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, lastFileID);
        setTimeout(function () {
            deleteFile(lastFileID);
        }, 3600000);
    },
});

let lastFileID;

// Define the maximum size for uploading
// picture i.e. 1 MB. it is optional
const maxSize = 1000 * 1000 * 1000;

let upload = multer({
    storage: storage,
    limits: { fileSize: maxSize },
}).single("file");

app.get("/", function (req, res) {
    res.render("upload");
});

app.get("/uploads/", function (req, res) {
    if (fs.existsSync("uploads/" + req.query.q)) {
        res.download("uploads/" + req.query.q);
    } else {
        res.render("invalid");
    }
});

app.get("/info", function (req, res) {
    res.render("info");
});

app.post("/uploaded", function (req, res, next) {
    // Error MiddleWare for multer file upload, so if any
    // error occurs, the image would not be uploaded!
    upload(req, res, function (err) {
        if (err) {
            // ERROR occured (here it can be occured due
            // to uploading image of size greater than
            // 1MB or uploading different file type)
            res.send(err);
        } else {
            // SUCCESS, image successfully uploaded
            res.render("uploaded", {
                url: "https://directshare.herokuapp.com/uploads?q=" + lastFileID,
            });
        }
    });
});

app.use(function (req, res) {
    res.render("invalid");
});

// Take any port number of your choice which
// is not taken by any other process
app.listen(process.env.PORT || 8080);
