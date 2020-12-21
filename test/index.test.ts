/**
 * Sample routes structure in ./routes:
 *
 * /posts                           {GET,POST}
 * /posts/:postId                   {GET,PATCH,DELETE}
 * /posts/:postId/like              {POST}
 * /posts/:postId/comments          {GET,POST}
 * /posts/:postId/comments/:id      {GET,DELETE}
 * /posts/:postId/comments/:id/like {POST}
 * /users                           {GET}
 * /users/:id                       {GET,PATCH}
 */

import { expect } from 'chai'
import { mapRoutes, sortByNestedParams } from '../src'

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

describe('sortByNestedParams', () => {
  it('should sort from lowest to higher amount of params', () => {
    const routes = mapRoutes(__dirname + '/routes')
    const sorted = sortByNestedParams(Object.keys(routes))

    expect(sorted[0].includes(':')).to.be.false
    expect(sorted[sorted.length - 1].includes(':')).to.be.true
    expect(sorted[sorted.length - 1].match(/:/g).length).to.equal(2)
  })
})
