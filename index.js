const Sql = require('sequelize');
const express = require('express')

const myDB = new Sql({
    dialect: 'sqlite',
    storage: './data.db'
})
// Model
const Product = myDB.define(
  'Product', 
  {
    id: {
      type: Sql.DataTypes.INTEGER,
      field: 'id',
      autoIncrement: true,
      primaryKey: true
    },
    productName: {
      type: Sql.DataTypes.STRING,
      field: 'product_name'
    },
    sku: {
      type: Sql.DataTypes.STRING,
      field: 'sku'
    },
  },
  {
    tableName: 'products',
    timestamps: false
  }
)

const Sales = myDB.define(
  'Sales',
  {
    id: {
      type: Sql.DataTypes.INTEGER,
      field: 'id',
      autoIncrement: true,
      primaryKey: true
    },
    productId: {
      type: Sql.DataTypes.INTEGER,
      field: 'product_id'
    },
    quantity: {
      type: Sql.DataTypes.INTEGER,
      field: 'quantity'
    },
  },
  {
    tableName: 'sales',
  }
)

const app = express()
app.use(express.urlencoded({ extended: true }));
const port = 3000

async function indexPage(req, res) {
  let products = await Product.findAll();
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
      <table class="table is-fullwidth">
        <thead>
          <th>ID</th>
          <th>Name</th>
          <th>SKU</th>
        </thead>
        <tbody>
          ${products.map(product => `<tr>
            <td>${product.id}</td>
            <td>${product.productName}</td>
            <td>${product.sku}</td>
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

app.get('/', indexPage)
app.post("/newProduct", newProduct)

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})



