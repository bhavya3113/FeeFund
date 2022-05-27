const mongoose = require("mongoose");
const schema = mongoose.Schema;

const studentSchema = new schema({
  fullname:{
    type: String,
    require: true
  },
  email:{
    type: String,
    require: true
  },
  password:{
    type: String,
    require:true
  },
  school:{
    type: String,
    require: true
  },
  class:{
    type: String,
    require: true
  },
  mobileno:{
    type: Number,
    require:true
  },
  income:{
    type: Number,
    require:true
  },
  sourceofincome:{
    type: Number,
    require:true
  },
  gender: String,
  image: String,
  
  incomeCertificate:{
  type:String,
  require:true
  },
  feeProof:{
    type:String,
    require:true
  },
  address: String,

  fundingRequied:{
    type:Number,
    require:true
  },
 bankAcNo:{
    type:Number,
    require:true
  },
  ifscCode:{
    type:String,
    require:true
  }
})

module.exports = mongoose.model("students",studentSchema);