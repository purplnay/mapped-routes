import { RouteHandler } from '../../../../../../src'

// Send 'Comment `id`' using the Response object
export const get: RouteHandler = (req, res) => {
  res.end(`Comment ${req.params.id}`)
}
