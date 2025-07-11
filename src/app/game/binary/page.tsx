'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'
import { checkGameOver } from '@/lib/lives'

interface PricePoint {
  x: number
  y: number
  timestamp: number
}

export default function BinaryGame() {
  const [gameState, setGameState] = useState<'waiting' | 'playing' | 'won' | 'lost'>('waiting')
  const [isClient, setIsClient] = useState(false)
  const [particles, setParticles] = useState<Array<{id: number, left: number, top: number, delay: number, duration: number}>>([])
  const [pricePoints, setPricePoints] = useState<PricePoint[]>([])
  const [currentBalance, setCurrentBalance] = useState(500)
  const [betAmount, setBetAmount] = useState(50)
  const [entryPrice, setEntryPrice] = useState(0)
  const [currentPrice, setCurrentPrice] = useState(100)
  const [gameTime, setGameTime] = useState(0)
  const [prediction, setPrediction] = useState<'higher' | 'lower' | null>(null)

  const [nickname, setNickname] = useState('')
  const router = useRouter()
  const gameInterval = useRef<NodeJS.Timeout | null>(null)
  const candleInterval = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Check if game is over
    if (checkGameOver()) {
      window.location.href = '/'
      return
    }

    setIsClient(true)
    const saved = localStorage.getItem('nickname')
    if (saved) {
      setNickname(saved)
    }
    
    // Generate particles on client side only
    const generatedParticles = Array.from({ length: 25 }, (_, i) => ({
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
    setCurrentBalance(500)
    setBetAmount(50)
    setPricePoints([])
    setCurrentPrice(100)
    setGameTime(0)
    setIsTrading(false)
    setCurrentPosition(null)
    setEntryPrice(0)
    setPrediction(null)
    
    // Start the game timer
    gameInterval.current = setInterval(() => {
      setGameTime(prev => prev + 0.1)
    }, 100)
    
    // Start generating price points (every 0.5 seconds)
    candleInterval.current = setInterval(() => {
      generateNewPricePoint()
    }, 500)
  }

  const generateNewPricePoint = () => {
    const priceChange = (Math.random() - 0.5) * 10 // -5 to +5
    const newPrice = currentPrice + priceChange
    
    const newPoint: PricePoint = {
      x: gameTime * 2, // Move right to left
      y: newPrice,
      timestamp: Date.now()
    }
    
    setCurrentPrice(newPrice)
    setPricePoints(prev => {
      const updated = [...prev, newPoint]
      // Keep only last 100 points
      return updated.slice(-100)
    })
  }

  // Function to draw chart
  const drawChart = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // Draw grid
    ctx.strokeStyle = 'rgba(255, 150, 0, 0.2)'
    ctx.lineWidth = 1
    
    // Vertical grid lines
    for (let i = 0; i <= 20; i++) {
      const x = (canvas.width / 20) * i
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvas.height)
      ctx.stroke()
    }
    
    // Horizontal grid lines
    for (let i = 0; i <= 10; i++) {
      const y = (canvas.height / 10) * i
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvas.width, y)
      ctx.stroke()
    }
    
    if (pricePoints.length === 0) return
    
    // Calculate price range
    const maxPrice = Math.max(...pricePoints.map(p => p.y), 110)
    const minPrice = Math.min(...pricePoints.map(p => p.y), 90)
    const priceRange = maxPrice - minPrice
    
    // Draw price line
    ctx.strokeStyle = '#fbbf24'
    ctx.lineWidth = 3
    ctx.beginPath()
    
    pricePoints.forEach((point, index) => {
      const x = canvas.width - (pricePoints.length - index) * 3
      const normalizedPrice = (point.y - minPrice) / priceRange
      const y = canvas.height - (normalizedPrice * canvas.height)
      
      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    
    ctx.stroke()
    
    // Draw current price line
    const normalizedCurrentPrice = (currentPrice - minPrice) / priceRange
    const currentY = canvas.height - (normalizedCurrentPrice * canvas.height)
    
    ctx.strokeStyle = '#ef4444'
    ctx.lineWidth = 2
    ctx.setLineDash([5, 5])
    ctx.beginPath()
    ctx.moveTo(0, currentY)
    ctx.lineTo(canvas.width, currentY)
    ctx.stroke()
    ctx.setLineDash([])
  }

  // Update chart when price points change
  useEffect(() => {
    const canvas = document.querySelector('canvas') as HTMLCanvasElement
    if (canvas && gameState === 'playing') {
      drawChart(canvas)
    }
  }, [pricePoints, currentPrice, gameState])

  const endGame = (result: 'won' | 'lost') => {
    setGameState(result)
    if (gameInterval.current) clearInterval(gameInterval.current)
    if (candleInterval.current) clearInterval(candleInterval.current)
  }

  const predictHigher = () => {
    if (gameState !== 'playing' || prediction) return
    
    setPrediction('higher')
    setEntryPrice(currentPrice)
    setCurrentBalance(prev => prev - betAmount)
    
    // Wait 5 seconds then check result
    setTimeout(() => {
      checkResult()
    }, 5000)
  }

  const predictLower = () => {
    if (gameState !== 'playing' || prediction) return
    
    setPrediction('lower')
    setEntryPrice(currentPrice)
    setCurrentBalance(prev => prev - betAmount)
    
    // Wait 5 seconds then check result
    setTimeout(() => {
      checkResult()
    }, 5000)
  }

  const checkResult = () => {
    if (!prediction) return
    
    let profit = 0
    if (prediction === 'higher') {
      profit = currentPrice > entryPrice ? betAmount * 1.8 : -betAmount
    } else {
      profit = currentPrice < entryPrice ? betAmount * 1.8 : -betAmount
    }
    
    setCurrentBalance(prev => prev + betAmount + profit)
    setPrediction(null)
    setEntryPrice(0)
    
    // Check win condition
    if (currentBalance + betAmount + profit >= 1000) {
      setTimeout(() => {
        endGame('won')
      }, 1000)
    }
    
    // Check lose condition (if balance goes below 10)
    if (currentBalance + betAmount + profit < 10) {
      setTimeout(() => {
        endGame('lost')
      }, 1000)
    }
  }

  const resetGame = () => {
    setGameState('waiting')
    setCurrentBalance(500)
    setBetAmount(50)
    setPricePoints([])
    setCurrentPrice(100)
    setGameTime(0)
    setIsTrading(false)
    setCurrentPosition(null)
    setEntryPrice(0)
    setPrediction(null)
  }

  const goToNextGame = () => {
    localStorage.setItem('gameProgress', '6')
    router.push('/game/elimination')
  }

  if (!isClient) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-orange-400 font-mono text-xl">Завантаження...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Enhanced game background with binary effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-orange-900 via-red-900 to-pink-900"></div>
      
      {/* Floating binary particles */}
      <div className="absolute inset-0">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-1 h-1 bg-orange-400 rounded-full opacity-30 animate-float"
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`
            }}
          />
        ))}
      </div>
      
      {/* Binary grid lines */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(255, 150, 0, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 150, 0, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      {/* Game UI */}
      <div className="relative z-10 p-4">
        {/* Enhanced Header */}
        <div className="flex justify-between items-center mb-6 bg-black/50 backdrop-blur-sm p-4 rounded-none border border-orange-500/30">
          <div className="text-white font-mono text-sm space-y-1">
            <div className="flex items-center">
              <span className="text-orange-400 mr-2">👤</span>
              <span>Гравець: <span className="text-orange-400 font-bold">{nickname}</span></span>
            </div>
            <div className="flex items-center">
              <span className="text-yellow-400 mr-2">⏱️</span>
              <span>Час: <span className="text-yellow-400 font-bold">{gameTime.toFixed(1)}s</span></span>
            </div>
          </div>
          <div className="text-white font-mono text-sm space-y-1">
            <div className="flex items-center">
              <span className="text-red-400 mr-2">📈</span>
              <span>Гра: <span className="text-red-400 font-bold">Бінарні опціони</span></span>
            </div>
            <div className="flex items-center">
              <span className="text-green-400 mr-2">💰</span>
              <span>Баланс: <span className="text-green-400 font-bold">${currentBalance.toFixed(2)}</span></span>
            </div>
          </div>
        </div>

        {/* Game title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent tracking-wider mb-2">
            📈 БІНАРНІ ОПЦІОНИ 📈
          </h1>
          <p className="text-gray-400 text-sm max-w-2xl mx-auto">
            Торгуй криптовалютою! Купуй на підйом (LONG) або падіння (SHORT). Мета: зібрати $1000 з початкових $500
          </p>
        </div>

        {/* Trading Area */}
        <div className="flex flex-col lg:flex-row gap-8 mb-8">
          {/* Chart Area */}
          <div className="flex-1">
            <div className="bg-black/50 backdrop-blur-sm border border-orange-500/40 rounded-none p-4">
              <h2 className="text-xl font-bold text-white mb-4 text-center">📊 Графік ціни</h2>
              
              {/* Chart container */}
              <div className="relative h-96 bg-gray-900 border border-gray-700 rounded-none overflow-y-auto">
                <canvas
                  className="w-full h-full"
                />
                
                {/* Price display overlay */}
                <div className="absolute top-2 right-2 bg-black/70 px-2 py-1 rounded">
                  <div className="text-sm font-bold text-white">
                    ${currentPrice.toFixed(2)}
                  </div>
                </div>
              </div>
              
              {/* Current prediction info */}
              {prediction && (
                <div className="mt-4 p-3 bg-black/30 border border-orange-500/40 rounded-none">
                  <div className="text-center text-white">
                    <div className="text-sm">
                      Прогноз: <span className={`font-bold ${prediction === 'higher' ? 'text-green-400' : 'text-red-400'}`}>
                        {prediction === 'higher' ? 'ВИЩЕ 📈' : 'НИЖЧЕ 📉'}
                      </span>
                    </div>
                    <div className="text-sm">
                      Вхід: <span className="text-yellow-400 font-bold">${entryPrice.toFixed(2)}</span>
                    </div>
                    <div className="text-sm">
                      Поточна: <span className="text-cyan-400 font-bold">${currentPrice.toFixed(2)}</span>
                    </div>
                    <div className="text-sm text-orange-400">
                      Результат через 5 секунд...
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Trading Controls */}
          <div className="lg:w-80">
            <div className="bg-black/50 backdrop-blur-sm border border-orange-500/40 rounded-none p-4">
              <h2 className="text-xl font-bold text-white mb-4 text-center">🎯 Торгові кнопки</h2>
              
              {/* Bet amount input */}
              <div className="mb-4">
                <Label htmlFor="betAmount" className="text-orange-400 font-bold text-sm uppercase tracking-wider">
                  Ставка ($):
                </Label>
                <Input
                  id="betAmount"
                  type="number"
                  min="10"
                  max={currentBalance}
                  value={betAmount}
                  onChange={(e) => setBetAmount(Math.min(Number(e.target.value), currentBalance))}
                  className="bg-black/60 border-orange-500/60 text-white placeholder:text-gray-500 focus:border-orange-400 focus:ring-orange-400/30 font-mono text-sm backdrop-blur-sm"
                />
              </div>

              {/* Trading buttons */}
              {gameState === 'playing' && !prediction && (
                <div className="space-y-3">
                  <Button
                    onClick={predictHigher}
                    disabled={betAmount > currentBalance}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-4 px-6 rounded-none border border-green-400/60 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-500/30"
                  >
                    <span className="font-mono tracking-wider">ВИЩЕ 📈</span>
                  </Button>
                  <Button
                    onClick={predictLower}
                    disabled={betAmount > currentBalance}
                    className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white font-bold py-4 px-6 rounded-none border border-red-400/60 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-500/30"
                  >
                    <span className="font-mono tracking-wider">НИЖЧЕ 📉</span>
                  </Button>
                </div>
              )}

              {/* Waiting for result */}
              {gameState === 'playing' && prediction && (
                <div className="text-center">
                  <div className="text-orange-400 font-bold text-lg mb-2">
                    Очікування результату...
                  </div>
                  <div className="text-white text-sm">
                    Прогноз: {prediction === 'higher' ? 'ВИЩЕ' : 'НИЖЧЕ'}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Game controls */}
        {gameState === 'waiting' && (
          <div className="text-center">
            <Button
              onClick={startGame}
              className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold py-6 px-12 rounded-none border border-orange-400/60 transition-all duration-300 transform hover:scale-105 shadow-2xl shadow-orange-500/40 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <span className="font-mono tracking-wider text-xl relative z-10">ПОЧАТИ ТОРГІВЛЮ 📈</span>
            </Button>
          </div>
        )}

        {gameState === 'won' && (
          <Card className="bg-black/90 border border-green-500/40 shadow-2xl shadow-green-500/30 backdrop-blur-md">
            <CardHeader className="text-center">
              <CardTitle className="text-green-400 font-black text-3xl animate-pulse">
                🚀 МІЛЬЙОНЕР! 🚀
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <p className="text-white text-lg">
                Ти досягнув $1000! Ти справжній трейдер!
              </p>
              <p className="text-green-400 font-bold text-xl">
                Фінальний баланс: ${currentBalance.toFixed(2)}
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
                💀 БАНКРОТ! 💀
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <p className="text-white text-lg">
                Ти втратив всі гроші! Трейдинг - це не гра!
              </p>
              <p className="text-red-400 font-bold text-xl">
                Фінальний баланс: ${currentBalance.toFixed(2)}
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
      <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-r from-transparent via-orange-400 to-transparent animate-pulse"></div>
      
      {/* Enhanced corner decorations */}
      <div className="absolute top-4 left-4 w-12 h-12 border-l-4 border-t-4 border-orange-400 opacity-80 animate-pulse"></div>
      <div className="absolute top-4 right-4 w-12 h-12 border-r-4 border-t-4 border-red-400 opacity-80 animate-pulse animation-delay-1000"></div>
      <div className="absolute bottom-4 left-4 w-12 h-12 border-l-4 border-b-4 border-pink-400 opacity-80 animate-pulse animation-delay-2000"></div>
      <div className="absolute bottom-4 right-4 w-12 h-12 border-r-4 border-b-4 border-orange-400 opacity-80 animate-pulse animation-delay-3000"></div>
    </div>
  )
} 