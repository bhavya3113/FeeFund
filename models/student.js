const mongoose = require("mongoose");
const path = require("path");
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
  fees:{
    type: Number,
    require:true
  },
  sourceofincome:{
    type: String,
    require:true
  },
  gender: String,

  image:{
    type:String,
    default:path.join('images','noprofile.png')
  },
  incomeCertificate:{
  type:String,
  require:true,
  default:path.join('images','noprofile.png')
  },
  feeProof:{
    type:String,
    require:true,
    default:path.join('images','noprofile.png')
  },
  address: String,

  fundingRequired:{
    type:Number,
    require:true
  },
 bankAcNo:{
    type:Number,
    require:true
  },
  bankName:{
    type:String,
    require:true
  },
  ifscCode:{
    type:String,
    require:true
  }
})

module.exports = mongoose.model("students",studentSchema);