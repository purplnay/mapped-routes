/**
 * Sort routes from lowest amount of params to highest.
 *
 * @param routes The route paths to sort.
 */
export function sortByNestedParams(routes: string[]): string[] {
  return routes.sort((a, b) => {
    const aParams = a.match(/:[a-z0-9\-_]+/gi)?.length || 0
    const bParams = b.match(/:[a-z0-9\-_]+/gi)?.length || 0

    if (aParams > bParams) {
      return 1
    }

    if (bParams > aParams) {
      return -1
    }

    return 0
  })
}
