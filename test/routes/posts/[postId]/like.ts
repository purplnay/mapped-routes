import { RouteHandler } from '../../../../src'

// Throw 'Not logged in'
export const post: RouteHandler = () => {
  throw 'Not logged in'
}
