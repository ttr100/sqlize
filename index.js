const Sql = require('sequelize');
const myDB = new Sql({
    dialect: 'sqlite',
    storage: './data.db'
})


// const Product = myDB.define(
//   'Product', 
//   {
//     id: {
//       type: Sql.DataTypes.INTEGER,
//       field: 'id'
//     },
//     productName: {
//       type: Sql.DataTypes.STRING,
//       field: 'product_name'
//     },
//     sku: {
//       type: Sql.DataTypes.STRING,
//       field: 'sku'
//     },
//   }