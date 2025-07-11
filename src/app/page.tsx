'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { checkGameOver } from '@/lib/lives'

export default function Home() {
  const [nickname, setNickname] = useState('')
  const [savedNickname, setSavedNickname] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [gameOver, setGameOver] = useState(false)

  useEffect(() => {
    // Check if game is over
    if (checkGameOver()) {
      setGameOver(true)
      return
    }

    // Load nickname from localStorage on component mount
    const saved = localStorage.getItem('nickname')
    if (saved) {
      setSavedNickname(saved)
    }
  }, [])

  const handleSaveNickname = () => {
    if (nickname.trim()) {
      setIsLoading(true)
      // Simulate a brief loading state for better UX
      setTimeout(() => {
        localStorage.setItem('nickname', nickname.trim())
        setSavedNickname(nickname.trim())
        setNickname('')
        setIsLoading(false)
        
        // Clear eliminated players and game progress when first joining the game
        localStorage.removeItem('eliminatedPlayers')
        localStorage.removeItem('eliminationUsed')
        localStorage.removeItem('gameProgress')
        localStorage.removeItem('totalWinnings')
        localStorage.removeItem('eliminationOrder')
      }, 500)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveNickname()
    }
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Enhanced crypto grid background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(0, 255, 255, 0.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 255, 0.15) 1px, transparent 1px)
          `,
          backgroundSize: '30px 30px'
        }}></div>
      </div>

      {/* Squid Game symbols background */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Triangle symbols */}
        {[...Array(8)].map((_, i) => (
          <div
            key={`triangle-${i}`}
            className="absolute text-cyan-400 opacity-10 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${10 + Math.random() * 5}s`
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L22 20H2L12 2Z"/>
            </svg>
          </div>
        ))}
        
        {/* Circle symbols */}
        {[...Array(6)].map((_, i) => (
          <div
            key={`circle-${i}`}
            className="absolute text-purple-400 opacity-10 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${8 + Math.random() * 4}s`
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="10"/>
            </svg>
          </div>
        ))}
        
        {/* Square symbols */}
        {[...Array(4)].map((_, i) => (
          <div
            key={`square-${i}`}
            className="absolute text-pink-400 opacity-10 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${12 + Math.random() * 3}s`
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <rect x="2" y="2" width="20" height="20"/>
            </svg>
          </div>
        ))}
      </div>

      {/* Enhanced animated neon lines */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse"></div>
        <div className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent animate-pulse animation-delay-1000"></div>
        <div className="absolute top-1/2 left-0 w-px h-full bg-gradient-to-b from-transparent via-pink-400 to-transparent animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 right-0 w-px h-full bg-gradient-to-b from-transparent via-yellow-400 to-transparent animate-pulse animation-delay-3000"></div>
        
        {/* Diagonal lines */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-green-400 to-transparent animate-pulse animation-delay-1500 transform rotate-45 origin-left"></div>
        <div className="absolute bottom-0 right-0 w-full h-px bg-gradient-to-r from-transparent via-orange-400 to-transparent animate-pulse animation-delay-2500 transform -rotate-45 origin-right"></div>
        </div>

      {/* Floating crypto symbols */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute text-2xl opacity-15 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${8 + Math.random() * 4}s`
            }}
          >
            {['₿', 'Ξ', '◈', '◆', '◇', '○', '●'][Math.floor(Math.random() * 7)]}
          </div>
        ))}
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        {gameOver ? (
          <Card className="w-full max-w-md backdrop-blur-md bg-black/90 border border-red-500/40 shadow-2xl shadow-red-500/30 relative overflow-hidden">
            <CardHeader className="text-center space-y-4 pb-6 relative z-10">
              <CardTitle className="text-3xl font-black bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent tracking-wider">
                💀 ГРА ЗАКІНЧЕНА 💀
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6 relative z-10">
              <div className="p-4 bg-gradient-to-r from-red-600/30 to-pink-600/30 rounded-none border border-red-400/40 backdrop-blur-sm">
                <p className="text-white font-bold text-lg">
                  Ти втратив всі життя! 😵
                </p>
                <p className="text-red-400 text-sm mt-2">
                  Наступна гра пройде лише через рік...
                </p>
                <p className="text-yellow-400 text-sm mt-2">
                  Повертайся в {localStorage.getItem('gameOverYear')} році!
                </p>
              </div>
              <Button
                onClick={() => {
                  localStorage.removeItem('playerLives')
                  setGameOver(false)
                }}
                className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white font-bold py-3 px-6 rounded-none border border-red-400/60 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-red-500/30"
              >
                <span className="font-mono tracking-wider">СПРОБУВАТИ ЗНОВУ 💀</span>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="w-full max-w-sm backdrop-blur-md bg-black/90 border border-cyan-500/40 shadow-2xl shadow-cyan-500/30 relative overflow-hidden">
          {/* Card background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `
                linear-gradient(45deg, transparent 40%, rgba(0, 255, 255, 0.1) 50%, transparent 60%),
                linear-gradient(-45deg, transparent 40%, rgba(255, 0, 255, 0.1) 50%, transparent 60%)
              `,
              backgroundSize: '20px 20px'
            }}></div>
          </div>

          <CardHeader className="text-center space-y-4 pb-6 relative z-10">
            <div className="relative">
              <CardTitle className="text-3xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent tracking-wider">
                🦑 CRYPTO-SQUID 🦑
              </CardTitle>
              <div className="text-2xl font-black bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent tracking-wider">
                GAMES
              </div>
              <div className="absolute -inset-2 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 rounded-lg blur opacity-25 animate-pulse"></div>
            </div>
            
            {/* Squid Game symbols around title */}
            <div className="flex justify-center items-center space-x-4 mt-4">
              <div className="text-cyan-400 animate-pulse">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L22 20H2L12 2Z"/>
                </svg>
              </div>
              <div className="text-purple-400 animate-pulse animation-delay-1000">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="12" r="10"/>
                </svg>
              </div>
              <div className="text-pink-400 animate-pulse animation-delay-2000">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="2" y="2" width="20" height="20"/>
                </svg>
              </div>
            </div>

            <CardDescription className="text-sm text-center font-medium text-gray-300 leading-relaxed">
              <span className="text-yellow-400 font-bold">Вітаємо в підводному блокчейні на виживання!</span> <br/>
              Тут тебе чекають неймовірні скарби, але також і підступні небезпеки<br/>
              Щоб вижити, ти повинен бути швидкий, розумний і вміти користуватися технологіями.<br/>
              <span className="text-yellow-400 font-bold">Удачі!</span>
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6 relative z-10">
            {!savedNickname ? (
              <div className="space-y-4">
                <div className="space-y-3">
                  <Label htmlFor="nickname" className="text-cyan-400 font-bold text-sm uppercase tracking-wider flex items-center">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="mr-2">
                      <path d="M12 2L22 20H2L12 2Z"/>
                    </svg>
                    Write your nickname:
                  </Label>
                  <Input
                    id="nickname"
                    type="text"
                    placeholder="Enter your squid nickname..."
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value.toLowerCase())}
                    onKeyPress={handleKeyPress}
                    className="bg-black/60 border-cyan-500/60 text-white placeholder:text-gray-500 focus:border-cyan-400 focus:ring-cyan-400/30 font-mono text-sm backdrop-blur-sm"
                  />
                </div>
                <Button
                  onClick={handleSaveNickname}
                  disabled={!nickname.trim() || isLoading}
                  className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-bold py-3 px-6 rounded-none border border-cyan-400/60 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/30 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2 relative z-10">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span className="font-mono">SAVING...</span>
                    </div>
                  ) : (
                    <span className="font-mono tracking-wider relative z-10">JOIN THE GAME 🚀</span>
                  )}
                </Button>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="p-4 bg-gradient-to-r from-green-600/30 to-cyan-600/30 rounded-none border border-green-400/40 backdrop-blur-sm">
                  <p className="text-white font-bold text-sm">
                    Welcome back, <span className="text-cyan-400 font-black uppercase tracking-wider">{savedNickname}</span>! 🎉
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => {
                      // Save the game over year and player lives if they exist
                      const gameOverYear = localStorage.getItem('gameOverYear')
                      const playerLives = localStorage.getItem('playerLives')
                      
                      // Clear all localStorage except game over year and player lives
                      localStorage.clear()
                      
                      // Restore game over year if it existed
                      if (gameOverYear) {
                        localStorage.setItem('gameOverYear', gameOverYear)
                      }
                      
                      // Restore player lives if they existed
                      if (playerLives) {
                        localStorage.setItem('playerLives', playerLives)
                      }
                      
                      setSavedNickname('')
                    }}
                    variant="outline"
                    className="flex-1 border-cyan-500/60 text-cyan-400 hover:bg-cyan-500/20 font-mono text-xs uppercase tracking-wider rounded-none backdrop-blur-sm"
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="mr-1">
                      <circle cx="12" cy="12" r="10"/>
                    </svg>
                    Change
                  </Button>
                  <Button
                    onClick={() => {
                      // Check if game is over before starting
                      if (checkGameOver()) {
                        setGameOver(true)
                        return
                      }
                      
                      // Clear eliminated players and game progress when starting a new game
                      localStorage.removeItem('eliminatedPlayers')
                      localStorage.removeItem('eliminationUsed')
                      localStorage.removeItem('gameProgress')
                      localStorage.removeItem('totalWinnings')
                      localStorage.removeItem('eliminationOrder')
                      
                      const progress = localStorage.getItem('gameProgress')
                      if (progress) {
                        const round = parseInt(progress)
                        switch (round) {
                          case 1:
                            window.location.href = '/game/green-light'
                            break
                          case 2:
                            window.location.href = '/game/glass-bridge'
                            break
                          case 3:
                            window.location.href = '/game/illusion'
                            break
                          case 4:
                            window.location.href = '/game/memories'
                            break
                          case 5:
                            window.location.href = '/game/altcoins'
                            break
                          case 6:
                            window.location.href = '/game/token-catcher'
                            break
                          case 7:
                            window.location.href = '/game/maze'
                            break
                          default:
                            window.location.href = '/game/green-light'
                        }
                      } else {
                        window.location.href = '/game/green-light'
                      }
                    }}
                    className="flex-1 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white font-bold font-mono text-xs uppercase tracking-wider rounded-none border border-yellow-400/60 shadow-lg shadow-yellow-500/25"
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="mr-1">
                      <rect x="2" y="2" width="20" height="20"/>
                    </svg>
                    🚀 Start
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        )}
      </div>

      {/* Enhanced bottom scan line effect */}
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse"></div>
      
      {/* Corner decorations */}
      <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-cyan-400 opacity-60"></div>
      <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-purple-400 opacity-60"></div>
      <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-pink-400 opacity-60"></div>
      <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-yellow-400 opacity-60"></div>
    </div>
  )
}
