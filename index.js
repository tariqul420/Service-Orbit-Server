const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require('express');
const cors = require('cors');
const app = express();

require('dotenv').config();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors())
app.use(express.json())
app.use(cookieParser())

const uri = `mongodb+srv://${process.env.DATABASE_USERNAME}:${process.env.DATABASE_PASSWORD}@tariqul-islam.mchvj.mongodb.net/?retryWrites=true&w=majority&appName=TARIQUL-ISLAM`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        await client.connect();
        await client.db("admin").command({ ping: 1 });
        console.log("☘️  You successfully connected to MongoDB!");

        // Database Collection Name
        const nameCollection = client.db('NoName').collection('Name')

        // User Private Route
        app.get('/private', verifyToken, async (req, res) => {
            try {
                const { email } = req.query
                const query = { email: email }

                if (req.user.email !== email) {
                    return res.status(403).send({ error: 'Forbidden Access' })
                }

                const result = await nameCollection.find(query).toArray()
                res.send(result)
            } catch (error) {
                console.error('Private:', error.message)
                res.status(500).send({ error: 'Failed to get private data' })
            }
        })

    } catch (err) {
        console.error('Mongodb', err.message)
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello Programmer. How Are You? This Server For No-Name Website ❤️')
})

app.listen(port, () => {
    console.log(`☘️  You successfully connected to Server: ${port}`);
})