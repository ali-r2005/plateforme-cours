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
const Course = require('./courseModel');
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
    const courses = await Course.find();
    res.json(courses);
});
app.post('/add', authenticateToken, async (req, res) => {
    const { titre, professeur_id, description, prix } = req.body;
    const course = new Course({ titre, professeur_id, description, prix });
    await course.save();
    res.json(course);
});

app.put('/update/:id', authenticateToken, async (req, res) => {
    try{
        const { id } = req.params;
        const { titre, professeur_id, description, prix } = req.body;
        const course = await Course.findOneAndUpdate({_id:id}, { titre:titre,professeur_id : professeur_id, description:description, prix:prix }, { new: true });
        res.json(course);
    }catch(err){
        console.log(err)
    }
});

app.delete('/delete/:id', authenticateToken, async (req, res) => {
    try{
        const { id } = req.params;
        const course = await Course.findByIdAndDelete(id);
        res.json(course);
    }catch(err){
        console.log(err)
    }
});

app.get("/search", authenticateToken, async (req, res) => {
    try{
        const { titre } = req.query;
        const course = await Course.find({titre:titre});
        res.json(course);
    }catch(err){
        console.log(err)
    }
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });