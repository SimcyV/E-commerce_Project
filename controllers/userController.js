const product = require("../models/product_schema")
const category = require('../models/category_schema')
const user = require("../models/user_schema")
const bcrypt = require("bcrypt")
const otpFunction = require("../utility/otpVerification")
const OTP = require("../models/otp_schema")
const cart = require("../models/cart_schema")
const brand = require("../models/brand_schema")
const wallet = require("../models/wallet_schema")
const order = require("../models/order_schema")
const coupon = require("../models/coupon_schema")
module.exports = {

    base: async (req, res) => {
        try {
            const categories = await category.find()
            const products = await product.find({}).populate("brand category")
            res.render("./user/user_landing", { categories, products })
        } catch (error) {
            console.error(error)
        }
    },

    dash: async (req, res) => {
        try {
            if (req.session.login) {
                const categories = await category.find()
                // const products = await product.find({}).populate("brand category")
                // console.log(products);
                const userMail = req.session.userEmail
                const newUser = await user.findOne({ email: userMail })
                const userId = newUser.id;
                // console.log(userId);
                const newWallet = await wallet.find({ userId: userId }).populate('orders')
                // console.log(newWallet);
                let debitAmount = 0, creditAmount = 0, walletTotal = 0
                for (x of newWallet) {
                    if (x.status === "Debit") {
                        debitAmount += x.totalAmount
                    } else if (x.status === "Credit") {
                        creditAmount += x.totalAmount
                    }
                }
                const walletamounts = await user.findOne({ _id: userId })
                // walletTotal = creditAmount + walletamounts.referedAmount - debitAmount
                walletTotal = creditAmount - debitAmount
                req.session.walletAmount = walletTotal
                // res.render("./user/dashboard", { categories, products })
                const page = parseInt(req.query.page) || 1; // Get the page number from query parameters
                const perPage = 8; // Number of items per page
                const skip = (page - 1) * perPage;
                const products = await product.find({ display: "Active" }).populate("brand category").sort({ name: 1 }).skip(skip).limit(perPage);
                // const products = await product.find({ display: "Active" }).populate("brand category");


                const totalCount = await product.countDocuments();
                res.render('./user/dashboard', {
                    products,
                    currentPage: page,
                    perPage,
                    totalCount,
                    totalPages: Math.ceil(totalCount / perPage),
                });
            }
            else {
                res.redirect('/')
            }
        } catch (error) {
            console.error(error)
        }
    },


    // to sigin page
    getSignin: (req, res) => {
        try {
            res.render("./user/user_signin")
        } catch (error) {
            console.log(error);
        }
    },

    postSignin: async (req, res) => {
        try {
            const { email, password } = req.body;
            const products = await product.find({})
            const checkUser = await user.findOne({ email: email })
            if (checkUser) {
                if (checkUser.status === "Active") {
                    const passwordMatch = await bcrypt.compare(password, checkUser.password)
                    if (passwordMatch) {
                        req.session.login = true;
                        req.session.userEmail = email;
                        res.redirect('/dashboard')
                    } else {
                        req.flash("error", "Invalid credentials please try again")
                        res.redirect("/signin")
                    }
                } else {
                    req.flash("error", "User blocked by admin")
                    res.redirect("/signin")
                }
            } else {
                req.flash("error", "User not exists,please sign-up to proceed")
                res.redirect("/signin")
            }
        } catch (error) {

        }
    },

    getUserProductDetails: async (req, res) => {
        try {
            const { id } = req.params
            const productToDisplay = await product.findOne({ _id: id }).populate('brand category')
            res.render("./user/product_details", { productToDisplay })
        } catch (error) {

        }
    },


    // signup page
    getSignup: (req, res) => {
        try {
            const referal=req.query.ref            
            if (referal!=undefined){
                req.session.referal=referal
            }
            res.render("./user/user_signup")
        } catch (error) {

        }
    },



    postSignup: async (req, res) => {
        try {
            console.log(req.session.referal," iam in post");
            const { name, email, password } = req.body;
            const newUser = await user.findOne({ email: email })
            if (newUser) {
                req.flash("error", "Email already exists,please try another one.")
                res.redirect("/signup")
            } else {
                const hashPwd = await bcrypt.hash(password, 12)
                const currentUser = new user({ name, email, password: hashPwd })
                otpToBeSent = otpFunction.generateotp()
                const result = otpFunction.sendOTP(req, res, email, otpToBeSent)
                req.session.logged = true
                req.session.user = currentUser
                res.redirect("/otpverify")
            }

        } catch (error) {

        }
    },



    // forgot password
    getForgotpwd: (req, res) => {
        res.render("./user/user_forgotpwd")
    },
    postForgotpwd: async (req, res) => {
        try {
            const { email } = req.body
            const checkMail = await user.findOne({ email: email })

            if (checkMail && checkMail.status === "Active") {
                req.session.email = email
                otpToBeSent = otpFunction.generateotp()
                const result = otpFunction.sendOTP(req, res, email, otpToBeSent)
                res.redirect("/otpSignup")
            } else {
                req.flash("error", "Invalid email.Something went wrong!!")
                res.redirect("/forgotPwd")
            }
        } catch (error) {
            console.error(error);
        }
    },

    getOtpSignup: async (req, res) => {
        try {
            res.render("./user/otp_signup")

        } catch (error) {

        }

    },

    postOtpSignup: async (req, res) => {
        try {
            const { otp } = req.body
            const email = req.session.email
            const userDbOtp = await OTP.findOne({ email: email })
            if (userDbOtp) {
                if (userDbOtp.otp === Number(otp)) {
                    res.redirect("/pwdRecovery")
                } else {
                    req.flash("error", "Wrong OTP, try again......")
                    res.redirect("/otpSignup")
                }
            } else {
                req.flash("error", "Something went wrong, pls try again...")
                res.redirect("/otpSignup")
            }
        } catch (error) {

        }

    },

    // otp verify
    getOtpVerify: (req, res) => {
        try {
            res.render("./user/user_otpverification")
        } catch (error) {

        }
    },

    postOtpVerify: async (req, res) => {
        try {            
            const { otp } = req.body
            const { name, email, password } = req.session.user
            const userDbOtp = await OTP.findOne({ email: email })          
            if (userDbOtp.otp === Number(otp)) {
                const newuser = new user({
                    name: name,
                    email: email,
                    password: password
                })               
                await newuser.save()
                const referaluser=await user.findOne({email:newuser.email})
                const id=referaluser._id
                const updatereferaluser=await user.findByIdAndUpdate(id,{$set:{referredBy:req.session.referal}})
                const updateUser=await user.findOne({_id:req.session.referal})                
                if(updateUser){
                    const referedAmount=updateUser.referedAmount ||0;
                    var total=referedAmount+100;   
                    const newupdateUser=await user.findByIdAndUpdate(
                        req.session.referal,{$set:{referedAmount:total}}
                    )
                    const newupdateUser1=await user.findByIdAndUpdate(
                        req.session.referal,{$push:{referredUsers:id}}
                    )
                }
                res.render("./user/user_signin")
                req.session.login=false;
                req.session.destroy();
            } else {
                req.flash("error", "Invalid OTP")
                res.redirect("/otpVerify")
            }

        } catch (error) {

        }
    },

    // otp resend for forgotpasssword
    getOtpResendForgotSignup: async (req, res) => {
        try {
            const users = await OTP.findOne({ email: req.session.email })

            if (users == null) {
                email = req.session.email
                otpToBeSent = otpFunction.generateotp();
                const result = otpFunction.sendOTP(req, res, email, otpToBeSent)
                req.flash("success", "New OTP send successfully")
                res.redirect("/otpSignup")
            } else {
                console.log(users.otp);
                req.flash("error", "OTP already send")
                res.redirect("/otpSignup")
            }

        } catch (error) {

        }
    },

    // otp resend
    getOtpResend: async (req, res) => {
        try {
            const users = await OTP.findOne({ email: req.session.user.email })

            if (users == null) {
                email = req.session.user.email
                otpToBeSent = otpFunction.generateotp();
                const result = otpFunction.sendOTP(req, res, email, otpToBeSent)
                req.flash("success", "New OTP send successfully")
                res.redirect("/otpverify")
            } else {
                console.log(users.otp);
                req.flash("error", "OTP already send")
                res.redirect("/otpverify")
            }

        } catch (error) {

        }
    },

    // confirm password
    getConfirmpwd: (req, res) => {
        try {
            res.render("./user/dashboard")
        } catch (error) {

        }
    },

    // password recovery
    getPwdRecovery: (req, res) => {
        try {
            res.render("./user/user_confirmpwd")
        } catch (error) {

        }
    },

    postPwdRecovery: async (req, res) => {
        try {
            const email = req.session.email
            // const checkUser=await user.findOne({email:email})
            const { password } = req.body;
            const hashPwd = await bcrypt.hash(password, 12);
            const updateUser = await user.findOneAndUpdate({ email: email }, { $set: { password: hashPwd } })
            req.flash("success", "Password changed successfully")
            res.redirect("/signin")
        } catch (error) {

        }
    },





    // profile

    getProfile: async (req, res) => {
        try {
            const email = req.session.userEmail
            const newuser = await user.findOne({ email: email }).populate('referredUsers referredBy')
            res.render("./user/user_profile", { newuser })
        } catch (error) {

        }
    },


    // add address
    getUserAddress: async (req, res) => {
        try {
            const userMail = req.session.userEmail
            const newUser = await user.findOne({ email: userMail })
            const addresses = newUser.address
            res.render("./user/user_address", { addresses })
        } catch (error) {

        }
    },

    getAddAddress: (req, res) => {
        try {


            res.render("./user/user_addaddress")
        } catch (error) {

        }
    },

    postAddAddress: async (req, res) => {
        try {

            const email = req.session.userEmail
            console.log(req.body);
            const addressData = {
                name: req.body.name,
                houseName: req.body.houseName,
                city: req.body.city,
                pincode: req.body.pincode,
                state: req.body.state,
                mobile: req.body.mobile,
                altMobile: req.body.altMobile
            };

            const users = await user.findOne({ email: email })
            if (users) {
                users.address.push(addressData)
                await users.save()
                req.flash("success", "User address saved successfully")
                res.redirect("/profile")
            }

        } catch (error) {
            console.error(error)
        }
    },

    // delete address
    getDeleteAddress: async (req, res) => {
        try {
            const { id } = req.params;
            const email = req.session.userEmail;
            const newUser = await user.findOne({ email: email })
            // console.log(newUser);
            const userId = newUser._id
            await user.findByIdAndUpdate({ _id: userId }, { $pull: { address: { _id: id } } })
            res.redirect("/profile")
        } catch (error) {

        }
    },

    getEditAddress: async (req, res) => {
        try {
            const { id } = req.params;
            const email = req.session.user;
            const newUser = await user.findOne({ emaill: email })
            console.log(newUser);
            const addresses = newUser.address.id(id)
            res.render("./user/user_editaddress", { addresses })
        } catch (error) {

        }
    },


    postEditAddress: async (req, res) => {
        try {
            const { id } = req.params;
            const email = req.session.userEmail;
            const newUser = await user.findOne({ email: email })
            const newEditAddress = newUser.address.id(id)

            newEditAddress.name = req.body.name;
            newEditAddress.houseName = req.body.houseName,
                newEditAddress.city = req.body.city,
                newEditAddress.pincode = req.body.pincode,
                newEditAddress.state = req.body.state,
                newEditAddress.mobile = req.body.mobile,
                newEditAddress.altMobile = req.body.altMobile
            await newUser.save()
            req.flash("success", "Address updated successfully......")
            res.redirect("/profile")
        } catch (error) {

        }
    },


    // password change
    getPasswordChange: (req, res) => {
        try {
            const users = req.session.user;
            res.render("./user/user_passwordchange")
        } catch (error) {

        }
    },

    postPasswordChange: async (req, res) => {
        try {
            const { password, newpassword, confirmpassword } = req.body
            const newemail = req.session.userEmail
            const newUser = await user.findOne({ email: newemail })
            const passwordMatch = await bcrypt.compare(password, newUser.password)
            if (passwordMatch == false) {
                req.flash("error", "current password doesnot match")
                res.redirect("/userPasswordChange")
            }
            else if (newpassword === confirmpassword && password != newpassword) {
                console.log(password);
                console.log(newpassword);
                const hashPassword = await bcrypt.hash(newpassword, 12)
                const updatedUser = await user.findOneAndUpdate({ email: newUser.email }, { $set: { password: hashPassword } })
                req.flash("success", "Password changed successfully")
                res.redirect("/dashboard")
            } else {
                req.flash("error", "current password and new password are same")
                res.redirect("/userPasswordChange")
            }
        } catch (error) {

        }
    },

    getFilter: async (req, res) => {
        try {
            req.session.filterdata = null;
            const displayProduct = await product.find({}).sort({ name: 1 })
            const newbrand = await brand.find({})
            const newcategory = await category.find({})
            res.render("./user/user_shop", { displayProduct, newbrand, newcategory })
        } catch (error) {

        }
    },

    postGetFilter: async (req, res) => {

        try {
            const displayProduct = await product.find({});
            const newbrand = await brand.find({});
            const newcategory = await category.find({});

            let filterCriteria = {};


            if (req.body.category) {
                filterCriteria.category = req.body.category;

            }

            if (req.body.brand) {
                filterCriteria.brand = req.body.brand;
            }


            const filteredProducts = await product.find(filterCriteria).sort({ name: 1 });
            req.session.filterdata = filterCriteria
            res.render("./user/user_shop", { displayProduct: filteredProducts, newbrand, newcategory });
        } catch (error) {
            console.error(error);

        }

    },

    // logout
    getLogout: (req, res) => {
        try {
            req.session.destroy()
            res.redirect("/")
        } catch (error) {

        }
    },



    getSearch: async (req, res) => {
        try {
            const newbrand = await brand.find({})
            const newcategory = await category.find({})
            const { name } = req.query
            // console.log("hii",name);
            const displayProduct = await product.find({ name: { $regex: name, $options: 'i' } });
            res.render("./user/user_shop", { displayProduct, newbrand, newcategory })

        } catch (error) {

        }
    },


    postSortby: async (req, res) => {
        try {
            const filterCriteria = req.session.filterdata;
            if (filterCriteria) {
                const { sortBy } = req.body;
                let sortCriteria = {};
                switch (sortBy) {
                    case "A-Z":
                        sortCriteria = { name: 1 };
                        break;
                    case "Z-A":
                        sortCriteria = { name: -1 };
                        break;
                    case "Price-low-high":
                        sortCriteria = { price: 1 };
                        break;
                    case "Price-high-low":
                        sortCriteria = { price: -1 };
                        break;
                    case "New-Arrival":
                        // If you have a field indicating new arrivals in your products collection,
                        // you can sort by that field. For example, assuming 'createdAt' represents the arrival date.
                        sortCriteria = { createdAt: -1 }; // Assuming -1 represents descending order of arrival date
                        break;
                    default:
                        break;
                }
                // console.log(sortCriteria, " this is my sort criteria");

                const displayProduct = await product.find(filterCriteria).sort(sortCriteria);

                const newbrand = await brand.find({});
                const newcategory = await category.find({});
                res.render("./user/user_shop", { displayProduct, newbrand, newcategory });
            } else {
                const { sortBy } = req.body
                if (sortBy === "A-Z") {
                    console.log("iam in a to z");
                    const displayProduct = await product.find({}).sort({ name: 1 })
                    console.log(displayProduct, "product for a to z");
                    const newbrand = await brand.find({})
                    const newcategory = await category.find({})
                    res.render("./user/user_shop", { displayProduct, newbrand, newcategory })
                } else if (sortBy === "Z-A") {
                    const displayProduct = await product.find({}).sort({ name: -1 })
                    const newbrand = await brand.find({})
                    const newcategory = await category.find({})
                    res.render("./user/user_shop", { displayProduct, newbrand, newcategory })
                } else if (sortBy === "Price-low-high") {
                    const displayProduct = await product.find({}).sort({ price: 1 })
                    const newbrand = await brand.find({})
                    const newcategory = await category.find({})
                    res.render("./user/user_shop", { displayProduct, newbrand, newcategory })
                } else if (sortBy === "Price-high-low") {
                    const displayProduct = await product.find({}).sort({ price: -1 })
                    const newbrand = await brand.find({})
                    const newcategory = await category.find({})
                    res.render("./user/user_shop", { displayProduct, newbrand, newcategory })
                } else if (sortBy === "New-Arrival") {
                    const displayProduct = []
                    const Products = await order.aggregate([
                        {
                            $unwind: "$items"
                        },
                        {
                            $group: {
                                _id: "$_id",
                                totalQuantity: { $sum: "$items.quantity" },
                                orderDate: { $first: "$orderDate" },
                                items: { $push: "$items" } // Push all items into an array
                            }
                        },
                        {
                            $sort: { totalQuantity: -1 }
                        },
                        {
                            $lookup: {
                                from: "products", // Assuming the product collection is named "products"
                                localField: "items.productId", // Assuming the field in the items array containing product IDs is "productId"
                                foreignField: "_id",
                                as: "populatedItems" // Populate products into a new field called "populatedItems"
                            }
                        },
                        {
                            $addFields: {
                                "items": "$populatedItems" // Replace the original items array with the populated items
                            }
                        },
                        {
                            $project: {
                                populatedItems: 0 // Remove the populatedItems field from the output
                            }
                        },
                        {
                            $project: {
                                _id: 1,
                                totalQuantity: 1,
                                orderDate: 1,
                                items: { $arrayElemAt: ["$items", 0] } // Capture the first item in the array
                            }
                        }
                    ]);
                    Products.forEach((product) => {
                        product.items.forEach((item) => {
                            // console.log(item);
                            displayProduct.push(item);
                        });
                    });
                    const newbrand = await brand.find({});
                    const newcategory = await category.find({});
                    res.render("./user/user_shop", { displayProduct, newbrand, newcategory });
                }
            }
        } catch (error) {
            // Handle error
        }
    },

    //     postSortby: async (req, res) => {
    //         try {   

    //             console.log(req.session.filterdata)


    //             const { sortBy } = req.body
    //             if (sortBy === "A-Z") {
    //                 console.log("iam in a to z");
    //                 const displayProduct = await product.find({}).sort({ name: 1 })
    //                 console.log(displayProduct,"product for a to z");
    //                 const newbrand = await brand.find({})
    //                 const newcategory = await category.find({})
    //                 res.render("./user/user_shop", { displayProduct, newbrand, newcategory })
    //             } else if (sortBy === "Z-A") {
    //                 const displayProduct = await product.find({}).sort({ name: -1 })
    //                 const newbrand = await brand.find({})
    //                 const newcategory = await category.find({})
    //                 res.render("./user/user_shop", { displayProduct, newbrand, newcategory })
    //             } else if (sortBy === "Price-low-high") {
    //                 const displayProduct = await product.find({}).sort({ price: 1 })
    //                 const newbrand = await brand.find({})
    //                 const newcategory = await category.find({})
    //                 res.render("./user/user_shop", { displayProduct, newbrand, newcategory })
    //             }else if (sortBy === "Price-high-low") {
    //                 const displayProduct = await product.find({}).sort({ price: -1 })
    //                 const newbrand = await brand.find({})
    //                 const newcategory = await category.find({})
    //                 res.render("./user/user_shop", { displayProduct, newbrand, newcategory })
    //             }else if (sortBy === "New-Arrival") {
    //                 const displayProduct=[]
    //                 const Products = await order.aggregate([
    //                     {
    //                         $unwind: "$items"
    //                     },
    //                     {
    //                         $group: {
    //                             _id: "$_id",
    //                             totalQuantity: { $sum: "$items.quantity" },
    //                             orderDate: { $first: "$orderDate" },
    //                             items: { $push: "$items" } // Push all items into an array
    //                         }
    //                     },
    //                     {
    //                         $sort: { totalQuantity: -1 }
    //                     },
    //                     {
    //                         $lookup: {
    //                             from: "products", // Assuming the product collection is named "products"
    //                             localField: "items.productId", // Assuming the field in the items array containing product IDs is "productId"
    //                             foreignField: "_id",
    //                             as: "populatedItems" // Populate products into a new field called "populatedItems"
    //                         }
    //                     },
    //                     {
    //                         $addFields: {
    //                             "items": "$populatedItems" // Replace the original items array with the populated items
    //                         }
    //                     },
    //                     {
    //                         $project: {
    //                             populatedItems: 0 // Remove the populatedItems field from the output
    //                         }
    //                     },
    //                     {
    //                         $project: {
    //                             _id: 1,
    //                             totalQuantity: 1,
    //                             orderDate: 1,
    //                             items: { $arrayElemAt: ["$items", 0] } // Capture the first item in the array
    //                         }
    //                     }
    //                 ]);

    //                 // console.log(Products);



    //                 Products.forEach((product) => {
    //                     product.items.forEach((item) => {
    //                         console.log(item);
    //                         displayProduct.push(item);
    //                     });
    //                 });
    //                 console.log(displayProduct);

    //                 const newbrand = await brand.find({});
    //                 const newcategory = await category.find({});
    //                 res.render("./user/user_shop", { displayProduct, newbrand, newcategory });
    //             }


    // // console.log(sortBy);
    //         } catch (error) {

    //         }
    //     },

    postapplycoupon: async (req, res) => {
        try {
            const couponname = req.body.coupon;
            if (couponname) {
                const applycoupon = await coupon.findOne({ code: couponname });
                const disval = applycoupon.discount / 100;
                const total = req.session.grandTotal;

                const discountedamount = total * disval;
                const finalamount = total - discountedamount;

                // Reduce discountedamount to two digits after the decimal point
                const roundedDiscountedAmount = Number(discountedamount.toFixed(2));

                req.session.amounttopay = finalamount;
                req.session.couponDiscount = roundedDiscountedAmount;

                res.json({ success: true, discountedAmount: roundedDiscountedAmount, grandTotal: finalamount });
            } else {
                req.session.couponDiscount = 0;
                req.session.amounttopay = req.session.grandTotal;
                res.json({ success: false });
            }
        } catch (error) {
            console.log(error);

        }
    },

}





