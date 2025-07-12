'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface Position {
  x: number
  y: number
}

interface WallMarker {
  x: number
  y: number
  emoji: string
}

export default function MazeGame() {
  const [gameState, setGameState] = useState<'waiting' | 'playing' | 'won' | 'lost'>('waiting')
  const [playerPosition, setPlayerPosition] = useState<Position>({ x: 1, y: 1 })
  const [exitPosition] = useState<Position>({ x: 10, y: 10 })
  const [nickname, setNickname] = useState('')
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(25)

  const [wallMarkers, setWallMarkers] = useState<WallMarker[]>([])
  const router = useRouter()
  const gameInterval = useRef<NodeJS.Timeout | null>(null)
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null)

  // Емодзі для позначення стін
  const wallEmojis = ['💔', '🦴', '🦷', '💥', '💀', '☠️']

  // Складніший лабіринт 12x12: 0 = прохід, 1 = стіна (невидима)
  const maze = [
    [1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,1,0,0,0,0,0,0,1],
    [1,0,1,0,1,0,1,1,1,1,0,1],
    [1,1,1,0,0,0,0,0,0,1,0,1],
    [1,0,1,1,1,1,1,1,0,1,1,1],
    [1,0,0,0,0,0,0,0,0,1,0,1],
    [1,0,1,0,1,1,1,1,1,1,0,1],
    [1,0,0,1,0,0,0,0,0,0,0,1],
    [1,0,1,0,0,1,0,1,1,1,0,1],
    [1,0,0,0,1,0,0,0,0,1,1,1],
    [1,0,1,0,1,0,1,1,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1]
  ]

  useEffect(() => {
    const saved = localStorage.getItem('nickname')
    if (saved) {
      setNickname(saved)
    }
  }, [])

  const startGame = () => {
    setGameState('playing')
    setPlayerPosition({ x: 1, y: 1 })
    setScore(0)
    setTimeLeft(20)
    setTouchStart(null)
    setWallMarkers([]) // Очищаємо маркери при початку нової гри
    
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
  }

  const endGame = (result: 'won' | 'lost') => {
    setGameState(result)
    if (gameInterval.current) clearInterval(gameInterval.current)
  }

  const resetGame = () => {
    setGameState('waiting')
    setPlayerPosition({ x: 1, y: 1 })
    setScore(0)
    setTimeLeft(20)
    setTouchStart(null)
    // НЕ очищаємо маркери - зберігаємо їх для наступної спроби
    

  }

  const goToNextGame = () => {
    // Add final winnings to total
    const currentWinnings = parseInt(localStorage.getItem('totalWinnings') || '0')
    const newWinnings = currentWinnings + score
    localStorage.setItem('totalWinnings', newWinnings.toString())
    
    // Mark game as completed
    localStorage.setItem('gameProgress', '8')
    router.push('/birth-day-quest/game/elimination/')
  }

  // Функції керування свайпами та клавішами
  const movePlayer = (direction: { x: number; y: number }) => {
    if (gameState !== 'playing') return

    setPlayerPosition(prev => {
      const newX = prev.x + direction.x
      const newY = prev.y + direction.y

      // Перевірка стін
      if (newX < 0 || newX >= maze[0].length || newY < 0 || newY >= maze.length) {
        // Додаємо маркер стіни
        const randomEmoji = wallEmojis[Math.floor(Math.random() * wallEmojis.length)]
        setWallMarkers(prevMarkers => [...prevMarkers, { x: newX, y: newY, emoji: randomEmoji }])
        // Не закінчуємо гру, просто повертаємося на попередню позицію
        return prev
      }

      if (maze[newY][newX] === 1) {
        // Додаємо маркер стіни
        const randomEmoji = wallEmojis[Math.floor(Math.random() * wallEmojis.length)]
        setWallMarkers(prevMarkers => [...prevMarkers, { x: newX, y: newY, emoji: randomEmoji }])
        // Не закінчуємо гру, просто повертаємося на попередню позицію
        return prev
      }

      // Перевірка виходу
      if (newX === exitPosition.x && newY === exitPosition.y) {
        setScore(500)
        setTimeout(() => {
          endGame('won')
        }, 500)
        return prev
      }

      setScore(prev => prev + 1)
      return { x: newX, y: newY }
    })
  }

  // Обробка клавіш WASD
  const handleKeyDown = (e: KeyboardEvent) => {
    if (gameState !== 'playing') return

    switch (e.key.toLowerCase()) {
      case 'w':
      case 'arrowup':
        movePlayer({ x: 0, y: -1 })
        break
      case 's':
      case 'arrowdown':
        movePlayer({ x: 0, y: 1 })
        break
      case 'a':
      case 'arrowleft':
        movePlayer({ x: -1, y: 0 })
        break
      case 'd':
      case 'arrowright':
        movePlayer({ x: 1, y: 0 })
        break
    }
  }

  // Обробка свайпів
  const handleTouchStart = (e: React.TouchEvent) => {
    if (gameState !== 'playing') return
    const touch = e.touches[0]
    setTouchStart({ x: touch.clientX, y: touch.clientY })
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (gameState !== 'playing' || !touchStart) return
    
    const touch = e.changedTouches[0]
    const deltaX = touch.clientX - touchStart.x
    const deltaY = touch.clientY - touchStart.y
    const minSwipeDistance = 30

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Горизонтальний свайп
      if (Math.abs(deltaX) > minSwipeDistance) {
        movePlayer({ x: deltaX > 0 ? 1 : -1, y: 0 })
      }
    } else {
      // Вертикальний свайп
      if (Math.abs(deltaY) > minSwipeDistance) {
        movePlayer({ x: 0, y: deltaY > 0 ? 1 : -1 })
      }
    }

    setTouchStart(null)
  }

  // Обробка клавіш
  useEffect(() => {
    if (gameState === 'playing') {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [gameState])

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Cyberpunk background with neon grid */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-purple-900 to-cyan-900"></div>
      
      {/* Animated cyberpunk grid */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(0, 255, 255, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 255, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '30px 30px',
          animation: 'gridMove 20s linear infinite'
        }}></div>
      </div>

      {/* Floating holographic particles */}
      <div className="absolute inset-0">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full opacity-60 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
              boxShadow: '0 0 10px rgba(0, 255, 255, 0.8)'
            }}
          />
        ))}
      </div>

      {/* Scanning lines effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse"></div>
        <div className="absolute top-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent animate-pulse animation-delay-1000"></div>
        <div className="absolute top-2/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-pink-400 to-transparent animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-yellow-400 to-transparent animate-pulse animation-delay-3000"></div>
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
              <span>Час: <span className="text-yellow-400 font-bold">{timeLeft}s</span></span>
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
          <h1 className="text-4xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text tracking-wider mb-2 relative">
            <div className="absolute -inset-2 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 rounded-lg blur opacity-25 animate-pulse"></div>
            <span className="relative">🧭  НЕВИДИМИЙ ЛАБІРИНТ 🧭</span>
          </h1>
          <p className="text-cyan-400 text-sm font-mono tracking-wider">
            ВИКОРИСТОВУЙ WASD АБО СВАЙПИ, ЩОБ ДІЙТИ ДО ВИХОДУ
          </p>
                                <p className="text-gray-400 text-xs mt-2">
            🕵️ НЕВИДИМИЙ ЛАБІРИНТ! Стіни з&apos;являються тільки після зіткнення з ними.
          </p>
          <p className="text-gray-400 text-xs">
            Емодзі показують де є стіни. Поразка тільки при вичерпанні часу!
          </p>
        </div>

        {/* Cyberpunk Maze Game Area */}
        <div className="flex justify-center mb-8">
          <div 
            className="relative bg-gradient-to-br from-slate-900/50 via-purple-900/30 to-cyan-900/30 border-2 border-cyan-500/60 rounded-none p-4 backdrop-blur-sm shadow-2xl shadow-cyan-500/30"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Holographic border effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 rounded-none opacity-30 animate-pulse"></div>
            
            <div className="grid grid-cols-12 gap-0 relative z-10">
              {maze.map((row, y) =>
                row.map((cell, x) => {
                  // Перевіряємо чи є маркер стіни на цій позиції
                  const wallMarker = wallMarkers.find(marker => marker.x === x && marker.y === y)
                  
                  return (
                    <div
                      key={`${x}-${y}`}
                      className={`w-8 h-8 border border-cyan-500/30 transition-all duration-200 ${
                        wallMarker
                          ? 'bg-gradient-to-br from-red-800 to-pink-900 border-red-500/60 shadow-inner shadow-red-500/50' 
                          : x === exitPosition.x && y === exitPosition.y
                          ? 'bg-gradient-to-br from-green-500/80 to-emerald-500/80 border-green-400/80 animate-pulse shadow-lg shadow-green-500/50'
                          : 'bg-transparent hover:bg-cyan-500/10'
                      }`}
                    >
                      {x === playerPosition.x && y === playerPosition.y && (
                        <div className="w-full h-full bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full animate-pulse flex items-center justify-center shadow-lg shadow-cyan-500/50">
                          <span className="text-xs text-white font-bold">🤖</span>
                        </div>
                      )}
                      {x === exitPosition.x && y === exitPosition.y && !(x === playerPosition.x && y === playerPosition.y) && (
                        <div className="w-full h-full bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/50">
                          <span className="text-xs text-white font-bold">🌐</span>
                        </div>
                      )}
                      {wallMarker && !(x === playerPosition.x && y === playerPosition.y) && !(x === exitPosition.x && y === exitPosition.y) && (
                        <div className="w-full h-full flex items-center justify-center text-lg animate-pulse">
                          <span>{wallMarker.emoji}</span>
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>

        {/* Controls Instructions */}
        {gameState === 'playing' && (
          <div className="flex justify-center mb-8">
            <div className="text-center">
              <div className="p-4 bg-gradient-to-br from-slate-900/50 to-purple-900/30 border-2 border-cyan-500/60 rounded-none backdrop-blur-sm shadow-2xl shadow-cyan-500/30">
                <p className="text-cyan-400 text-sm font-mono tracking-wider mb-2">
                  КЕРУВАННЯ
                </p>
                <div className="grid grid-cols-2 gap-4 text-xs text-gray-300">
                  <div>
                    <p className="text-cyan-400 font-bold">КЛАВІАТУРА:</p>
                    <p>WASD або стрілки</p>
                  </div>
                  <div>
                    <p className="text-purple-400 font-bold">СВАЙПИ:</p>
                    <p>Проведіть пальцем</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Game Controls */}
        <div className="flex justify-center space-x-4">
          {gameState === 'waiting' && (
            <Button
              onClick={startGame}
              className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-bold py-3 px-8 rounded-none border border-cyan-400/60 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-cyan-500/30 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <span className="font-mono tracking-wider relative z-10">ПОЧАТИ ГРУ 🚀</span>
            </Button>
          )}

          {gameState === 'won' && (
            <div className="text-center space-y-4">
              <div className="p-4 bg-gradient-to-r from-green-600/30 to-cyan-600/30 rounded-none border border-green-400/40 backdrop-blur-sm relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-400/10 to-transparent animate-pulse"></div>
                <p className="text-white font-bold text-lg relative z-10">
                  🎉 Перемога! Ти знайшов вихід! 🎉
                </p>
                <p className="text-green-400 text-sm mt-2 relative z-10 font-mono">
                  Рахунок: {score}
                </p>
              </div>
              <Button
                onClick={goToNextGame}
                className="bg-gradient-to-r from-green-600 to-cyan-600 hover:from-green-500 hover:to-cyan-500 text-white font-bold py-3 px-8 rounded-none border border-green-400/60 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-green-500/30 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <span className="font-mono tracking-wider relative z-10">ДАЛІ ➡️</span>
              </Button>
            </div>
          )}

          {gameState === 'lost' && (
            <div className="text-center space-y-4">
              <div className="p-4 bg-gradient-to-r from-red-600/30 to-pink-600/30 rounded-none border border-red-400/40 backdrop-blur-sm relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-400/10 to-transparent animate-pulse"></div>
                <p className="text-white font-bold text-lg relative z-10">
                  ⏰ Час вичерпано! Ти не встиг знайти вихід! ⏰
                </p>
                <p className="text-red-400 text-sm mt-2 relative z-10 font-mono">
                  Рахунок: {score}
                </p>
              </div>
              <Button
                onClick={resetGame}
                className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white font-bold py-3 px-8 rounded-none border border-red-400/60 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-red-500/30 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <span className="font-mono tracking-wider relative z-10">🔄 СПРОБУВАТИ ЗНОВУ</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced bottom scan line effect */}
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-transparent via-purple-400 to-transparent animate-pulse"></div>
      
      {/* Corner decorations */}
      <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-purple-400 opacity-60"></div>
      <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-pink-400 opacity-60"></div>
      <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-indigo-400 opacity-60"></div>
      <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-purple-400 opacity-60"></div>
    </div>
  )
} 