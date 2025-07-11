'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'

interface ImagePiece {
  id: number
  revealed: boolean
}

export default function IllusionGame() {
  const [gameState, setGameState] = useState<'waiting' | 'playing' | 'won' | 'lost'>('waiting')
  const [answer, setAnswer] = useState('')
  const [isClient, setIsClient] = useState(false)
  const [particles, setParticles] = useState<Array<{id: number, left: number, top: number, delay: number, duration: number}>>([])
  const [imagePieces, setImagePieces] = useState<ImagePiece[]>([])
  const [revealedPieces, setRevealedPieces] = useState(0)
  const [showWrongAnswerPopup, setShowWrongAnswerPopup] = useState(false)

  const [nickname, setNickname] = useState('')
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(120)
  const router = useRouter()
  const gameInterval = useRef<NodeJS.Timeout | null>(null)

  // Correct answer (you can change this)
  const correctAnswers = ['парасолька', 'зонт', 'амбрелла', 'зонтик', 'зонтік', 'парасоль']

  useEffect(() => {
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
    setAnswer('')
    setScore(0)
    setTimeLeft(120)
    setRevealedPieces(0)
    // Initialize image pieces
    const initialPieces = Array.from({ length: 9 }, (_, i) => ({
      id: i,
      revealed: false
    }))
    setImagePieces(initialPieces)
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

  const handlePieceClick = (pieceId: number) => {
    if (gameState !== 'playing') return

    setImagePieces(prevPieces =>
      prevPieces.map(piece =>
        piece.id === pieceId && !piece.revealed
          ? { ...piece, revealed: true }
          : piece
      )
    )

    setRevealedPieces(prev => {
      const newCount = prev + 1
      if (newCount >= 9) {
        // All pieces revealed, give bonus points
        setScore(prev => prev + 50)
      }
      return newCount
    })

    // Add some points for each piece revealed
    setScore(prev => prev + 10)
  }

  // Helper for background-position in percentage for 3x3 grid
  const getBackgroundPosition = (pieceId: number) => {
    const row = Math.floor(pieceId / 3)
    const col = pieceId % 3
    // For 3x3 grid, use 0%, 50%, 100%
    const xPercent = col * 50
    const yPercent = row * 50
    return `${xPercent}% ${yPercent}%`
  }

  const handleSubmitAnswer = () => {
    if (correctAnswers.includes(answer.toLowerCase().trim())) {
      setScore(prev => prev + 100)
      setTimeout(() => {
        endGame('won')
      }, 1000)
    } else {
      setScore(Math.max(0, score - 10))
      setAnswer('')
      setShowWrongAnswerPopup(true)
      // Hide popup after 3 seconds
      setTimeout(() => {
        setShowWrongAnswerPopup(false)
      }, 3000)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmitAnswer()
    }
  }

  const resetGame = () => {
    setGameState('waiting')
    setAnswer('')
    setScore(0)
    setTimeLeft(120)
    setRevealedPieces(0)
    setImagePieces([])
  }

  const goToNextGame = () => {
    localStorage.setItem('gameProgress', '3')
    router.push('/game/memories') // Go to memories game
  }

  if (!isClient) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-pink-400 font-mono text-xl">Завантаження...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Enhanced game background with illusion effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900 via-pink-900 to-indigo-900"></div>
      {/* Floating illusion particles */}
      <div className="absolute inset-0">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-1 h-1 bg-pink-400 rounded-full opacity-30 animate-float"
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`
            }}
          />
        ))}
      </div>
      {/* Grid lines for illusion effect */}
      <div className="absolute inset-0 opacity-15">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(255, 0, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 0, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      {/* Game UI */}
      <div className="relative z-10 p-4">
        {/* Enhanced Header */}
        <div className="flex justify-between items-center mb-6 bg-black/50 backdrop-blur-sm p-4 rounded-none border border-pink-500/30">
          <div className="text-white font-mono text-sm space-y-1">
            <div className="flex items-center">
              <span className="text-pink-400 mr-2">👤</span>
              <span>Гравець: <span className="text-pink-400 font-bold">{nickname}</span></span>
            </div>
            <div className="flex items-center">
              <span className="text-yellow-400 mr-2">⏱️</span>
              <span>Час: <span className="text-yellow-400 font-bold">{timeLeft}s</span></span>
            </div>
          </div>
          <div className="text-white font-mono text-sm space-y-1">
            <div className="flex items-center">
              <span className="text-purple-400 mr-2">🧩</span>
              <span>Відкрито: <span className="text-purple-400 font-bold">{revealedPieces}/9</span></span>
            </div>
            <div className="flex items-center">
              <span className="text-cyan-400 mr-2">🏆</span>
              <span>Рахунок: <span className="text-cyan-400 font-bold">{score}</span></span>
            </div>
          </div>
        </div>

        {/* Game title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent tracking-wider mb-2">
            🎭 Інтуїція 🎭
          </h1>
          <p className="text-gray-400 text-sm">
            Гра на інтуїцію. Вгадай що загадав фронтмен.<br />
            Нехай ця картинка буде тобі підказкою.
          </p>
        </div>

        {/* Illusion Game Area */}
        <div className="flex flex-col items-center space-y-6 mb-8">
          {/* Image container with beautiful styling */}
          <div className="relative bg-gradient-to-br from-pink-900/30 via-purple-900/30 to-indigo-900/30 border-2 border-pink-500/40 rounded-none p-4 backdrop-blur-sm">
            <div className="relative w-[400px] h-[400px]">
              {/* Background QR code image */}
              <img 
                src="https://i.pinimg.com/736x/8f/88/00/8f8800361c01d5e5666d5f35a4e13370.jpg"
                alt="QR Code"
                className="absolute inset-0 w-full h-full object-cover"
                style={{
                  opacity: revealedPieces > 0 ? 1 : 0,
                  transition: 'opacity 0.5s ease-in-out'
                }}
              />
              {/* Image pieces container */}
              <div className="absolute inset-0 flex flex-wrap">
                {imagePieces.map((piece) => (
                  <div
                    key={piece.id}
                    className="w-1/3 h-1/3 overflow-hidden cursor-pointer transition-all duration-500 ease-out relative"
                    onClick={() => handlePieceClick(piece.id)}
                    style={{
                      opacity: piece.revealed ? 0 : 1,
                      transition: 'opacity 0.7s ease-out'
                    }}
                  >
                    {/* Use div with background-image for precise control */}
                    <div
                      className="w-full h-full"
                      style={{
                        backgroundImage: "url('https://i.pinimg.com/736x/89/be/c4/89bec41bd4ca1b3cb332f3f120422136.jpg')",
                        backgroundSize: '300% 300%',
                        backgroundPosition: getBackgroundPosition(piece.id),
                        backgroundRepeat: 'no-repeat'
                      }}
                    />
                    {/* Invisible tiles - no borders or numbers */}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Answer input section - always visible during game */}
          {gameState === 'playing' && (
            <div className="w-full max-w-md space-y-4">
              <div className="space-y-2">
                <Label htmlFor="answer" className="text-pink-400 font-bold text-sm uppercase tracking-wider">
                  Введіть відповідь:
                </Label>
                <Input
                  id="answer"
                  type="text"
                  placeholder="Введіть текст..."
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="bg-black/60 border-pink-500/60 text-white placeholder:text-gray-500 focus:border-pink-400 focus:ring-pink-400/30 font-mono text-sm backdrop-blur-sm"
                />
              </div>
              <Button
                onClick={handleSubmitAnswer}
                disabled={!answer.trim()}
                className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold py-3 px-6 rounded-none border border-pink-400/60 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-pink-500/30"
              >
                <span className="font-mono tracking-wider">ПІДТВЕРДИТИ ВІДПОВІДЬ</span>
              </Button>
            </div>
          )}
        </div>

        {/* Game controls */}
        {gameState === 'waiting' && (
          <div className="text-center">
            <Button
              onClick={startGame}
              className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold py-6 px-12 rounded-none border border-pink-400/60 transition-all duration-300 transform hover:scale-105 shadow-2xl shadow-pink-500/40 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <span className="font-mono tracking-wider text-xl relative z-10">ПОЧАТИ ГРУ 🚀</span>
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
                Ти успішно розгадав ілюзію!
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
                Час вийшов! Ти не встиг розгадати ілюзію!
              </p>
              <p className="text-red-400 font-bold text-xl">
                Спробуй знову, будь швидшим.
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

      {/* Wrong Answer Popup */}
      {showWrongAnswerPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
          <Card className="bg-black/95 border border-red-500/60 shadow-2xl shadow-red-500/40 backdrop-blur-md relative z-10 animate-in slide-in-from-bottom-4 duration-300">
            <CardHeader className="text-center">
              <CardTitle className="text-red-400 font-black text-2xl animate-pulse">
                ❌ НЕПРАВИЛЬНА ВІДПОВІДЬ ❌
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-white text-lg">
                Спробуй ще раз! Подумай уважніше.
              </p>
              <p className="text-red-400 font-bold text-sm">
                -10 очок за неправильну відповідь
              </p>
              <Button
                onClick={() => setShowWrongAnswerPopup(false)}
                className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white font-bold py-3 px-6 rounded-none border border-red-400/60 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-red-500/30"
              >
                <span className="font-mono tracking-wider">ЗРОЗУМІЛО</span>
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Enhanced bottom scan line effect */}
      <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-r from-transparent via-pink-400 to-transparent animate-pulse"></div>
      {/* Enhanced corner decorations */}
      <div className="absolute top-4 left-4 w-12 h-12 border-l-4 border-t-4 border-pink-400 opacity-80 animate-pulse"></div>
      <div className="absolute top-4 right-4 w-12 h-12 border-r-4 border-t-4 border-purple-400 opacity-80 animate-pulse animation-delay-1000"></div>
      <div className="absolute bottom-4 left-4 w-12 h-12 border-l-4 border-b-4 border-indigo-400 opacity-80 animate-pulse animation-delay-2000"></div>
      <div className="absolute bottom-4 right-4 w-12 h-12 border-r-4 border-b-4 border-pink-400 opacity-80 animate-pulse animation-delay-3000"></div>
    </div>
  )
}