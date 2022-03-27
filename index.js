const Sql = require('sequelize');
const myDB = new Sql({
    dialect: 'sqlite',
    storage: './data.db'
})


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


async function entryPoint(){
  const allProducts = await Product.findAll();

  for(let i = 0; i < allProducts.length; i++){
    console.log('-------------------------')
    console.log(`ID:  ${allProducts[i].id}`)
    console.log(`Name:  ${allProducts[i].productName}`)
    console.log(`SKU:  ${allProducts[i].sku}`)
    console.log('-------------------------')
  }


  const newProduct = await Product.create({productName: 'Dettol', sku: 'DET-123'})
  console.log('-------------------------')
  console.log(`ID:  ${newProduct.id}`)
  console.log(`Name:  ${newProduct.productName}`)
  console.log(`SKU:  ${newProduct.sku}`)
  console.log('-------------------------')
}

entryPoint();