
const { User, Student } = require('../models');
const bcrypt = require('bcryptjs');
const { log } = require("console");
const { check, validationResult } = require('express-validator');


exports.validate = (method) => {
  switch (method) {
    case 'createUser': {
      return [
        check('firstname', 'firstname is required').notEmpty(),
        check('lastname', 'lastname is required').notEmpty(),
        check('grade', 'grade is required').notEmpty(),
        check('contact', 'contact is required').notEmpty(),
        check('email', 'Invalid email').isEmail(),
        check('password', 'Password must be at least 6 characters long').isLength({ min: 6 }),
      ];
    }
  }
};

exports.findAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await Student.findAndCountAll({
      limit,
      offset,
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      data: rows,
      totalPages,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.create = async (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, password, email, firstname, lastname, grade, contact } = req.body;

  try {
    const existingStudent = await Student.findOne({ where: { firstname, lastname }});

    if ( existingStudent) {
      throw new Error('Email or Student already exists');
    }


    const hashedPassword = await bcrypt.hash(password, 10);

    const newStudentData = async () => {

      const newStudent = await Student.create({
        username: username,
        email: email,
        password: hashedPassword,
        firstname: firstname,
        lastname: lastname,
        grade: grade,
        contact: contact,
      });

      return newStudent;
      }

    const result = await newStudentData();

    res.status(201).send(result);
  } catch (err) {
    res.status(500).send({
      message: err.message || 'Some error occurred while creating the User.'
    });
  }
};

exports.findOne = (req, res) => {
  const id = req.params.id;

  Student.findByPk(id)
    .then(data => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find student with id=${id}.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving student with id=" + id
      });
    });
};


exports.delete = async (req, res) => {
  const id = req.params.id;
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const student = await Student.findByPk(id);
    
    if (!student) {
      return res.status(404).send({ message: `Cannot find Student with id=${id}.` });
    }

    await Student.destroy({ where: { id } });

    res.send({ message: "User was deleted successfully!", student });

  } catch (err) {
    res.status(500).send({ message: `Could not delete User with id=${id}: ${err.message}` });
  }
};

exports.update = async (req, res) => {
  const id = req.params.id;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, password, email, firstname, lastname, grade, contact } = req.body;

  try {
    const student = await Student.findByPk(id);
    
    if (!student) {
      return res.status(404).send({ message: `Cannot find Student with id=${id}.` });
    }

    const existingStudent = await Student.findOne({ where: { firstname, lastname } });

    if ( existingStudent && existingStudent.id !== student.id) {
      throw new Error('Email or Tutor name already exists');
    }

    const hashedPassword = password ? await bcrypt.hash(password, 10) : student.password;

    await student.update({
      username: username ,
      email: email ,
      password: hashedPassword,
      firstname: firstname || student.firstname,
      lastname: lastname || student.lastname,
      grade: grade || student.grade,
      contact: contact || student.contact,
    });

    res.status(200).send({ message: "Student was updated successfully!", student });
  } catch (err) {
    res.status(500).send({
      message: err.message || 'Some error occurred while updating the Tutor.'
    });
  }
};
