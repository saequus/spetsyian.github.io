import { useRouter } from 'next/router'
import Header from '../../components/header'
import Layout from '../../components/layout'
import Container from '../../components/container'

type Props = {
  content: string
  lang: string
  preface: string
  welcomeMsg: string
}

const About = ({ content, lang, preface, welcomeMsg }: Props) => {
  const router = useRouter()
  return (
    <Layout lang={lang}>
      <Container>
        <Header />

        <div className='
          m-auto
          lg:w-2/3
          '>
          <h1 className='
            mb-4 mt-5 text-3xl text-center font-bold orange shadow-t-bl uppercase
            lg:text-3xl
          '>
            {welcomeMsg}
          </h1>
    
          <div className='
            pt-2 pb-2 mb-6 flex gray-600 flex-wrap flex-wrap text-2xl
            lg:justify-between lg:flex-nowrap lg:text-xl
            sm:flex-wrap sm:flex-wrap sm:text-xl
          '>
            <a className='p-2 hover:underline' href='https://github.com/saequus'>GitHub</a>
            <div className='lg:block hidden'>|</div>
            <a className='p-2 hover:underline' href='https://www.linkedin.com/in/spetsyian/'>LinkedIn</a>
            <div className='lg:block hidden'>|</div>
            <a className='p-2 over:underline' href='https://leetcode.com/saequus/'>LeetCode</a>
            <div className='lg:block hidden'>|</div>
            <a className='p-2 hover:underline' href='https://www.hackerrank.com/saequus'>HackerRank</a>
          </div>
          
          <div className='
            block
            md:flex md:justify-between'
          >
            <img className='md:w-3/5 w-full flex-1' src='/assets/img/av.webp' alt='Profile photo' />

            <div className='
              flex-1 gray-600 text-xl mt-3
              lg:ml-4 md:ml-3 lg:mt-0'
            >
              <div className="max-w-2xl mx-auto">
                The best time to start is yesterday.
                <br/>
                Today is the best tomorrow.
                <br/>
                Knowledge and connections are the most profitable investment.
                <br/>
                People are the most valuable asset.
                <br/>
                Money is the most liquid resource.
                <br/>
                Joining forces is the most effective way.
              </div>
            </div>
          </div>
          

          <div className="gray-600 text-2xl mb-5 lg:font-extralight lg:text-xl">
            <h1 className='font-bold my-3'>Applied Programming</h1>
            <p>Python, JavaScript</p>
            
            <h1 className='font-bold my-3'>Cloud Platforms</h1>
            <p> AWS, Google Cloud, Microsoft Azure</p>
            
            <h1 className='font-bold my-3'>Database</h1>
            <p>PostgreSQL, MongoDB, Redis</p>

            <h1 className='font-bold my-3'>Tools/Frameworks</h1>
            <p>FastAPI, Kafka, React.js, Node.js, Express.js, Flask, Django, Vue.js, CSS/SASS/LESS, Matplotlib, Pandas & Numpy</p>

            <h1 className='font-bold my-3'>DevOps</h1>
            <p>Kubernetes, Docker, Nginx, WSGI/ASGI, Gunicorn, PM2, various clis</p>
            
            <h1 className='font-bold my-3'>About me</h1>
            <p>Full Stack Engineer. I like financial topics, playing the guitar, speaking foreign languages, doing sports and reading books</p>
          </div>
          

        </div>
      

        <div className='about__return-to-main-page'>
          <a href='/'>
            {/* {%- if page.lang-about == 'en' -%}
              Return to main page
            {%- else if page.lang-about == 'ru' -%}
              Вернуться на главную
            {%- endif -%} */}
          </a>
        </div>

      </Container>
    </Layout>
  )
}


export default About



// export async function getStaticProps() {
//   const aboutData = getNewPostBySlug('about', [
//     'lang',
//     'content',
//     'preface',
//     'welcomeMsg'
//   ])
//   const content = await markdownToHtml(aboutData.content || '')

//   return {
//     props: {
//       lang: aboutData.lang,
//       preface: aboutData.preface,
//       welcomeMsg: aboutData.welcomeMsg,
//       content,
//     },
//   }
// }

