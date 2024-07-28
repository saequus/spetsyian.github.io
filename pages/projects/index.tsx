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

const Projects = ({ content, lang, preface, welcomeMsg }: Props) => {
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
            Projects  
          </h1>          

          <div className="gray-600 text-2xl my-5 pt-8 lg:font-extralight lg:text-xl grid grid-cols-1 md:grid-cols-2 grid-flow-row gap-4">
            
            {/* Neuro Postęp */}
             <div className="relative max-w-sm rounded overflow-hidden shadow-lg">
                <a href='https://neuropostep.pl/'>
                    <img className="w-full h-48 object-cover" src="/assets/img/projects/neuro-postep-project-img.png" alt="Neuro Postęp website screenshot"></img>

                    <div className="absolute inset-0 bg-black opacity-70"></div>

                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                            <h2 className="text-white text-3xl font-bold">Neuro Postęp</h2>
                            <p className="text-white m-2">Medical office for the treatment of autoimmune and neurodegenerative diseases</p>
                        </div>
                    </div>
                </a>
            </div>

            {/* Zageno.com */}
            <div className="relative max-w-sm rounded overflow-hidden shadow-lg">
                <a href='https://zageno.com/'>
                    <img className="w-full h-48 object-cover" src="/assets/img/projects/zageno-project-img.png" alt="Zageno website screenshot"></img>

                    <div className="absolute inset-0 bg-black opacity-70"></div>

                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                            <h2 className="text-white text-3xl font-bold">Zageno</h2>
                            <p className="text-white m-2">Medical equipment markeplace for labs</p>
                        </div>
                    </div>
                </a>
            </div>

            {/* Lift Vertical */}
            <div className="relative max-w-sm rounded overflow-hidden shadow-lg">
                <a href='https://liftvertical.com/'>
                    <img className="w-full h-48 object-cover" src="/assets/img/projects/lift-vertical-project-img.png" alt="Lift Vertical website screenshot"></img>

                    <div className="absolute inset-0 bg-black opacity-70 "></div>

                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                            <h2 className="text-white text-3xl font-bold">Lift Vertical</h2>
                            <p className="text-white m-2">AI Technologies for Social Welfare</p>
                        </div>
                    </div>
                </a>
            </div>

            {/* Zenhotels.com */}
            <div className="relative max-w-sm rounded overflow-hidden shadow-lg">
                <a href='https://www.zenhotels.com'>
                    <img className="w-full h-48 object-cover" src="/assets/img/projects/zenhotels-project-img.png" alt="Zenhotels.com website screenshot"></img>

                    <div className="absolute inset-0 bg-black opacity-70"></div>

                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                            <h2 className="text-white text-3xl font-bold">Zenhotels.com</h2>
                            <p className="text-white m-2">Booking hotels around the Globe</p>
                        </div>
                    </div>
                </a>
            </div>

          </div>
        
          <div className='mt-10 flex'>
            <span className='mx-auto'>and many others </span> 
          </div>
          
          

        </div>
      



      </Container>
    </Layout>
  )
}


export default Projects




