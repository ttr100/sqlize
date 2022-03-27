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

// Nicko
async function printAllEntry(){
  const allProducts = await Product.findAll();

  for(let i = 0; i < allProducts.length; i++){
    console.log('-------------------------')
    console.log(`ID:  ${allProducts[i].id}`)
    console.log(`Name:  ${allProducts[i].productName}`)
    console.log(`SKU:  ${allProducts[i].sku}`)
    console.log('-------------------------')
  }
}

async function new100Entry(){
  for(let i = 0; i < 100; i++){
    const newProduct = await Product.create({productName: 'GFUEL' + i.toString(), sku: 'TEST' + toString(i*10)});
  }

  console.log('DATA ENTRY DONE');
}

async function fun(){
  await new100Entry();
  await printAllEntry();
}

fun()
