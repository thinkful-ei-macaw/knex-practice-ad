const ShoppingListService = require('../src/shopping-list-service');
const knex = require('knex');

describe('Shopping List Service object', function() {
  let db;

  let testItems = [
    {
      id: 1,
      name: 'mango',
      category: 'Snack',
      checked: false,
      price: '12.33',
      date_added: new Date('2029-01-21T16:28:32.615Z')
    },
    {
      id: 2,
      name: 'coffee',
      category: 'Breakfast',
      checked: true,
      price: '22.99',
      date_added: new Date('2029-01-10T16:28:32.615Z')
    },
    {
      id: 3,
      name: 'apples',
      category: 'Lunch',
      checked: false,
      price: '5.99',
      date_added: new Date('2029-01-05T16:28:32.615Z')
    }
  ];

  before(() => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    });
  });

  before(() => db('shopping_list').truncate());

  afterEach(() => db('shopping_list').truncate());

  after(() => db.destroy());

  context(`Given 'shopping_list' has data`, () => {
    beforeEach(() => {
      return db
        .into('shopping_list')
        .insert(testItems);
    });

    it(`getAllItems() resolves all items from 'shopping_list' table`, () => {
      return ShoppingListService.getAllItems(db)
        .then(actual => {
          expect(actual).to.eql(testItems);
        });
    });

    it(`getById() resolves an item by id from 'shopping_list' table`, () => {
      const thirdId = 3;
      const thirdTestItem = testItems[thirdId - 1];
      return ShoppingListService.getById(db, thirdId)
        .then(actual => {
          expect(actual).to.eql({
            id: thirdId,
            name: thirdTestItem.name,
            category: thirdTestItem.category,
            checked: thirdTestItem.checked,
            price: thirdTestItem.price,
            date_added: thirdTestItem.date_added
          });
        });
    });

    it(`deleteItem() removes an item by id from 'shopping_list' table`, () => {
      const itemId = 3;
      return ShoppingListService.deleteItem(db, itemId)
        .then(() => ShoppingListService.getAllItems(db))
        .then(allItems => {
          // copy the test articles array without the "deleted" article
          const expected = testItems.filter(item => item.id !== itemId);
          expect(allItems).to.eql(expected);
        });
    });

    it(`updateItem() updates an item from the 'shopping_list' table`, () => {
      const idOfItemToUpdate = 3
      const newItemData = {
        name: 'updated name',
        category: 'Lunch',
        checked: false,
        price: '33.33',
        date_added: new Date()
      }
      return ShoppingListService.updateItem(db, idOfItemToUpdate, newItemData)
        .then(() => ShoppingListService.getById(db, idOfItemToUpdate))
        .then(item => {
          expect(item).to.eql({
            id: idOfItemToUpdate,
            ...newItemData,
          })
        })
    })
  });

    context(`Given 'shopping_list' has no data`, () => {
      it(`getAllItems() resolves an empty array`, () => {
        return ShoppingListService.getAllItems(db)
          .then(actual => {
            expect(actual).to.eql([]);
          });
      });
  
      it(`insertItem() inserts an item and resolves the item with an 'id'`, () => {
        const newItem = {
          id: 1,
          name: 'new item',
          category: 'Lunch',
          checked: false,
          price: '33.33',
          date_added: new Date()
        };
        return ShoppingListService.insertItem(db, newItem)
          .then(actual => {
            expect(actual).to.eql({
              id: newItem.id,
              name: newItem.name,
              category: newItem.category,
              checked: newItem.checked,
              price: newItem.price,
              date_added: newItem.date_added,
            });
          });
      });
  });
});