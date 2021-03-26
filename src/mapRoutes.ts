import { existsSync } from 'fs'
import { isAbsolute, join, normalize } from 'path'
import read from 'fs-readdir-recursive'

/**
 * Generate Express route paths from a directory structure.
 *
 * @param dir The directory to read the routes from.
 * @returns An object with Express paths as key and module path as value.
 */
export function mapRoutes(dir: string): { [key: string]: string } {
  const dirPath = normalize(dir)

  // Reject relative paths
  if (!isAbsolute(dirPath)) {
    throw new Error(`Path \`${dir}\` is not an absolute path.`)
  }

  // Reject invalid paths
  if (!existsSync(dirPath)) {
    throw new Error(`Directory \`${dir}\` does not exist.`)
  }

  // Get the file paths in `dir`
  const paths = read(dirPath)
    .filter(path => {
      // Ignore TypeScript declarations
      return !path.endsWith('.d.ts')
    })
    .map(path => {
      // Prepend a / for Express and normalize the path
      return '/' + normalize(path)
    })
    .map(path => {
      // Replace backslashes for Windows
      return path.replace(/\\/g, '/')
    })

  const routes: { [key: string]: string } = {}

  paths.forEach(path => {
    // Remove file extensions
    const withoutExtension = path.replace(/\.m?(js|ts)x?$/i, '')

    // Remove 'index'
    const withoutIndex = withoutExtension.replace(/\/index$/i, '')

    // Transform bracket params to Express params
    const withParams = withoutIndex.replace(/\[([a-z0-9\-_]+)\]/gi, ':$1')

    routes[withParams] = join(dirPath, path).replace(/\\/g, '/')
  })

  return routes
}
