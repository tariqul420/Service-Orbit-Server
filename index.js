const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const app = express();

require('dotenv').config();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: ['http://localhost:5173'],
    credentials: true,
}))
app.use(express.json())
app.use(cookieParser())

// Verify Jwt Token
const verifyToken = (req, res, next) => {
    const token = req.cookies.ServiceOrbit_Token
    if (!token) return res.status(401).send({ error: 'unauthorized access' })

    // Verify Token
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, decoded) => {
        if (error) return res.status(401).send({ error: 'unauthorized access' })

        req.user = decoded
        next()
    })
}

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

        // Create Jwt Token
        app.post('/jwt', async (req, res) => {
            try {
                const userInfo = req.body
                const token = jwt.sign(userInfo, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' })
                res.cookie('ServiceOrbit_Token', token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
                }).send({ success: true })
            } catch (err) {
                console.error('JWT:', err.message)
                res.status(500).send({ error: 'Failed to create jwt token' })
            }
        })

        //logout when not access jwt token
        app.post('/logout', async (req, res) => {
            res.clearCookie('ServiceOrbit_Token', {}, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
            }).send({ success: true })
        })

        // User Private Route
        app.get('/private', async (req, res) => {
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