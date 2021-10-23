import { serialize, CookieSerializeOptions } from 'cookie'
import { NextApiResponse } from 'next'

/**
 * This sets `cookie` using the `res` object
 */

export const setCookie = (
  res: NextApiResponse,
  name: string,
  value: unknown,
  options: CookieSerializeOptions = {}
) => {
  const stringValue =
    typeof value === 'object' ? 'j:' + JSON.stringify(value) : String(value)

  if (Object.prototype.hasOwnProperty.call(options, 'maxAge')) {
    let maxAge = options.maxAge || 0
    options.expires = new Date(Date.now() + maxAge)
    maxAge /= 1000
    options.maxAge = maxAge
  }

  res.setHeader('Set-Cookie', serialize(name, stringValue, options))
}

