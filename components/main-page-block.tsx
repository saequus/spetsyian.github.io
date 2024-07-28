import { Button } from './buttons/button'

type Props = {
  title: string
}

const MainPageBlock = () => {
  return (
    <section>
      <div className='m-auto'>

        <div className='
        flex flex-col text-center tracking-wider
        lg:mx-5'>
          <h1 className='text-3xl uppercase font-bold m-2 orange shadow-t-bl'>Slava Spetsyian</h1>
          <p className='text-center text-xl uppercase gray-600 m-1
            lg:font-extralight
            '>
            Full Stack Engineer. Growth Hacker. Author
          </p>
          
          <div className='text-xl  m-3
            md:flex md:justify-center
            lg:font-extralight
            '>
              <div className='m-1 orange '>
                <p>slava@spetsyian.com</p>
              </div>
              <span className='m-1 gray-600 hidden md:block'> &nbsp; | &nbsp; </span>
              <div className='m-1 orange'>
                <a href='https://t.me/saequus'>@saequus</a>
              </div>
            </div>
        </div>

        <div className='
          md:flex md:justify-center
        '>

          <div className='
            p-8 mx-2 my-4 flex-auto rounded-sm chocolate-bg orange uppercase shadow-2xl
            lg:w-2/12 lg:m-7
          '>
            <h1 className='text-3xl p-1 font-bold'>About me</h1>
            <p className='mb-3 text-xl lg:font-extralight'>Dedicated to work for people
            </p>
            <Button href='/about/' text='More'></Button>
          </div>

          <div className='p-8 mx-2 my-4 flex-auto rounded-sm chocolate-bg orange uppercase shadow-2xl
            lg:w-2/12 lg:m-7
          '>
            <h1 className='text-3xl p-1 font-bold'>Projects</h1>
            <p className='mb-3 text-xllg:font-extralight'>Check out the projects I have worked on</p>
            <Button href='/projects' text='Projects'></Button>
          </div>

        </div>

        <div className='md:flex md:justify-center'>

          <div className='p-8 mx-2 my-4 flex-auto rounded-sm chocolate-bg orange uppercase shadow-2xl
            lg:w-2/12 lg:m-7
          '>
            <h1 className='text-3xl p-1 font-bold'>Blog</h1>
            <h3 className='mb-3 text-xl lg:font-extralight'>Smart productive [overviews]</h3>
            <Button href='https://t.me/smart_productive' text='Visit'></Button>
          </div>

          <div className='p-8 mx-2 my-4 flex-auto rounded-sm chocolate-bg orange uppercase shadow-2xl
            lg:w-2/12 lg:m-7
          '>
            <h1 className='text-3xl p-1 font-bold'>Shared</h1>
            <h3 className='mb-3 text-xl lg:font-extralight'>Staff you may find funny or usefull</h3>
            <Button href='https://drive.google.com/drive/u/0/folders/1AzDEjiloqka5BDha16IxJaBQVBU2CYej' text='Check'></Button>
          </div>

        </div>
      </div>

    </section>
  )
}

export default MainPageBlock
