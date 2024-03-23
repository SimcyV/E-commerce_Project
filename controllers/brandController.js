const brand=require("../models/brand_schema")
const category=require("../models/category_schema")
const product=require("../models/product_schema")


module.exports = {

   // ................................................BRAND ROUTES.....................................................
   getBrand:async(req,res)=>{
      try {

         const page = parseInt(req.query.page) || 1; // Get the page number from query parameters
        const perPage = 5; // Number of items per page
        const skip = (page - 1) * perPage;
        const newBrands = await brand.find({}).sort({ name: 1 }).skip(skip).limit(perPage);
        const totalCount = await brand.countDocuments();
        res.render("./admin/brands", {
         newBrands,
            currentPage: page,
            perPage,
            totalCount,
            totalPages: Math.ceil(totalCount / perPage),
        });
         // const newBrands=await brand.find({}) 
         // const categories=await category.find({}) 
         // res.render("./admin/brands",{newBrands,categories})
      } catch (error) {
         console.log(error);
      }
   },


   getAddBrand: (req, res) => {
      try {
         res.render("./admin/add_brand")
      } catch (error) {
         console.log("brand err");
      }
   },


postAddBrand:async(req,res)=>{
   try {
      const brandName=req.body.name;
      const newBrand=await brand.findOne({name:brandName})
      if(newBrand){
         // console.log("Brand name already exist");
         req.flash("error","Brand already exists!!")
      }else{
         await brand.create(req.body)
         // console.log("Brand added successfully");
         req.flash("success","Brand added successfully")
      }
      res.redirect("/addbrand")
      
   } catch (error) {
      
   }
},

getEditBrand:async(req,res)=>{
try {
   const {id}=req.params;   
   const brandEdit=await brand.findOne({_id:id})  
   res.render("./admin/edit_brand",{brandEdit})
} catch (error) {
   
}
},


postEditBrand:async(req,res)=>{
   try {
      const {id}=req.params;
      // console.log(id);
      const name=req.body.name;
      const checkBrand=await brand.findOne({name:name})
      if(checkBrand){                
         req.flash("error","Brand already exists!!")
     }else{
         const editBrand=await brand.findByIdAndUpdate({_id:id},{name:name})
         req.flash("success","Brand edited successfully")
     }
     res.redirect("/brand")

   
   } catch (error) {
      
   }
},

getBrandCancel:(req,res)=>{
try {
   res.redirect("/brand")
} catch (error) {
   
}
},

getBlockBrand:async(req,res)=>{
   try {
      const {id}=req.params;
      const brandData=await brand.findOne({_id:id})
      if(brandData.status=="Active"){
         const user=await brand.findByIdAndUpdate(id,{status :"Blocked"})
         res.redirect("/brand")
      }else if(brandData.status=="Blocked"){
         const user1=await brand.findByIdAndUpdate(id,{status:"Active"})
         res.redirect("/brand")
      }
   } catch (error) {
      
   }
},

getDeleteBrand:async(req,res)=>{
   try {
      const {id}=req.params;
      const brandDetails=await product.findOne({brand:id})
      if(brandDetails){
         req.flash("error","Brand already in use, can't delete")
            res.redirect("/brand")
      }else{
         const brandDetails= await brand.findByIdAndDelete({_id:id})
         req.flash("success","Brand deleted successfully...")
         res.redirect("/brand")
      }
   } catch (error) {
      
         }         
   },
}





