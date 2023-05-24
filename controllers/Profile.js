const Profile = require("../models/Profile");
const User = require("../models/User");
const { uploadImageToCloudinary } = require("../utils/imageUploader");


exports.updateProfile = async (req,res) => {
    try {
        //get data
        const {dateOfBirth="", about="", contactNumber} =req.body;
        //get user id
        const id = req.user.id;

         //find profile by id
         const userDetails = await User.findById(id);
         const profile = await Profile.findById(userDetails.additionalDetails);

         //update profile
        profile.dateOfBirth = dateOfBirth;
        profile.about = about;
        profile.contactNumber = contactNumber;
           
        //save the updated profile
        await profile.save();

        //return res
        return res.json({
            success:true,
            message:'Profile Updated Successfully',
            profile,
        });       
           
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'Issue with Updating Profile. Try later',
            error: error.message,

        });
        
    }
};

//delete Account
// Explore - how can we schedule this deletion operation
//cron job explore

exports.deleteAccount = async (req,res) => {
    try {

      console.log("Printing ID: ", req.user.id);

        //get id
        const id = req.user.id;
        //validation
        const user = await User.findById({_id: id});
        if(!user){
            return res.status(404).json({
                success:false,
                message:'User not found',
            });
        }
        //delete profile
        await Profile.findByIdAndDelete({_id: user.additionalDetails});
        //HW -unenroll user from all enrolled process
        //delete user
        await User.findByIdAndDelete({_id:id});
        //return res
        res.status(200).json({
            success:true,
            message:'User Deleted Successfully',

        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success:false,
            message:'Issue with deleting User credentials. Try later',
            error: error.message,

        });
        
    }
};

//getAllUserDetails


exports.getAllUserDetails = async(req, res) => {
    try {
        //get id
        const id = req.user.id;
        //validation and get user details
        const userDetails = await User.findById(id).populate("additionalDetails").exec();
         console.log(userDetails);
        //return res
        res.status(200).json({
            success:true,
            message:"User details fetched successfully",
            data: userDetails,
        });

        
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:'Issue with fetching User details. Try later',
            error: error.message,
        
       });
}
};

exports.updateDisplayPicture = async (req, res) => {
    try {
      console.log("picture hain");
      const displayPicture = req.files.displayPicture;
      console.log("picture hain");

      const userId = req.user.id;
      const image = await uploadImageToCloudinary(
        displayPicture,
        process.env.FOLDER_NAME,
        1000,
        1000,
        console.log("picture hain")

      )

      console.log(image)
      const updatedProfile = await User.findByIdAndUpdate(
        { _id: userId },
        { image: image.secure_url },
        { new: true }
      )
      res.send({
        success: true,
        message: `Image Updated successfully`,
        data: updatedProfile,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
};
  
exports.getEnrolledCourses = async (req, res) => {
    try {
      const userId = req.user.id
      const userDetails = await User.findOne({
        _id: userId,
      })
        .populate("courses")
        .exec()
      if (!userDetails) {
        return res.status(400).json({
          success: false,
          message: `Could not find user with id: ${userDetails}`,
        })
      }
      return res.status(200).json({
        success: true,
        data: userDetails.courses,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
};