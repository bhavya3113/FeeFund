const { validationResult } = require("express-validator");

const Student = require("../models/student");

exports.viewstudents = async (req, res, next) => {
  try {

      const students = await Student.find({}).select('-password');
      if (!students) {
      const error = new Error("No student found!!");
      error.statusCode = 400;
      throw error;
      }
      return res.status(201).json({students:students});
    }
  catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}
