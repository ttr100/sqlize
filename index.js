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

  res.send(`
<html>
  <head>
    <title>App Kasir</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css">
  </head>
  <body>
    <div class="box">
      <form method="post" action="/newProduct">
        <div class="field">
          <div class="control">
            <input class="input" type="text" name="name" placeholder="New product name" />
          </div>
        </div>
        <div class="field">
          <div class="control">
            <input class="input" type="text" name="sku" placeholder="New product SKU"/>
          </div>
        </div>
        <input class="button is-primary" type="submit" value="Submit" />
      </form>
    </div>
    <div class="box">
      <h1>Products</h1>
      <form method="get" action="/">
        <div class="field has-addons">
          <div class="control">
            <input class="input" type="text" name="search" placeholder="Find a product">
          </div>
          <div class="control">
            <button type="submit" class="button is-info">
              Search
            </button>
          </div>
        </div>
      </form>

      <table class="table is-fullwidth">
        <thead>
          <th>ID</th>
          <th>Name</th>
          <th>SKU</th>
          <th></th>
          <th></th>
        </thead>
        <tbody>
          ${products.map(product => `<tr>
            <td>${product.id}</td>
            <td>${product.productName}</td>
            <td>${product.sku}</td>
            <td><a href="/${product.id}" class="button">Edit</a></td>
            <td>
              <form method="post" action="/${product.id}/delete">
                <input class="button is-danger" type="submit" onclick="return confirm('sure to delete?')" value="Delete" />
              </form>
            </td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
  </body>
</html>
  `)
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

  res.send(`
    <html>
    <head>
      <title>App Kasir</title>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css">
    </head>
    <body>
      <div class="box">
        <form method="post" action="/${product.id}/update">
          <div class="field">
            <div class="control">
              <input class="input" type="text" name="name" value="${product.productName}" placeholder="New product name" />
            </div>
          </div>
          <div class="field">
            <div class="control">
              <input class="input" type="text" name="sku" value="${product.sku}" placeholder="New product SKU"/>
            </div>
          </div>
          <input class="button is-primary" type="submit" value="Save" />
          <a href="/" class="button">Cancel</a>
          <input class="button is-danger" type="submit" value="Delete" formaction="/${product.id}/delete" />
        </form>
      </div>
      <div class="box">
      
        <form method="post" action="/${product.id}/sales">
          <input type="hidden" name="productId" value="${product.id}">
          <div class="field">
            <div class="control">
              <input class="input" type="number" name="quantity" placeholder="0" />
            </div>
            <input class="button is-primary" type="submit" value="Record Sale" />
          </div>
        </form>
        <table class="table is-fullwidth">
          <thead>
            <tr>
              <th>Quantity</th>
              <th>Tiemestamp</th>
            </tr>
          </thead>
          <tbody>
            ${productSales.map(sale => `<tr>
              <td>${sale.quantity}</td>
              <td>${sale.createdAt}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </body>
  </html>`)
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

app.get('/temp', function(req, res){
  res.render('index', {header: 'TEMP', name: 'Alice'});
})

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

