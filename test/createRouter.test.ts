import { expect } from 'chai'
import { createServer, Server } from 'http'
import express, { NextFunction, Request, Response } from 'express'
import request from 'supertest'
import { mapRoutes } from '../src/mapRoutes'
import { createRouter } from '../src/createRouter'

describe('createRouter()', () => {
  let server: Server
  let lastPath: string

  before(done => {
    const app = express()
    const routes = mapRoutes(__dirname + '/routes')

    app.use(
      '/api',
      createRouter(routes, [
        (req: Request, res: Response, next: NextFunction) => {
          lastPath = req.url
          next()
        },
      ]),
    )

    server = createServer(app)

    server.listen(done)
  })

  after(done => {
    server.close(done)
  })

  it('should execute the correct route', async () => {
    const response = await request(server).get('/api/users')

    expect(response.text).to.equal('Get users')
  })

  it('should execute global middlewares', async () => {
    const response = await request(server).get('/api/users/abcd')

    expect(lastPath).to.equal('/users/abcd')
    expect(response.text).to.equal('Invalid ID')
  })

  it('should execute the correct method handler', async () => {
    const response = await request(server).patch('/api/users/1234')

    expect(response.text).to.equal('Update user 1234')
  })

  it('should execute the middlewares in the correct order', async () => {
    const getRes = await request(server).get('/api/posts')
    const postRes = await request(server).post('/api/posts')

    expect(getRes.text).to.equal('testMiddleware,getTestMiddleware,getRoute')
    expect(postRes.text).to.equal('testMiddleware,postTestMiddleware,postRoute')
  })

  it('should ignore the .spec files', async () => {
    await request(server).get('/api/posts/123/like.spec').expect(404)
  })

  it('should ignore the .test files', async () => {
    await request(server).get('/api/posts/123/index.test').expect(404)
  })
})
