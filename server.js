const express = require('express')
const app = express()

const { v4: uuidv4 } = require('uuid');

const morningReceipt = require('./examples/morning-receipt.json')
const simpleReceipt = require('./examples/simple-receipt.json')
/*
These rules collectively define how many points should be awarded to a receipt.

- One point for every alphanumeric character in the retailer name.
- 50 points if the total is a round dollar amount with no cents.
- 25 points if the total is a multiple of 0.25.
- 5 points for every two items on the receipt.
- If the trimmed length of the item description is a multiple of 3,   multiply - the price by 0.2 and round up to the nearest integer. The result is the number of points earned.
- 6 points if the day in the purchase date is odd.
- 10 points if the time of purchase is after 2:00pm and before 4:00pm.
*/

const points = {}
const receipts = [morningReceipt, simpleReceipt]

app.post('/receipts/process', (req, res) => {
  const ids = []
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
    const splitTime = purchaseTime.split(':')[0];
    if (splitTime > 14 && splitTime < 16) points += 10;

    // One point for every alphanumeric character in the retailer name.
    points += retailerName.length;

    ids.push({id});
    points[id] = points;
  })


  res.send(ids).status(200);
})

app.get('/', (req, res) => {
  res.send('Hello World!')
})




const port = 3000

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
