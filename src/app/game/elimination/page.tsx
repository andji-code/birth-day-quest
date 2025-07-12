'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { checkGameOver } from '@/lib/lives'

interface Player {
  id: number
  name: string
  number: string
  avatar: string
  isAlive: boolean
  isEliminated: boolean
  lives: number
}

interface DeathReason {
  id: number
  reason: string
  used: boolean
}

export default function EliminationScreen() {
  const [isClient, setIsClient] = useState(false)
  const [nickname, setNickname] = useState('')
  const [totalWinnings, setTotalWinnings] = useState(0)
  const [currentRound, setCurrentRound] = useState(1)
  const [showDeathPopup, setShowDeathPopup] = useState(false)
  const [eliminatedPlayer, setEliminatedPlayer] = useState<Player | null>(null)
  const [deathReason, setDeathReason] = useState('')
  const [particles, setParticles] = useState<Array<{id: number, left: number, top: number, delay: number, duration: number}>>([])
  const [eliminationUsed, setEliminationUsed] = useState(false)
  const [eliminationOrder, setEliminationOrder] = useState<{[key: number]: number}>({})
  
  const router = useRouter()

  const [players, setPlayers] = useState<Player[]>([
    { id: 1, name: 'Валентин', number: '012', avatar: 'https://i.pinimg.com/736x/fe/38/aa/fe38aac98a27218a3c1f3ab4cfe55d6a.jpg', isAlive: true, isEliminated: false, lives: 3 },
    { id: 2, name: 'Андрій', number: '200', avatar: 'https://i.pinimg.com/736x/23/d0/72/23d0726c0089b181582d18f5cf9eff97.jpg', isAlive: true, isEliminated: false, lives: 3 },
    { id: 3, name: 'Ярік', number: '067', avatar: 'https://i.pinimg.com/736x/5b/82/39/5b8239f7920fffdee4c4e69f64151a90.jpg', isAlive: true, isEliminated: false, lives: 3 },
    { id: 4, name: 'Діма', number: '228', avatar: 'https://i.pinimg.com/736x/7c/c0/05/7cc00545993bb0f425dc7eeab0b5e227.jpg', isAlive: true, isEliminated: false, lives: 3 },
    { id: 5, name: 'Міша', number: '237', avatar: 'https://i.pinimg.com/736x/cd/f3/87/cdf3871fa9f13fafc22862679ae20092.jpg', isAlive: true, isEliminated: false, lives: 3 },
    { id: 6, name: 'Тоха', number: '522', avatar: 'https://i.pinimg.com/736x/8c/86/ed/8c86edca77dca77021f0e3fd3abc60bf.jpg', isAlive: true, isEliminated: false, lives: 3 },
    { id: 7, name: 'Сон Ґі-Хун', number: '456', avatar: 'https://preview.redd.it/when-you-realize-that-player-456-won-45-6-billion-because-v0-gk7gabfx62fe1.jpeg?width=640&crop=smart&auto=webp&s=e74aa7af38bf857ae0e5f383beb6a8edc30f0be8', isAlive: true, isEliminated: false, lives: 3 },
    { id: 8, name: 'Guard', number: '069', avatar: 'https://static.wikia.nocookie.net/thesquidgame/images/4/48/Soldier_1.jpg', isAlive: true, isEliminated: false, lives: 3 }
  ])

  const [deathReasons, setDeathReasons] = useState<DeathReason[]>([
    { id: 1, reason: 'Забув пароль від гаманця', used: false },
    { id: 2, reason: 'Попався на фейковий аірдроп', used: false },
    { id: 3, reason: 'Продав токени перед пампом', used: false },
    { id: 4, reason: 'Купив на піку і продав на дні', used: false },
    { id: 5, reason: 'Повірив в "гарантований" прибуток', used: false },
    { id: 6, reason: 'Вкладав все в один токен', used: false },
    { id: 7, reason: 'Не диверсифікував портфель', used: false }
  ])

  const coffinImage = 'https://www.looper.com/img/gallery/the-real-reason-coffins-were-shaped-like-gift-boxes-in-squid-game/l-intro-1636154669.jpg'

  useEffect(() => {
    setIsClient(true)
    
    // Check if game is over
    if (checkGameOver()) {
      router.push('/')
      return
    }
    
    const saved = localStorage.getItem('nickname')
    if (saved) {
      setNickname(saved)
    }
    
    // Generate particles
    const generatedParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 8 + Math.random() * 4
    }))
    setParticles(generatedParticles)

    // Load game progress
    const progress = localStorage.getItem('gameProgress')
    if (progress) {
      setCurrentRound(parseInt(progress))
    }

    // Load total winnings
    const winnings = localStorage.getItem('totalWinnings')
    if (winnings) {
      setTotalWinnings(parseInt(winnings))
    }

    // Load elimination state
    const eliminationState = localStorage.getItem('eliminationUsed')
    if (eliminationState) {
      setEliminationUsed(eliminationState === 'true')
    }

    // Load eliminated players
    const eliminatedPlayers = localStorage.getItem('eliminatedPlayers')
    if (eliminatedPlayers) {
      const eliminatedIds = JSON.parse(eliminatedPlayers)
      setPlayers(prev => prev.map(p => 
        eliminatedIds.includes(p.id) 
          ? { ...p, isAlive: false, isEliminated: true }
          : p
      ))
    }

    // Load elimination order
    const savedEliminationOrder = localStorage.getItem('eliminationOrder')
    if (savedEliminationOrder) {
      setEliminationOrder(JSON.parse(savedEliminationOrder))
    }

    // Load player lives
    const playerLives = localStorage.getItem('playerLives')
    if (playerLives) {
      const livesData = JSON.parse(playerLives)
      setPlayers(prev => prev.map(p => 
        livesData[p.id] !== undefined 
          ? { ...p, lives: livesData[p.id] }
          : p
      ))
    }
  }, [router])

  const eliminateRandomPlayer = () => {
    if (eliminationUsed) return // Prevent multiple eliminations

    const alivePlayers = players.filter(p => p.isAlive && p.name !== 'Валентин')
    if (alivePlayers.length === 0) return

    const randomPlayer = alivePlayers[Math.floor(Math.random() * alivePlayers.length)]
    const availableReasons = deathReasons.filter(r => !r.used)
    const randomReason = availableReasons[Math.floor(Math.random() * availableReasons.length)]

    // Update player status
    setPlayers(prev => prev.map(p => 
      p.id === randomPlayer.id 
        ? { ...p, isAlive: false, isEliminated: true }
        : p
    ))

    // Update elimination order
    const currentEliminationCount = 8 - Object.keys(eliminationOrder).length
    const newEliminationOrder = {
      ...eliminationOrder,
      [randomPlayer.id]: currentEliminationCount
    }
    setEliminationOrder(newEliminationOrder)
    localStorage.setItem('eliminationOrder', JSON.stringify(newEliminationOrder))

    // Mark reason as used
    setDeathReasons(prev => prev.map(r => 
      r.id === randomReason.id ? { ...r, used: true } : r
    ))

    // Update total winnings
    const bonus = 10
    const newWinnings = totalWinnings + bonus
    setTotalWinnings(newWinnings)
    localStorage.setItem('totalWinnings', newWinnings.toString())

    // Save eliminated players to localStorage
    const eliminatedIds = players
      .filter(p => !p.isAlive || p.isEliminated)
      .map(p => p.id)
    if (!eliminatedIds.includes(randomPlayer.id)) {
      eliminatedIds.push(randomPlayer.id)
    }
    localStorage.setItem('eliminatedPlayers', JSON.stringify(eliminatedIds))

    // Mark elimination as used
    setEliminationUsed(true)
    localStorage.setItem('eliminationUsed', 'true')

    // Show death popup
    setEliminatedPlayer(randomPlayer)
    setDeathReason(randomReason.reason)
    setShowDeathPopup(true)
  }

  const goToNextGame = () => {
    const nextRound = currentRound + 1
    setCurrentRound(nextRound)
    localStorage.setItem('gameProgress', nextRound.toString())
    
    // Reset elimination state for next round
    setEliminationUsed(false)
    localStorage.removeItem('eliminationUsed')
    
    // Route to next game based on current round
    switch (nextRound) {
      case 2:
        router.push('/game/glass-bridge')
        break
      case 3:
        router.push('/game/illusion')
        break
      case 4:
        router.push('/game/memories')
        break
      case 5:
        router.push('/game/altcoins')
        break
      case 6:
        router.push('/game/token-catcher')
        break
      case 7:
        router.push('/game/maze')
        break
      case 8:
        // Final elimination - go to winner screen
        router.push('/game/winner')
        break
      default:
        router.push('/game/winner')
    }
  }

  const aliveCount = players.filter(p => p.isAlive).length

  if (!isClient) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-purple-400 font-mono text-xl">Завантаження...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Enhanced game background */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900 via-indigo-900 to-blue-900"></div>
      
      {/* Floating particles */}
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

      {/* Game UI */}
      <div className="relative z-10 p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 bg-black/50 backdrop-blur-sm p-4 rounded-none border border-purple-500/30">
          <div className="text-white font-mono text-sm space-y-1">
            <div className="flex items-center">
              <span className="text-purple-400 mr-2">👤</span>
              <span>Гравець: <span className="text-purple-400 font-bold">{nickname}</span></span>
            </div>
            <div className="flex items-center">
              <span className="text-yellow-400 mr-2">🎯</span>
              <span>Раунд: <span className="text-yellow-400 font-bold">{currentRound}</span></span>
            </div>
          </div>
          <div className="text-white font-mono text-sm space-y-1">
            <div className="flex items-center">
              <span className="text-green-400 mr-2">💰</span>
              <span>Загальний виграш: <span className="text-green-400 font-bold">${totalWinnings}</span></span>
            </div>
            <div className="flex items-center">
              <span className="text-red-400 mr-2">💀</span>
              <span>Залишилось: <span className="text-red-400 font-bold">{aliveCount}</span></span>
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black bg-gradient-to-r from-red-400 via-purple-400 to-blue-400 bg-clip-text text-transparent tracking-wider mb-2">
            {currentRound === 8 ? '💀 ФІНАЛЬНА ЕЛІМІНАЦІЯ 💀' : '💀 ЕЛІМІНАЦІЯ 💀'}
          </h1>
          <p className="text-gray-400 text-sm max-w-2xl mx-auto">
            {currentRound === 8 
              ? 'Останній гравець покидає гру. Ти залишаєшся єдиним вижившим!'
              : 'Після кожного раунду один гравець покидає гру. За кожну смерть +$10 до загального виграшу.'
            }
          </p>
        </div>

        {/* Players Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {players.map((player) => (
            <div
              key={player.id}
              className={`relative p-4 bg-black/50 backdrop-blur-sm border rounded-none transition-all duration-500 ${
                player.isEliminated 
                  ? 'border-red-500/60 bg-red-500/20 opacity-60' 
                  : 'border-purple-500/40 hover:border-purple-400/60'
              }`}
            >
              <div className="text-center">
                <div className="relative mb-2">
                  {player.isEliminated ? (
                    <img
                      src={coffinImage}
                      alt="Coffin"
                      className="w-16 h-16 mx-auto rounded-full object-cover"
                    />
                  ) : player.name === 'Валентин' ? (
                    <div className="w-16 h-16 mx-auto text-4xl flex items-center justify-center">
                      <img
                        src={player.avatar}
                        alt={player.name}
                        className="w-16 h-16 mx-auto rounded-full object-cover"
                      />
                    </div>
                  ) : (
                    <img
                      src={player.avatar}
                      alt={player.name}
                      className="w-16 h-16 mx-auto rounded-full object-cover"
                    />
                  )}
                  {player.isEliminated && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-red-500 text-2xl">💀</span>
                    </div>
                  )}
                </div>
                <div className={`font-mono text-sm font-bold ${
                  player.isEliminated ? 'text-red-400' : 'text-white'
                }`}>
                  {player.name}
                </div>
                <div className={`text-xs font-mono ${
                  player.isEliminated ? 'text-red-400' : 'text-yellow-400'
                }`}>
                  #{player.number}
                </div>
                <div className={`text-xs ${
                  player.isEliminated ? 'text-red-400' : 'text-gray-400'
                }`}>
                  {player.isEliminated ? `ДОЖИВ ДО ТОП: ${eliminationOrder[player.id]}` : 'ЖИВИЙ'}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="text-center space-y-4">
          <Button
            onClick={eliminateRandomPlayer}
            disabled={aliveCount <= 1 || eliminationUsed}
            className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white font-bold py-4 px-8 rounded-none border border-red-400/60 transition-all duration-300 transform hover:scale-105 shadow-2xl shadow-red-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="font-mono tracking-wider text-lg">
              {eliminationUsed ? 'ЕЛІМІНАЦІЯ ВИКОНАНА 💀' : 'ЕЛІМІНУВАТИ ГРАВЦЯ 💀'}
            </span>
          </Button>
          
          <Button
            onClick={goToNextGame}
            disabled={!eliminationUsed}
            className={`${
              currentRound === 8 
                ? 'bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 border-yellow-400/60 shadow-yellow-500/40'
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 border-purple-400/60 shadow-purple-500/40'
            } text-white font-bold py-4 px-8 rounded-none border transition-all duration-300 transform hover:scale-105 shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <span className="font-mono tracking-wider text-lg">
              {eliminationUsed 
                ? (currentRound === 8 ? '👑 ПЕРЕМОЖЕЦЬ 👑' : 'НАСТУПНА ГРА 🎯')
                : 'СПОЧАТКУ ЕЛІМІНУЙ ГРАВЦЯ 💀'
              }
            </span>
          </Button>
        </div>
      </div>

      {/* Death Popup */}
      {showDeathPopup && eliminatedPlayer && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <Card className="bg-black/90 border border-red-500/40 shadow-2xl shadow-red-500/30 backdrop-blur-md max-w-md mx-4 animate-scaleIn relative">
            {/* Close button */}
            <button
              onClick={() => setShowDeathPopup(false)}
              className="absolute top-2 right-2 text-red-400 hover:text-red-300 transition-colors duration-200 z-10"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
            <CardHeader className="text-center">
              <CardTitle className="text-red-400 font-black text-2xl animate-pulse">
                {currentRound === 8 ? '💀 ФІНАЛЬНА ЕЛІМІНАЦІЯ 💀' : '💀 ЕЛІМІНАЦІЯ 💀'}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-4 mb-4">
                {/* Before avatar */}
                <div className="text-center">
                  <img
                    src={eliminatedPlayer.avatar}
                    alt={eliminatedPlayer.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-purple-400"
                  />
                  <p className="text-white text-xs mt-1">ДО</p>
                </div>
                
                {/* Arrow */}
                <div className="text-red-400 text-2xl animate-pulse">
                  ➜
                </div>
                
                {/* After avatar (coffin) */}
                <div className="text-center">
                  <div className="relative">
                    <img
                      src={coffinImage}
                      alt="Coffin"
                      className="w-16 h-16 rounded-full object-cover border-2 border-red-400"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-red-500 text-xl">💀</span>
                    </div>
                  </div>
                  <p className="text-red-400 text-xs mt-1">ПІСЛЯ</p>
                </div>
              </div>
              
              <p className="text-white text-lg font-bold">
                {eliminatedPlayer.name}
              </p>
              <p className="text-yellow-400 text-sm font-mono">
                #{eliminatedPlayer.number}
              </p>
              <p className="text-red-400 text-sm">
                {deathReason}
              </p>
              <p className="text-yellow-400 font-bold">
                ДОЖИВ ДО ТОП: {eliminationOrder[eliminatedPlayer.id]}
              </p>
              <p className="text-green-400 font-bold">
                +${currentRound === 8 ? '50' : '10'} до загального виграшу
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Enhanced corner decorations */}
      <div className="absolute top-4 left-4 w-12 h-12 border-l-4 border-t-4 border-red-400 opacity-80 animate-pulse"></div>
      <div className="absolute top-4 right-4 w-12 h-12 border-r-4 border-t-4 border-purple-400 opacity-80 animate-pulse animation-delay-1000"></div>
      <div className="absolute bottom-4 left-4 w-12 h-12 border-l-4 border-b-4 border-indigo-400 opacity-80 animate-pulse animation-delay-2000"></div>
      <div className="absolute bottom-4 right-4 w-12 h-12 border-r-4 border-b-4 border-red-400 opacity-80 animate-pulse animation-delay-3000"></div>
    </div>
  )
} 