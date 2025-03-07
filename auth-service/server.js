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
const User = require('./userModel');
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

app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    const user = new User({ name, email, password });
    await user.save();
    res.json({ user });
  });

app.post("/login" ,async (req,res)=>{
    try{
      const {email,password} = req.body;
      const user = await User.findOne({email:email,password:password})
      if(!user) return res.status(401).json({message:"invalid user"})
      const token = jwt.sign({ userId: user.id, email: user.email }, SECRET_KEY, { expiresIn: '9h' })
      res.json({token})
    }
    catch(error){
      res.status(500).json({message:error.message})
    }
  })

app.get("/profile",authenticateToken ,async (req,res)=>{
    const token = req.headers.authorization.split(" ")[1]
    const decoded = jwt.verify(token, SECRET_KEY)
    const user = await User.find({_id : decoded.userId})
    res.json({user})
  })

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });