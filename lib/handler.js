import bugger from 'debug'
import fs from 'fs'
import final from 'finalhandler'

const debug = bugger('handler')

export default function(duplex, _router) {


  let done = final(duplex.req, duplex.res)
  let path = duplex.path

  if (duplex.asset) return duplex.static()

  let router = _router._router
  let method = duplex.method.toLowerCase()
  let match = router.match(path)

  if (!match) return done(false)

  let handlers = match.node[method]
  duplex.params = match.param

  handlers.forEach(handler => handler(duplex))



  // const routers = duplex.routers
  // const len = routers.length
  // const done = final(duplex.req, duplex.res)
  // const stack = duplex.middleware
  // const path = duplex.path
  // const method = duplex.method
  // const params = duplex.routeParamters
  //
  // debug('Routers length: %o', routers.length)
  //
  // let matched = false
  // let id = 0
  //
  // let router = {}
  // let regex = ''
  //
  // if (duplex.asset) {
  //   return duplex.static(path)
  // }
  //
  // debug('Requested view: %o', path)
  //
  // while (!matched && id !== len) {
  //   router = routers[id++]
  //   regex = router.match
  //   matched = !!regex.test(path) && router.method === method
  //   if (matched && router.params.length) {
  //     duplex.params = paramify(duplex, router)
  //   }
  // }
  //
  //
  //
  // return matched
  //     ? router.handler(duplex)
  //     : done(false)
  //
  //

}