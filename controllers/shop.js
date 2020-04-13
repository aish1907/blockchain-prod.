const Product = require('../models/product');
const Order = require('../models/order');
const stripe = require('stripe')('sk_test_ACjl2TdvzG3kme7XdTlgVTyv00XlyDFYLy');
//const nodemailer = require('nodemailer');
//const sendgridTransport = require('nodemailer-sendgrid-transport');

//const transporter = nodemailer.createTransport(sendgridTransport({
  //shop: {
    //api_key: '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'
  //}
//}));

exports.getProducts = (req, res, next) => {
  Product.find()
    .then(products => {
      console.log(products);
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'All Products',
        path: '/products'
      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      res.render('shop/product-detail', {
        product: product,
        pageTitle: product.title,
        path: '/products'
      });
    })
    .catch(err => console.log(err));
};

exports.getIndex = (req, res, next) => {
  Product.find()
    .then(products => {
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/'
      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getCart = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
      const products = user.cart.items;
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: products
      });
    })
    .catch(err => console.log(err));
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then(product => {
      return req.user.addToCart(product);
    })
    .then(result => {
      console.log(result);
      res.redirect('/cart');
    });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .removeFromCart(prodId)
    .then(result => {
      res.redirect('/cart');
    })
    .catch(err => console.log(err));
};

exports.getCheckout = (req,res,next) =>{
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
      const products = user.cart.items;
      let total=0;
      products.forEach(p => {
        total += p.quantity*p.productId.price;
      });

      res.render('shop/checkout', {
        path: '/checkout',
        pageTitle: 'Your Cart',
        products: products,
        totalSum: total
      });
    })
    .catch(err => console.log(err));
};

exports.postOrder = (req, res, next) => {


  const token = req.body.stripeToken; // Using Express
   let totalSum = 0;

   req.user
     .populate('cart.items.productId')
     .execPopulate()
     .then(user => {
       user.cart.items.forEach(p => {
         totalSum += p.quantity * p.productId.price;
       });

       const products = user.cart.items.map(i => {
         return { quantity: i.quantity, product: { ...i.productId._doc } };
       });
       const order = new Order({
         user: {
           email: req.user.email,
           userId: req.user
         },
         products: products
       });
       return order.save();
     })
     .then(result => {
       const charge = stripe.charges.create({
         amount: totalSum * 100,
         currency: 'inr',
         description: 'Demo Order',
         source: token,
         metadata: { order_id: result._id.toString() }
       });
        return req.user.clearCart();
    })
    .then(result => {
      res.redirect('/orders');
      return transporter.sendMail({
        to:req.user.email,
        from: 'DOne@solutions.com',
        subject: 'Kudos!',
        html: '<h1>Your package has found someone promising!Soon to reach out.</h1>'
      });
    })
    .catch(err => {console.log(err);
});
};



exports.getOrders = (req, res, next) => {
  Order.find({ 'user.userId': req.user._id })
    .then(orders => {
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: orders
      });
    })
    .catch(err =>{ console.log(err);
});
};
