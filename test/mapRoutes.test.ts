import { expect } from 'chai'
import { mapRoutes } from '../src/mapRoutes'

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
