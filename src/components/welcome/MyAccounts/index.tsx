import { useMemo } from 'react'
import { Box, Button, Link, SvgIcon, Typography } from '@mui/material'
import madProps from '@/utils/mad-props'
import CreateButton from './CreateButton'
import Track from '@/components/common/Track'
import { OVERVIEW_EVENTS, OVERVIEW_LABELS } from '@/services/analytics'
import { DataWidget } from '@/components/welcome/MyAccounts/DataWidget'
import css from './styles.module.css'
import PaginatedSafeList from './PaginatedSafeList'
import { VisibilityOutlined } from '@mui/icons-material'
import AddIcon from '@/public/images/common/add.svg'
import { AppRoutes } from '@/config/routes'
import ConnectWalletWidget from '@/components/common/ConnectWallet/ConnectWalletWidget'
import useWallet from '@/hooks/wallets/useWallet'
import { useRouter } from 'next/router'
import useTrackSafesCount from './useTrackedSafesCount'
import { type AllSafesGrouped, useAllSafesGrouped, type MultiChainSafeItem } from './useAllSafesGrouped'
import { type SafeItem } from './useAllSafes'

const NO_SAFES_MESSAGE = "You don't have any Safe Accounts yet"
const NO_WATCHED_MESSAGE = 'Watch any Safe Account to keep an eye on its activity'

type AccountsListProps = {
  safes: AllSafesGrouped
  onLinkClick?: () => void
}
const AccountsList = ({ safes, onLinkClick }: AccountsListProps) => {
  const wallet = useWallet()
  const router = useRouter()

  // We consider a multiChain account owned if at least one of the multiChain accounts is not on the watchlist
  const ownedMultiChainSafes = useMemo(
    () => safes.allMultiChainSafes?.filter((account) => account.safes.some(({ isWatchlist }) => !isWatchlist)),
    [safes],
  )

  // If all safes of a multichain account are on the watchlist we put the entire account on the watchlist
  const watchlistMultiChainSafes = useMemo(
    () => safes.allMultiChainSafes?.filter((account) => !account.safes.some(({ isWatchlist }) => !isWatchlist)),
    [safes],
  )

  const ownedSafes = useMemo<(MultiChainSafeItem | SafeItem)[]>(
    () => [...(ownedMultiChainSafes ?? []), ...(safes.allSingleSafes?.filter(({ isWatchlist }) => !isWatchlist) ?? [])],
    [safes, ownedMultiChainSafes],
  )
  const watchlistSafes = useMemo<(MultiChainSafeItem | SafeItem)[]>(
    () => [
      ...(watchlistMultiChainSafes ?? []),
      ...(safes.allSingleSafes?.filter(({ isWatchlist }) => isWatchlist) ?? []),
    ],
    [safes, watchlistMultiChainSafes],
  )

  useTrackSafesCount(ownedSafes, watchlistSafes, wallet)

  const isLoginPage = router.pathname === AppRoutes.welcome.accounts
  const trackingLabel = isLoginPage ? OVERVIEW_LABELS.login_page : OVERVIEW_LABELS.sidebar

  return (
    <Box data-testid="sidebar-safe-container" className={css.container}>
      <Box className={css.myAccounts}>
        <div className="flex items-center justify-center mb-10 text-center flex-col">
          <span className="text-[#E8A616] inline-block mb-8 font-londrina text-[35px] sm:text-[55px] md:text-[100px] leading-tight sm:leading-relaxed md:leading-[94.64px]">
            Demo
          </span>
          <iframe
            src="https://drive.google.com/file/d/1NjQSg84FTifilEQqZ7tXtTyFlx-Im8bo/preview"
            width="640"
            height="480"
            allow="autoplay"
            className="max-w-full aspect-[4/3]"
          ></iframe>
        </div>
        <Box className={css.header}>
          <Typography variant="h1" fontWeight={700} className={css.title}>
            Safe accounts
          </Typography>
          <Track {...OVERVIEW_EVENTS.CREATE_NEW_SAFE} label={trackingLabel}>
            <CreateButton isPrimary={!!wallet} />
          </Track>
        </Box>
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

        <PaginatedSafeList
          title="My accounts"
          safes={ownedSafes}
          onLinkClick={onLinkClick}
          noSafesMessage={
            wallet ? (
              NO_SAFES_MESSAGE
            ) : (
              <>
                <Box mb={2}>Connect a wallet to view your Safe Accounts or to create a new one</Box>
                <Track {...OVERVIEW_EVENTS.OPEN_ONBOARD} label={trackingLabel}>
                  <ConnectWalletWidget text="Connect a wallet" contained />
                </Track>
              </>
            )
          }
        />

        <PaginatedSafeList
          title={
            <>
              <VisibilityOutlined sx={{ verticalAlign: 'middle', marginRight: '10px' }} fontSize="small" />
              Watchlist
            </>
          }
          safes={watchlistSafes || []}
          action={
            <Track {...OVERVIEW_EVENTS.ADD_TO_WATCHLIST} label={trackingLabel}>
              <Link href={AppRoutes.newSafe.load}>
                <Button
                  disableElevation
                  size="small"
                  onClick={onLinkClick}
                  startIcon={<SvgIcon component={AddIcon} inheritViewBox fontSize="small" />}
                >
                  Add
                </Button>
              </Link>
            </Track>
          }
          noSafesMessage={NO_WATCHED_MESSAGE}
          onLinkClick={onLinkClick}
        />

        <DataWidget />
      </Box>
    </Box>
  )
}

const MyAccounts = madProps(AccountsList, {
  safes: useAllSafesGrouped,
})

export default MyAccounts
