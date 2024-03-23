const express=require("express");
const router=express.Router();
const userController=require("../controllers/userController");
const productController = require("../controllers/productController");
const cartController = require("../controllers/cartController");
const paymentController=require("../controllers/paymentController")
const orderController=require("../controllers/orderController")
const { verifyUser, userExist } = require("../middlewares/userAuth");
const wishlistController=require("../controllers/wishlistController");
const WalletController=require("../controllers/walletController")
// base root
router.route("/")
.get( userExist,userController.base)

router.route("/dashboard")
.get(verifyUser,userController.dash)

// to user product details
router.route("/userProductDetails/:id")
.get(verifyUser,userController.getUserProductDetails)

// signin route
router.route("/signin")
.get(userExist,userController.getSignin)
.post(userExist,userController.postSignin)

// signin route
router.route("/signup")
.get(userExist,userController.getSignup)
.post(userExist,userController.postSignup)

// otp signup-resend
router.route("/otpResend")
.get(userController.getOtpResend)

// forgot password route
router.route("/forgotPwd")
.get(userController.getForgotpwd)
.post(userController.postForgotpwd)

//otp signup for forgot password
router.route("/otpSignup")
.get (userController.getOtpSignup)
.post(userController.postOtpSignup)

// forgot password signup(OTP resend)
router.route("/otpResendForgotSignup")
.get(userController.getOtpResendForgotSignup)

// otp verify route
router.route("/otpverify")
.get(userController.getOtpVerify)
.post(userController.postOtpVerify)


// confirm password root
router.route("/confirmpwd")
.get(userController.getConfirmpwd)

// password recovery root
router.route("/pwdRecovery")
.get(userController.getPwdRecovery)
.post(userController.postPwdRecovery)

// profile route
router.route("/profile")
.get(verifyUser,userController.getProfile)

// user add address route
router.route("/userAddress")
.get(verifyUser,userController.getUserAddress)

// add address route
router.route("/addAddress")
.get(verifyUser,userController.getAddAddress)
.post(verifyUser,userController.postAddAddress)

// edit address
router.route("/editAddress/:id")
.get(verifyUser,userController.getEditAddress)
.post(verifyUser,userController.postEditAddress)

//delete address
router.route("/deleteAddress/:id")
.get(verifyUser,userController.getDeleteAddress)

// user change password
router.route("/userPasswordChange")
.get(verifyUser,userController.getPasswordChange)
.post(verifyUser,userController.postPasswordChange)

// <=========================================================CART=============================================================>
// to user cart route
router.route("/cart")
.get(verifyUser,cartController.getCart)

// add to cart route
router.route("/addtoCart/:id")
.get(verifyUser,cartController.getAddCart)

// remove cart items
router.route("/removeCartItems/:id")
.get(verifyUser,cartController.getRemoveCart)

// updateQuantity
router.route("/updateQuantity")
.post(verifyUser,cartController.postUpdatequantity)


// checkout  
router.route("/checkOut")
.get(verifyUser,cartController.getCheckout)
.post(verifyUser,paymentController.postCheckout)

//post of apply coupon
router.route("/applycoupon")
.post(verifyUser,userController.postapplycoupon)

// to orderlist
router.route("/orderList")
.get(verifyUser,orderController.getOrderList)

// order list detailed view
router.route("/userDetailViewOrder/:id")
.get(verifyUser,orderController.getUserDetailViewOrder)

// cancel order
router.route("/cancelOrder/:id")
.get(verifyUser,orderController.getCancelOrder)



//filter routes
router.route("/filters" )
.get(verifyUser,userController.getFilter)
.post(verifyUser,userController.postGetFilter);

// search
router.route("/search")
.get(verifyUser,userController.getSearch)
//===========================================================logout============================================================
router.route("/logout")
.get(userController.getLogout)

// =========================================================wishlist=================================================================
router.route("/wishlist")
.get (verifyUser,wishlistController.getWishlist)

// add wishlist
router.route("/wishlist/:id")
.get (verifyUser,wishlistController.addWishlist)

// delete wishlist
router.route("/deleteWishlist/:id")
.get(verifyUser,wishlistController.getdeleteWishlist)

// return order
router.route("/returnOrder/:id")
.get(verifyUser,orderController.getReturnOrder)
.post(verifyUser,orderController.postReturnOrder)

//route for wallets
router.route("/userWallet")
.get(verifyUser,WalletController.getUserWallet)

//invoice
router.route("/invoice/:id")
.get (verifyUser,orderController.downloadInvoice)

// ==================================================payment ==================================================
router.route("/makePayment")
.get(verifyUser,paymentController.createOrder)

router.route("/verifyPayment")
.post(verifyUser,paymentController.verifyPayment)
//
router.route("/onlineCheckOut")
.post(verifyUser,paymentController.onlineCheckOut)

// sucess page
router.route("/order_success")
.get(paymentController.getOrderSuccess)
// sort By
router.route("/sortby")
.post(verifyUser,userController.postSortby)

//Invoice download
router.route("/invoice/:id")
.get (verifyUser,orderController.downloadInvoice)

module.exports=router;