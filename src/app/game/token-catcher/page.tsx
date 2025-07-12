'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from 'next/navigation'


interface Token {
  id: number
  type: 'btc' | 'eth' | 'bnb' | 'trump' | 'dai'
  x: number
  y: number
  speed: number
  isClicked: boolean
}

export default function TokenCatcherGame() {
  const [gameState, setGameState] = useState<'waiting' | 'playing' | 'won' | 'lost'>('waiting')
  const [isClient, setIsClient] = useState(false)
  const [particles, setParticles] = useState<Array<{id: number, left: number, top: number, delay: number, duration: number}>>([])
  const [tokens, setTokens] = useState<Token[]>([])
  const [balance, setBalance] = useState(500)
  const [gameTime, setGameTime] = useState(0)
  const [gameAreaRef, setGameAreaRef] = useState<HTMLDivElement | null>(null)



  const [nickname, setNickname] = useState('')
  const router = useRouter()
  const gameInterval = useRef<NodeJS.Timeout | null>(null)
  const tokenInterval = useRef<NodeJS.Timeout | null>(null)


  
  const tokenImages = {
    btc: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1.png',
    eth: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png',
    bnb: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png',
    trump: 'https://s2.coinmarketcap.com/static/img/coins/64x64/35336.png',
    dai: 'https://s2.coinmarketcap.com/static/img/coins/64x64/4943.png'
  }

  const tokenNames = {
    btc: 'BTC',
    eth: 'ETH',
    bnb: 'BNB',
    trump: 'TRUMP',
    dai: 'DAI'
  }

  useEffect(() => {
    setIsClient(true)
    
    const saved = localStorage.getItem('nickname')
    if (saved) {
      setNickname(saved)
    }
    
    // Generate particles on client side only
    const generatedParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 8 + Math.random() * 4
    }))
    setParticles(generatedParticles)
  }, [router])

  const startGame = () => {
    setGameState('playing')
    setTokens([])
    setBalance(500)
    setGameTime(0)
    
    // Start the game timer
    gameInterval.current = setInterval(() => {
      setGameTime(prev => prev + 0.1)
    }, 100)
    
    // Start generating tokens (every 1.5 seconds)
    tokenInterval.current = setInterval(() => {
      generateNewToken()
    }, 1500)
  }

  const generateNewToken = () => {
    if (!gameAreaRef) return
    
    // 30% chance for BTC
    const random = Math.random()
    let randomType: Token['type']
    
    if (random < 0.3) {
      randomType = 'btc'
    } else {
      // 70% chance for other tokens (distributed equally)
      const otherTokens: Token['type'][] = ['eth', 'bnb', 'trump', 'dai']
      randomType = otherTokens[Math.floor(Math.random() * otherTokens.length)]
    }
    
    // Spawn tokens within the game area bounds
    const newToken: Token = {
      id: Date.now(),
      type: randomType,
      x: Math.random() * 80 + 10, // 10% to 90% of game area width
      y: -10, // Start just above the game area
      speed: 0.7, // Fixed speed
      isClicked: false
    }
    
    setTokens(prev => [...prev, newToken])
  }

  const endGame = (result: 'won' | 'lost') => {
    setGameState(result)
    if (gameInterval.current) clearInterval(gameInterval.current)
    if (tokenInterval.current) clearInterval(tokenInterval.current)
  }

  const handleTokenClick = (tokenId: number) => {
    setTokens(prev => {
      const token = prev.find(t => t.id === tokenId)
      if (!token || token.isClicked) return prev
      
      // Check if token is in the bonus zone (green BUY zone - center area)
      // The green zone is positioned at top-1/2 with h-8, so it's roughly 46% to 54% of screen height
      const isInBonusZone = token.y >= 46 && token.y <= 54
      
      // Check if token is in the destruction zone (red SELL zone - below green zone)
      // The red zone is positioned at top-1/2 with translate-y-12 (48px down from center)
      // In a 384px container, 48px = 12.5%, so the zone is roughly 62.5% down from top
      // With h-8 (32px = 8.33%), the zone covers roughly 58.33% to 66.67%
      const isInDestructionZone = token.y >= 58 && token.y <= 85
      

      
      // Update balance based on token type and position
      if (token.type === 'btc') {
        if (isInBonusZone) {
          // Update balance immediately
          setBalance(currentBalance => currentBalance + 100)

        } else {
          // BTC clicked outside bonus zone - still give +50
          setBalance(currentBalance => currentBalance + 50)

        }
        // Bitcoin always disappears when clicked, regardless of position
      } else {
        // Other tokens can only be destroyed in the red zone
        if (!isInDestructionZone) {
          return prev // Don't allow clicking outside red zone
        } else {
          // Token is in destruction zone - destroy without penalty
        }
      }
      
      return prev.map(t => 
        t.id === tokenId ? { ...t, isClicked: true } : t
      )
    })
  }

  const updateTokenPositions = () => {
    setTokens(prev => prev.map(token => ({
      ...token,
      y: token.y + token.speed
    })))
  }

  // Update token positions and remove tokens that fall below game area
  useEffect(() => {
    if (gameState === 'playing') {
      const updateInterval = setInterval(() => {
        updateTokenPositions()
        
        // Remove tokens that fall below the game area and subtract balance
        setTokens(prev => {
          const tokensToRemove = prev.filter(token => token.y >= 100)
          
          // Subtract balance for tokens that fell to the bottom
          tokensToRemove.forEach(token => {
            if (!token.isClicked) {
              setBalance(prevBalance => prevBalance - 100)
            }
          })
          
          return prev.filter(token => token.y < 100)
        })
      }, 50)

      return () => clearInterval(updateInterval)
    }
  }, [gameState])

  // Check win/lose conditions
  useEffect(() => {
    if (balance >= 1000) {
      endGame('won')
    } else if (balance <= 0) {
      endGame('lost')
    }
  }, [balance])

  const resetGame = () => {
    setGameState('waiting')
    setTokens([])
    setBalance(500)
    setGameTime(0)
  }

  const goToNextGame = () => {
    localStorage.setItem('gameProgress', '7')
    router.push('/game/elimination/')
  }

  if (!isClient) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-purple-400 font-mono text-xl">Завантаження...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Enhanced game background with token effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900 via-indigo-900 to-blue-900"></div>
      
      {/* Floating token particles */}
      <div className="absolute inset-0">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-1 h-1 bg-purple-400 rounded-full opacity-30 animate-float"
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`
            }}
          />
        ))}
      </div>
      
      {/* Token grid lines */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(147, 51, 234, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(147, 51, 234, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      {/* Game UI */}
      <div className="relative z-10 p-4">
        {/* Enhanced Header */}
        <div className="flex justify-between items-center mb-6 bg-black/50 backdrop-blur-sm p-4 rounded-none border border-purple-500/30">
          <div className="text-white font-mono text-sm space-y-1">
            <div className="flex items-center">
              <span className="text-purple-400 mr-2">👤</span>
              <span>Гравець: <span className="text-purple-400 font-bold">{nickname}</span></span>
            </div>
            <div className="flex items-center">
              <span className="text-yellow-400 mr-2">⏱️</span>
              <span>Час: <span className="text-yellow-400 font-bold">{gameTime.toFixed(1)}s</span></span>
            </div>
          </div>
          <div className="text-white font-mono text-sm space-y-1">

            <div className="flex items-center">
              <span className="text-green-400 mr-2">💰</span>
              <span>Баланс: <span className="text-green-400 font-bold">${balance}</span></span>
            </div>
          </div>
        </div>

        {/* Game title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-400 bg-clip-text text-transparent tracking-wider mb-2">
            🎯 ТОКЕН КЕТЧЕР 🎯
          </h1>
          <p className="text-gray-400 text-sm max-w-2xl mx-auto">
            Клікай по всіх токенах крім BTC! BTC в зоні BUY = +$100, BTC поза зоною = +$50, інші токени в зоні SELL = знищення без штрафу. Дійди до $1000!
          </p>
        </div>

        {/* Game Area */}
        <div 
          ref={setGameAreaRef}
          className="relative h-96 bg-black/30 border border-purple-500/40 rounded-none mb-8 overflow-hidden"
        >

          {/* Light green bonus zone in the middle */}
          <div className="absolute left-0 top-1/2 w-full h-8 bg-green-400/30 border-t-2 border-b-2 border-green-400/60 transform -translate-y-1/2">
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white font-bold text-sm tracking-wider">BUY</span>
            </div>
          </div>
          
          {/* Red destruction zone below green zone */}
          <div className="absolute left-0 top-1/2 w-full h-8 bg-red-400/30 border-t-2 border-b-2 border-red-400/60 transform translate-y-12">
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white font-bold text-sm tracking-wider">SELL</span>
            </div>
          </div>
          

          
          {/* Falling tokens */}
          {tokens.map((token) => (
            <div
              key={token.id}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                if (!token.isClicked) {
                  handleTokenClick(token.id)
                }
              }}
              onMouseDown={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
              onTouchStart={(e) => {
                e.preventDefault()
                e.stopPropagation()
                if (!token.isClicked) {
                  handleTokenClick(token.id)
                }
              }}
              className={`absolute cursor-pointer transition-all duration-200 z-20 ${
                token.isClicked ? 'opacity-0 scale-0 pointer-events-none' : 'opacity-100 scale-100'
              } hover:scale-125 active:scale-95`}
              style={{
                left: `${token.x}%`,
                top: `${token.y}%`,
                transform: `translate(-50%, -50%) ${token.isClicked ? 'scale(0)' : ''}`,
                pointerEvents: token.isClicked ? 'none' : 'auto',
                touchAction: 'manipulation'
              }}
            >
              <img
                src={tokenImages[token.type]}
                alt={tokenNames[token.type]}
                className="w-12 h-12 select-none pointer-events-none"
                draggable={false}
                onError={(e) => {
                  // Fallback for broken images
                  e.currentTarget.style.display = 'none'
                }}
              />
            </div>
          ))}
        </div>



        {/* Game controls */}
        {gameState === 'waiting' && (
          <div className="text-center">
            <Button
              onClick={startGame}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-6 px-12 rounded-none border border-purple-400/60 transition-all duration-300 transform hover:scale-105 shadow-2xl shadow-purple-500/40 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <span className="font-mono tracking-wider text-xl relative z-10">ПОЧАТИ ГРУ 🎯</span>
            </Button>
          </div>
        )}

        {gameState === 'won' && (
          <Card className="bg-black/90 border border-green-500/40 shadow-2xl shadow-green-500/30 backdrop-blur-md">
            <CardHeader className="text-center">
              <CardTitle className="text-green-400 font-black text-3xl animate-pulse">
                🎉 ПЕРЕМОГА! 🎉
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <p className="text-white text-lg">
                Ти досяг $1000! Відмінна гра!
              </p>
              <p className="text-green-400 font-bold text-xl">
                Фінальний баланс: ${balance}
              </p>
              <div className="flex space-x-4">
                <Button
                  onClick={resetGame}
                  variant="outline"
                  className="flex-1 border-green-500/60 text-green-400 hover:bg-green-500/20 font-mono text-sm uppercase tracking-wider rounded-none py-4"
                >
                  Грати знову
                </Button>
                <Button
                  onClick={goToNextGame}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold font-mono text-sm uppercase tracking-wider rounded-none border border-green-400/60 py-4"
                >
                  Наступна гра
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {gameState === 'lost' && (
          <Card className="bg-black/90 border border-red-500/40 shadow-2xl shadow-red-500/30 backdrop-blur-md">
            <CardHeader className="text-center">
              <CardTitle className="text-red-400 font-black text-3xl animate-pulse">
                💀 ПРОГРАШ! 💀
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <p className="text-white text-lg">
                Твій баланс впав до $0! Спробуй ще раз!
              </p>
              <p className="text-red-400 font-bold text-xl">
                Фінальний баланс: ${balance}
              </p>
              <Button
                onClick={resetGame}
                className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white font-bold py-4 px-8 rounded-none border border-red-400/60 transition-all duration-300 transform hover:scale-105 shadow-2xl shadow-red-500/40"
              >
                <span className="font-mono tracking-wider text-lg">СПРОБУВАТИ ЗНОВУ</span>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Enhanced bottom scan line effect */}
      <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-r from-transparent via-purple-400 to-transparent animate-pulse"></div>
      
      {/* Enhanced corner decorations */}
      <div className="absolute top-4 left-4 w-12 h-12 border-l-4 border-t-4 border-purple-400 opacity-80 animate-pulse"></div>
      <div className="absolute top-4 right-4 w-12 h-12 border-r-4 border-t-4 border-indigo-400 opacity-80 animate-pulse animation-delay-1000"></div>
      <div className="absolute bottom-4 left-4 w-12 h-12 border-l-4 border-b-4 border-blue-400 opacity-80 animate-pulse animation-delay-2000"></div>
      <div className="absolute bottom-4 right-4 w-12 h-12 border-r-4 border-b-4 border-purple-400 opacity-80 animate-pulse animation-delay-3000"></div>
    </div>
  )
} 