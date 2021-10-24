import Container from './container'
import { EXAMPLE_PATH } from '../lib/constants'
import Social from '../components/social'

type Props = {
  lang: string
}
  

const Footer = ({lang}: Props) => {
  return (
    <footer className="bg-accent-1 border-t border-accent-2">
      <Container>
        <div className="
          py-5  text-sm gray-600 flex flex-col items-start
          lg:flex-row lg:py-20
        ">
          <div className='px-4 pt-2 lg:px-20'>
          {(lang == 'ru')
              ?
              <div>
                <p>
                  Можете написать в любой момент на <span className='orange'>slava@spetsyian.com</span>.
                </p>
                <p>
                Если есть история, которой вы хотите поделиться, высылайте на этот email. 
                </p>
              </div>
              :
              <div>
                <p>
                  Feel free to contact me via <span className='orange'>slava@spetsyian.com</span>.
                </p>
                <p>
                  If you have a story to share on this blog, you're welcome to submit one by the email. 
                </p>
              </div>   
          }
          </div>

          <div className='px-4 pt-2 lg:px-20'>
            <Social
              facebook_username='slava.spetsyian'
              telegram_username='slava_spetsyian'
              github_username='saequus'
              twitter_username='slava_spetsyian'
            />
          </div>
         

          <div className="
            flex pt-2 flex-col px-4 justify-center items-center
            lg:flex-row lg:pl-4 lg:w-1/2 lg:px-20
            ">
            {(lang == 'ru')
              ?
              <p>Записки о веб разработке, жизненные истории, <a href='/poems/'>стихи</a> и обзоры.</p>
              :
              <p>Web development notes, life stories and reviews.</p>
            }
          </div>
        </div>
      </Container>
    </footer>
  )
}

export default Footer
