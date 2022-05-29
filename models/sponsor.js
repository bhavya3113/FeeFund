const mongoose = require("mongoose");
const schema = mongoose.Schema;

const sponsorSchema = new schema({
  fullname:{
    type: String,
    require: true
  },
  email:{
    type: String,
  },
  mobileno:{
    type: Number,
  },
  donation:[{
  amountdonated:{
    type:Number,
    require:true
  },
  donatedto:{
    type:schema.Types.ObjectId,
    ref:"students"
  }
}]
})

module.exports = mongoose.model("sponsors",sponsorSchema);