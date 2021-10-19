import Link from 'next/link'
import { Button } from '../components/buttons/button'

type Props = {
  title: string
  slug: string
}

const MainBlock = ({
  slug,
  title,
}: Props) => {
  return (
    <section>
      <div className="md:grid md:grid-cols-2 md:gap-x-16 lg:gap-x-8 mb-20 md:mb-28">
        <div>
          <h3 className="mb-4 text-4xl lg:text-6xl leading-tight">
            <Link as={`/posts/${slug}`} href="/posts/[slug]">
              <a className="hover:underline">{title}</a>
            </Link>
          </h3>
        </div>

      </div>

      <div className='m-auto'>

        <div className='flex flex-col text-center tracking-wider'>
          <h1 className='text-3xl uppercase font-semibold m-2 orange shadow-t-bl'>Slava Spetsyian</h1>
          <p className='text-center text-xl uppercase font-extralight gray-600 m-1'>Full Stack Engineer. Growth Hacker. Author</p>
          
            <div className='flex text-xl font-extralight m-3 justify-center'>
              <div>
                <p className='orange'>slava@spetsyian.com</p>
              </div>
              <span className='gray-600'> &nbsp; | &nbsp; </span>
              <div>
                <a className='orange' href='https://t.me/slava_spetsyian'>@slava_spetsyian</a>
              </div>
            </div>
        </div>

        <div className='flex justify-center'>

          <div className='p-8 m-7 flex-auto w-2/12 rounded-sm chocolate-bg orange uppercase shadow-2xl'>
            <h1 className='text-3xl p-1 font-semibold'>About me</h1>
            <p className='mb-2 font-extralight'>Dedicated to work for people</p>
            <Button href='/en/about/' text='More'></Button>
          </div>

          <div className='p-8 m-7 flex-auto w-2/12 rounded-sm chocolate-bg orange shadow-2xl'>
            <h1 className='text-3xl p-1 font-semibold'>CV</h1>
            <p className='mb-2 uppercase font-extralight'>See the CV / Resume</p>
            <Button href='/assets/Slava_Spetsyian_CV.pdf' text='See'></Button>
          </div>

        </div>

        <div className='flex justify-center'>

          <div className='p-8 m-7 flex-auto w-2/12 rounded-sm chocolate-bg orange uppercase shadow-2xl'>
            <h1 className='text-3xl p-1 font-semibold'>Blog</h1>
            <p className='mb-2 font-extralight'>Blog in English and Russian</p>
            <Button href='/en/blog/' text='Visit'></Button>
          </div>

          <div className='p-8 m-7 flex-auto w-2/12 rounded-sm chocolate-bg orange uppercase shadow-2xl'>
            <h1 className='text-3xl p-1 font-semibold'>Shared</h1>
            <p className='mb-2 font-extralight'>Staff you may find funny or usefull</p>
            <Button href='https://drive.google.com/drive/u/0/folders/1AzDEjiloqka5BDha16IxJaBQVBU2CYej' text='Check'></Button>
          </div>

        </div>
      </div>

    </section>
  )
}

export default MainBlock
