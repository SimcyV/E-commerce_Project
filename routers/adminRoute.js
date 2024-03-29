const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController")
const categoryController = require("../controllers/categoryController");
const brandController = require("../controllers/brandController");
const customerController = require("../controllers/customerController")
const productController = require("../controllers/productController")
const multer = require("../middlewares/multer");
const orderController = require("../controllers/orderController");
const adminDashboardController = require("../controllers/adminDashboardController")
const couponController=require("../controllers/couponController")
const offerController=require("../controllers/offerController");
const uploadMulter = require("../middlewares/multer");



// ======================Signin====================   

router.route("/admin")
    .get(adminController.base)
    .post(adminController.postAdminSignin)

// ====================AdminDashboard=============

router.route("/admin-dashboard")
    .get(adminController.adminDash)


//=============================================================category route==========================================================
router.route("/addcategory")
    .get(categoryController.getAddCategory)
    .post(categoryController.postAddCategory)

router.route("/category")
    .get(categoryController.getCategory)


router.route("/editcategory/:id")
    .get(categoryController.getEditCategory)
    .post(categoryController.postEditCategory)

router.route("/deletecategory/:id")
    .get(categoryController.getDeleteCategory)

router.route("/removecategory/:id")
    .get(categoryController.getRemoveCategory)

// =====================brand route==================
// add brand route
router.route("/addbrand")
    .get(brandController.getAddBrand)
    .post(brandController.postAddBrand)

// get brand route
router.route("/brand")
    .get(brandController.getBrand)

// edit brand route
router.route("/editBrand/:id")
    .get(brandController.getEditBrand)
    .post(brandController.postEditBrand)

// block brand route
router.route("/blockbrand/:id")
    .get(brandController.getBlockBrand)

// delete brand
router.route("/deletebrand/:id")
    .get(brandController.getDeleteBrand)

// cancel button on edit brand
router.route("/brandcancel")
    .get(brandController.getBrandCancel)

// ====================================================Customer=========================================================================

// customer route
router.route("/customers")
    .get(customerController.getCustomers)

// block unblock user
router.route("/blockUnblock/:id")
    .get(customerController.getBlockUnblock)

// ===================================================Product==============================================================================
// product route
router.route("/product")
    .get(productController.getProduct)

// block product
router.route("/blockProduct/:id")
    .get(productController.getBlockProduct)

// add product
router.route("/addProduct")
    .get(productController.getAddProduct)
    .post(uploadMulter.any(), productController.postProduct)

// product details
router.route("/productDetails/:id")
    .get(productController.getProductDetails)

// edit product
router.route("/editProduct/:id")
    .get(productController.getEditProduct)
    .post(multer.fields([{ name: 'image1', maxCount: 1 }, { name: 'image2', maxCount: 1 }, { name: 'image3', maxCount: 1 }, { name: 'image4', maxCount: 1 }]), productController.postEditProduct)

// delete product
router.route("/deleteProduct/:id")
    .get(productController.getDeleteProduct)

// cancel button
router.route("/cancelProduct/:id")
    .get(productController.getCancelProduct)

// ====================================================================order list===============================================================
// admin order list root
router.route("/adminorderlist")
    .get(orderController.getAdminOrderList)

// admin view order
router.route("/adminViewOrder/:id")
    .get(orderController.getAdminViewOrder)
    .post(orderController.postViewOrder)

// ====================================================================admin dash=============================================
// get sales
router.route("/latestOrders")
    .get(adminDashboardController.getSalesOrder)


//count by day
router.route("/countByday")
    .get(adminDashboardController.getCount)

//count by month
router.route("/countBymonth")
    .get(adminDashboardController.getCount)

//count by year
router.route("/countByyear")
    .get(adminDashboardController.getCount)

//sales report download
router.route("/salesReportDownload")
.post(adminDashboardController.getSalesReportDownload)

    //Ledger report download
router.route("/downloadLedgerReport")
.post(adminDashboardController.getdownloadLedgerReport)

// ================================================================Coupon=====================================================================
// admin coupon route
router.route("/adminCoupon")
    .get(couponController.getadminCoupon)

//Add coupon
router.route("/addCoupon")
    .get(couponController.getAddCoupon)
    .post(couponController.postAddCoupon)

//block coupon
router.route("/blockcoupon/:id")
    .get(couponController.getblockcoupon)

//edit coupon
router.route("/editcoupon/:id")
    .get(couponController.geteditcoupon)
    .post(couponController.posteditcoupon)

    
//delete coupon
router.route("/deletecoupon/:id")
.get(couponController.getdeletecoupon)

// ================================================================Offers=====================================================================
//
router.route("/offers")
.get(offerController.getOffers)

// ================================================================logout=====================================================================
router.route("/adminlogout")
    .get(adminController.getAdminLogout)

    //Add Offer
router.route("/addOffer")
.get(offerController.getaddOffer)
.post(offerController.postaddOffer)

//Block Offer
router.route("/blockoffer/:id")
    .get(offerController.blockoffer)

//Delete Offer
router.route("/deleteoffer/:id")
    .get(offerController.deleteoffer)


module.exports = router;

