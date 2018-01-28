var express = require('express');
var router = express.Router();
var Company = require('../models/company');
var Product = require('../models/product');
////////////////
/////////////
//모든 기기 검색
router.get('/products', function (req, res) {
    Product.find({}, (err, products) => {
        if (err) {
            res.status(404).end();
        } else {
            res.status(200).json(products);
        }
    });
});
///////////////

/*
company id로 해당 회사의 모든 기기 검색
* */
router.get('/products/:id', function (req, res) {
    //id : company id
    Product.find({company_id : req.params.id}, (err, product) => {
        if(err) res.status(404).end();
        else{
            res.status(200).json(
                product
            )
        }
    })
});

/*
특정 회사로 기기 추가
* */
router.post('/products/:id', function (req, res) {
//id : company id
    let company;
    //console.log(req.body.company_name);

    Company.findById(req.params.id, (err, _company) => {
        if (err) {
            res.status(404).end();
        }
        if(_company == null) res.status(404).end();//company not found
        company = _company;

          let product = new Product({
                company_id: company._id,
                product_name: req.body.product_name,
            }
        );

        product.save((err) => {
            if (err) {
                res.status(404);
            }
            else {
                res.status(201).json({
                    success: true
                });
            }
        });
    });


});

router.delete('/products', (req, res) => {
    Product.remove({product_id: req.body.product_id}, (err, output) => {
        if (err) res.status(500);
        else
            res.status(200).json({
                success: true
            });
    });
});

module.exports = router;