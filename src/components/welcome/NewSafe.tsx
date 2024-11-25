import React from 'react'

import WelcomeLogin from './WelcomeLogin'
import WelcomeIntro from '@/components/welcome/WelcomeIntro'

const NewSafe = () => {
  return (
    <>
      <div className="mt-14 text-center md:mb-4 w-full">
        <h1 className="text-[#1F1D29] font-londrina text-[35px] sm:text-[55px] md:text-[100px] leading-tight sm:leading-relaxed md:leading-[94.64px]">
          Get Started With <span className="text-[#E8A616] inline-block">Ka-Ching</span>
        </h1>
        <h2 className="text-[#343235] font-londrina text-[18px] sm:text-[22px] md:text-[26px] leading-tight sm:leading-relaxed md:leading-[18.93px] py-6">
          Connect your wallet to create a new Safe Account or open an existing one
        </h2>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 p-3 pb-0 min-[460px]:max-w-[90%] md:max-w-2xl lg:max-w-5xl min-[460px]:mx-auto">
        <div className="col-span-1 lg:col-span-5 pl-0 min-h-[30vh] md:min-h-[40vh]">
          <WelcomeIntro />
        </div>
        <div className="col-span-1 lg:col-span-7 pl-0 lg:pl-8 min-h-[35vh] md:min-h-[45vh]">
          <WelcomeLogin />
        </div>
      </div>
    </>
  )
}

export default NewSafe
