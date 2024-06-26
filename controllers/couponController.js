const coupon = require("../models/coupon_schema")
const user = require("../models/user_schema")
const flash = require("express-flash")

module.exports = {

    getadminCoupon: async (req, res) => {
        try {

            const page = parseInt(req.query.page) || 1; // Get the page number from query parameters
            const perPage = 5; // Number of items per page
            const skip = (page - 1) * perPage;
            const newCoupons = await coupon.find({}).sort({  discount: 1 }).skip(skip).limit(perPage);
            const totalCount = await coupon.countDocuments();
            res.render("./admin/admin_coupons", {
                newCoupons,
                currentPage: page,
                perPage,
                totalCount,
                totalPages: Math.ceil(totalCount / perPage),
            });


            // const newCoupons = await coupon.find({})
            // res.render("./admin/admincoupons", { newCoupons })
        } catch (error) {
            console.log(error);
            
        }
    },

    getAddCoupon: async (req, res) => {
        try {
            res.render("./admin/add_coupon")
        } catch (error) {
            console.log(error)
          
        }
    },

    postAddCoupon: async (req, res) => {
        try {
            const name = req.body.code
            const testcoupon = await coupon.findOne({ code: name })           
            if (testcoupon) {                
                req.flash("error", "Coupon Already Exists....")
                res.redirect("/addCoupon")
            } else {
                const newCoupon = new coupon({
                    code: req.body.code,
                    discount: req.body.discount,
                    valid_from: req.body.valid_from,
                    valid_to: req.body.valid_to,
                    status: "Active"
                })
                await newCoupon.save()
                res.redirect("/adminCoupon")
            }

        } catch (error) {
            console.log(error);
            
        }
    },
   

    getblockcoupon: async (req, res) => {
        const { id } = req.params
        const editCoupon = await coupon.findOne({ _id: id })
        if (editCoupon.status === "Active") {
            const newCoupon = await coupon.findByIdAndUpdate({ _id: id }, { status: "Block" })
        } else if (editCoupon.status === "Block") {
            const newCoupon = await coupon.findByIdAndUpdate({ _id: id }, { status: "Active" })
        }
        console.log(editCoupon);
        res.redirect("/adminCoupon")
    },


    geteditcoupon: async (req, res) => {
        try {
            const { id } = req.params
            const editCoupon = await coupon.findOne({ _id: id })
            res.render("./admin/edit_coupon", { editCoupon })
        } catch (error) {
            console.log(error);
            
        }
    },

    posteditcoupon: async (req, res) => {
        try {
            const { id } = req.params
            const checkcoupon = await coupon.findOne({ _id: id })
            console.log(checkcoupon);
            if (checkcoupon) {
                req.flash("error", "Coupon Already Exists....")
                res.redirect("/adminCoupon")
            } else {
                const updateCoupon = await coupon.findByIdAndUpdate({ _id: id }, req.body)
                res.redirect("/adminCoupon")
            }
        } catch (error) {
            console.log(error);
           
        }
    },
    getdeletecoupon: async (req, res) => {
        try {
            const { id } = req.params
            const newUser = await user.findOne({ _id: id })
            if (newUser) {
                req.flash("error", "Coupon already in use, cannot delete.......")
                res.redirect("/adminCoupon")
            } else {
                const delcoupon = await coupon.findOneAndDelete({ _id: id })
                res.redirect("/adminCoupon")
            }
        } catch (error) {
           
        }
    },

}