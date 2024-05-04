const express    = require('express')
const mongoose   = require('mongoose')
const morgan     = require('morgan')
const cors       = require('cors')
const http       = require('http')
const WebSocket  = require('ws')
const cookieParser = require('cookie-parser')
const path = require('path')


const middleware = require('./middleware')
const app        = express()
const server     = http.createServer(app)

const wss    = new WebSocket.Server({ noServer: true })

require('dotenv').config()

const port = process.env.PORT_NO
const dbString = process.env.DB_STRING
const baseURL = process.env.URL_BASE

const authRouter    = require('./routers/auth')
const userRouter    = require('./routers/users')
const profileRouter = require('./routers/profile')

// app.use(bodyParser.json({ limit: '5mb' }))
app.use(express.json())
app.use(morgan('tiny'))
app.use(cors())
app.use(middleware.authHandle())
app.use(cookieParser())

app.use(express.static(path.join(__dirname, 'admin-build')))
// app.use(express.static(path.join(__dirname, 'auth-build')))
app.use(express.static(path.join(__dirname, 'game-build/build')))

app.use('*', cors())

app.use(`${baseURL}/auth`, authRouter)
app.use(`${baseURL}/users`, userRouter)
app.use(`${baseURL}/profiles`, profileRouter)

app.use(middleware.errorHandle)

// app.get('/', (req, res) => {
//     res.send('Server Running!')
// })

app.get('/admin', function(req, res) {
  res.sendFile(path.join(__dirname, './admin-build', 'index.html'));
})

// app.get('/auth', function(req, res) {
//   res.sendFile(path.join(__dirname, './auth-build', 'index.html'));
// })

app.get('/games', function(req, res) {
  res.sendFile(path.join(__dirname, './game-build/build', 'index.html'));
})

server.on('upgrade', (request, socket, head) => {
  const pathname = request.url.split('/');

  if (pathname[1] === '') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request)
    })
  } else {
    socket.destroy()
  }
})

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    const data = JSON.parse(message)
    if (data.type === 'location' || data.type === 'request' || data.type === 'accepted') {
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(data));
        }
      })
    }

    

  })
  // ws.send(JSON.stringify({message: 'Connected!'}));
})

mongoose.connect(dbString)
.then(() => console.log('Database Connected!'))
.catch( (error) => console.log(error))


server.listen(port, () => {
    console.log(`Server is listening at http://localhost:${port}`)
  });
  