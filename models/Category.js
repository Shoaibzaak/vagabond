const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const categoryModel = new Schema(
  {
    name: {
      type: String,
      required:true
    },
    shade:{
        type:String
    }
   
    
  },

  {
    timestamps: true,
    strict: true,
  }
);

categoryModel.set("toJSON", {
  virtuals: false,
  transform: (doc, ret, options) => {
    delete ret.__v;
  },
});

const category = mongoose.model("Category", categoryModel);
module.exports = category;
