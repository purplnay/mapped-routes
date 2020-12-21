import { NextFunction, Request, Response } from 'express'
import { RouteHandler } from '../../../src'

// Return 'Invalid ID' if :id is not numeric
function isNumericId(req: Request, res: Response, next: NextFunction) {
  const id = parseInt(req.params.id)

  if (isNaN(id)) {
    res.end('Invalid ID')
  } else {
    next()
  }
}

export const middlewares = [isNumericId]

// Return 'User :id'
export const get: RouteHandler = req => {
  return `User ${req.params.id}`
}

// Return 'Update user :id'
export const patch: RouteHandler = req => {
  return `Update user ${req.params.id}`
}
