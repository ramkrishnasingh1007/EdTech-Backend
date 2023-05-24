const Section = require("../models/Section");
const Course = require("../models/Course");

exports.createSection = async (req, res) =>{
     try {
        // data fetch 
        const {sectionName, courseId} = req.body;
        //data validation
        if(!sectionName || !courseId) {
            return res.status(400).json({
                success:false,
                message:'Missing Properties',
            });
        }
        //create section
        const newSection = await Section.create({sectionName});
        //update course with section objectID
        const updatedCourse = await Course.findByIdAndUpdate(
                                                  courseId,
                                                  {
                                                    $push:{
                                                      courseContent: newSection._id,  
                                                    },
                                                  },
                                                  {new:true}
                                                )
                                                .populate({
                                                    path: "courseContent",
                                                    populate: {
                                                        path: "subSection",
                                                    },
                                                })
                                                .exec();
        //hW : use populate to replace section & sub-section both in updatedCourseDetails done                                       
        //return response
        res.status(200).json({
            success:true,
            message:'Section created successfully',
            updatedCourse,
        })

     } catch (error) {
        return res.status(500).json({
            success:false,
            message:'Unable to create section. Please try again',
            error:error.message,
        });
        
     }


};

exports.updateSection = async (req,res) =>{
    try {
        //data lena padega as input
         const {sectionName, sectionId} = req.body;
         const section = await Section.findByIdAndUpdate(sectionId, {sectionName}, {new:true});

            res.status(200).json({
                success:true,
                message:section,
            });
        
           
    } catch (error) {
        console.error("Error updating section:", error);
        res.status(500).json({
            success:false,
            message:'Unable to update section. Please try again',
        });
    }
};

exports.deleteSection = async (req,res) =>{
    try {
        //get id - sending id's in params
        const {sectionId} = req.params;
        //use findByIdAndDelete
        await Section.findByIdAndDelete(sectionId);
        //Hw [in testing] - do we need to delete the entry from course schema?
        //res return
        res.status(200).json({
            success:true,
            message:"Section deleted successfully"
        });
        
    } catch (error) {
        console.error("Error deleting section", error);
        res.status(500).json({
            success:false,
            message:'Unable to delete section. Please try again',
        });
    }
};