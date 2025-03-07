const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
dotenv.config();
const UrlMongoose = process.env.MONGOURL
const app = express();
const port = process.env.PORT ;
app.use(express.json());
mongoose.connect( UrlMongoose).then(() => console.log('Connected to MongoDB')).catch(err => console.error('Could not connect to MongoDB', err));
const Student = require('./studentModel');
const SECRET_KEY = process.env.JWTSECRET;

const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization');

  if (!token) return res.status(403).json({ message: "Access denied. No token provided." });

  try {
      const decoded = jwt.verify(token.split(" ")[1], SECRET_KEY);
      req.user = decoded;
      next(); // Proceed to the next middleware or route
  } catch (err) {
      res.status(401).json({ message: "Invalid token" });
  }
};
app.get('/all', authenticateToken, async (req, res) => {
    const students = await Student.find();
    res.json(students);
});

app.post('/add', authenticateToken, async (req, res) => {
    try{const { nom, email, cours } = req.body;
    const student = new Student({ nom, email, cours });
    await student.save();
    res.json(student)}catch(err){
        console.log(err)
    }
});

app.post("/enroll/:st_id/:crs_id", authenticateToken, async (req, res) => {
    try {
        const { st_id, crs_id } = req.params;
        const student = await Student.findById(st_id);
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }
        student.cours.push(crs_id);
        await student.save();
        res.json(student);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: err.message });
    }
});

app.get("/enrolledCourses/:etudiant_id", authenticateToken, async (req, res) => {
    try {
        const { etudiant_id } = req.params;
        const student = await Student.findById(etudiant_id);
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }
        courses = await mongoose.connection.db.collection('courses').find({ _id: { $in: student.cours } }).toArray();
        res.json(courses);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: err.message });
    }
});
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });