import { createServer, Server } from 'http'
import express, { Request, Response } from 'express'
import request from 'supertest'
import { MappedRoutes } from '../src/MappedRoutes'

describe('MappedRoutes()', () => {
  let server: Server

  const interceptor = (req: Request, res: Response, content: string) => {
    res.json({ error: false, data: content })
  }

  const errorHandler = (req: Request, res: Response, error: any) => {
    res.json({ error: true, data: error })
  }

  before(done => {
    const app = express()
    const mappedRoutes = MappedRoutes(__dirname + '/routes', {
      interceptor,
      errorHandler,
    })

    app.use(mappedRoutes)
    server = createServer(app)

    server.listen(done)
  })

  after(done => {
    server.close(done)
  })

  it('should execute the custom error handler', async () => {
    await request(server).post('/posts/1234/like').expect({
      error: true,
      data: 'Not logged in',
    })
  })

  it('should execute the interceptor', async () => {
    await request(server).get('/users').expect({
      error: false,
      data: 'Get users',
    })
  })
})
