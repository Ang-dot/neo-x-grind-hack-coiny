import React, { useRef, useState } from 'react'
import { Undo2, Share2, X } from 'lucide-react'
import * as htmlToImage from 'html-to-image'

const GameHistory = ({ gameID, gameDetails, setIsModalOpen }) => {
  const [status, setStatus] = useState('')
  const [tweet, setTweet] = useState('')
  const [isTwitterBtnClick, setIsTwitterBtnClick] = useState(false)
  const contentRef = useRef(null)

  const getChoice = (num) => {
    const choice = typeof num === 'bigint' ? Number(num) : Number(num)
    switch (choice) {
      case 0:
        return 'Unknown'
      case 1:
        return 'Tuk Tuk'
      case 2:
        return 'Traffic Jam'
      case 3:
        return 'Food Cart'
      default:
        return 'Unknown'
    }
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

  return (
    <>
      <div className="max-w-4xl mx-auto pt-20">
        {/* Share button */}
        <div className="flex flex-row justify-between mb-4">
          {/* Back button - outside the captured content */}
          <div className="mt-4">
            <Undo2
              size={25}
              className="cursor-pointer"
              onClick={() => {
                setIsModalOpen(false)
                setStatus('')
              }}
            />
          </div>
          <button
            onClick={() => setIsTwitterBtnClick(true)}
            className="flex items-center space-x-2 pixel-btn transform transition-transform hover:scale-[1.02]"
          >
            <Share2 size={18} />
            <span className="text-[14px] sm:text-[15px] md:text-[16px] lg:text-[17px] xl:text-[18px]">
              Share to Twitter
            </span>
          </button>
        </div>

        {/* Content to be captured */}
        <div ref={contentRef} className="bg-black text-white p-8 rounded-lg">
          <div className="text-center mb-12">
            <div className="flex flex-row space-x-5 justify-center">
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-pink-500 mb-4 font-pressStart2P">
                Blockchain History
              </h1>
            </div>
            <div className="mt-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-left">
                <div className="col-span-1"></div>
                <div className="col-span-2 border border-[#FFFFFF] rounded-lg p-6 space-y-4">
                  <div className="text-[14px] sm:text-[15px] md:text-[16px] lg:text-[17px] xl:text-[18px] font-pressStart2P mb-4 flex justify-center">
                    {gameID}
                  </div>
                  <div className="flex flex-col md:flex-row justify-between">
                    <div className="text-gray-400 text-[13px] sm:text-[14px] md:text-[15px] lg:text-[16px] xl:text-[17px]">
                      Status
                    </div>
                    <div className="text-[13px] sm:text-[14px] md:text-[15px] lg:text-[16px] xl:text-[17px]">
                      {getGameState(gameDetails[7])}
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row justify-between">
                    <div className="text-gray-400 text-[13px] sm:text-[14px] md:text-[15px] lg:text-[16px] xl:text-[17px]">
                      Winner
                    </div>
                    <div className="text-[13px] sm:text-[14px] md:text-[15px] lg:text-[16px] xl:text-[17px]">
                      {gameDetails[6]?.slice(0, 6)}...{gameDetails[6]?.slice(-4)}
                    </div>
                  </div>
                </div>
                <div className="col-span-1"></div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
              <div className="rounded-lg p-6 text-left border border-gray-700">
                <h2 className="text-[14px] sm:text-[15px] md:text-[16px] lg:text-[17px] xl:text-[18px] font-pressStart2P mb-4">
                  Player 1
                </h2>
                <div className="space-y-4">
                  <div className="flex flex-col md:flex-row justify-between">
                    <div className="text-gray-400 text-[13px] sm:text-[14px] md:text-[15px] lg:text-[16px] xl:text-[17px]">
                      Address
                    </div>
                    <div className="text-[13px] sm:text-[14px] md:text-[15px] lg:text-[16px] xl:text-[17px]">
                      {gameDetails[0]?.slice(0, 6)}...{gameDetails[0]?.slice(-4)}
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row justify-between">
                    <div className="text-gray-400 text-[13px] sm:text-[14px] md:text-[15px] lg:text-[16px] xl:text-[17px]">
                      Username
                    </div>
                    <div className="text-[13px] sm:text-[14px] md:text-[15px] lg:text-[16px] xl:text-[17px]">
                      {gameDetails[2] == null ? '...' : gameDetails[2]}
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row justify-between">
                    <div className="text-gray-400 text-[13px] sm:text-[14px] md:text-[15px] lg:text-[16px] xl:text-[17px]">
                      Choice
                    </div>
                    <div className="text-[13px] sm:text-[14px] md:text-[15px] lg:text-[16px] xl:text-[17px]">
                      {getChoice(gameDetails[4])}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-lg p-6 text-left border border-gray-700">
                <h2 className="text-[14px] sm:text-[15px] md:text-[16px] lg:text-[17px] xl:text-[18px] font-pressStart2P mb-4">
                  Player 2
                </h2>
                <div className="space-y-4">
                  <div className="flex flex-col md:flex-row justify-between">
                    <div className="text-gray-400 text-[13px] sm:text-[14px] md:text-[15px] lg:text-[16px] xl:text-[17px]">
                      Address
                    </div>
                    <div className="text-[13px] sm:text-[14px] md:text-[15px] lg:text-[16px] xl:text-[17px]">
                      {gameDetails[1]?.slice(0, 6)}...{gameDetails[1]?.slice(-4)}
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row justify-between">
                    <div className="text-gray-400 text-[13px] sm:text-[14px] md:text-[15px] lg:text-[16px] xl:text-[17px]">
                      Username
                    </div>
                    <div className="text-[13px] sm:text-[14px] md:text-[15px] lg:text-[16px] xl:text-[17px]">
                      {gameDetails[3] == null ? '...' : gameDetails[3]}
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row justify-between">
                    <div className="text-gray-400 text-[13px] sm:text-[14px] md:text-[15px] lg:text-[16px] xl:text-[17px]">
                      Choice
                    </div>
                    <div className="text-[13px] sm:text-[14px] md:text-[15px] lg:text-[16px] xl:text-[17px]">
                      {getChoice(gameDetails[5])}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

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
                  <p className="flex justify-center pt-4 text-sm">{status}</p>
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
    </>
  )
}

export default GameHistory
