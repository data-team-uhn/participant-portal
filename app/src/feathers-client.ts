import authentication from '@feathersjs/authentication-client'
import { feathers } from '@feathersjs/feathers'
import socketio from '@feathersjs/socketio-client'
import { io } from 'socket.io-client'

import { BASE_URL, ENVIRONMENT } from './constants'

const socketOptions = { ackTimeout: 10000 }

const socket = ENVIRONMENT === 'production'
  ? io(BASE_URL, { path: '/socket.io/', ...socketOptions })
  : io(BASE_URL, socketOptions)

const app: any = feathers()

const storage = window.sessionStorage

app.configure(socketio(socket, socketOptions))
app.configure(authentication({ storage: storage }))

export default app
