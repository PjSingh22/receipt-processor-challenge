const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();

const example1 = require('./examples/example1-receipt.json');
const example2 = require('./examples/example2-receipt.json');
const morningReceipt = require('./examples/morning-receipt.json');
const simpleReceipt = require('./examples/simple-receipt.json');

const pointsObj = {}
const receipts = [example1, example2, morningReceipt, simpleReceipt]

app.get('/', (req, res) => {
  res.send('Hello World!')
})

// process reciepts by tallying up points for each receipt
app.post('/receipts/process', (req, res) => {
  const ids = []

  if (!receipts.length) res.send({error: 'No receipts to process'}).status(404);

  receipts.forEach(receipt => {
    // create a unique id for each receipt
    const id = uuidv4();
    let points = 0;

    // remove all non-alphanumeric characters from retailer name
    let retailerName = receipt.retailer.replace(/\W/g, '');
    let items = receipt.items;

    // convert purchase date to a date object
    let purchaseDate = new Date(receipt.purchaseDate.replace(/-/g, '\/')).toDateString();
    let purchaseTime = receipt.purchaseTime;
    let total = receipt.total;

    // One point for every alphanumeric character in the retailer name.
    points += retailerName.length;

    // 50 points if the total is a round dollar amount with no cents.
    if (!parseInt(total.split('.')[1])) points += 50;

    // 25 points if the total is a multiple of 0.25.
    if (parseInt(total.split('.')[1]) % 25 === 0) points += 25;

    // 5 points for every two items on the receipt.
    points += Math.floor(items.length / 2) * 5;

    // multiply item price by 0.2 and round up to the nearest integer if the trimmed length of the item description is a multiple of 3
    items.forEach(item => {
      let description = item.shortDescription;
      let price = item.price;

      if (description.trim().length % 3 === 0) {
        points += Math.ceil(price * 0.2);
      }
    })

    // 6 points if the day in the purchase date is odd.
    if (purchaseDate.split(' ')[2] % 2 !== 0) points += 6;

    // 10 points if the time of purchase is after 2:00pm and before 4:00pm.
    const splitTime = purchaseTime.split(':').join('');
    if (splitTime > 1400 && splitTime < 1600) points += 10;

    ids.push({id});
    pointsObj[id] = points;
  })

  res.send(ids).status(200);
})

// get points for a specific receipt
app.get('/receipts/:id/points', (req, res) => {
  const id = req.params.id;
  const point = pointsObj[id];

  if (point) {
    res.send({points: point}).status(200);
  } else {
    res.send({error: 'Receipt not found'}).status(404);
  }
})

const port = 3000

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
