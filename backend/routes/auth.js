const express = require('express');
const User = require('../models/User');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var fetchuser = require('../middleware/fetchuser');


const JWT_SECRET = '20lakhpackage9pointer';

//no login require ROUTE- 1
router.post('/createuser', [
    body('name', 'Enter the valid name'). isLength({min: 3}),
    body('email', 'Enter the valid email'). isEmail(),
    body('password','password must be atlest 5 characters'). isLength({min: 5}),
],async (req, res)=> {
    let success = false;
   //if there are errors, return bad request and errors
   const errors = validationResult(req);
   if(!errors.isEmpty()){
    return res.status(400).json({ success, errors: errors.array()});
   }
   //Check wheather the user with this email exists already
   try{
   let user =  await User.findOne({email: req.body.email});
    if(user){
      return res.status(400).json({success, error: "Sorry a user with this email already exists"})
    }
     const salt = await bcrypt.genSalt(10);
    const secPass = await bcrypt.hash(req.body.password, salt) 
    //Create a new user
    user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: secPass,
   });
   const data = {
    user:{
        id: user.id
    }
}

   const authtoken = jwt.sign(data, JWT_SECRET);
   
      success = true;
    res.json({success, authtoken})
}catch(error){
    console.error(error.message);
    res.status(500).send("Internal Server error");
}
})
// Authentication a User using: POST "/api/auth/login". No login required ROUTE - 2
router.post('/login', [
    body('email', 'Enter the valid email'). isEmail(),
    body('password','password cannot be blanked'). exists(),
],async (req, res)=> {
    let success = false;
    const errors = validationResult(req);
    if(!errors.isEmpty()){
     return res.status(400).json({ errors: errors.array()});
    }
    const {email, password} = req.body;
    try{
        let user = await User.findOne({email});
        if(!user){
            success = false;
            return res.status(400).json({error: 'Please try to login with correct credentials'})
        }
        const passwordCompare = await bcrypt.compare(password, user.password);
        if(!passwordCompare){
            success = false;
            return res.status(400).json({success, error: 'Please try to login with correct credentials'})
        }
        const data = {
            user:{
                id: user.id
            }
        }
           const authtoken = jwt.sign(data, JWT_SECRET);
           success = true;
            res.json({success, authtoken})

    }catch(error){
        console.error(error.message);
        res.status(500).send("Internal Server error");
    }
});
// ROUTE-3 get loggedin user details using: POST "/api/auth/getuser". Login required
router.post('/getuser',fetchuser, async (req, res)=> {
try {
    userId = req.user.id;
    const user = await  User.findById(userId).select('-password')
    res.send(user)
} catch (error) {
    console.error(error.message);
        res.status(500).send("Internal Server error");
}
})
module.exports = router
