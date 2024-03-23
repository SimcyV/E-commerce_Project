const product = require("../models/product_schema");
const category = require("../models/category_schema");
const brand = require("../models/brand_schema");
const moment = require("moment")
const sharp=require("sharp")
const path=require("path")

module.exports = {
    getProduct: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1; // Get the page number from query parameters
            const perPage = 5; // Number of items per page
            const skip = (page - 1) * perPage;
            const products = await product.find().sort({ name: 1 }).skip(skip).limit(perPage)
                .populate("brand")
                .populate("category")
            const totalCount = await product.countDocuments();
            res.render("./admin/product", {
                products,
                currentPage: page,
                perPage,
                totalCount,
                totalPages: Math.ceil(totalCount / perPage)
            })
            // const products = await product.find().populate("brand category")
            // console.log(products);
            // res.render("./admin/product", { products })
        } catch (error) {

        }
    },

    getBlockProduct:async(req,res)=>{
        try {
            const {id}=req.params;
            const productData=await product.findOne({_id:id})
            // console.log(productData);
            if(productData.display =="Active"){
                const product1=await product.findByIdAndUpdate(id,{display:"Blocked"})
                res.redirect("/product")
            }else if(productData.display =="Blocked"){
                const product2=await product.findByIdAndUpdate(id,{display:"Active"})
                res.redirect("/product")
            }
        } catch (error) {
            console.error(error);
        res.status(500).send("Internal Server Error"); 
        }
    },
    

    getAddProduct: async (req, res) => {
        try {
            const categorys = await category.find({})
            const brands = await brand.find({})
            res.render("./admin/add_product", { categorys, brands })
        } catch (error) {

        }
    },

    // postProduct: async (req, res) => {
    //     try {
    //         const images = []
    //         const newCategory = await category.findOne({ name: req.body.category })
    //         const newBrand = await brand.findOne({ name: req.body.brand })
    //         for (let i = 1; i <= 4; i++) {
    //             const fieldName = `image${i}`;
    //             if (req.files[fieldName] && req.files[fieldName][0]) {
    //                 images.push(req.files[fieldName][0].filename);
    //             }
    //         }
    //         let status
    //         if (req.body.stock <= 0) {
    //             status = "Out of Stock";
    //         } else {
    //             status = "In Stock";
    //         }
    //         if (Number(req.body.discount) >= Number(req.body.price)) {
    //             req.flash("error1", "Discount price must be less than product price")
    //             res.redirect("/addProduct");
    //         }

    //         const newProduct = new product({
    //             name: req.body.name,
    //             price: req.body.price,
    //             discount: req.body.discount,
    //             description: req.body.description,
    //             brand: newBrand._id,
    //             tags: req.body.tags, stock: req.body.stock,
    //             category: newCategory._id,
    //             status: status,
    //             display: "Active",
    //             updatedOn: moment(new Date()).format("llll"),
    //             images: images,
    //         });
    //         await newProduct.save()
    //         req.flash("success", "Product is added successfully")
    //         res.redirect("/product")
    //     } catch (error) {

    //     }
    // },

    postProduct: async (req, res) => {
        try {
            const images = [];
            const newCategory = await category.findOne({ name: req.body.category });
            const newBrand = await brand.findOne({ name: req.body.brand });
        
            // Loop through each image field to process
            for (let i = 1; i <= 4; i++) {
                const fieldName = `image${i}`;
                if (req.files[fieldName] && req.files[fieldName][0]) {
                    const file = req.files[fieldName][0];
                    
    
                    try {
                        // Use sharp to crop image before saving
                        const croppedImageBuffer = await sharp(file.path) // Use file path instead of buffer
                            .resize({ width: 200, height: 200, fit: 'cover' })
                            .toBuffer();
                        const filename = `${fieldName}-${Date.now()}.jpg`;
                        images.push(filename);
                        // Save cropped image
                        await sharp(croppedImageBuffer).toFile(path.join(__dirname, '..', 'public', 'uploads', filename)); // Use path.join to construct the file path
                    } catch (sharpError) {
                        console.error('Sharp error:', sharpError);
                        continue;
                    }
                }
            }
            let status
                    if (req.body.stock <= 0) {
                        status = "Out of Stock";
                    } else {
                        status = "In Stock";
                    }
                    if (Number(req.body.discount) >= Number(req.body.price)) {
                        req.flash("error1", "Discount price must be less than product price")
                        res.redirect("/addProduct");
                    }
        
                    const newProduct = new product({
                        name: req.body.name,
                        price: req.body.price,
                        discount: req.body.discount,
                        description: req.body.description,
                        brand: newBrand._id,
                        tags: req.body.tags, stock: req.body.stock,
                        category: newCategory._id,
                        status: status,
                        display: "Active",
                        updatedOn: moment(new Date()).format("llll"),
                        images: images,
                    });
                    await newProduct.save()
                    req.flash("success", "Product is added successfully")
                    res.redirect("/product")
                } catch (error) {
        
                }
            },

    getProductDetails: async (req, res) => {
        try {
            const { id } = req.params
            const productToDisplay = await product.findOne({ _id: id }).populate("brand category")
            res.render("./admin/product_details", { productToDisplay })
        } catch (error) {

        }
    },

    getEditProduct: async (req, res) => {
        try {
            const { id } = req.params
            const brands = await brand.find({})
            const categorys = await category.find({})
            const editProduct = await product.findOne({ _id: id }).populate('brand category')
           
            res.render("./admin/edit_product", { brands, categorys, editProduct })
        } catch (error) {

        }
    },


    postEditProduct: async (req, res) => {
        try {
            const { id } = req.params
            // console.log(id);
            let images = []
            for (let i = 0; i <= 3; i++) {
                const fieldName = `image${i + 1}`;
                if (req.files[fieldName] && req.files[fieldName][0]) {
                    images[i] = req.files[fieldName][0].filename;
                    const upload = await product.findByIdAndUpdate({ _id: id }, { $set: { [`images.${i}`]: images[i] } })
                }
            }
            let status
            if (req.body.stock > 0) {
                status = "In Stock"
            } else {
                status = "Out Of Stock"
            }
            const editProduct = await product.findOne({ _id: id })
            const brands = await brand.findOne({ name: req.body.brand })
            const categorys = await category.findOne({ name: req.body.category }) 

            if (req.body.brand == null) {
                req.body.brand = editProduct.brand
            } else {
                req.body.brand = brands._id;
            }
            if (req.body.category == null) {
                req.body.category = editProduct.category
            } else {
                req.body.category = categorys._id
            }
            const result = await product.findByIdAndUpdate({ _id: id }, req.body)
            const stocks = await product.findByIdAndUpdate({ _id: id }, { $set: { status: status } })
            const checkOffer=await product.findOne({_id:id})

            console.log(checkOffer);
            if (checkOffer.offerprice!=0){
                const price= (checkOffer.price-checkOffer.discount)
                const offerprice=(price)*(checkOffer.offerdiscount/100);
                const updateOfferPrice=price-offerprice;

                const productUpdate=await product.findByIdAndUpdate({ _id: id},{ $set: {offerprice : updateOfferPrice } })

                // console.log(price,offerprice);

            }
            req.flash("success", "Product is Edited Successfully");
            res.redirect("/product")

        } catch (error) {
            console.error(error);
            req.flash("error", "An error occurred while editing the product");
            res.redirect("/product");
        }
        
    },

    getDeleteProduct:async(req,res)=>{
      try {
        const {id}=req.params
        const deleteProduct=await product.findByIdAndDelete({_id:id})
        req.flash("success","Product deleted successfully")
        res.redirect("/product")
      } catch (error) {
        
      }
    },

    getCancelProduct: async (req, res) => {
        try {
            const { id } = req.params;
            // res.redirect("/productDetails/"+id)
            res.redirect("/product")
        } catch (error) {

        }
    },



}