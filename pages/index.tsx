import Container from '../components/container'
import Layout from '../components/layout'
import Head from 'next/head'
import MainPageBlock from '../components/main-page-block'

const Index = () => {
  return (
    <>
      <Layout>
        <Head>
          <title>Spetsyian | Full Stack Engineer</title>
        </Head>
        <Container>
          <MainPageBlock></MainPageBlock>
        </Container>
      </Layout>
    </>
  )
}

export default Index