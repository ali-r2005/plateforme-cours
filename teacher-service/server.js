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
const Teacher = require('./teacherModel');
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
    const teachers = await Teacher.find();
    res.json(teachers);
});

app.post('/add', authenticateToken, async (req, res) => {
    try{
    const { name, bio, cours } = req.body;
    const teacher = new Teacher({ name, bio, cours });
    await teacher.save();
    res.json(teacher)}catch(err){
        console.log(err)
    }
});

app.post("/assign/:professeur_id/:cours_id", authenticateToken, async (req, res) => {
    try {
        const { professeur_id, cours_id } = req.params;
        const teacher = await Teacher.findById(st_id);
        if (!teacher) {
            return res.status(404).json({ message: "teacher not found" });
        }
        teacher.cours.push(cours_id);
        await teacher.save();
        res.json(teacher);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: err.message });
    }
});

app.get("/enrolledStudents/:cours_id", authenticateToken, async (req, res) => {
    try {
        const { cours_id } = req.params;
        const students = await mongoose.connection.db
        .collection('students')
        .find({ 
            cours: new mongoose.Types.ObjectId(cours_id) 
        })
        .toArray();
        res.json(students);
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