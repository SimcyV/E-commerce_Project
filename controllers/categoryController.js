const product=require("../models/product_schema")
const category=require("../models/category_schema")
const flash=require("express-flash")

module.exports = {

    // .................................................  Category Routes ........................................... 
    getCategory:async(req,res)=>{
        try{
            const page = parseInt(req.query.page) || 1; // Get the page number from query parameters
            const perPage = 5; // Number of items per page
            const skip = (page - 1) * perPage;
            const categories = await category.find({}).sort({ name: 1 }).skip(skip).limit(perPage);
            const totalCount = await category.countDocuments();
            res.render("./admin/category", {
                categories,
                currentPage: page,
                perPage,
                totalCount,
                totalPages: Math.ceil(totalCount / perPage),
            });
            // const categories=await category.find({}) 
            // res.render("./admin/category",{categories})
        } catch (error) {
            console.error(error)
        }
    },


    getAddCategory: (req, res) => {
        try {
            res.render("./admin/add_category")
        } catch (error) {
            console.log("error");
        }

    },

    postAddCategory:async(req,res)=>{
        try {
            const name=req.body.name
            const addcategory=await category.findOne({name:name});
            if(addcategory){
                // console.log("category already exists");
                req.flash("error","Category already exists!!")
            }else{
                await category.create(req.body)
                req.flash("success","Category added successfully")
            }       
            res.redirect("/addcategory")
            
        } catch (error) {
            
        }
    },


    getEditCategory:async(req,res)=>{
        try {
            const {id}=req.params            
             const categoryEdit=await category.findOne({_id:id})
             const categories=await category.find({})
             res.render("./admin/edit_category",{categories, categoryEdit})
        } catch (error) {
            
        }
    },

    postEditCategory:async(req,res)=>{
        try {
            const {id}=req.params;
            const name=req.body.name;
            const checkCategory=await category.findOne({name:name})
            if(checkCategory){                
                req.flash("error","Category already exists!!")
            }else{
                const editCategory=await category.findByIdAndUpdate({_id:id},{name:name})
                req.flash("success","Category edited successfully")
            }

            res.redirect("/category")
        } catch (error) {
            
        }
    },


    getDeleteCategory:async(req,res)=>{
        try {
            const {id}=req.params;
            const categoryData=await category.findOne({_id:id}) 
            if(categoryData.status =="Active"){
                const user=await category.findByIdAndUpdate(id,{status:"Blocked"})
                res.redirect("/category")
            }else if(categoryData.status =="Blocked"){
                const user1=await category.findByIdAndUpdate(id,{status:"Active"})
                res.redirect("/category")
            }
        } catch (error) {
            
        }
    },

    getRemoveCategory:async(req,res)=>{
        try {
         const {id}=req.params;
         const removeCat=await product.findOne({category:id})        
         if(removeCat){
            req.flash("error","Category already in use, can't delete")
            res.redirect("/category")
         }else{
            const removecategory= await category.findByIdAndDelete({_id:id})
            req.flash("success","Category deleted successfully...")
            res.redirect("/category")
         }         
        } catch (error) {
            
        }
    },
 // .......................................................... End ....................................................

}