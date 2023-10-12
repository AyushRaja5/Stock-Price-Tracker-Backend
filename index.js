const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config(); // .env file
const app = express();
const StockSchema = require('./models/stock.js')
const PORT = process.env.PORT || 5000;
const cors = require('cors')
const dbURL = process.env.MONGODB_URI;
const path = require('path')

mongoose.connect(dbURL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(error => {
  console.error('MongoDB connection error:', error);
});

// middleware
app.use(express.json());
app.use(cors());


const stockNames = ['AAPL', 'GOOGL', 'TSLA', 'AMZN', 'MSFT', 'META', 'NFLX', 'NVDA', 'V', 'MA'];
const generateRandomPrice = () => {
  const num = Math.random() * 200; // Random Price
  return Math.floor(num);
};


app.post('/update', async (req, resp) => {
  try {
    const stocksData = stockNames.map(async (name) => {
      // Find the stock by name
      const existingStock = await StockSchema.findOne({ name });

      if (existingStock) {
        // If the stock exists, update its price and lastUpdated time
        const newPrice = generateRandomPrice();
        existingStock.price = newPrice;
        existingStock.lastUpdated = new Date();
        await existingStock.save();
        return existingStock;
      }
      else {
        // If the stock does not exist, insert a new stock
        const newStock = new StockSchema({
          name,
          price: generateRandomPrice(),
          lastUpdated: new Date(),
        });
        await newStock.save();
        return newStock;
      }
    });

    const updatedStocks = await Promise.all(stocksData);

    resp.json({ message: 'Stocks updated/inserted successfully.', stocks: updatedStocks });
  } catch (error) {
    console.error('Error updating/inserting stocks:', error);
    resp.status(500).json({ message: 'Internal Server Error' });
  }
});


// Update stock price in every 1 min
const updateStockPrices = async () => {
  try {
    const stocksData = stockNames.map(async (name) => {
      // Find the stock by name
      const existingStock = await StockSchema.findOne({ name });

      if (existingStock) {
        // If the stock exists, update its price and lastUpdated
        const newPrice = generateRandomPrice();
        existingStock.price = newPrice;
        existingStock.lastUpdated = new Date();
        await existingStock.save();
        return existingStock;
      } else {
        // If the stock does not exist, insert a new one
        const newStock = new StockSchema({
          name,
          price: generateRandomPrice(),
          lastUpdated: new Date(),
        });
        await newStock.save();
        return newStock;
      }
    });

    const updatedStocks = await Promise.all(stocksData);
    console.log('Stock prices updated at', new Date());
  } catch (error) {
    console.error('Error updating/inserting stocks:', error);
  }
};

const updateInterval = 1 * 60 * 1000; // 1 min
setInterval(updateStockPrices, updateInterval);

app.get('/allstocks', async (req, resp) => {
  try {
    const allstocks = await StockSchema.find({});
    resp.status(200).json({ message: 'We got all the stocks :)', allstocks })
  }
  catch (error) {
    resp.status(500).json({ message: "Error while getting all stocks :( " })
  }
})

app.get('/getstock/:id', async (req, resp) => {
  const { id } = req.params;
  try {
    const existingStock = await StockSchema.findById(id);
    if (existingStock)
      resp.status(200).json({ message: 'Stock found with this id', stock: existingStock });
    else
      resp.status(404).json({ message: 'Stock with this id not found' });
  } catch (error) {
    resp.status(500).json({ message: 'Internal Server Error, Error in fetching Stocks' })
  }
})

app.use(express.static(path.join(__dirname, "public/build")));
app.get("/*", function (req, res) {
  res.sendFile(path.join(__dirname, "public/build", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
