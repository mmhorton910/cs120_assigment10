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
        <h1 style="font-family: sans-serif">Place or Zip Code Lookup</h1>
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
    filter = { zip_codes: query };
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
            <h1 style="font-family: sans-serif">Results</h1>
            <p style="font-family: sans-serif">Place: ${result.place_name}</p>
            <p style="font-family: sans-serif">Zip Codes: ${result.zip_codes.join(', ')}</p>
            <a href="/" style="font-family: sans-serif">Go back</a>
          </body>
        </html>
      `);
    } else {
      res.send(`
        <html>
          <body>
            <h1 style="font-family: sans-serif">No results found</h1>
            <a href="/" style="font-family: sans-serif">Go back</a>
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
