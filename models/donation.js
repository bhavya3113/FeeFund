const mongoose = require("mongoose");
const schema = mongoose.Schema;

const donationSchema = new schema({
  orderid: {
    type: String,
    required: true,
  },
  paymentid: {
    type: String,
    required: true,
  },
  signature: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("donation",donationSchema);