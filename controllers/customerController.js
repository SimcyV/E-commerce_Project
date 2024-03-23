const users=require("../models/user_schema");

module.exports={


    getCustomers:async (req,res)=>{
        try {
            const page = parseInt(req.query.page) || 1; // Get the page number from query parameters
            const perPage = 5; // Number of items per page
            const skip = (page - 1) * perPage;
            const user = await users.find({}).sort({ name: 1 }).skip(skip).limit(perPage);
            const totalCount = await users.countDocuments();
            res.render("./admin/customers", {
                user,
                currentPage: page,
                perPage,
                totalCount,
                totalPages: Math.ceil(totalCount / perPage),
            });

            // const user=await users.find()
            // console.log(user);
            // res.render("./admin/customers",{user})
        } catch (error) {
            
        }
    },

    getBlockUnblock:async(req,res)=>{
        try {
            const {id}=req.params;
            const userData=await users.findOne({_id:id})
            if(userData.status =="Active"){
                const user=await users.findByIdAndUpdate(id,{status:"Blocked"})
                res.redirect("/customers")
            }else if(userData.status =="Blocked"){
                const user1=await users.findByIdAndUpdate(id,{status:"Active"})
                res.redirect("/customers")
            }
        } catch (error) {
            
        }
    }
}