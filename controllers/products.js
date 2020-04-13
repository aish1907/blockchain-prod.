const path = require('path');
var stripe = require("stripe")("sk_test_ACjl2TdvzG3kme7XdTlgVTyv00XlyDFYLy")


const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/add-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    formsCSS: true,
    productCSS: true,
    activeAddProduct: true
  });
};

var stripe = Stripe('pk_test_99HvB4jn2lcOTp84FAxAhh8N00sH3KAgIB');
var elements = stripe.elements();


exports.postAddProduct = (req, res, next) => {
  const product = new Product(req.body.title);
  product.save();
  res.redirect('/');
};

exports.getProducts = (req, res, next) => {
  Product.fetchAll(products => {
    res.render('shop/product-list', {
      prods: products,
      pageTitle: 'Shop',
      path: '/',
      hasProducts: products.length > 0,
      activeShop: true,
      productCSS: true
    });
  });
};
