'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from 'next/navigation'


export default function GreenLightGame() {
  const [gameState, setGameState] = useState<'waiting' | 'playing' | 'won' | 'lost'>('waiting')
  const [isGreenLight, setIsGreenLight] = useState(false)
  const [playerPosition, setPlayerPosition] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30)
  const [score, setScore] = useState(0)
  const [nickname, setNickname] = useState('')
  const [lightIntensity, setLightIntensity] = useState(0)

  const [lastMoveTime, setLastMoveTime] = useState(0)
  const router = useRouter()
  const gameInterval = useRef<NodeJS.Timeout | null>(null)
  const lightInterval = useRef<NodeJS.Timeout | null>(null)
  const intensityInterval = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem('nickname')
    if (saved) {
      setNickname(saved)
    }
  }, [router])

  const startGame = () => {
    setGameState('playing')
    setPlayerPosition(0)
    setTimeLeft(30)
    setScore(0)
    setLightIntensity(0)
    
    // Start the light switching with moderate random timing
    const switchLight = () => {
      setIsGreenLight(prev => !prev)
      // Schedule next switch with random timing between 1.5-3.5 seconds
      const nextDelay = 750 + Math.random() * 2000
      lightInterval.current = setTimeout(switchLight, nextDelay)
    }
    switchLight() // Start immediately
    
    // Start the timer
    gameInterval.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          endGame('lost')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    // Start light intensity animation
    intensityInterval.current = setInterval(() => {
      setLightIntensity(prev => (prev + 1) % 100)
    }, 50)
  }

  const endGame = (result: 'won' | 'lost') => {
    setGameState(result)
    if (lightInterval.current) clearTimeout(lightInterval.current)
    if (gameInterval.current) clearInterval(gameInterval.current)
    if (intensityInterval.current) clearInterval(intensityInterval.current)
  }

  const handleMove = () => {
    if (gameState !== 'playing') return
    
    const now = Date.now()
    const timeSinceLastMove = now - lastMoveTime
    
    // Limit movement to maximum +1 per 300ms
    if (timeSinceLastMove < 300) {
      return // Too soon to move again
    }
    
    if (isGreenLight) {
      // Correct move - advance player by 5% (faster movement)
      setPlayerPosition(prev => {
        const newPosition = prev + 5
        if (newPosition >= 100) {
          endGame('won')
          return 100
        }
        return newPosition
      })
      setScore(prev => prev + 5)
      setLastMoveTime(now)
    } else {
      // Wrong move - game over
      endGame('lost')
    }
  }



  const resetGame = () => {
    setGameState('waiting')
    setIsGreenLight(false)
    setPlayerPosition(0)
    setTimeLeft(30)
    setScore(0)
    setLightIntensity(0)
    setLastMoveTime(0)
  }

  const goToNextGame = () => {
    // Save progress and go to next game
    localStorage.setItem('gameProgress', '2')
    router.push('/game/elimination/')
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault()
        handleMove()
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [gameState, isGreenLight])

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Game background */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-800 to-black"></div>
      
      {/* Grid lines for track */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      {/* Game UI */}
      <div className="relative z-10 p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div className="text-white font-mono text-sm">
            <div>Гравець: <span className="text-cyan-400 font-bold">{nickname}</span></div>
            <div>Час: <span className="text-yellow-400 font-bold">{timeLeft}s</span></div>
          </div>
          <div className="text-white font-mono text-sm">
            <div>Позиція: <span className="text-green-400 font-bold">{playerPosition}%</span></div>
            <div>Рахунок: <span className="text-purple-400 font-bold">{score}</span></div>

          </div>
        </div>

        {/* Game title */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-black bg-gradient-to-r from-green-400 to-red-400 bg-clip-text text-transparent tracking-wider">
            🟢 ЗЕЛЕНЕ-СВІТЛО / ЧЕРВОНЕ-СВІТЛО 🔴
          </h1>
          <p className="text-gray-400 text-sm mt-2">
            Натискай "РУХ" тільки під час зеленого світла! Максимум 1 рух кожні 300ms. Швидкий рух - 5% за раз!
          </p>
        </div>

        {/* Enhanced Game area */}
        <div className="relative h-80 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 border-2 border-gray-600 rounded-none mb-8 overflow-hidden">
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `
                linear-gradient(45deg, transparent 40%, rgba(0, 255, 255, 0.1) 50%, transparent 60%),
                linear-gradient(-45deg, transparent 40%, rgba(255, 0, 255, 0.1) 50%, transparent 60%)
              `,
              backgroundSize: '30px 30px'
            }}></div>
          </div>

          {/* Enhanced Finish line with white/black flag */}
          <div className="absolute right-0 top-0 bottom-0 w-8 flex flex-col">
            {/* Flag pole */}
            <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-yellow-400 to-yellow-600"></div>
            
            {/* White/Black flag */}
            <div className="absolute right-1 top-4 w-6 h-8 flex flex-col">
              <div className="flex-1 bg-white border border-gray-300"></div>
              <div className="flex-1 bg-black border border-gray-700"></div>
            </div>
            
            {/* Flag glow effect */}
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-r from-transparent via-yellow-400/20 to-yellow-400/40 animate-pulse"></div>
          </div>
          
                    {/* Enhanced Player character with shadow and glow */}
          <div 
            className="absolute top-1/2 transform -translate-y-1/2 transition-all duration-500 ease-out"
            style={{ left: `${playerPosition}%` }}
          >
            <div className="relative">
              {/* Character shadow */}
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-2 bg-black/50 rounded-full blur-sm"></div>
              
              {/* Character avatar with enhanced styling */}
              <div className="w-16 h-16 bg-cover bg-center rounded-full border-4 border-white shadow-2xl relative overflow-hidden"
                   style={{
                     backgroundImage: 'url(https://i.pinimg.com/736x/fe/38/aa/fe38aac98a27218a3c1f3ab4cfe55d6a.jpg)',
                     backgroundSize: 'cover'
                   }}>
                {/* Character glow effect */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400/20 to-purple-400/20 animate-pulse"></div>
              </div>
              
              {/* Movement trail effect */}
              {gameState === 'playing' && (
                <div className="absolute top-1/2 left-0 transform -translate-y-1/2 w-8 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse"></div>
              )}
            </div>
          </div>

          {/* Enhanced Light indicator with better animations */}
          <div className="absolute top-6 left-6">
            <div className="relative">
              {/* Light background */}
              <div className="w-12 h-12 rounded-full border-3 border-white/50 bg-black/50 backdrop-blur-sm"></div>
              
              {/* Light indicator with enhanced glow */}
              <div className="absolute top-1 left-1 w-10 h-10 rounded-full border-2 border-white shadow-lg animate-pulse"
                   style={{
                     backgroundColor: isGreenLight ? '#10b981' : '#ef4444',
                     boxShadow: isGreenLight 
                       ? `0 0 30px #10b981, 0 0 60px #10b981, 0 0 90px #10b981` 
                       : `0 0 30px #ef4444, 0 0 60px #ef4444, 0 0 90px #ef4444`,
                     animation: isGreenLight ? 'pulse 1s infinite' : 'pulse 0.5s infinite'
                   }}>
              </div>
              
              {/* Light intensity ring */}
              <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-2 border-transparent"
                   style={{
                     borderTopColor: isGreenLight ? '#10b981' : '#ef4444',
                     transform: `rotate(${lightIntensity * 3.6}deg)`,
                     opacity: 0.7
                   }}>
              </div>
            </div>
          </div>

          {/* Progress markers */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 via-yellow-400 to-red-400 opacity-30"></div>
          
          {/* Distance markers */}
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="absolute top-0 bottom-0 w-px bg-cyan-400/30"
              style={{ left: `${(i + 1) * 10}%` }}
            />
          ))}
        </div>

        {/* Game controls */}
        {gameState === 'waiting' && (
          <div className="text-center">
            <Button
              onClick={startGame}
              className="bg-gradient-to-r from-green-600 to-cyan-600 hover:from-green-500 hover:to-cyan-500 text-white font-bold py-4 px-8 rounded-none border border-green-400/60 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-green-500/30"
            >
              <span className="font-mono tracking-wider text-lg">ПОЧАТИ ГРУ 🚀</span>
            </Button>
          </div>
        )}

        {gameState === 'playing' && (
          <div className="text-center space-y-4">
            <div className="text-white font-mono text-lg">
              {isGreenLight ? (
                <span className="text-green-400 font-bold">🟢 ЗЕЛЕНЕ СВІТЛО - РУХАЙСЯ!</span>
              ) : (
                <span className="text-red-400 font-bold">🔴 ЧЕРВОНЕ СВІТЛО - СТОЙ!</span>
              )}
            </div>
            <Button
              onClick={handleMove}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-4 px-8 rounded-none border border-blue-400/60 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-blue-500/30"
            >
              <span className="font-mono tracking-wider text-lg">РУХ (ПРОБІЛ)</span>
            </Button>
          </div>
        )}

        {gameState === 'won' && (
          <Card className="bg-black/90 border border-green-500/40 shadow-2xl shadow-green-500/30">
            <CardHeader className="text-center">
              <CardTitle className="text-green-400 font-black text-2xl">
                🎉 ПЕРЕМОГА! 🎉
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-white">
                Ти успішно пройшов перший раунд!
              </p>
              <p className="text-cyan-400 font-bold">
                Фінальний рахунок: {score}
              </p>
              <div className="flex space-x-2">
                <Button
                  onClick={resetGame}
                  variant="outline"
                  className="flex-1 border-cyan-500/60 text-cyan-400 hover:bg-cyan-500/20 font-mono text-xs uppercase tracking-wider rounded-none"
                >
                  Грати знову
                </Button>
                <Button
                  onClick={goToNextGame}
                  className="flex-1 bg-gradient-to-r from-green-600 to-cyan-600 hover:from-green-500 hover:to-cyan-500 text-white font-bold font-mono text-xs uppercase tracking-wider rounded-none border border-green-400/60"
                >
                  Наступна гра
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {gameState === 'lost' && (
          <Card className="bg-black/90 border border-red-500/40 shadow-2xl shadow-red-500/30">
            <CardHeader className="text-center">
              <CardTitle className="text-red-400 font-black text-2xl">
                💀 ГРА ЗАКІНЧЕНА 💀
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-white">
                Ти натиснув під час червоного світла!
              </p>
              <p className="text-red-400 font-bold">
                Дані знищені. Спробуй знову.
              </p>
              <Button
                onClick={resetGame}
                className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white font-bold py-3 px-6 rounded-none border border-red-400/60 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-red-500/30"
              >
                <span className="font-mono tracking-wider">СПРОБУВАТИ ЗНОВУ</span>
              </Button>
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