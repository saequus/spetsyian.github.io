import { useRouter } from 'next/router'
import Header from '../../components/header'
import Layout from '../../components/layout'
import Container from '../../components/container'
import { getEnPostBySlug } from '../../lib/api'
import markdownToHtml from '../../lib/markdownToHtml'
import MarkdownBody from '../../components/markdown-body'

type Props = {
  content: string
  lang: string
  preface: string
  welcomeMsg: string
}

const About = ({ content, lang, preface, welcomeMsg }: Props) => {
  const router = useRouter()
  return (
    <Layout>
      <Container>
        <Header />

        <div className='w-2/3 m-auto'>
          <h1 className='mb-4 mt-5 text-3xl text-center font-bold m-2 orange shadow-t-bl uppercase'>
            {welcomeMsg}
          </h1>
    
          <div className='pt-2 pb-2 mb-6 text-xl flex font-extralight justify-between gray-600'>
            <a className='hover:underline' href='https://github.com/saequus'>GitHub</a>
            <div className='no-show-mobile'>|</div>
            <a className='hover:underline' href='https://www.linkedin.com/in/spetsyian/'>LinkedIn</a>
            <div className='no-show-mobile'>|</div>
            <a className='hover:underline' href='https://leetcode.com/saequus/'>LeetCode</a>
            <div className='no-show-mobile'>|</div>
            <a className='hover:underline' href='https://www.hackerrank.com/saequus'>HackerRank</a>
            <div className='no-show-mobile'>|</div>
            <a className='hover:underline' href='https://medium.com/saequus'>Medium Blog</a>
          </div>
          
          <div className='flex justify-between'>
            <img className='w-3/5 flex-1' src='/assets/img/av.webp' alt='Profile photo' />

            <div className='ml-3 flex-1 gray-600'>
              <MarkdownBody content={preface} classParam="font-extralight max-w-2xl mx-auto" />
            </div>
          </div>
          

          <MarkdownBody content={content} classParam="gray-600 font-extralight"/>
          

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



export async function getStaticProps() {
  const aboutData = getEnPostBySlug('about', [
    'lang',
    'content',
    'preface',
    'welcomeMsg'
  ])
  const content = await markdownToHtml(aboutData.content || '')

  return {
    props: {
      lang: aboutData.lang,
      preface: aboutData.preface,
      welcomeMsg: aboutData.welcomeMsg,
      content,
    },
  }
}

