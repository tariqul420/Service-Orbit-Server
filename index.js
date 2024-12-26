const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const app = express();

require('dotenv').config();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: [
        'http://localhost:5173',
        'https://service-orbit.web.app',
        'https://service-orbit.firebaseapp.com'
    ],
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
        // await client.connect();
        // await client.db("admin").command({ ping: 1 });
        console.log("☘️  You successfully connected to MongoDB!");

        // Database Collection Name
        const serviceCollection = client.db('ServiceOrbit').collection('Services');
        const bookNowCollection = client.db('ServiceOrbit').collection('Purchase_Book')

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
            try {
                res.clearCookie('ServiceOrbit_Token', {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
                }).send({ success: true })
            } catch (error) {
                console.error('Logout:', err.message)
                res.status(500).send({ error: 'Failed to logout when not access jwt token' })
            }
        })

        // Add service
        app.post('/add-service', verifyToken, async (req, res) => {
            try {
                const service = req.body
                const result = await serviceCollection.insertOne(service)
                res.send(result)
            } catch (error) {
                console.error('Add Service:', error.message)
                res.status(500).send({ error: 'Failed to add service' })
            }
        })

        // Post a Purchase request
        app.post('/add-purchase', verifyToken, async (req, res) => {
            try {
                const purchase = req.body
                const query = { 'currentUser.email': purchase?.currentUser?.email, serviceId: purchase?.serviceId }

                const alreadyExist = await bookNowCollection.findOne(query)

                if (alreadyExist) return res.status(400).send('You already purchase this service!')

                const result = await bookNowCollection.insertOne(purchase)
                res.send(result)
            } catch (error) {
                console.error('Add Purchase:', error.message)
                res.status(500).send({ error: 'Failed to add service' })
            }
        })

        // Using for banner
        app.get('/banner', async (req, res) => {
            try {
                const result = await serviceCollection
                    .find()
                    .limit(15)
                    .sort({ servicePrice: -1 })
                    .project({ serviceImage: 1, _id: 1 })
                    .toArray();
                res.send(result);
            } catch (error) {
                console.error('Banner', error.message);
                res.status(500).send({ error: 'Failed to get banner data' });
            }
        });

        // Popular Services
        app.get('/popular-services', async (req, res) => {
            try {
                const result = await serviceCollection.find().limit(4).sort({ servicePrice: 1 }).toArray()
                res.send(result)
            } catch (error) {
                console.error('Popular Services', error.message)
                res.status(500).send({ error: 'Failed to get popular services data' })
            }
        })

        // All services
        app.get('/all-services', async (req, res) => {
            try {
                const { search } = req.query
                let option = {}
                if (search) {
                    option = {
                        serviceName: { $regex: search, $options: 'i' }
                    }
                }

                const result = await serviceCollection.find(option).toArray();
                res.send(result);
            } catch (error) {
                console.error('All Services', error.message);
                res.status(500).send({ error: 'Failed to get all services' });
            }
        });

        // Single service details
        app.get('/service-details/:id', async (req, res) => {
            try {
                const id = req.params.id
                const query = { _id: new ObjectId(id) }
                const result = await serviceCollection.findOne(query)
                res.send(result)
            } catch (error) {
                console.error('Service Details', error.message)
                res.status(500).send({ error: 'Failed to get single service details.' })
            }
        })

        // My Service Route
        app.get('/manage-service', verifyToken, async (req, res) => {
            try {
                const { email } = req.query
                const option = { 'serviceProvider.email': email }

                if (req.user.email !== email) {
                    return res.status(403).send({ error: 'Forbidden Access' })
                }

                const result = await serviceCollection.find(option).toArray()
                res.send(result)
            } catch (error) {
                console.error('My service:', error.message)
                res.status(500).send({ error: 'Failed to get my service data' })
            }
        })

        //Delete my service
        app.delete('/manage-service/:id', verifyToken, async (req, res) => {
            try {
                const id = req.params.id
                const email = req.query.email

                if (req.user.email !== email) {
                    return res.status(403).send({ error: 'Forbidden Access' })
                }

                const query = { _id: new ObjectId(id) }
                const result = await serviceCollection.deleteOne(query)
                res.send(result)
            } catch (error) {
                console.error('Delete Service:', error.message)
                res.status(500).send({ error: 'Failed to delete service' })
            }
        })

        // Update My service
        app.put('/update-service/:id', verifyToken, async (req, res) => {
            try {
                const id = req.params.id
                const query = { _id: new ObjectId(id) }
                const options = { upsert: true };
                const service = req.body
                const updateDoc = {
                    $set: service
                }

                if (req.user.email !== service?.serviceProvider?.email) {
                    return res.status(403).send({ error: 'Forbidden Access' })
                }

                const result = await serviceCollection.updateOne(query, updateDoc, options);
                res.send(result)
            } catch (error) {
                console.error('Update Service:', error.message)
                res.status(500).send({ error: 'Failed to Update service' })
            }
        })

        // Booked all Service data
        app.get('/booked-service', verifyToken, async (req, res) => {
            try {
                const { email } = req.query
                const option = { 'currentUser.email': email }

                if (req.user.email !== email) {
                    return res.status(403).send({ error: 'Forbidden Access' })
                }

                const result = await bookNowCollection.find(option).toArray()
                res.send(result)
            } catch (error) {
                console.error('Booked Service:', error.message)
                res.status(500).send({ error: 'Failed to get booked service data' })
            }
        })

        // Service To Do All Data
        app.get('/service-todo', verifyToken, async (req, res) => {
            try {
                const email = req.query.email
                const query = { 'serviceProvider.email': email }

                if (req.user.email !== email) {
                    return res.status(403).send({ error: 'Forbidden Access' })
                }

                const result = await bookNowCollection.find(query).toArray()
                res.send(result)
            } catch (error) {
                console.error('Service Todo:', error.message)
                res.status(500).send({ error: 'Failed to get service todo data' })
            }
        })

        // Update Status
        app.patch('/service-todo-update-status/:id', async (req, res) => {
            const data = req.body
            const id = req.params.id
            const query = { _id: new ObjectId(id) }

            const updated = {
                $set: { serviceStatus: data.currentStatus },
            }

            const result = await bookNowCollection.updateOne(query, updated)
            res.send(result)
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