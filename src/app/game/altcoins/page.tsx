'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from 'next/navigation'

export default function AltcoinsGame() {
  const [gameState, setGameState] = useState<'waiting' | 'playing' | 'won' | 'lost'>('waiting')
  const [isClient, setIsClient] = useState(false)
  const [particles, setParticles] = useState<Array<{id: number, left: number, top: number, delay: number, duration: number}>>([])
  const [currentPrice, setCurrentPrice] = useState(0)
  const [gameTime, setGameTime] = useState(0)
  const [waitTime, setWaitTime] = useState(0)

  const [nickname, setNickname] = useState('')
  const [score, setScore] = useState(0)

  const router = useRouter()
  const gameInterval = useRef<NodeJS.Timeout | null>(null)
  const priceInterval = useRef<NodeJS.Timeout | null>(null)

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
  }, [])

  const startGame = () => {
    setGameState('playing')
    setScore(0)
    setGameTime(0)
    setCurrentPrice(0)
    setWaitTime(0)
    
    // Start the game timer
    gameInterval.current = setInterval(() => {
      setGameTime(prev => prev + 0.1)
    }, 100)
    
    // Start price changes (5 times per second)
    priceInterval.current = setInterval(() => {
      setCurrentPrice(() => {
        // Random price between -100% and +400%
        return Math.random() * 500 - 100
      })
    }, 200) // 5 times per second
  }

  const endGame = (result: 'won' | 'lost') => {
    setGameState(result)
    if (gameInterval.current) clearInterval(gameInterval.current)
    if (priceInterval.current) clearInterval(priceInterval.current)
  }

  const handleBuyClick = () => {
    if (gameState !== 'playing') return
    
    const clickTimeValue = gameTime
    
    // Check if click is in the correct time window (35-40 seconds)
    if (clickTimeValue >= 35 && clickTimeValue <= 40) {
      setScore(500)
      setWaitTime(clickTimeValue)
      endGame('won')
    } else {
      setScore(-99)
      setWaitTime(clickTimeValue)
      endGame('lost')
    }
  }

  const resetGame = () => {
    setGameState('waiting')
    setScore(0)
    setGameTime(0)
    setCurrentPrice(0)
    setWaitTime(0)
    

  }

  const goToNextGame = () => {
    localStorage.setItem('gameProgress', '6')
    router.push('/game/elimination')
  }

  const getPriceColor = (price: number) => {
    if (price >= 0) {
      const intensity = Math.min(price / 400, 1)
      return `rgb(${0 + intensity * 100}, ${255 - intensity * 100}, ${0})`
    } else {
      const intensity = Math.min(Math.abs(price) / 100, 1)
      return `rgb(${255}, ${0 + intensity * 100}, ${0})`
    }
  }

  const getPriceEmoji = (price: number) => {
    if (price >= 300) return '🚀'
    if (price >= 200) return '📈'
    if (price >= 100) return '📊'
    if (price >= 0) return '📉'
    if (price >= -50) return '💸'
    return '💀'
  }

  if (!isClient) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-green-400 font-mono text-xl">Завантаження...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Enhanced game background with crypto effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-green-900 via-emerald-900 to-teal-900"></div>
      
      {/* Floating crypto particles */}
      <div className="absolute inset-0">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-1 h-1 bg-green-400 rounded-full opacity-30 animate-float"
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`
            }}
          />
        ))}
      </div>
      
      {/* Crypto grid lines */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(0, 255, 150, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 150, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }}></div>
      </div>

      {/* Game UI */}
      <div className="relative z-10 p-4">
        {/* Enhanced Header */}
        <div className="flex justify-between items-center mb-6 bg-black/50 backdrop-blur-sm p-4 rounded-none border border-green-500/30">
          <div className="text-white font-mono text-sm space-y-1">
            <div className="flex items-center">
              <span className="text-green-400 mr-2">👤</span>
              <span>Гравець: <span className="text-green-400 font-bold">{nickname}</span></span>
            </div>
          </div>
          <div className="text-white font-mono text-sm space-y-1">

            <div className="flex items-center">
              <span className="text-cyan-400 mr-2">🏆</span>
              <span>Рахунок: <span className="text-cyan-400 font-bold">{score}</span></span>
            </div>
          </div>
        </div>

        {/* Game title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent tracking-wider mb-2">
            💰 АЛЬТКОЇНИ 💰
          </h1>
          <p className="text-gray-400 text-sm max-w-2xl mx-auto">
            Альткоїни - не зло, але треба знати коли їх купити. Не за рання аби не чекати 3 роки альт сезона, і не запізно на піку, аби вони не соскамились
          </p>
        </div>

        {/* Crypto Trading Area */}
        <div className="flex flex-col items-center space-y-8 mb-8">
          {/* Crypto image container with price overlay */}
          <div className="relative bg-gradient-to-br from-green-900/30 via-emerald-900/30 to-teal-900/30 border-2 border-green-500/40 rounded-none p-4 backdrop-blur-sm">
            <img 
              src={
                gameState === 'won' 
                  ? "https://media.tenor.com/JBE4pIpmhBgAAAAe/ponke-ponkesol.png" 
                  : gameState === 'lost'
                  ? "https://i.pinimg.com/736x/a5/fe/c5/a5fec56dda57c28b115437575d0ffc47.jpg"
                  : "https://builtin.com/sites/www.builtin.com/files/styles/ckeditor_optimize/public/inline-images/inside-crypto-cryptocurrency.png"
              }
              alt={
                gameState === 'won' 
                  ? "Ponke Winner" 
                  : gameState === 'lost'
                  ? "Screenshot Loss"
                  : "Crypto Trading"
              }
              className="w-[400px] h-[300px] object-cover rounded-none"
            />
            
            {/* Price display overlay */}
            {gameState === 'playing' && (
              <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center">
                <div className="text-center space-y-4">
                  <h2 className="text-xl font-bold text-white">
                    📊 Поточна ціна:
                  </h2>
                  <div 
                    className="text-6xl font-black transition-all duration-200 ease-out"
                    style={{ color: getPriceColor(currentPrice) }}
                  >
                    {currentPrice > 0 ? '+' : ''}{currentPrice.toFixed(1)}%
                  </div>
                  <div className="text-4xl">
                    {getPriceEmoji(currentPrice)}
                  </div>
                  <div className="text-green-400 text-sm">
                    Ціна змінюється 5 разів на секунду
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Buy button */}
          {gameState === 'playing' && (
            <div className="text-center">
              <Button
                onClick={handleBuyClick}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-6 px-12 rounded-none border border-green-400/60 transition-all duration-300 transform hover:scale-105 shadow-2xl shadow-green-500/40 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <span className="font-mono tracking-wider text-xl relative z-10">КУПИТИ ЗАРАЗ! 💰</span>
              </Button>
              <p className="text-yellow-400 text-sm mt-2">
                Клікни між 35-40 секундами для максимального профіту!
              </p>
            </div>
          )}


        </div>

        {/* Game controls */}
        {gameState === 'waiting' && (
          <div className="text-center">
            <Button
              onClick={startGame}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-6 px-12 rounded-none border border-green-400/60 transition-all duration-300 transform hover:scale-105 shadow-2xl shadow-green-500/40 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <span className="font-mono tracking-wider text-xl relative z-10">ПОЧАТИ ТОРГІВЛЮ 💰</span>
            </Button>
          </div>
        )}

        {gameState === 'won' && (
          <Card className="bg-black/90 border border-green-500/40 shadow-2xl shadow-green-500/30 backdrop-blur-md">
            <CardHeader className="text-center">
              <CardTitle className="text-green-400 font-black text-3xl animate-pulse">
                🚀 МАКСИМАЛЬНИЙ ПРОФІТ! 🚀
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <p className="text-white text-lg">
                Ти купив в ідеальний момент! +500% профіту!
              </p>
              <p className="text-yellow-400 text-lg">
                Ти зачекав: <span className="text-yellow-400 font-bold">{waitTime.toFixed(1)} секунд</span>
              </p>
              <p className="text-green-400 font-bold text-xl">
                Фінальний рахунок: {score}
              </p>
              <div className="flex space-x-4">
                <Button
                  onClick={resetGame}
                  variant="outline"
                  className="flex-1 border-green-500/60 text-green-400 hover:bg-green-500/20 font-mono text-sm uppercase tracking-wider rounded-none py-4"
                >
                  Торгувати знову
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
                💀 РЕКЕТ! 💀
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <p className="text-white text-lg">
                Ти купив в неправильний час! -99% збитку!
              </p>
              <p className="text-yellow-400 text-lg">
                Ти зачекав: <span className="text-yellow-400 font-bold">{waitTime.toFixed(1)} секунд</span>
              </p>
              <p className="text-red-400 font-bold text-xl">
                Фінальний рахунок: {score}
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
      <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-r from-transparent via-green-400 to-transparent animate-pulse"></div>
      
      {/* Enhanced corner decorations */}
      <div className="absolute top-4 left-4 w-12 h-12 border-l-4 border-t-4 border-green-400 opacity-80 animate-pulse"></div>
      <div className="absolute top-4 right-4 w-12 h-12 border-r-4 border-t-4 border-emerald-400 opacity-80 animate-pulse animation-delay-1000"></div>
      <div className="absolute bottom-4 left-4 w-12 h-12 border-l-4 border-b-4 border-teal-400 opacity-80 animate-pulse animation-delay-2000"></div>
      <div className="absolute bottom-4 right-4 w-12 h-12 border-r-4 border-b-4 border-green-400 opacity-80 animate-pulse animation-delay-3000"></div>
    </div>
  )
} 