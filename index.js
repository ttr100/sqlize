const express = require('express')
const {Product, Sales, SyncModels} = require('./db')
const shop = require('./shop')


const app = express()
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

  console.log(products.length);

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



app.get("/shop", shop.shopPage);
app.post("/new-shop", shop.newShop);
app.get("/shop/:id", shop.editShop);
app.post("/shop/:id/update", shop.updateShop);
app.post("/shop/:id/delete", shop.deleteShop);

app.get('/', indexPage)
app.post("/newProduct", newProduct)
app.get("/:id", editProduct)
app.post("/:id/update", updateProduct)
app.post("/:id/delete", deleteProduct)


SyncModels();
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

