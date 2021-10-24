import Link from 'next/link'

const Header = () => {
  return (
    <div className='
    m-auto
    lg:w-2/3'>
      <h2 className="text-2xl md:text-2xl font-semibold mb-2 mt-2 gray-600">
        <Link href="/">
          <a className="hover:underline">Main</a>
        </Link>
        .
      </h2>
    </div>
  )
}

export default Header
