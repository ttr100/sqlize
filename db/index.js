const Sql = require('sequelize');

const myDB = new Sql({
    dialect: 'sqlite',
    storage: './data.db'
})

const Op = Sql.Op

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

const Shop = myDB.define(
  'Shops',
  {
    id: {
      type: Sql.DataTypes.INTEGER,
      field: 'id',
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: Sql.DataTypes.STRING,
      field: 'name'
    },
  },
  {
    tableName: 'shops',
    timestamps: true,
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
    quantity: {
      type: Sql.DataTypes.INTEGER,
      field: 'quantity'
    },
    quantitySum: {
      type: Sql.DataTypes.VIRTUAL,
    }
  },
  {
    tableName: 'sales',
  }
)
// Associations
Sales.belongsTo(Product, {foreignKey: 'productId'})


// Alice owns 3 cars
// car1 belongs to alice //tabale car  - owner_id - 
// car2 belongs to alice
// car3 belongs to alice


async function SyncModels(){
  await Product.sync()
  await Shop.sync()
  await Sales.sync()
}

module.exports = {
  Product, Shop, Sales, SyncModels, Op
}