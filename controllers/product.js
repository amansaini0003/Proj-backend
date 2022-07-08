const Product = require("../models/product");
const formidable = require("formidable");
const _ = require("lodash");
const fs = require("fs"); //file system

exports.getProductById = (req, res, next, id) => {
  Product.findById(id)
    .populate("category")
    .exec((err, product) => {
      if (err || !product) {
        return res.status(400).json({
          errorMessage: "No product was found in DB",
        });
      }
      req.product = product;
      next();
    });
};
exports.createProduct = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, (err, fields, file) => {
    if (err) {
      return res.status(400).json({
        errorMessage: "Problem with image",
      });
    }

    //destructure fields

    const { name, description, price, category, stock } = fields;

    // restrictions on fields

    if (!name || !description || !price || !category || !stock) {
      return res.status(400).json({
        errorMessage: "Please include all fields",
      });
    }

    let product = new Product(fields);

    //handle file here
    if (file.photo) {
      if (file.photo.size > 3000000) {
        return res.status(400).json({
          errorMessage: "File is too big!",
        });
      }
      product.photo.data = fs.readFileSync(file.photo.path);
      product.photo.contentType = file.photo.type;
    }

    // console.log(product);

    //save to DB
    product.save((err, product) => {
      if (err) {
        return res.status(400).json({
          errorMessage: "Saving T-Shirt in DB failed!",
        });
      }
      res.json(product);
    });
  });
};

exports.getProduct = (req, res) => {
  req.product.photo = undefined;
  return res.json(req.product);
};

//middleware
exports.photo = (req, res, next) => {
  if (req.product.photo.data) {
    res.set("Content-Type", req.product.photo.contentType);
    return res.send(req.product.photo.data);
  }
  next();
};

exports.updateProduct = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, (err, fields, file) => {
    if (err) {
      return res.status(400).json({
        errorMessage: "Problem with image",
      });
    }

    //updation
    let product = req.product;
    product = _.extend(product, fields);

    //handle file here
    if (file.photo) {
      if (file.photo.size > 3000000) {
        return res.status(400).json({
          errorMessage: "File is too big!",
        });
      }
      product.photo.data = fs.readFileSync(file.photo.path);
      product.photo.contentType = file.photo.type;
    }

    // console.log(product);

    //save to DB
    product.save((err, product) => {
      if (err) {
        return res.status(400).json({
          errorMessage: "Updation of  Product in DB failed!",
        });
      }
      res.json(product);
    });
  });
};

exports.removeProduct = (req, res) => {
  try {
    let product = req.product;
    if (!product) {
      return res.send("No product Found");
    }
    product.remove((err, removedProduct) => {
      if (err || !removedProduct) {
        return res.status(400).json({
          errorMessage: "Failed to delete the product!",
        });
      }
      res.json({
        message: `${removedProduct.name} Deleted Successfully`,
        removedProduct,
      });
    });
  } catch (err) {
    console.log(err);
  }
};

//product listing
exports.getAllProducts = (req, res) => {
  let limit = req.query.limit ? parseInt(req.query.limit) : 8;
  let sortBy = req.query.sortBy ? req.query.sortBy : "_id";

  Product.find()
    .select("-photo")
    .populate("category")
    .sort([[sortBy, "asc"]])
    .limit(limit)
    .exec((err, products) => {
      if (err) {
        return res.status(400).json({
          errorMessage: "No products found in DB",
        });
      }
      return res.json(products);
    });
};

exports.getAllUniqueCategories = (req, res) => {
  Product.distinct("category", {}, (err, category) => {
    if (err) {
      return res.json({
        errorMessage: "No Category Found in DB",
      });
    }
    res.json(category);
  });
};

exports.updateStock = (req, res, next) => {
  let myOpertions = req.body.order.products.map((prod) => {
    return {
      updateOne: {
        filter: { _id: prod._id },
        update: { $sinc: { stock: -prod.count, sold: +prod.count } },
      },
    };
  });
  Product.bulkWrite(myOpertions, {}, (err, products) => {
    if (err) {
      return res.status(400).json({
        errorMessage: "Bulk Operation Failed!",
      });
    }
    next();
  });
};
