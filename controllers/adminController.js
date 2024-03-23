const product=require("../models/product_schema")
const order=require("../models/order_schema")


module.exports={

   // .................................................  Base root for admin ........................................... 

   base: (req, res) => {
      if (req.session.adminlogined) {
          const breadcrumbs = [
              { url: '/admin', label: 'Admin' }
          ];
          res.locals.breadcrumbs = breadcrumbs; // Set breadcrumbs in res.locals
          res.render('./admin/admin_dashboard', { breadcrumbs: breadcrumbs });
      } else {
          res.render('./admin/admin_signin');
      }
  },
  
  

   postAdminSignin:async(req,res)=>{
      try{
         const credentials={
            email:process.env.ADMIN_EMAIL,
            password:process.env.ADMIN_PWD
         }
         const { email, password } = req.body;
         if (email == credentials.email && password == credentials.password) {
            req.session.admin = email;
            req.session.adminlogined = true;
            res.redirect('/admin-dashboard')
         } else {
            req.flash("error", "Invalid Credentials");
            res.redirect("/admin");
         }
      } catch (error) {
         console.log(error);
         res.status(500).render("error500", { message: "Internal Server Error" });
      }
   },
   
   // .......................................................... End .................................................... 
   

   adminDash: async(req, res)=>{
      if(req.session.adminlogined){
         const breadcrumbs = [
            { url: '/admin-dashboard', label: 'Home' },
            // { url: '/products', label: 'Products' }
          ];
          
         res.render("./admin/admin_dashboard",{breadcrumbs})
      }
      else{
         res.redirect('/admin')
      }
   },


   getAdminLogout:(req,res)=>{
      try {
         req.session.destroy()
         // req.session.adminlogined =false;
         res.redirect("/admin")
      } catch (error) {
         
      }
   },

}