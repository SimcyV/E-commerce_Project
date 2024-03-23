const order=require("../models/order_schema");
const product=require("../models/product_schema");
const wishlist=require("../models/wishlist_schema");
const user=require("../models/user_schema")
const Swal=require("sweetalert2")
module.exports={
   getWishlist:async(req,res)=>{
    try {       
        const userMail=req.session.userEmail
        const newUser=await user.findOne({email:userMail})
        const userId=newUser.id;
        const displayProduct=await wishlist.findOne({userId:userId}).populate("products")
        res.render("./user/wishlist",{displayProduct})
    } catch (error) {
        
    }
   } ,
   
addWishlist: async (req, res) => {
    try {
        const { id } = req.params;
        const userMail=req.session.userEmail
        const newUser=await user.findOne({email:userMail})
        const userId=newUser.id;
        const data = await wishlist.findOne({ userId: userId });
        if (data === null){
            const newwishlist = await wishlist.create({
                userId: userId,
                products: [id]  
            });
        } else if (data.products.includes(id)) {
             req.flash("error", "Product already in the wishlist");
          
            return res.redirect("/dashboard");
        } else {
            data.products.push(id);
            await data.save();

        }
        req.flash("success", "Product added to wishlist");
        res.redirect("/dashboard");
    } catch (error) {       
        
    }
},
getdeleteWishlist:async (req,res)=>{
    try {
        const{id}=req.params
        const userMail=req.session.userEmail
        const newUser=await user.findOne({email:userMail})
        const result=await wishlist.findOneAndUpdate(
            {userId:newUser.id},
            {$pull:{products:id}},
            {new:true}           
            )
            console.log(result);
            res.redirect("/wishlist")        
    } catch (error) {
            
    }
},
}

