const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const dotenv = require("dotenv");
const otpGenerator = require("otp-generator");
const jwt = require("jsonwebtoken");
const path = require("path");

dotenv.config();

const Student = require("../models/student");

const Otp = require("../models/otp");
const mail = require("../utils/sendemail");

var emailregex = /^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/

exports.signup = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ Error: "Validation Failed" });
    }

    const { email } = req.body;

    var validemail = emailregex.test(email);

    if (!validemail) {
      const error = new Error('Please enter a valid email');
      error.statusCode = 422;
      throw error;
    }

    const student = await Student.findOne({ email: email });
    if (student) {
      const error = new Error("Student already exists !!");
      error.statusCode = 400;
      throw error;
    }

    const otp = otpGenerator.generate(6, {
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false
    });

    const result = await Otp.findOne({ email: email });
    if (result === null) {
      const newOtp = new Otp({ email: email, otp: otp });
      await newOtp.save();
    }
    else
      await Otp.updateOne({ email: email }, { $set: { otp: otp } });
    mail.sendEmail(email, otp);
    return res.status(201).json({ message: 'Otp sent' });
  }
  catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}

exports.otpVerification = async (req, res, next) => {
  try {
    const { email, otp, password, name, mobileno, gender,school,inclass,address} = req.body;
    const student = await Student.findOne({ email: email });
    if (student)
        return res.status(401).send('Already registered.');

    const newotp = await Otp.findOne({ email: email });
    if (!newotp) {
      const err = new Error('Otp is expired');
      err.statusCode = 422;
      throw err;
    }
    if (newotp.otp !== otp) {
      const err = new Error("Wrong Otp");
      err.statusCode = 420;
      throw err;
    }
    await newotp.remove();

    const hashedPassword = await bcrypt.hash(password, 12);
      const newStudent = new Student({
       email: email,
       password: hashedPassword,
       fullname: name,
       mobileno: mobileno,
       gender: gender,
       school:school,
       class:inclass,
       address:address
    });
    await newStudent.save();
    const accesstoken = jwt.sign({ email: email, userId: newStudent._id }, process.env.ACCESS_TOKEN_KEY, { expiresIn: '1d' });
    return res.status(200).json({ message: "successfully registered", access_token: accesstoken});
  }
  catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}

exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ Error: "Validation Failed" });
    }
    const { email, password} = req.body;
    var validemail = emailregex.test(email);
    if (!validemail) {
      const error = new Error('Please enter a valid email');
      error.statusCode = 422;
      throw error;
    }
    const student = await Student.findOne({ email: email });

      if (!student) {
        const error = new Error("Student is not registered !!");
        error.statusCode = 400;
        throw error;
      }
      const result = await bcrypt.compare(password, student.password);
      if (!result) {
        const error = new Error('Incorrect Password');
        error.statusCode = 403;
        throw error;
      }
    const accesstoken = jwt.sign({ email: email, userId: student._id }, process.env.ACCESS_TOKEN_KEY, { expiresIn: '1d' });
    return res.status(200).json({ message: "LoggedIn", email: email, access_token: accesstoken });
    }
  catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}

exports.resetpass = async (req, res, next) => {
  if (!validationResult(req).isEmpty())
      return res.status(422).json('please enter a valid email');

  try {
      const email = req.body.email;
      var validemail = emailregex.test(email);

      if (!validemail) {
          const error = new Error('Please enter a valid email');
          error.statusCode = 422;
          throw error;
      }

      const student = await Student.findOne({ email: email });
      if (student === null)
          return res.status(401).send('Student not found');

      const otp = otpGenerator.generate(6, {
          lowerCaseAlphabets: false,
          upperCaseAlphabets: false,
          specialChars: false
      });

      const result = await Otp.findOne({ email: email });
      if (result === null) {
          const newOtp = new Otp({ email: email, otp: otp });
          await newOtp.save();
      }
      else
          await Otp.updateOne({ email: email }, { $set: { otp: otp } });

      mail.sendEmail(email, otp);
      return res.status(200).send('otp sent successfully');
  } catch (err) {
      if (!err.statusCode)
          err.statusCode = 500;
      next(err);
  }
};

exports.verify = async (req, res, next) => {
  if (!validationResult(req).isEmpty())
      return res.status(422).json('please enter a valid email');
  try{
      const {email,otp} = req.body;
      var validemail = emailregex.test(email);

      if (!validemail) {
          const error = new Error('Please enter a valid email');
          error.statusCode = 422;
          throw error;
      }
  const optInDb = await Otp.findOne({ email: email });
      if (!optInDb) {
          const err = new Error('Otp is expired');
          err.statusCode = 422;
          throw err;
        }
        if (optInDb.otp !== otp) {
          const err = new Error("Wrong Otp");
          err.statusCode = 420;
          throw err;
        }
        return res.status(200).json('correct otp');
  }
  catch (err) {
    if (!err.statusCode)
        err.statusCode = 500;
    next(err);
  }
};
 
exports.newpassword = async (req, res, next) => {
  try{
    if (!validationResult(req).isEmpty())
    return res.status(422).json('validation failed');

      const {newpass,email,confirmpass} = req.body;

      const student = await Student.findOne({ email: email });
      if (student === null){
          const error = new Error("student is not registered !!");
          error.statusCode = 400;
          throw error;
        }
        if(newpass != confirmpass)
        {
          const error = new Error("Passwords do not match");
          error.statusCode = 422;
          throw error;
        }
          const hashedPw = await bcrypt.hash(newpass, 12);
          await Student.updateOne({ email: email }, { $set: { password: hashedPw} });
          return res.status(200).json('password updated');


  } 
  catch (err) {
      if (!err.statusCode)
          err.statusCode = 500;
      next(err);
  }
}; 


exports.details = async (req, res, next) => {
  try{
    if (!validationResult(req).isEmpty())
    return res.status(422).json('validation failed');

      const {email,income,fees,sourceofincome,bankac,ifsc,bankname,fundingRequired} = req.body;
      const {image,incomecerti,feeproof} = req.files;
      let imageUrl,incomecertiurl,feeproofurl;
      if(image){
          imageUrl = image[0].path;
      }
      if(incomecerti){
        incomecertiurl = incomecerti[0].path;
      }
      if(feeproof){
        feeproofurl = feeproof[0].path;
    }
    if(parseInt(income)>200000)
      {
        const error = new Error("Not eligible for funding");
        error.statusCode = 400;
        throw error;
      }
     
      if(parseInt(fees)<parseInt(fundingRequired))
      {
        const error = new Error("Enter amount less than or equal to fees");
        error.statusCode = 400;
        throw error;
      }
      const student = await Student.findOne({ email: email });
      if (student === null){
          const error = new Error("student is not registered !!");
          error.statusCode = 400;
          throw error;
        }
        await Student.updateOne({ email: email },
          { $set: { income:income,fees:fees,sourceofincome:sourceofincome,bankName:bankname,
            fundingRequired:fundingRequired,ifscCode:ifsc,bankAcNo:bankac,image:imageUrl,
            incomeCertificate:incomecertiurl,feeProof:feeproofurl} });
         
       //   console.log(student)
          return res.status(200).json('student details added');
  } 
  catch (err) {
      if (!err.statusCode)
          err.statusCode = 500;
      next(err);
  }
}; 

