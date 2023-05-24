const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require('bcrypt');
const crypto = require("crypto");

//resetPasswordToken
exports.resetPasswordToken = async (req, res) =>{
    try {

        // get email from req body
    const email = req.body.email;
    //check user for this emmail, email verification
    const user = await User.findOne({email: email});
    if(!user){
        return res.json({
            success:false,
            message:`This Email: ${email} is not registered with us. Enter valid email`,
        });
    }
    //generate token
    const token = crypto.randomBytes(20).toString("hex");
    //update user by adding token and expiration time
    const updatedDetails = await User.findOneAndUpdate(
                                         {email: email},
                                         {
                                            token: token,
                                            resetPasswordExpires: Date.now() + 3600000,
                                         },
                                         {new:true});
      console.log("Details", updatedDetails);                                   
    //create url
    const url = `http://localhost:3000/update-password/${token}`
    //send mail containing url
    await mailSender(email, 
                    "Password Reset Link",
                    `Password Reset Link: ${url}. Please click this url to reset password`);
    //return response
    res.json({
        success:true,
        message:'Email sent successfully, please check email and change password',
    });

        
    } catch (error) {
        return res.json({
            error: error.message,
            success:false,
            message:`Something went wrong while reset password`,
        });
    }
       
};

//resetPassword

exports.resetPassword = async (req, res) =>{

    try {

         //data fetch
    const {password, confirmPassword, token} = req.body;
    //validation
    if(confirmPassword !== password){
        return res.json({
            success:true,
            message:'Password not matching',
        });
    }
    //get userdetails from db using token
    const userDetails = await User.findOne({token: token});
    //if no entry - invalid token
    if(!userDetails){
        return res.json({
            success:false,
            message:'Token is invalid',
        });
    }
    //token time check
    if(!(userDetails.resetPasswordExpires > Date.now())){
        return res.status(403).json({
            success:false,
            message:'Token is expired, please regenerate your token',
        });
    }
    //hash password
    const encryptedPassword = await bcrypt.hash(password, 10);
    //update password
    await User.findOneAndUpdate(
        {token: token},
        {password: encryptedPassword},
        {new:true},
    );
    //return response
    res.json({
        success:true,
        message:'Password reset successful',
    });
        
    } catch (error) {
        return res.json({
            error: error.message,
            success:false,
            message:"Something went wrong while sending reset password mail",
        }); 
    }
    
};

