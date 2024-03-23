const mongoose=require("mongoose")
const brandSchema=new mongoose.Schema({
    name:{
        type:String,
        unique:true,
        required:true,
        uppercase:true
    },
    status: {
        type: String,
        default: "Active"
    }
})

const brand=mongoose.model("brand",brandSchema);

module.exports=brand;