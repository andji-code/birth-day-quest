'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'
import { checkGameOver, loseLife, getBaseLives, getDisplayLives } from '@/lib/lives'

export default function MemoriesGame() {
  const [gameState, setGameState] = useState<'waiting' | 'playing' | 'won' | 'lost'>('waiting')
  const [answer, setAnswer] = useState('')
  const [isClient, setIsClient] = useState(false)
  const [particles, setParticles] = useState<Array<{id: number, left: number, top: number, delay: number, duration: number}>>([])
  const [showWrongAnswerPopup, setShowWrongAnswerPopup] = useState(false)

  const [nickname, setNickname] = useState('')
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)
  const [lives, setLives] = useState(3)
  const gameInterval = useRef<NodeJS.Timeout | null>(null)
  const router = useRouter()

  // Correct answers for memory test
  const correctAnswers = ['курка', 'петух', 'скаймаг', 'skywrath mage', 'skywrath']

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
    
    // Load player lives (base lives only, bonus HP is shown separately)
    setLives(getBaseLives(1)) // Player ID 1 for Валентин
    
    // Generate particles on client side only
    const generatedParticles = Array.from({ length: 20 }, (_, i) => ({
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
    setTimeLeft(60)
    
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
    
    if (result === 'lost') {
      const gameOver = loseLife(1, 'memories')
      if (gameOver) {
        router.push('/')
        return
      }
      // Update lives state with base lives only
      setLives(getBaseLives(1))
    }
  }

  const handleSubmitAnswer = () => {
    if (correctAnswers.some(correct => answer.toLowerCase().trim().startsWith(correct))) {
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
    setTimeLeft(60)
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
      {/* Enhanced game background with memory effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900 via-indigo-900 to-purple-900"></div>
      
      {/* Floating memory particles */}
      <div className="absolute inset-0">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-1 h-1 bg-blue-400 rounded-full opacity-30 animate-float"
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`
            }}
          />
        ))}
      </div>
      
      {/* Memory grid lines */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(0, 150, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 150, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      {/* Game UI */}
      <div className="relative z-10 p-4">
        {/* Enhanced Header */}
        <div className="flex justify-between items-center mb-6 bg-black/50 backdrop-blur-sm p-4 rounded-none border border-blue-500/30">
          <div className="text-white font-mono text-sm space-y-1">
            <div className="flex items-center">
              <span className="text-blue-400 mr-2">👤</span>
              <span>Гравець: <span className="text-blue-400 font-bold">{nickname}</span></span>
            </div>
            <div className="flex items-center">
              <span className="text-yellow-400 mr-2">⏱️</span>
              <span>Час: <span className="text-yellow-400 font-bold">{timeLeft}s</span></span>
            </div>
          </div>
          <div className="text-white font-mono text-sm space-y-1">
            <div className="flex items-center">
              <span className="text-red-400 mr-2">❤️</span>
              <span>Життя: <span className="text-red-400 font-bold">{'❤️'.repeat(lives)}</span></span>
            </div>
            <div className="text-xs text-yellow-400">
              Бонус: +{Math.max(0, getDisplayLives(1) - lives)} HP
            </div>
            <div className="flex items-center">
              <span className="text-purple-400 mr-2">🏆</span>
              <span>Рахунок: <span className="text-purple-400 font-bold">{score}</span></span>
            </div>
          </div>
        </div>

        {/* Game title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent tracking-wider mb-2">
            🧠 СПОГАДИ 🧠
          </h1>
          <p className="text-gray-400 text-sm">
            Тест на пам'ять. Згадай свої минулі поразки.
          </p>
        </div>

        {/* Memory Test Area */}
        <div className="flex flex-col items-center space-y-8 mb-8">
          {/* Question container */}
          <div className="relative bg-gradient-to-br from-blue-900/30 via-indigo-900/30 to-purple-900/30 border-2 border-blue-500/40 rounded-none p-6 backdrop-blur-sm max-w-2xl">
            <div className="text-center space-y-6">
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-white">
                  🎯 Питання на пам'ять:
                </h2>
                <div className="bg-black/40 p-6 rounded-none border border-blue-400/30">
                  <p className="text-white text-lg leading-relaxed">
                    "На помилках треба вчитись і їх пам'ятати. Ти програв лише раз, чи памятаєш як? 
                    <br /><br />
                    <span className="text-blue-300 font-semibold">
                      На якому герої андрій переміг тебе в суху на міду 1 на 1?"
                    </span>
                  </p>
                </div>
              </div>

              {/* Answer input section */}
              {gameState === 'playing' && (
                <div className="w-full max-w-md mx-auto space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="answer" className="text-blue-400 font-bold text-sm uppercase tracking-wider">
                      Введіть відповідь:
                    </Label>
                    <Input
                      id="answer"
                      type="text"
                      placeholder="Введіть назву героя..."
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="bg-black/60 border-blue-500/60 text-white placeholder:text-gray-500 focus:border-blue-400 focus:ring-blue-400/30 font-mono text-sm backdrop-blur-sm"
                    />
                  </div>
                  <Button
                    onClick={handleSubmitAnswer}
                    disabled={!answer.trim()}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 px-6 rounded-none border border-blue-400/60 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30"
                  >
                    <span className="font-mono tracking-wider">ПІДТВЕРДИТИ ВІДПОВІДЬ</span>
                  </Button>
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
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-6 px-12 rounded-none border border-blue-400/60 transition-all duration-300 transform hover:scale-105 shadow-2xl shadow-blue-500/40 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <span className="font-mono tracking-wider text-xl relative z-10">ПОЧАТИ ТЕСТ 🧠</span>
            </Button>
          </div>
        )}

        {gameState === 'won' && (
          <Card className="bg-black/90 border border-green-500/40 shadow-2xl shadow-green-500/30 backdrop-blur-md">
            <CardHeader className="text-center">
              <CardTitle className="text-green-400 font-black text-3xl animate-pulse">
                🎉 ПАМ'ЯТЬ НЕ ПІДВЕЛА! 🎉
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <p className="text-white text-lg">
                Ти згадав свою поразку! Пам'ять працює відмінно!
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
                  Тестувати знову
                </Button>
                <Button
                  onClick={() => {
                    localStorage.setItem('gameProgress', '4')
                    router.push('/game/elimination')
                  }}
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
                💀 ЧАС ВИЙШОВ 💀
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <p className="text-white text-lg">
                Ти не встиг згадати! Пам'ять потребує тренування.
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
                Спробуй ще раз! Згадай уважніше.
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
      <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-pulse"></div>
      
      {/* Enhanced corner decorations */}
      <div className="absolute top-4 left-4 w-12 h-12 border-l-4 border-t-4 border-blue-400 opacity-80 animate-pulse"></div>
      <div className="absolute top-4 right-4 w-12 h-12 border-r-4 border-t-4 border-indigo-400 opacity-80 animate-pulse animation-delay-1000"></div>
      <div className="absolute bottom-4 left-4 w-12 h-12 border-l-4 border-b-4 border-purple-400 opacity-80 animate-pulse animation-delay-2000"></div>
      <div className="absolute bottom-4 right-4 w-12 h-12 border-r-4 border-b-4 border-blue-400 opacity-80 animate-pulse animation-delay-3000"></div>
    </div>
  )
} 