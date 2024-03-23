const product = require("../models/product_schema")
const brand = require("../models/brand_schema")
const category = require("../models/category_schema")
const cart = require("../models/cart_schema")
const user = require("../models/user_schema")
const order = require("../models/order_schema")
const wallet= require("../models/wallet_schema")
const Razorpay = require('razorpay')
const { RAZORPAY_ID_KEY, RAZORPAY_SECRET_KEY } = process.env;
const crypto = require('crypto');
const Swal=require("sweetalert2")


var instance = new Razorpay({
    key_id: RAZORPAY_ID_KEY,
    key_secret: RAZORPAY_SECRET_KEY,
});

module.exports = {


    postCheckout: async (req, res) => {
        try {
            let total = 0
            if (req.session.amounttopay === 0 || !req.session.amounttopay) {
                total = req.session.grandTotal          //total amount from session
            } else {
                total = req.session.amounttopay
            }

            const walletTotal=req.session.walletAmount;
            // const total=req.session.grandTotal;
            const addressId = req.body.address;
            const checkTotal = walletTotal - total;
            const paymentMethod = req.body.payment;
            const quantity = req.session.totalQuantity    //total quantity from session 
            const userMail = req.session.userEmail            //user mail from session            
            const newUser = await user.findOne({ email: userMail })     //finding user            
            const dbAddress = newUser.address       //placing address id from user to dbAddress
            const newCart = await cart.findOne({ userId: newUser.id })   //getting the cart id from user id           
            const shipAddress = dbAddress.find((item) => item._id.equals(addressId))    //comparing shipping address from body with the db address id
                      
            if (paymentMethod === "walletPayment" && checkTotal < 0) {
                req.flash("error", "you dont have enough balance in your wallet. pls try other payment method")
                res.redirect("/cart")
            } else {
                if (shipAddress && paymentMethod) {
                    const add = {
                        name: shipAddress.name,
                        houseName: shipAddress.houseName,
                        pincode: shipAddress.pincode,
                        city: shipAddress.city,
                        state: shipAddress.state,
                        mobile: shipAddress.mobile,
                        altMobile: shipAddress.altMobile
                    }
                  
                let method = "", pay = "";
                if (paymentMethod == "COD") {
                    if (total > 1000) {
                        req.flash("error", "COD not available for orders above Rs 1000.");
                        return res.redirect("/checkout");
                    }
                    method = "COD";
                    pay = "Pending";
                } else {
                    method = "Wallet";
                    pay = "Paid";
                }
                    let couponDiscount = 0
                    if (req.session.couponDiscount != 0) {
                        couponDiscount = req.session.couponDiscount
                    }

                    const newOrder = new order({
                        userId: newUser.id,
                        status: "Order Placed",
                        items: newCart.items,
                        paymentMethod: method,
                        orderDate: new Date(),
                        // deliveryDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),//four days (4 * 24 hours * 60 minutes * 60 seconds * 1000 milliseconds).
                        totalAmount: total,
                        totalQuantity: quantity,
                        paymentStatus: pay,
                    couponDiscount: couponDiscount,
                        address: add
                    })                    
                    
                    const currentOrder = await newOrder.save()  //saving the new order to database
                    await cart.findByIdAndDelete({ _id: newCart._id }) //finding the cart and deleting the cart
                         
                    if (paymentMethod == "walletPayment") {
                        const newWallet = new wallet({
                            userId: newUser.id,
                            orders: currentOrder._id,
                            status: "Debit",
                            totalAmount: currentOrder.totalAmount
                        })
                        
                       
                        await newWallet.save()
                    }



                    //updating the stock when order is placed
                    for (item of currentOrder.items) {
                        const productId = item.productId
                        const quantity = item.quantity
                        const newProduct = await product.findById(productId)
                        if (newProduct) {
                            const newQuantity = newProduct.stock - quantity
                            if (newQuantity <= 0) {
                                newProduct.stock = 0
                                newProduct.status = "Out of Stock"
                                await newProduct.save()
                            } else {
                                newProduct.stock = newQuantity
                                await newProduct.save()
                            }
                        }
                    }
                     req.flash("success", "your order has been place succesfully. Please visit order tab for details")
                     res.redirect("/order_success")
                   
                } else {
                    
  
                    req.flash("error", "shipping address and payment method need not be blank")
                     res.redirect("/checkout")
                }
            }

        } catch (error) {

        }
    },

    //   ======================================================================================payment============================================================================
    createOrder: async (req, res) => {
        try {

            const addressID = req.query.addressID;
            const paymentMethods = req.query.paymentMethod;
            // console.log(addressID);
            //  console.log(paymentMethods);
            //  console.log('@!!!@@');
            req.session.address = addressID;
            let total = req.session.grandTotal
            // if (req.session.amounttopay === 0 || !req.session.amounttopay) {
            //     total = req.session.grantTotal          //total amount from session
            // } else {
            //     total = req.session.amounttopay
            // }

            //const total = req.session.grantTotal;



            // console.log(total);
            var options = {
                amount: total * 100,
                currency: "INR",
                receipt: "order_rcptid_11",
            };
            const order = await instance.orders.create(options);
            return res.json({ success: true, order, messsge: '@@@@@' });
        } catch (error) {
            console.error(error);

        }
    },

    verifyPayment: async (req, res) => {
        let hmac = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET_KEY);
        hmac.update(
            req.body.payment.razorpay_order_id +
            "|" +
            req.body.payment.razorpay_payment_id
        );
        hmac = hmac.digest("hex");
        if (hmac === req.body.payment.razorpay_signature) {
            const orderId = req.body.order.receipt;
            const orderID = req.body.orderId;
            // const updateOrderDocument = await order.findByIdAndUpdate(orderID, {
            //     PaymentStatus: "Paid",
            //     paymentMethod: "Online",
            // });           
            res.json({ success: true });
        } else {
            res.json({ failure: true });
        }
    },

   
    // online Payment Post for order creation
    onlineCheckOut: async (req, res) => {
        try {
            // console.log(req.session);
            const addressId = req.session.address    //shipping address id from the body            
            const paymentMethod = req.body.payment //payment method from the body 
            let total = req.session.grantTotal;
            // if (req.session.amounttopay === 0 || !req.session.amounttopay) {
            //     total = req.session.grantTotal          //total amount from session
            // } else {
            //     total = req.session.amounttopay
            // }

            // const total = req.session.grantTotal  //total amount from session
            total = Number(req.session.grandTotal)
            const quantity = req.session.totalQuantity    //total quantity from session 
            const userMail = req.session.userEmail
            const findUser = await user.findOne({ email: userMail })
            const userId = findUser.id

            console.log("test paymenttttttt")
            const newUser = await user.findById({ _id: userId })     //finding user            
            const dbAddress = newUser.address     //placind address id from user to dbAddress
            const newCart = await cart.findOne({ userId: userId })   //getting the cart id from user id           
            const shipAddress = dbAddress.find((item) => item._id.equals(addressId))    //comparing shipping address from body with the db address id
            //updating the order in database           
            if (shipAddress) {
                const add = {
                    name: shipAddress.name,
                    houseName: shipAddress.houseName,
                    pincode: shipAddress.pincode,
                    city: shipAddress.city,
                    state: shipAddress.state,
                    mobile: shipAddress.mobile,
                    altMobile: shipAddress.altMobile
                }
                let couponDiscount = 0
                if (req.session.couponDiscount != 0) {
                    couponDiscount = req.session.couponDiscount
                }
                const newOrder = new order({
                    userId: userId,
                    status: "Order Placed",
                    items: newCart.items,
                    paymentMethod: "Online",
                    orderDate: new Date(),
                    // deliveryDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),//four days (4 * 24 hours * 60 minutes * 60 seconds * 1000 milliseconds).
                    totalAmount: total,
                    totalQuantity: quantity,
                    paymentStatus: "Paid",
                    couponDiscount: couponDiscount,
                    address: add
                })
                const currentOrder = await newOrder.save()  //saving the new order to database
                await cart.findByIdAndDelete({ _id: newCart._id }) //finding the card and deleting the cart               

                //updating the stock when order is placed
                for (item of currentOrder.items) {
                    const productId = item.productId
                    const quantity = item.quantity
                    const newProduct = await product.findById(productId)
                    if (newProduct) {
                        const newQuantity = newProduct.stock - quantity
                        if (newQuantity <= 0) {
                            newProduct.stock = 0
                            newProduct.status = "Out of Stock"
                            await newProduct.save()
                        } else {
                            newProduct.stock = newQuantity
                            await newProduct.save()
                        }
                    }
                }
                req.flash("success", "your order has been place succesfully. Please visit order tab for details")
                res.json({ success: true })
                res.render("./user/order_success")
            }
            else {
                req.flash("error", "shipping address and payment method need not be blank")
                res.redirect("/checkOut")
            }
        } catch (error) {
            console.log(error);

        }
    },
 
    

    getOrderSuccess: async (req, res) => {
        try {
            res.render("./user/order_success")
        } catch (error) {

        }
    }
};