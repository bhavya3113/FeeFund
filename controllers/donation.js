const Razorpay = require("razorpay");
const dotenv = require("dotenv");
const crypto = require("crypto");

dotenv.config();


const Student = require("../models/student");
const Sponsor = require("../models/sponsor");
const Donation = require("../models/donation");

exports.makedonation= async(req,res,next)=>{
  try{
    var instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    var options = {
      amount: req.body.amount*100, 
      currency: "INR",
      receipt: "order_rcptid_11"
    };
    const create =await instance.orders.create(options);
    // console.log(create)
    if(!create)
    {
      const err = new Error('abc');
      err.statusCode = 4;
      throw err;
    }
   return res.status(201).json(create);
  } 
  catch{
    // console.log(err)
    if(!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}

exports.verify=async(req,res,next)=>{
  try{
    console.log("hello")
    const{name,email,phoneno,amount,donatedto,createdorderid,razorpay_payment_id,razorpay_order_id,razorpay_signature }=req.body;

    const body=createdorderid + "|" + razorpay_payment_id;

  
    const expectedSignature = crypto.createHmac('sha256', process.env.ENC_SECRET_KEY);
    expectedSignature.update(body.toString())
    const result = expectedSignature.digest('hex');
    if(razorpay_signature != result)
    {
      const err = new Error('Invalid signature');
      err.statusCode = 400;
      throw err;    
    }
    console.log("success")
    const donation= new Donation({
          orderid: razorpay_order_id,
          paymentid: razorpay_payment_id,
          signature: razorpay_signature
  });
   await donation.save();
   const donatedtostudent = await Student.findById(donatedto);
   donatedtostudent.fundingRequired -=amount;
   donatedtostudent.amountRaised += amount;
   await donatedtostudent.save();

   //const spon = await Sponsor.findOne({email:email})
   const spon = await Sponsor.findOneAndUpdate(
    {email:email},
    { $set: { "fullname": name ,  "mobileno":phoneno} },
    { $push:{ "donation":[{ amountdonated:amount,donatedto:donatedto }]}},
    { upsert:true}
  )
  //  if(spon)
  //  {
  //    spon.donation.push({ amountdonated:amount,donatedto:donatedto});
  //    await spon.save();
  //  }
// else{
//    const sponsor = new Sponsor({
//     fullname:name,
//     email:email,
//     mobileno:phoneno,
//     amountdonated:amount,
//     donatedto:donatedto
//    })
  
  //  await sponsor.save()
//  }
  res.status(200).json({message:"successful"})
  }
  catch(err){
    if(!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}