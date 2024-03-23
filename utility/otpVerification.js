const nodemailer = require("nodemailer")
const OTP = require("../models/otp_schema")
const flash = require("express-flash")
require("dotenv").config()



module.exports = {


    generateotp: () => {
        const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
        return otp;
    },



    sendOTP: async (req, res, email, otpToBeSent) => {
        try {
            const transporter = nodemailer.createTransport({
                service: "Gmail",
                port: 465,
                secure: true,
                auth: {
                    user: process.env.APP_NAME,
                    pass:process.env.APP_PWD,
                },
            });
            const duration = 60 * 1000
            const createdAt = Date.now()
            const expiresAt = createdAt + duration
            const newOTP = new OTP({
                email: email,
                otp: otpToBeSent,
                createdAt: createdAt,
                expiresAt: expiresAt,
            })
            console.log("current otp:", otpToBeSent);
            const otpDB = await newOTP.save()
            setTimeout(() => {
                OTP.deleteOne({ email: email })
                    .then(() => {
                        console.log("Document deleted successfully");
                    })
                    .catch((err) => {
                        console.error(err);
                    });
            }, 60000);



            const message = "Enter this OTP to continue for the varification"
            const mailData = {
                from: process.env.APP_NAME,
                to: email,
                subject: "Otp from Laptronics",
                //text: "This is the first test mail from trainers mavoor OTP is",
                html: `<p>${message}</p> <p style="font-size:25px; letter-spacing:2px"><b tomato>${otpToBeSent}</b></p><p> This code expires in <b>${duration / 1000}seconds</b></p>`,

            }

             //Sending mail data//
  transporter.sendMail(mailData,(error,info)=>{
    if(error){
      console.log(error);
    }else{
      console.log("Succesfully send otp");
    //     req.flash("success","OTP sent Succesfully")
    //    res.redirect("/signin")
    }
  }        
  );


        } catch (error) {
            console.log(error);
            res.redirect("/signup")

        }
    }
}