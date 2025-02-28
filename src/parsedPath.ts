/* eslint-disable no-use-before-define */
/* eslint-disable no-constructor-return */
import BasePath from "pathlib-js"
import { join as parsePath } from "path"


function stringParser(str: string) {
  return parsePath(str)
}

function deepChangeStrings(value: any): any {
  const isBasePath = checkInstanceBasePath(value)
  if (isBasePath) return isBasePath
  if (value === null) return value
  if (value instanceof Promise) {
    return value.then(res => deepChangeStrings(res))
  }
  if (typeof value === 'string' && /[^/*]\/([^/*]|$)/.test(value)) {
    return stringParser(value)
  }
  if (Array.isArray(value)) {
    return value.map(val => deepChangeStrings(val))
  }
  if (typeof value === 'object') {
    return Object.entries(value).reduce((acc: {[key: string|number|symbol|``]: any}, [key, val]) => {
      const parseVal = deepChangeStrings(val)
      acc[key] = parseVal
      return acc
    }, {})
  }
  return value
}

/**
 * A class that extends the default 'pathlib-js' `Path` class. It's been updated to return strings parsed using System Path Delimiters
 * @description
 * A wrapper class representing a filepath on which operations can be performed.
 * @example
 * Here are a few examples of how the Path class instantiates:
 * ```js
 * // Assume that the current working directory is:
 * "/home/jsmith/Documents/Work" on Unix and
 * "C:\\Users\\JSmith\\Documents\\Work" on Windows
 * const fp1 = new Path("~")
 * const fp2 = new Path(".")
 * const fp3 = new Path("..")
 * const fp4_unix = new Path("/users/hsimpson/Documents")
 * const fp4_win = new Path("C:\\Users\\HSimpson\\Documents")
 * const fp5 = new Path("./foo")
 * const fp6 = new Path("../bar")
 * const fp7 = new Path("/")
 * console.log([fp1.path, fp2.path, fp3.path, fp4_unix.path, fp4_win.path,
 *              fp5.path, fp6.path, fp7.path
 *              ].join("\n"));
 *
 * // For a Unix user:
 * >>>
 * /home/jsmith
 * /home/jsmith/Documents/Work
 * /home/jsmith/Documents
 * /users/hsimpson/Documents
 * // Windows example has been omitted
 * /home/jsmith/Documents/Work/foo
 * /home/jsmith/Documents/bar
 * /
 *
 * // For a Windows user:
 * >>>
 * C:\\Users\\JSmith
 * C:\\Users\\JSmith\\Documents\\Work
 * C:\\Users\\JSmith\\Documents
 * // Unix example has been omitted
 * C:\\Users\\HSimpson\\Documents
 * C:\\Users\\JSmith\\Documents\\Work\\foo
 * C:\\Users\\JSmith\\Documents\\bar
 * C:\\
 * ```
 */
class Path extends BasePath {
  constructor(...args: ConstructorParameters<typeof BasePath>) {
    super(...args)
    return new Proxy(this, {
      get(target, prop) {
        const value = (target as any)[prop]

        // If it's a method, wrap it
        if (typeof value === 'function') {
          return (...args2: any[]) => {
            const result = value.apply(target, args2)

            // Check if the result is an instance of BasePath
            const isBasePath = checkInstanceBasePath(result)
            if (isBasePath) return isBasePath

            // Check if the result is an array of BasePath instances
            if (Array.isArray(result)) {
              return result.map(item => {
                const isBasePathArr = checkInstanceBasePath(item)
                if (isBasePath) return isBasePathArr
                else return deepChangeStrings(item)
              })
            }

            // If result is not an instance of BasePath, parse it
            return deepChangeStrings(result)
          }
        }

        // If it's not a function, parse it
        return deepChangeStrings(value)
      }
    })
  }
}

function checkInstanceBasePath(value: any) {
  if (value instanceof BasePath) {
    // Return a new instance of Path instead of just wrapping
    const newPathInstance = new Path(value.path)
    Object.assign(newPathInstance, value)
    return newPathInstance
  }
  return false
}

export default Path
