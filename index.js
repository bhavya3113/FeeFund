const express = require("express");
const mongoose = require("mongoose"); 
const dotenv = require("dotenv");
const authRoutes = require("./routes/studentauth");
const multer = require('multer');
const path = require("path");

dotenv.config();
const app = express();


const fileStorage = multer.diskStorage({
  destination:(req,file,cb)=>{
      cb(null, 'images');
  },
  filename: (req,file,cb)=>{
    cb(null,  file.fieldname + '-' + file.originalname)
  }
})

const fileFilter=(req,file,cb)=>{
   if(file.mimetype == 'image/png' || file.mimetype == 'image/jpg' || file.mimetype == 'image/jpeg')
       cb(null,true);
    else {
      cb(null,false);
      console.log("wrong file type")}
  
}

app.use(multer({storage:fileStorage,fileFilter:fileFilter})
.fields([{ name: 'image', maxCount: 1 }, 
{ name: 'incomecerti', maxCount: 1 },{ name: 'feeproof', maxCount: 1 }])
);

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use('/images',express.static(path.join(__dirname, 'images')));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods","GET, POST, PUT, PATCH, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  next();
});

app.use('/auth',authRoutes);


app.use((error, req, res, next) => {
  // console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});


mongoose
  .connect(
    process.env.CONNECT_TO_DB
  )
  .then(result => {
    app.listen(process.env.PORT);
    console.log("connected");
  })
  .catch(err => console.log("error",err));
  