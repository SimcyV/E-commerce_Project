const product = require("../models/product_schema");
const cart = require("../models/cart_schema");
const user = require("../models/user_schema");
const Swal=require("sweetalert2")
const coupon=require("../models/coupon_schema")



module.exports = {
    // cart
    getCart: async (req, res) => {
        try {
            const email = req.session.userEmail;
            const newUser = await user.findOne({ email: email });
            const userId = newUser?.id;
            const newCart = await cart.findOne({ userId: userId }).populate("items.productId");
            let total = 0;
            let totalQuantity = 0;
            if (newCart) {
                newCart.items.forEach((item) => {
                    if (item.productId) { 

                        if(item.productId.offerprice===0){
                            total += item.quantity * (item.productId.price - item.productId.discount)
                        }else{
                            total += item.quantity * (item.productId.offerprice)
                        }
                        totalQuantity += item.quantity
                        req.session.grandTotal = total
                        req.session.totalQuantity = totalQuantity
                    }
                });
                
                res.render("./user/user_cart", { newCart, total, totalQuantity });
            } else {
                res.render("./user/user_cart", { newCart, total, totalQuantity });
            }
           
        } catch (error) {
            console.error(error);
            res.status(500).send("Internal Server Error");
        }
    },

    getAddCart: async (req, res) => {
        try {
            const id = req.params.id;
            const newProduct = await product.findOne({ _id: id });
            const stock = newProduct.stock;
            const email = req.session.userEmail;
            const newUser = await user.findOne({ email: email });
            const userId = newUser?.id;
            const check = await cart.findOne({ userId: userId });
            if (check !== null) {
                var currentCart = check.items.find((item) => {
                    return item.productId.equals(id);
                });
                if (currentCart) {
                    if (currentCart.quantity < stock) {
                        currentCart.quantity += 1;
                    } else {
                        res.json({});
                        return;
                    }
                } else {
                    if (stock > 0) {
                        check.items.push({ productId: id, quantity: 1 });
                    } else {
                        res.json({});
                        return;
                    }
                }
                await check.save();
                res.json({
                    success: true,
                });
            } else {
                if (stock > 0) {
                    const newCart = new cart({
                        userId: newUser?.id,
                        items: [{ productId: id, quantity: 1 }],
                    });
                    await newCart.save();
                    res.json({
                        success: true,
                    });
                } else {
                    res.json({});
                }
            }
        } catch (error) {

        }
    },


// update Quantity
postUpdatequantity:async(req,res)=>{
    try {
      
      const {productId,quantity,carts}=req.body; 
      const email = req.session.user
      const newUser = await user.findOne({ email: email })
      const dbproduct = await product.findOne({ _id: productId })
      const dbstock = dbproduct.stock;
      const newCart = await cart.findOne({ _id: carts }).populate("items.productId") 
      if (quantity > dbstock) {
        res.json({})
    } else {
        const productInCart = newCart.items.find((item) => item.productId.equals(productId))
        productInCart.quantity = quantity
        await newCart.save()
        res.json({
            success: true
        })
    }
    } catch (error) {
        
    }
},

    // remove cart items
    getRemoveCart: async (req, res) => {
        try {
            const { id } = req.params;
            const email = req.session.userEmail
            const newUser = await user.findOne({ email: email })
            const userId = newUser?._id
            const delItem = await cart.findOneAndUpdate({ userId: userId }, { $pull: { items: { productId: id } } }, { new: true })
            req.flash("success","Product removed successfully..")
            res.redirect("/cart")
        } catch (error) {
           
        }
    },


   // checkout
   getCheckout:async(req,res)=>{
    try {
        const email=req.session.userEmail;
        const newUser=await user.findOne({email:email})
        const address=newUser?.address;
        const total=req.session.grandTotal;
        const quantity=req.session.totalQuantity;

        let newcoupon=0
            if (total >= 50000 && total <= 99999) {
                newcoupon = await coupon.find({status:"Active",discount: { $gte: 5, $lte: 9 } })                
            } else if (total >=100000 && total <= 149999) {
                newcoupon = await coupon.find({ status:"Active",discount: { $gte: 10, $lte: 14 } })                
            }
            else if (total >=150000 && total <= 199999) {
                newcoupon = await coupon.find({ status:"Active",discount: { $gte: 15, $lte: 19 } })
            } 
        
       res.render("./user/user_checkout",{address,total,quantity,newcoupon})
    } catch (error) {
        
    }
},
};
