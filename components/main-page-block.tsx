import { Button } from './buttons/button'

type Props = {
  title: string
}

const MainPageBlock = () => {
  return (
    <section>
      <div className='m-auto'>

        <div className='flex flex-col text-center tracking-wider'>
          <h1 className='text-3xl uppercase font-bold m-2 orange shadow-t-bl'>Slava Spetsyian</h1>
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
            <h1 className='text-3xl p-1 font-bold'>About me</h1>
            <p className='mb-2 font-extralight'>Dedicated to work for people</p>
            <Button href='/about/' text='More'></Button>
          </div>

          <div className='p-8 m-7 flex-auto w-2/12 rounded-sm chocolate-bg orange shadow-2xl'>
            <h1 className='text-3xl p-1 font-bold'>CV</h1>
            <p className='mb-2 uppercase font-extralight'>See the CV / Resume</p>
            <Button href='/assets/Slava_Spetsyian_CV.pdf' text='See'></Button>
          </div>

        </div>

        <div className='flex justify-center'>

          <div className='p-8 m-7 flex-auto w-2/12 rounded-sm chocolate-bg orange uppercase shadow-2xl'>
            <h1 className='text-3xl p-1 font-bold'>Blog</h1>
            <p className='mb-2 font-extralight'>Blog in English and Russian</p>
            <Button href='/en/blog/' text='Visit'></Button>
          </div>

          <div className='p-8 m-7 flex-auto w-2/12 rounded-sm chocolate-bg orange uppercase shadow-2xl'>
            <h1 className='text-3xl p-1 font-bold'>Shared</h1>
            <p className='mb-2 font-extralight'>Staff you may find funny or usefull</p>
            <Button href='https://drive.google.com/drive/u/0/folders/1AzDEjiloqka5BDha16IxJaBQVBU2CYej' text='Check'></Button>
          </div>

        </div>
      </div>

    </section>
  )
}

export default MainPageBlock
