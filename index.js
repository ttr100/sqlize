const express = require('express')
const {Product, Sales, SyncModels, Op} = require('./db')
const shop = require('./shop')
const sequelize = require('sequelize');


const app = express()
app.set('views', './html');
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
const port = 3000

async function indexPage(req, res) {
  const searchFilter = req.query.search
  let product;

  if(searchFilter){
    products = await Product.findAll({
      where: {
        productName: {
          [Sql.Op.like]: `%${searchFilter}%`
        }
      }
    });
  }else{
    products = await Product.findAll();
  }

  res.render('index', {products: products})
}

async function newProduct(req, res){
  const newProductName = req.body.name;
  const newProductSKU = req.body.sku;

  await Product.create({
    productName: newProductName,
    sku: newProductSKU,
  })

  res.redirect('/')
}

async function updateProduct(req, res){
  const newProductName = req.body.name;
  const newProductSKU = req.body.sku;

  const productToUpdate = await Product.findByPk(req.params.id)
  productToUpdate.productName = newProductName
  productToUpdate.sku = newProductSKU
  await productToUpdate.save()

  res.redirect('/')
}

async function editProduct(req, res){
  const productId = req.params.id
  const product = await Product.findByPk(productId)
  const productSales = await Sales.findAll({
    where: {
      productId: productId,
    }
  })

  res.render('product/edit', {
    product: product,
    productSales: productSales,
  })
}

async function deleteProduct(req, res){
  const productId = req.params.id
  const product = await Product.findByPk(productId);
  await product.destroy()

  res.redirect('/')
}

async function recordProductSale(req, res){
  const product = await Product.findByPk(req.params.id)
  const qty = req.body.quantity
  await Sales.create({
    quantity: qty,
    productId: product.id
  })

  res.redirect(`/${product.id}`)
}


app.get("/favicon.ico", (req, res) => {
  res.send('')
});

async function salesIndexPage(req, res){
  const productSales = await Sales.findAll({
    include: Product,
    order: [
      ['createdAt', 'DESC'] //descending
    ]
  })

  const salesSummary = await Sales.findAll({
    attributes: [
      [sequelize.fn('SUM', sequelize.col('quantity')), 'quantitySum']
    ],
    group: 'productId',
    include: Product,
  })

  res.send(`
    <html>
    <head>
      <title>App Kasir</title>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css">
    </head>
    <body>

      <div class="box">
        <table class="table is-fullwidth">
          <thead>
            <tr>
              <th>Product name</th>
              <th>Quantity</th>
            </tr>
          </thead>
          <tbody>
            ${salesSummary.map(sale => `<tr>
              <td>${sale.Product.productName}</td>
              <td>${sale.quantitySum}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>

      <div class="box">
        <table class="table is-fullwidth">
          <thead>
            <tr>
              <th>Product name</th>
              <th>Product SKU</th>
              <th>Quantity</th>
              <th>Tiemestamp</th>
            </tr>
          </thead>
          <tbody>
            ${productSales.map(sale => `<tr>
              <td>${sale.Product.productName}</td>
              <td>${sale.Product.sku}</td>
              <td>${sale.quantity}</td>
              <td>${sale.createdAt}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </body>
  </html>`)
}

app.get('/sales', salesIndexPage)

app.get("/shop", shop.shopPage);
app.post("/new-shop", shop.newShop);
app.get("/shop/:id", shop.editShop);
app.post("/shop/:id/update", shop.updateShop);
app.post("/shop/:id/delete", shop.deleteShop);

app.get('/', indexPage)
app.post("/newProduct", newProduct)
app.get("/:id", editProduct)
app.post("/:id/sales", recordProductSale)
app.post("/:id/update", updateProduct)
app.post("/:id/delete", deleteProduct)



SyncModels();
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