// postSortby: async (req, res) => {
//     try {
//         const filterCriteria = req.session.filterdata;
//         let displayProduct;
        
//         if (filterCriteria) {
//             const { sortBy } = req.body;
//             let sortCriteria = {};

//             switch (sortBy) {
//                 case "A-Z":
//                 case "Z-A":
//                 case "Price-low-high":
//                 case "Price-high-low":
//                     sortCriteria = { [sortBy === "Z-A" ? "name" : "name"]: sortBy === "Z-A" ? -1 : 1 };
//                     break;
//                 case "New-Arrival":
//                     const Products = await order.aggregate([
//                         { $unwind: "$items" },
//                         { $group: { _id: "$_id", totalQuantity: { $sum: "$items.quantity" }, orderDate: { $first: "$orderDate" }, items: { $push: "$items" } } },
//                         { $sort: { totalQuantity: -1 } },
//                         { $lookup: { from: "products", localField: "items.productId", foreignField: "_id", as: "populatedItems" } },
//                         { $addFields: { "items": "$populatedItems" } },
//                         { $project: { populatedItems: 0 } },
//                         { $project: { _id: 1, totalQuantity: 1, orderDate: 1, items: { $arrayElemAt: ["$items", 0] } } }
//                     ]);

//                     displayProduct = Products.flatMap(product => product.items);
//                     break;
//                 default:
//                     break;
//             }

//             displayProduct = await product.find(filterCriteria).sort(sortCriteria);
//         } else {
//             const { sortBy } = req.body;
//             let sortCriteria = {};

//             switch (sortBy) {
//                 case "A-Z":
//                     sortCriteria = { name: 1 };
//                     break;
//                 case "Z-A":
//                     sortCriteria = { name: -1 };
//                     break;
//                 case "Price-low-high":
//                     sortCriteria = { price: 1 };
//                     break;
//                 case "Price-high-low":
//                     sortCriteria = { price: -1 };
//                     break;
//                 default:
//                     break;
//             }

//             displayProduct = await product.find({}).sort(sortCriteria);
//         }

//         const [newbrand, newcategory] = await Promise.all([brand.find({}), category.find({})]);

//         res.render("./user/user_shop", { displayProduct, newbrand, newcategory });
//     } catch (error) {
//         // Handle error
//     }
// }
