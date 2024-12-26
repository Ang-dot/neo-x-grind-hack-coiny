'use client'

import React, { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import { Copy, X, Share2 } from 'lucide-react'
import Image from 'next/image'
import * as htmlToImage from 'html-to-image'
import { useGame } from '@/components/common/GameProvider'
import GameNavbar from '../GameNavbar'
import GameRules from '../GameRules'
import useWallet from '@/hooks/wallets/useWallet'
import GameHistory from '../GameHistory'
// import { useDynamicContext } from '@dynamic-labs/sdk-react-core';

const GameBoard = () => {
  const contentRef = useRef(null)
  const [status, setStatus] = useState('')
  //Twitter
  const [tweet, setTweet] = useState('')
  const [isTwitterBtnClick, setIsTwitterBtnClick] = useState(false)
  // const {
  //     primaryWallet,
  // } = useDynamicContext();
  const wallet = useWallet()
  const { state, makeMove, setChoice, setUsername, fetchGameDetails } = useGame()
  const [isOpen, setIsOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isGameFinished, setGameFinish] = useState(false)
  const [annoucement, setAnnoucement] = useState('')
  const [gameDetails, setGameDetails] = useState({})
  const [gameID, setGameID] = useState('')
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState({ title: '', description: '' })

  const showNotification = (title, description) => {
    setToastMessage({ title, description })
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const getGameState = (state) => {
    const gameState = typeof state === 'bigint' ? Number(state) : Number(state)
    switch (gameState) {
      case 0:
        return 'Not Started'
      case 1:
        return 'Waiting for Player 2'
      case 2:
        return 'Both players moved'
      case 3:
        return 'Game Finished'
      default:
        return 'Unknown'
    }
  }

  const shareToTwitter = async () => {
    try {
      setStatus('Capturing HTML content...')
      // Capture the game history content
      const dataUrl = await htmlToImage.toPng(contentRef.current, {
        quality: 1.0,
        backgroundColor: '#000000', // Black background
        style: {
          padding: '20px',
        },
      })

      setStatus('Uploading image...')
    } catch (error) {
      console.error('Error sharing to Twitter:', error)
      setStatus('Error posting tweet')
    }
  }

  const [processedEvents] = useState(new Set())

  useEffect(() => {
    const setupEventListeners = async () => {
      try {
        if (!state.contract) {
          console.warn('Contract instance not available')
          return
        }

        const moveMadeHandler = (gameId, player, event) => {
          console.log('Hello World')
          const eventKey = `move-${gameId.toString()}-${player}`
          if (processedEvents.has(eventKey)) return
          processedEvents.add(eventKey)

          console.log('MoveMade event detected!', {
            gameId: gameId.toString(),
            player,
            eventData: event,
          })
          if (player != wallet?.address) {
            showNotification('Move Made', `Player ${player.slice(0, 6)}...${player.slice(-4)} made their move`)
          }
        }

        const winnerHandler = (gameId, winner, event) => {
          const eventKey = `winner-${gameId.toString()}-${winner}`
          if (processedEvents.has(eventKey)) return
          processedEvents.add(eventKey)

          console.log('Winner event detected!', {
            gameId: gameId.toString(),
            winner,
            eventData: event,
          })

          // Check for a draw (address(0))
          const isDrawAddress = winner === '0x0000000000000000000000000000000000000000'
          const isWinner = winner === wallet?.address
          console.log('Winner address:::::::::', winner)
          console.log('Addressss:::::::', wallet?.address)

          isDrawAddress
            ? setAnnoucement("It's A Tie")
            : isWinner
            ? setAnnoucement('Congratulations!')
            : setAnnoucement('Oh No!')
          setGameFinish(true)
        }

        // Add event listeners using the contract's events
        state.contract.on('MoveMade', moveMadeHandler)
        state.contract.on('Winner', winnerHandler)
        // state.contract.on("GameCreated", gameCreatedHandler);

        console.log('Event listeners setup completed')

        // Return cleanup function
        return () => {
          if (state.contract) {
            state.contract.off('MoveMade', moveMadeHandler)
            state.contract.off('Winner', winnerHandler)
            // state.contract.off("GameCreated", gameCreatedHandler);
            processedEvents.clear()
            console.log('Event listeners cleaned up')
          }
        }
      } catch (error) {
        console.error('Error setting up event listeners:', error)
        return () => {} // Return empty cleanup function in case of error
      }
    }

    // Set up event listeners and store cleanup function
    const cleanup = setupEventListeners()
    return () => {
      cleanup.then((cleanupFn) => cleanupFn?.())
    }
  }, [state.contract, processedEvents])

  return (
    <>
      <div className="min-h-screen w-full bg-[#0a0b1e] bg-gradient-to-b from-[#0a0b1e] to-[#1a0b2e] text-white px-4">
        <GameNavbar
          fetchGameDetails={fetchGameDetails}
          // fetchPlayerDetails={fetchPlayerDetails}
          setGameDetails={setGameDetails}
          // setPlayerDetails={setPlayerDetails}
          setIsModalOpen={setIsModalOpen}
          gameID={gameID}
          setGameID={setGameID}
          showNotification={showNotification}
          setGameFinish={setGameFinish}
          setIsOpen={setIsOpen}
        />
        {/* Create a container with minimum height that accounts for navbar */}
        <div className="min-h-[calc(100vh-56px)] flex flex-col pt-28">
          {/* Main content wrapper */}
          <div className="flex-1 flex items-center justify-center">
            {isGameFinished && (
              <div className="relative flex flex-col items-center justify-center py-8">
                <div className="flex flex-col items-center">
                  <div ref={contentRef} className="flex flex-col items-center">
                    <div
                      className={`text-xl sm:text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-pressStart2P text-center mb-8 ${
                        annoucement === 'Congratulations!'
                          ? 'text-[#90FDA5]'
                          : annoucement === 'Oh No!'
                          ? 'text-[#FFABBA]'
                          : 'text-[#0167EC]'
                      }`}
                    >
                      {annoucement}
                    </div>
                    <div className="text-[14px] sm:text-[16px] md:text-[18px] lg:text-[20px] xl:text-[22px] mb-10 text-white text-center font-pressStart2P">
                      {annoucement === 'Congratulations!'
                        ? 'No gas fee for you – enjoy the sweet, free ride! 💨'
                        : annoucement === 'Oh No!'
                        ? 'sometimes the price of wisdom... is gas fee'
                        : 'All Even! No victor this time'}
                    </div>
                    <div className="text-[14px] sm:text-[16px] md:text-[18px] lg:text-[20px] xl:text-[22px] mb-10 text-white font-pressStart2P text-center">
                      Game ID: {state.gameId}
                    </div>

                    <Image
                      src="/Basketball.png"
                      alt="Wallet Logo"
                      width={100}
                      height={100}
                      className="object-fill"
                      priority
                    />

                    {/* Dialog container with relative positioning to allow absolute positioning of triangle */}
                    <div className="relative mt-4 max-w-2xl">
                      {/* Triangle pseudo-element using before */}
                      <div className="absolute left-1/2 -top-4 -translate-x-1/2 w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-b-[16px] border-b-slate-700" />

                      {/* Main dialog box */}
                      <div className="flex flex-col justify-center items-center bg-slate-700 rounded-lg p-6 shadow-xl border border-slate-600">
                        <h3 className="text-[14px] sm:text-[16px] md:text-[18px] lg:text-[20px] xl:text-[22px] text-white mb-8 font-pressStart2P leading-10">
                          Game Profile Card
                        </h3>

                        {/* Two-column container */}
                        <div className="grid grid-cols-2 gap-6 mb-6">
                          {/* Recent Wins Section - First Column */}
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" />
                              </svg>
                              <h4 className="text-white font-semibold text-[14px] sm:text-[15px] md:text-[16px] lg:text-[17px] xl:text-[18px]">
                                Fun Stats
                              </h4>
                            </div>
                            <ul className="list-disc space-y-3 text-gray-300 pl-6">
                              <li className="text-[13px] sm:text-[14px] md:text-[15px] lg:text-[16px] xl:text-[17px]">
                                Favorite Move: Tuk-Tuk, because speed and agility are your forte!
                              </li>
                              <li className="text-[13px] sm:text-[14px] md:text-[15px] lg:text-[16px] xl:text-[17px]">
                                Top Rival: Traffic Jam
                              </li>
                              <li className="text-[13px] sm:text-[14px] md:text-[15px] lg:text-[16px] xl:text-[17px]">
                                Quickest Win: 3-second showdown using the Food Cart.
                              </li>
                            </ul>
                          </div>

                          {/* Achievements Section - Second Column */}
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              <h4 className="text-white font-semibold text-[14px] sm:text-[15px] md:text-[16px] lg:text-[17px] xl:text-[18px]">
                                Achievements
                              </h4>
                            </div>
                            <h1 className="text-[13px] sm:text-[14px] md:text-[15px] lg:text-[16px] xl:text-[17px] text-gray-300 pl-6">
                              Rush Hour Master: Achieved after winning 10 rounds with the Tuk-Tuk. You know every
                              shortcut through Bangkok!
                            </h1>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-5 justify-between mt-6 pb-6 w-full">
                    <button onClick={() => setIsTwitterBtnClick(true)} className="pixel-white-btn text-center w-full">
                      Share
                    </button>
                    <Link href="/game" disabled={state.loading} className="pixel-btn text-center w-full">
                      Replay
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Overlay */}
            {isOpen && <GameRules setIsOpen={setIsOpen} />}

            {/* Main Panel */}
            {!isModalOpen && !isGameFinished ? (
              <div className="w-full max-w-2xl mx-auto py-8">
                <h1 className="text-[#ff69b4] font-pressStart2P text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-center mb-16 animate-pulse">
                  Choose Wisely
                </h1>

                <div className="space-y-8">
                  {/* Username Input */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <label className="w-32 text-gray-400 text-[13px] sm:text-[14px] md:text-[15px] lg:text-[16px] xl:text-[17px]">
                      Username
                    </label>
                    <input
                      type="text"
                      placeholder="New Player"
                      value={state.username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="flex-1 bg-[#1a1b3e] border border-gray-700 rounded-lg px-4 py-2 w-full"
                    />
                  </div>

                  {/* Game ID Input */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <label className="w-32 text-gray-400 text-[13px] sm:text-[14px] md:text-[15px] lg:text-[16px] xl:text-[17px]">
                      Game ID
                    </label>
                    <div className="flex-1 relative flex items-center gap-2 w-full">
                      <input
                        type="text"
                        value={state.gameId}
                        readOnly
                        className="w-full bg-[#1a1b3e] border border-gray-700 rounded-lg px-4 py-2"
                      />
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(state.gameId)
                        }}
                        className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                        title="Copy Game ID"
                      >
                        <Copy size={20} className="text-gray-400" />
                      </button>
                    </div>
                  </div>

                  {/* Choice Buttons */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <label className="w-32 text-gray-400 text-[13px] sm:text-[14px] md:text-[15px] lg:text-[16px] xl:text-[17px]">
                      Choice
                    </label>
                    <div className="flex gap-4">
                      {[1, 2, 3].map((choice) => (
                        <button
                          key={choice}
                          onClick={() => setChoice(choice)}
                          className={`w-16 h-16 bg-[#1a1b3e] border-2 ${
                            state.choice === choice ? 'border-blue-500' : 'border-gray-700'
                          } rounded-lg hover:border-blue-400 transition-colors`}
                        >
                          <img
                            src={`/images/${choice === 1 ? 'food_truck' : choice === 2 ? 'traffic_jam' : 'tuktuk'}.png`}
                            alt={`Vehicle ${choice}`}
                            className="w-10 h-10 mx-auto"
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Error Display */}
                  {state.error && <div className="text-red-500 text-center">{state.error}</div>}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row justify-center gap-8 mt-12 text-[13px] sm:text-[14px] md:text-[15px] lg:text-[16px] xl:text-[17px]">
                    <button className="pixel-white-btn w-full">
                      <Link href="/game" disabled={state.loading}>
                        Back
                      </Link>
                    </button>
                    <button
                      onClick={() => {
                        makeMove()
                      }}
                      disabled={state.loading || !state.account}
                      className="pixel-btn w-full"
                    >
                      {state.loading ? 'Processing...' : 'Submit'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              !isGameFinished && (
                <div className="container relative flex flex-col text-white">
                  <GameHistory gameID={gameID} gameDetails={gameDetails} setIsModalOpen={setIsModalOpen} />
                </div>
              )
            )}

            {/* Toast Notification */}
            {showToast && (
              <div className="fixed z-20 top-0 right-0 bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm animate-slide-in-right">
                <div className="flex items-start">
                  <div className="ml-3 w-150 flex-1 pt-0.5">
                    <h1 className="text-sm font-medium text-gray-900">{toastMessage.title}</h1>
                    <h1 className="mt-1 text-sm text-gray-500">{toastMessage.description}</h1>
                  </div>
                  <button
                    className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-500 focus:outline-none"
                    onClick={() => setShowToast(false)}
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {isTwitterBtnClick && (
              <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-8">
                <div className="relative bg-[#0A0B1E] rounded-lg max-w-2xl w-full shadow-2xl p-8">
                  {/* Close Button */}
                  <button
                    onClick={() => setIsTwitterBtnClick(false)}
                    className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors"
                  >
                    <X size={24} />
                  </button>

                  {/* Modal Content */}
                  <div className="p-6">
                    <h2 className="font-pressStart2P pb-4">Post Tweet (Optional)</h2>
                    <textarea
                      value={tweet}
                      onChange={(e) => setTweet(e.target.value)}
                      className="w-full p-2 border rounded text-black"
                      placeholder="Add tweet text (optional)"
                      rows="4"
                      maxLength="280"
                    />
                    {status != '' ? (
                      <h1 className="flex justify-center pt-4 text-sm">{status}</h1>
                    ) : (
                      <div className="flex justify-end pt-4">
                        <button
                          onClick={shareToTwitter}
                          className="flex items-center space-x-2 pixel-btn transform transition-transform hover:scale-[1.02]"
                        >
                          <Share2 size={20} />
                          <span>Share</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default GameBoard
