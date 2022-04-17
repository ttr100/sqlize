const {Shop} = require('./db')

async function shopPage(req, res) {
  const searchFilter = req.query.search;
  let shops;

  if (searchFilter) {
    shops = await Shop.findAll({
      where: {
        name: {
          [Sql.Op.like]: `%${searchFilter}%`,
        },
      },
    });
  } else {
    shops = await Shop.findAll();
  }

  res.send(`
  <html>
  <head>
    <title>App Kasir</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css">
  </head>
  <body>
    <div class="box">
      <form method="post" action="/new-shop">
        <div class="field">
          <div class="control">
            <input class="input" type="text" name="name" placeholder="New shop name" />
          </div>
        </div>
        <input class="button is-primary" type="submit" value="Submit" />
      </form>
    </div>
    <div class="box">
      <h1>Products</h1>
      <form method="get" action="/shop">
        <div class="field has-addons">
          <div class="control">
            <input class="input" type="text" name="search" placeholder="Find a shop">
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
          <th></th>
          <th></th>
        </thead>
        <tbody>
          ${shops
            .map(
              (shop) => `<tr>
            <td>${shop.id}</td>
            <td>${shop.name}</td>
            <td><a href="/shop/${shop.id}" class="button">Edit</a></td>
            <td>
              <form method="post" action="/shop/${shop.id}/delete">
                <input class="button is-danger" type="submit" onclick="return confirm('sure to delete?')" value="Delete" />
              </form>
            </td>
          </tr>`
            )
            .join("")}
        </tbody>
      </table>
    </div>
    </body>
  </html>
  `);
}

async function newShop(req, res) {
  const newShopName = req.body.name;

  await Shop.create({
    name: newShopName,
  });

  res.redirect("/shop");
}

async function updateShop(req, res) {
  const newShopName = req.body.name;

  const shopToUpdate = await Shop.findByPk(req.params.id);
  shopToUpdate.name = newShopName;
  await shopToUpdate.save();

  res.redirect("/shop");
}

async function editShop(req, res) {
  const shopId = req.params.id;
  const shop = await Shop.findByPk(shopId);
  res.send(`
    <html>
    <head>
      <title>App Kasir</title>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css">
    </head>
    <body>
      <div class="box">
        <form method="post" action="/shop/${shop.id}/update">
          <div class="field">
            <div class="control">
              <input class="input" type="text" name="name" value="${shop.name}" placeholder="New product name" />
            </div>
          </div>
          <input class="button is-primary" type="submit" value="Save" />
          <a href="/" class="button">Cancel</a>
          <input class="button is-danger" type="submit" value="Delete" formaction="/shop/${shop.id}/delete" />
        </form>

      </div>
    </body>
  </html>`);
}

async function deleteShop(req, res) {
  const shopId = req.params.id;
  const shop = await Shop.findByPk(shopId);
  await shop.destroy();

  res.redirect("/shop");
}

module.exports = {
  shopPage, newShop, updateShop, editShop, deleteShop,
}