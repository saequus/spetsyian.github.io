import Container from './container'
import { EXAMPLE_PATH } from '../lib/constants'
import Social from '../components/social'

const Footer = () => {
  return (
    <footer className="bg-accent-1 border-t border-accent-2">
      <Container>
        <div className="
          py-20 text-sm gray-600 flex flex-col items-start
          lg:flex-row
        ">
          <div className='px-20 sm:px-4'>
            <p>
              Feel free to contact me via <span className='orange'>slava@spetsyian.com</span>.
            </p>
            <p>  
              If you have a story to share on this blog, you're welcome to submit one by the email. 
            </p>
          </div>

          <div className='px-20 sm:px-4'>
            <Social
              facebook_username='slava.spetsyian'
              telegram_username='slava_spetsyian'
              twitter_username='slava_spetsyian'
            />
          </div>
         

          <div className="
            flex flex-col px-20 justify-center items-center
            lg:flex-row lg:pl-4 lg:w-1/2
            sm:px-4
            ">
            <p>Web development notes, life stories and reviews.</p>
          </div>
        </div>
      </Container>
    </footer>
  )
}

export default Footer
