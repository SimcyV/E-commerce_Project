const product = require("../models/product_schema")
const brand = require("../models/brand_schema")
const category = require("../models/category_schema")
const cart = require("../models/cart_schema")
const user = require("../models/user_schema")
const order = require("../models/order_schema")
const admin = require("../models/admin_schema")
const wallet = require("../models/wallet_schema")
const { generateInvoicePDF } = require("../utility/downloadInvoice");
module.exports = {
    // orderlist
    getOrderList: async (req, res) => {
        try {
            const userMail = req.session.userEmail
            const newUser = await user.findOne({ email: userMail })
            const userId = newUser.id
            const page = parseInt(req.query.page) || 1; // Get the page number from query parameters
            const perPage = 5; // Number of items per page
            const skip = (page - 1) * perPage;
            const orderList = await order.find({ userId: userId }).sort({ orderDate: -1 }).skip(skip).limit(perPage);
            // const brands = await brand.find({}).sort({ name: 1 }).skip(skip).limit(perPage);
            const totalCount = await order.countDocuments();
            res.render("./user/user_orderlist", {
                orderList,
                currentPage: page,
                perPage,
                totalCount,
                totalPages: Math.ceil(totalCount / perPage),
            });
            // const orderList=await order.find({userId:userId}).sort({orderDate: -1})
            // res.render("./user/user_orderlist",{orderList})
        } catch (error) {

        }
    },

    // orderlist details
    getUserDetailViewOrder: async (req, res) => {
        try {
            const { id } = req.params;
            const newOrders = await order.findOne({ _id: id }).populate("items.productId")


            res.render("./user/user_orderdetails", { newOrders })
        } catch (error) {

        }
    },

    // cancel order
    getCancelOrder: async (req, res) => {
        try {
            const { id } = req.params;
            const userMail = req.session.userEmail
            const newUser = await user.findOne({ email: userMail })
            const userId = newUser.id;
            const orderToDelete = await order.findById({ _id: id })
            if (orderToDelete.status === "Order Placed" || orderToDelete.status === "Shipped") {
                updateProduct = orderToDelete.items
                for (const products of updateProduct) {                  
                    const dbProduct = await product.findById(products.productId)               

                    if (dbProduct) {
                        dbProduct.stock += products.quantity
                        if (dbProduct.stock > 0) {
                            dbProduct.status = "In Stock"
                        }
                        await dbProduct.save()
                    }
                }
                orderToDelete.status = "Cancelled"
                orderToDelete.returnDate = new Date()
                if (orderToDelete.paymentStatus === "Pending") {
                    orderToDelete.paymentStatus = "Not Applicable"
                } else {
                    orderToDelete.paymentStatus = "No payment transaction"
                }

                await orderToDelete.save()

                let creditamount = orderToDelete.totalAmount

                if (orderToDelete.paymentMethod === "COD") {
                    creditamount = 0

                }
                const newWallet = new wallet({
                    userId: userId,
                    orders: id,
                    status: "Credit",
                    totalAmount: creditamount
                })
                await newWallet.save()
                req.flash("success", "Order cancelled successfully")
                res.redirect("/orderList")
            } else {
                req.flash("error", "Something went wrong, try again")
                res.redirect("/orderList")
            }


        } catch (error) {

        }
    },

    // ===========================================admin order list================================================
    getAdminOrderList: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1; // Get the page number from query parameters
            const perPage = 5; // Number of items per page
            const skip = (page - 1) * perPage;
            const orders = await order.find().sort({ orderDate: -1 }).skip(skip).limit(perPage);
            const totalCount = await order.countDocuments();
            res.render("./admin/admin_orderlist", {
                orders,
                currentPage: page,
                perPage,
                totalCount,
                totalPages: Math.ceil(totalCount / perPage),
            });
            //    const orders = await order.find().sort({ orderDate: -1 });
            //    res.render("./admin/admin_orderlist",{orders})
        } catch (error) {

        }
    },

    getAdminViewOrder: async (req, res) => {
        try {
            const { id } = req.params
            const newOrders = await order.findOne({ _id: id }).populate('items.productId')
            res.render("./admin/admin_orderlistdetail", { newOrders })
        } catch (error) {

        }
    },

    postViewOrder: async (req, res) => {
        try {
            const { id } = req.params;
            const userMail = req.session.userEmail;
            const newUser = await user.findOne({ email: userMail })
            const userId = newUser.id;;
            const value = req.body.status;
            const reason = req.body.reason;
            let updateOrderDocument;

            if (value === "Shipped") {                
                updateOrderDocument = await order.findByIdAndUpdate(id, {
                    status: "Shipped",
                });
            } else if (value === "Delivered") {
                
                updateOrderDocument = await order.findByIdAndUpdate(id, {
                    status: "Delivered",
                    deliveryDate: Date.now(),
                    paymentStatus: "Paid"
                });
            } else if (value === "reject") {
                updateOrderDocument = await order.findByIdAndUpdate(id, {
                    status: "Delivered",
                    adminReason: reason,
                    rejectedDate: new Date(),
                    returnStatus: value
                });
            } else if (value === "accept") {
                
                updateOrderDocument = await order.findByIdAndUpdate(id, {
                    status: "Returned",
                    adminReason: reason,
                    approvedDate: new Date(),
                    returnStatus: value,
                    paymentStatus: "Refund"
                });

                const orderToUpdate = await order.findById(id);                
                const updateProduct = orderToUpdate.items;

                for (const products of updateProduct) {
                    const dbProduct = await product.findById(product.productId);
                    if (dbProduct) {
                        dbProduct.stock += products.quantity;
                        if (dbProduct.stock > 0) {
                            dbProduct.status = "In Stock";
                        }
                        await dbProduct.save();
                    }
                }
                
                const newWallet = new wallet({
                    userId: userId,
                    orders: orderToUpdate._id,
                    status: "Credit",
                    totalAmount: orderToUpdate.totalAmount
                })
                await newWallet.save()
            }
            req.flash("success", "Updated successfully..")
            res.redirect("/adminorderlist");

        } catch (error) {

        }
    },

    getReturnOrder: async (req, res) => {
        try {
            const { id } = req.params
            const newOrders = await order.findOne({ _id: id }).populate('items.productId')
            res.render("./user/user_returnpage", { newOrders })
            // const {id}=req.params
            // const updateOrderDocument = await order.findByIdAndUpdate(id, {
            //     status: "Return Pending",                                   
            // }); 
            // console.log(id)
            // res.redirect("/orderList")            
        } catch (error) {

        }
    },
    //user side return post
    postReturnOrder: async (req, res) => {
        try {
            const { id } = req.params
            const reason = req.body.reason
            const currentDate = Date.now()
            const updateOrderDocument = await order.findByIdAndUpdate(id, {
                status: "Return Pending",
                userReason: reason,
                returnDate: currentDate
            });
            res.redirect("/orderList")

        } catch (error) {

        }
    },

    downloadInvoice: async (req, res) => {
        try {
            const { id } = req.params
            const orderDetails = await order.findOne({ _id: id }).populate("items.productId")
            const userData = await user.findOne({ _id: req.session.userId })
            let result = await generateInvoicePDF(orderDetails, userData);
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader(
                "Content-Disposition",
                "attachment; filename=Invoice.pdf"
            );

            res.status(200).end(result);

            // console.log(userData,"useerrrrrrrrrrrrrrrr");
            // console.log(req.session,"sessionnnnnnn");
        } catch (error) {

        }
    },
}

