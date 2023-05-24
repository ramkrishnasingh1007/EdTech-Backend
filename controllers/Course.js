const Course = require("../models/Course");
const Category = require("../models/Category");
const User = require("../models/User");
const {uploadImageToCloudinary} = require("../utils/imageUploader");


//createCourse handler fn.
exports.createCourse = async (req,res) => {
    try {
        const userId = req.user.id;

        //fetch data
        let {courseName, courseDescription, whatYouWillLearn, price, tag, category, status, instructions} = req.body;

        //get thumbnail
        const thumbnail = req.files.thumbnailImage;

        //validation
        if(!courseName || !courseDescription || !whatYouWillLearn || !price || !tag || !thumbnail || !category){
            return res.status(400).json({
                success:false,
                message:'All fields are required',
            });
        }
        if (!status || status === undefined) {
			status = "Draft";
		}

        //check for instructor
      
        const instructorDetails = await User.findById(userId, {
            accountType: "Instructor",
        });
     
        // verify userId and instructorDetails._id are same or different?

        if(!instructorDetails){
            return res.status(404).json({
                success:false,
                message:'Instructor details not found!',
            });

        }

        //check given tag is valid or not
        const categoryDetails = await Category.findById(category);
        if(!categoryDetails){
            return res.status(404).json({
                success:false,
                message:'Category details not found!',
            });
        }

        //upload image to cloudinary
        const thumbnailImage = await uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME);
        console.log(thumbnailImage);
        //create an entry for new course
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor: instructorDetails._id,
            whatYouWillLearn: whatYouWillLearn,
            price,
            tag: tag,
            category: categoryDetails._id,
            thumbnail:thumbnailImage.secure_url,
            status: status,
            instructions: instructions,
        });

        //add the new course to the user schema of instrcutor
        await User.findByIdAndUpdate(
            {_id: instructorDetails._id},
            {
                $push:{
                    courses: newCourse._id,

                },
            },
            {new:true},
        );

        //update the TAG ka schema -- HW
        await Category.findByIdAndUpdate(
			{ _id: category },
			{
				$push: {
					course: newCourse._id,
				},
			},
			{ new: true }
		);

        //return response
         res.status(200).json({
            success:true,
            message:'Course created successfully',
            data: newCourse,
        });
        
    } catch(error) {
        console.error(error);
        res.status(500).json({
            success:false,
            message:'Failed to create Course',
            error: error.message,
        });
        
    }
};


//getAllCourses handler fn.

exports.getAllCourses = async (req, res)=>{
    try {

        const allCourses = await Course.find({}, {
            price:true,
            courseName:true,
            thumbnail:true,
            instructor: true,
            ratingAndReview:true,
            studentsEnrolled:true,
        }).populate("Instructor").exec();
    
        return res.status(200).json({
            success:true,
            message:'Data for all courses fetched successfully',
            data:allCourses,

        });
        
    } catch (error) {
        console.log(error);
        return res.status(404).json({
            success:false,
            message:`Cannot fetch course data`,
            error: error.message,
        });
        
    }
};

//getCourseDetails
exports.getCourseDetails = async (req,res) =>{
    try {
        //get id
        const {courseId} = req.body;
        //find course details
        const courseDetails = await Course.find(
                                 {_id:courseId})
                                 .populate(
                                    {
                                        path:"instructor",
                                        populate:{
                                            path:"additionalDetails",
                                        },
                                    }
                                 )
                                 .populate("category")
                                 //.populate("ratingAndreviews")
                                 .populate({
                                    path: "courseContent",
                                    populate:{
                                        path:"subSection",
                                    },
                                 })
                                 .exec();
     //validation
     if(!courseDetails){
        return res.status(400).json({
            success:false,
            message:`Could not find the course with ${courseId}`,
        });
     } 
       //return res
       return res.status(200).json({
        success:true,
        message:"Course Details fetched successfully",
        data:courseDetails,
       });  
                              
                               
    } catch (error) {
       console.log(error);
       return res.status(500).json({
        success:false,
        message: error.message,
       }); 
    
    }
}

