import type { NextPage } from 'next'
import GameHome from '@/components/game/GameHome'
import Head from 'next/head'

const Game: NextPage = () => {
  return (
    <>
      <Head>
        <title>{'Coiny – GameHome'}</title>
      </Head>
      {/* <main> */}
      <GameHome />
      {/* </main> */}

    </>
  )
}

export default Game