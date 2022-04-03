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
  </head>
  <body>
    <h1>Products</h1>
    <table>
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
  </body>
</html>
  `)
}

app.get('/', indexPage)

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})



