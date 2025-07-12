'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from 'next/navigation'


interface Tile {
  id: number
  isSolid: boolean
  isRevealed: boolean
  isBroken: boolean
}

export default function GlassBridgeGame() {
  const [gameState, setGameState] = useState<'waiting' | 'playing' | 'won' | 'lost'>('waiting')
  const [currentRow, setCurrentRow] = useState(0)
  const [playerPosition, setPlayerPosition] = useState({ row: 4, col: 0 })
  const [tiles, setTiles] = useState<Tile[][]>([])
  const [nickname, setNickname] = useState('')
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)
  const [falling, setFalling] = useState(false)
  const router = useRouter()
  const gameInterval = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem('nickname')
    if (saved) {
      setNickname(saved)
    }
  }, [])

  const initializeTiles = () => {
    const newTiles: Tile[][] = []
    for (let row = 0; row < 5; row++) {
      const rowTiles: Tile[] = []
      for (let col = 0; col < 2; col++) {
        rowTiles.push({
          id: row * 2 + col,
          isSolid: Math.random() < 0.5, // Random solid tile
          isRevealed: false,
          isBroken: false
        })
      }
      newTiles.push(rowTiles)
    }
    setTiles(newTiles)
  }

  const startGame = () => {
    setGameState('playing')
    setCurrentRow(0)
    setPlayerPosition({ row: 4, col: 0 })
    setScore(0)
    setTimeLeft(60)
    setFalling(false)
    initializeTiles()
    
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

  const handleTileClick = (row: number, col: number) => {
    if (gameState !== 'playing' || row !== currentRow || falling) return

    const tile = tiles[row][col]
    const newTiles = [...tiles]
    
    if (true || tile.isSolid) {
      // Correct choice - move to next row
      newTiles[row][col].isRevealed = true
      setTiles(newTiles)
      setScore(prev => prev + 20)
      
      if (row === 4) {
        // Reached the top - won!
        setTimeout(() => {
          endGame('won')
        }, 500)
      } else {
        // Move to next row
        setTimeout(() => {
          setCurrentRow(prev => prev + 1)
          setPlayerPosition({ row: 3 - row, col: col })
        }, 300)
      }
    } else {
      // Wrong choice - tile breaks and player falls
      newTiles[row][col].isBroken = true
      setTiles(newTiles)
      setFalling(true)
      
      setTimeout(() => {
        endGame('lost')
      }, 1000)
    }
  }

  const resetGame = () => {
    setGameState('waiting')
    setCurrentRow(0)
    setPlayerPosition({ row: 4, col: 0 })
    setScore(0)
    setTimeLeft(60)
    setFalling(false)
    setTiles([])
  }

  const goToNextGame = () => {
    localStorage.setItem('gameProgress', '3')
    router.push('/birth-day-quest/game/elimination/')
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Enhanced game background with glass effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900 via-indigo-900 to-purple-900"></div>
      
      {/* Glass particles effect */}
      <div className="absolute inset-0">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full opacity-40 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${8 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>
      
      {/* Grid lines for glass effect */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      {/* Game UI */}
      <div className="relative z-10 p-4">
        {/* Enhanced Header */}
        <div className="flex justify-between items-center mb-6 bg-black/50 backdrop-blur-sm p-4 rounded-none border border-cyan-500/30">
          <div className="text-white font-mono text-sm space-y-1">
            <div className="flex items-center">
              <span className="text-cyan-400 mr-2">👤</span>
              <span>Гравець: <span className="text-cyan-400 font-bold">{nickname}</span></span>
            </div>
            <div className="flex items-center">
              <span className="text-yellow-400 mr-2">⏱️</span>
              <span>Час: <span className="text-yellow-400 font-bold">{timeLeft}s</span></span>
            </div>
          </div>
          <div className="text-white font-mono text-sm space-y-1">
            <div className="flex items-center">
              <span className="text-blue-400 mr-2">🏗️</span>
              <span>Рівень: <span className="text-blue-400 font-bold">{currentRow + 1}/5</span></span>
            </div>
            <div className="flex items-center">
              <span className="text-purple-400 mr-2">🏆</span>
              <span>Рахунок: <span className="text-purple-400 font-bold">{score}</span></span>
            </div>
          </div>
        </div>

        {/* Game title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent tracking-wider mb-2">
            🏗️ СКЛЯНИЙ МІСТ 🏗️
          </h1>
          <p className="text-gray-400 text-sm">
            Виберіть правильну плитку, щоб дійти до фінішу!
          </p>
        </div>

        {/* Glass Bridge Game Area */}
        <div className="relative h-96 bg-gradient-to-b from-blue-900/50 via-indigo-900/50 to-purple-900/50 border-2 border-cyan-500/40 rounded-none mb-8 overflow-hidden backdrop-blur-sm">
          {/* Background glass effect */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `
                linear-gradient(45deg, transparent 40%, rgba(0, 255, 255, 0.1) 50%, transparent 60%),
                linear-gradient(-45deg, transparent 40%, rgba(255, 0, 255, 0.1) 50%, transparent 60%)
              `,
              backgroundSize: '50px 50px'
            }}></div>
          </div>

          {/* Finish line at top */}
          <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-60 animate-pulse"></div>
          
          {/* Glass tiles */}
          <div className="absolute inset-0 flex flex-col justify-between p-8">
            {tiles.map((row, rowIndex) => (
              <div key={rowIndex} className="flex justify-center space-x-8">
                {row.map((tile, colIndex) => (
                  <div
                    key={tile.id}
                    onClick={() => handleTileClick(rowIndex, colIndex)}
                    className={`w-20 h-12 cursor-pointer transition-all duration-300 transform hover:scale-110 ${
                      rowIndex === currentRow 
                        ? 'border-2 border-cyan-400 shadow-lg shadow-cyan-400/50' 
                        : 'border border-gray-500/30'
                    } ${
                      tile.isRevealed 
                        ? 'bg-green-500/80 border-green-400' 
                        : tile.isBroken 
                        ? 'bg-red-500/80 border-red-400' 
                        : 'bg-white/20 backdrop-blur-sm border-white/30'
                    } ${
                      falling && tile.isBroken ? 'animate-bounce' : ''
                    }`}
                    style={{
                      boxShadow: rowIndex === currentRow 
                        ? '0 0 20px rgba(0, 255, 255, 0.5)' 
                        : tile.isRevealed 
                        ? '0 0 15px rgba(34, 197, 94, 0.5)' 
                        : tile.isBroken 
                        ? '0 0 15px rgba(239, 68, 68, 0.5)' 
                        : '0 0 10px rgba(255, 255, 255, 0.2)'
                    }}
                  >
                    {/* Tile content */}
                    <div className="w-full h-full flex items-center justify-center">
                      {tile.isRevealed && (
                        <span className="text-green-400 text-2xl">✓</span>
                      )}
                      {tile.isBroken && (
                        <span className="text-red-400 text-2xl">✗</span>
                      )}
                      {!tile.isRevealed && !tile.isBroken && rowIndex === currentRow && (
                        <span className="text-cyan-400 text-lg font-bold">?</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Player character */}
          <div 
            className={`absolute transition-all duration-500 ease-out ${
              falling ? 'animate-bounce' : ''
            }`}
            style={{ 
              left: `${playerPosition.col === 0 ? '35%' : '65%'}`, 
              bottom: `${(playerPosition.row + 1) * 20}%` 
            }}
          >
            <div className="relative">
              {/* Character shadow */}
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-2 bg-black/50 rounded-full blur-sm"></div>
              
              {/* Character avatar */}
              <div className="w-12 h-12 bg-cover bg-center rounded-full border-3 border-white shadow-2xl relative overflow-hidden"
                   style={{
                     backgroundImage: 'url(https://i.pinimg.com/736x/fe/38/aa/fe38aac98a27218a3c1f3ab4cfe55d6a.jpg)',
                     backgroundSize: 'cover'
                   }}>
                {/* Character glow effect */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400/30 to-blue-400/30 animate-pulse"></div>
              </div>
              
              {/* Movement trail effect */}
              {gameState === 'playing' && !falling && (
                <div className="absolute top-1/2 left-0 transform -translate-y-1/2 w-6 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse"></div>
              )}
            </div>
          </div>

          {/* Glass shatter effect for broken tiles */}
          {tiles.some(row => row.some(tile => tile.isBroken)) && (
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-white rounded-full animate-ping"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Game controls */}
        {gameState === 'waiting' && (
          <div className="text-center">
            <Button
              onClick={startGame}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-6 px-12 rounded-none border border-cyan-400/60 transition-all duration-300 transform hover:scale-105 shadow-2xl shadow-cyan-500/40 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <span className="font-mono tracking-wider text-xl relative z-10">ПОЧАТИ ГРУ 🚀</span>
            </Button>
          </div>
        )}

        {gameState === 'playing' && (
          <div className="text-center space-y-4">
            <div className="text-white font-mono text-lg p-4 bg-black/50 backdrop-blur-sm border border-cyan-500/30 rounded-none">
              <span className="text-cyan-400 font-bold">
                Виберіть правильну плитку на рівні {currentRow + 1}!
              </span>
            </div>
            <p className="text-gray-400 text-sm">
              Ліва або права плитка? Тільки одна з них міцна!
            </p>
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
                Ти успішно пройшов скляний міст!
              </p>
              <p className="text-cyan-400 font-bold text-xl">
                Фінальний рахунок: {score}
              </p>
              <div className="flex space-x-4">
                <Button
                  onClick={resetGame}
                  variant="outline"
                  className="flex-1 border-cyan-500/60 text-cyan-400 hover:bg-cyan-500/20 font-mono text-sm uppercase tracking-wider rounded-none py-4"
                >
                  Грати знову
                </Button>
                <Button
                  onClick={goToNextGame}
                  className="flex-1 bg-gradient-to-r from-green-600 to-cyan-600 hover:from-green-500 hover:to-cyan-500 text-white font-bold font-mono text-sm uppercase tracking-wider rounded-none border border-green-400/60 py-4"
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
                💀 ГРА ЗАКІНЧЕНА 💀
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <p className="text-white text-lg">
                Плитка розбилася! Ти впав у прірву!
              </p>
              <p className="text-red-400 font-bold text-xl">
                Спробуй знову, будь обережніший.
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
      <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse"></div>
      
      {/* Enhanced corner decorations */}
      <div className="absolute top-4 left-4 w-12 h-12 border-l-4 border-t-4 border-cyan-400 opacity-80 animate-pulse"></div>
      <div className="absolute top-4 right-4 w-12 h-12 border-r-4 border-t-4 border-blue-400 opacity-80 animate-pulse animation-delay-1000"></div>
      <div className="absolute bottom-4 left-4 w-12 h-12 border-l-4 border-b-4 border-purple-400 opacity-80 animate-pulse animation-delay-2000"></div>
      <div className="absolute bottom-4 right-4 w-12 h-12 border-r-4 border-b-4 border-cyan-400 opacity-80 animate-pulse animation-delay-3000"></div>
    </div>
  )
} 