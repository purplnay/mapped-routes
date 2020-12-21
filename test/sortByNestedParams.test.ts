import { expect } from 'chai'
import { mapRoutes } from '../src/mapRoutes'
import { sortByNestedParams } from '../src/sortByNestedParams'

describe('sortByNestedParams()', () => {
  it('should sort from lowest to higher amount of params', () => {
    const routes = mapRoutes(__dirname + '/routes')
    const sorted = sortByNestedParams(Object.keys(routes))

    expect(sorted[0].includes(':')).to.be.false
    expect(sorted[sorted.length - 1].includes(':')).to.be.true
    expect(sorted[sorted.length - 1].match(/:/g).length).to.equal(2)
  })
})
