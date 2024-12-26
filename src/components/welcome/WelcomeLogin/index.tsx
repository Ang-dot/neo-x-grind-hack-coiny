import { AppRoutes } from '@/config/routes'
import { useRouter } from 'next/router'
import { CREATE_SAFE_EVENTS } from '@/services/analytics/events/createLoadSafe'
import { trackEvent } from '@/services/analytics'
import useWallet from '@/hooks/wallets/useWallet'
import { useHasSafes } from '../MyAccounts/useAllSafes'
import { useCallback, useEffect, useState } from 'react'
import WalletLogin from './WalletLogin'
import GameBoy from '@/components/common/GameBoy'
import Link from 'next/link'

const WelcomeLogin = () => {
  const router = useRouter()
  const wallet = useWallet()
  const { isLoaded, hasSafes } = useHasSafes()
  const [shouldRedirect, setShouldRedirect] = useState(false)

  const redirect = useCallback(() => {
    if (wallet) {
      if (isLoaded && !hasSafes) {
        trackEvent(CREATE_SAFE_EVENTS.OPEN_SAFE_CREATION)
        router.push({ pathname: AppRoutes.newSafe.create, query: router.query })
      } else {
        router.push({ pathname: AppRoutes.welcome.accounts, query: router.query })
      }
    }
  }, [hasSafes, isLoaded, router, wallet])

  const onLogin = useCallback(() => {
    setShouldRedirect(true)
  }, [])

  useEffect(() => {
    if (!shouldRedirect) return
    redirect()
  }, [redirect, shouldRedirect])

  return (
    <GameBoy isScrollable={false}>
      {wallet && (
        <div>
          <h2 className="text-white font-londrina font-bold text-2xl sm:text-3xl md:text-4xl">=== Get started ===</h2>
          <p className="text-white font-londrina-light text-center text-[12px] sm:text-[16px] md:text-[20px]">
            Open your existing Safe Accounts
            <br /> or create a new one
          </p>
        </div>
      )}
      <div className="space-y-3 lg:space-y-12 text-center w-full justify-center">
        <div className={wallet ? 'm-4 lg:m-7' : ''}>
          <WalletLogin onLogin={onLogin} onContinue={redirect} />
        </div>
        <button className="group relative w-full bg-gray-600">
          <Link href={AppRoutes.chat.index}>
            <div className="w-full p-2 group-hover:bg-black transition duration-300 ease-in-out">
              <h2 className="text-white font-londrina font-[1000] text-2xl sm:text-3xl md:text-[35px] leading-tight sm:leading-relaxed md:leading-[56.78px] transition duration-300 ease-in-out">
                <span className="group-hover:hidden">Getting Started with AI Agent</span>
                <span className="hidden group-hover:inline underline text-[#909B0E]">
                  Getting Started with AI Agent
                </span>
              </h2>
            </div>
          </Link>
        </button>
        {!wallet && (
          <button className="group relative w-full">
            <Link href={AppRoutes.newSafe.load}>
              <div className="w-full p-2 group-hover:bg-black transition duration-300 ease-in-out">
                <h2 className="text-white font-londrina font-[1000] text-2xl sm:text-3xl md:text-[35px] leading-tight sm:leading-relaxed md:leading-[56.78px] transition duration-300 ease-in-out">
                  <span className="group-hover:hidden">Watch Any Account</span>
                  <span className="hidden group-hover:inline underline text-[#909B0E]">&gt; Watch Any Account</span>
                </h2>
              </div>
            </Link>
          </button>
        )}
      </div>
    </GameBoy>
  )
}

export default WelcomeLogin
