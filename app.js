const express = require('express');
const { MongoClient } = require('mongodb');
const app = express();
const port = process.env.PORT || 3000;

const uri = 'mongodb+srv://cs120:webprogramming@cluster0.oxuwn4j.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'; // Adjust as necessary for your environment
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {
  res.send(`
    <html>
      <body>
        <h1>Place or Zip Code Lookup</h1>
        <form action="/process" method="post">
          <input type="text" name="query" placeholder="Enter a place or zip code" required>
          <button type="submit">Submit</button>
        </form>
      </body>
    </html>
  `);
});
app.post('/process', async (req, res) => {
  const query = req.body.query;
  let filter;

  if (/^\d/.test(query)) {
    filter = { zips: query };
  } else {
    filter = { place_name: query };
  }

  try {
    await client.connect();
    const db = client.db('database');
    const collection = db.collection('places');
    const result = await collection.findOne(filter);

    if (result) {
      res.send(`
        <html>
          <body>
            <h1>Results</h1>
            <p>Place: ${result.place_name}</p>
            <p>Zip Codes: ${result.zip_codes.join(', ')}</p>
            <a href="/">Go back</a>
          </body>
        </html>
      `);
    } else {
      res.send(`
        <html>
          <body>
            <h1>No results found</h1>
            <a href="/">Go back</a>
          </body>
        </html>
      `);
    }
  } catch (err) {
    console.error('Error processing request:', err);
    res.status(500).send('Internal Server Error');
  } finally {
    await client.close();
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
