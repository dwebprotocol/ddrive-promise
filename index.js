const ddrive = require('ddrive')

const callbackMethods = require('./callback-methods')

const kDDrive = Symbol('ddrive')

const getDDrive = drive => drive[kDDrive]

class DDrivePromise {
  constructor (...args) {
    let drive
    if (args.length === 1 && args[0].readFile) {
      drive = args[0]
    } else {
      drive = ddrive(...args)
    }

    this._cache = {}
    this._createDiffStream.bind(this)
    this._checkout.bind(this)

    return new Proxy(drive, this)
  }

  get (target, propKey) {
    if (propKey === kDDrive) return target

    if (propKey === 'createDiffStream') return this._createDiffStream
    if (propKey === 'checkout') return this._checkout
    const value = Reflect.get(target, propKey)
    if (typeof value === 'function') return this._getMethod(target, propKey, value)
    return value
  }

  _getMethod (target, propKey, func) {
    let method = this._cache[propKey]

    if (method) return method

    if (callbackMethods.includes(propKey)) {
      method = (...args) => {
        // We keep suporting the callback style if we get a callback.
        if (typeof args[args.length - 1] === 'function') {
          return Reflect.apply(func, target, args)
        }

        return new Promise((resolve, reject) => {
          args.push((err, ...result) => {
            if (err) return reject(err)
            if (result.length > 1) {
              resolve(result)
            } else {
              resolve(result[0])
            }
          })

          Reflect.apply(func, target, args)
        })
      }
    } else {
      method = (...args) => Reflect.apply(func, target, args)
    }

    this._cache[propKey] = method

    return method
  }

  _createDiffStream (other, prefix, opts) {
    if (other instanceof DDrivePromise) {
      other = getDDrive(other)
    }

    return getDDrive(this).createDiffStream(other, prefix, opts)
  }

  _checkout (version, opts) {
    const h = getDDrive(this).checkout(version, opts)
    return new DDrivePromise(h)
  }
}

module.exports = (...args) => new DDrivePromise(...args)
module.exports.getDDrive = getDDrive
