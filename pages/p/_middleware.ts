import { NextRequest, NextFetchEvent, NextResponse } from 'next/server'

const LANG_COOKIE_NAME = 'lang'

export function middleware(req: NextRequest, ev: NextFetchEvent) {
  if (req.cookies[LANG_COOKIE_NAME]) {
    return NextResponse.next()
  }

  if (!req.cookies[LANG_COOKIE_NAME]) {
    let res = NextResponse.redirect(`/en/${req.nextUrl.href}`)
    res.cookie('lang', 'en')
    return res;
  }
}