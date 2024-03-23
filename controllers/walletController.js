const order = require("../models/order_schema")
const wallet = require("../models/wallet_schema")
const product = require("../models/product_schema")
const User=require("../models/user_schema")

module.exports = {
    getUserWallet: async (req, res) => {
        try {
            const userMail= req.session.userEmail
            const newUser=await User.findOne({email:userMail})
            const userId=newUser.id;
            // console.log(userId);
            const newWallet = await wallet.find({ userId: userId }).populate('orders').sort({_id:-1})
            //  console.log(newWallet);
            let debitAmount = 0, creditAmount = 0, walletTotal = 0
            for (x of newWallet) {
                if (x.status === "Debit") {
                    debitAmount += x.totalAmount
                } else if (x.status === "Credit") {
                    creditAmount += x.totalAmount
                }
            }
            const walletamounts=await User.findOne({_id:userId})
             walletTotal = creditAmount + walletamounts.referedAmount - debitAmount
            // walletTotal = creditAmount - debitAmount
            req.session.walletAmount = walletTotal
            // console.log(req.session.walletAmount);
            res.render("./user/user_wallet", { newWallet, walletTotal,walletamounts })
        } catch (error) {
           
        }
    }
}