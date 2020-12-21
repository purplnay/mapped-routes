/**
 * Sample routes structure in ./routes:
 *
 * /posts
 * /posts/:postId
 * /posts/:postId/like
 * /posts/:postId/comments
 * /posts/:postId/comments/:id
 * /posts/:postId/comments/:id/like
 * /users
 * /users/:id
 */

import { expect } from 'chai'
import { AddressInfo } from 'net'
import { Server, createServer } from 'http'
import express, { NextFunction, Request, Response } from 'express'
import request from 'supertest'
import { createRouter, mapRoutes, sortByNestedParams } from '../src'

describe('mapRoutes()', () => {
  it('should reject relative paths', () => {
    expect(() => mapRoutes('./routes')).to.throw
  })

  it('should reject non-existing paths', () => {
    expect(() => mapRoutes(__dirname + '/invalid-path')).to.throw
  })

  it('should transform a dir structure to Express paths', () => {
    const routes = mapRoutes(__dirname + '/routes')

    expect(routes['/posts']).to.be.a('string')
    expect(routes['/posts/:postId']).to.be.a('string')
    expect(routes['/posts/:postId/comments']).to.be.a('string')
    expect(routes['/posts/:postId/comments/:id']).to.be.a('string')
    expect(routes['/posts/:postId/comments/:id/like']).to.be.a('string')
  })

  it('should return module paths that can be required', () => {
    const routes = mapRoutes(__dirname + '/routes')

    Object.values(routes).map(require)
  })
})

describe('sortByNestedParams()', () => {
  it('should sort from lowest to higher amount of params', () => {
    const routes = mapRoutes(__dirname + '/routes')
    const sorted = sortByNestedParams(Object.keys(routes))

    expect(sorted[0].includes(':')).to.be.false
    expect(sorted[sorted.length - 1].includes(':')).to.be.true
    expect(sorted[sorted.length - 1].match(/:/g).length).to.equal(2)
  })
})

describe('createRouter()', () => {
  let server: Server
  let port: number
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

    server.listen(() => {
      port = (server.address() as AddressInfo).port
      done()
    })
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
})
