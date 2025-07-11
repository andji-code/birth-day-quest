'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from 'next/navigation'

export default function WinnerScreen() {
  const [isClient, setIsClient] = useState(false)
  const [nickname, setNickname] = useState('')
  const [totalWinnings, setTotalWinnings] = useState(0)
  const [particles, setParticles] = useState<Array<{id: number, left: number, top: number, delay: number, duration: number}>>([])
  const router = useRouter()

  useEffect(() => {
    setIsClient(true)
    
    const saved = localStorage.getItem('nickname')
    if (saved) {
      setNickname(saved)
    }
    
    // Generate particles
    const generatedParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 8 + Math.random() * 4
    }))
    setParticles(generatedParticles)

    // Load total winnings
    const winnings = localStorage.getItem('totalWinnings')
    if (winnings) {
      setTotalWinnings(parseInt(winnings))
    }
  }, [])

  const goToHome = () => {
    // Reset game progress but keep lives
    localStorage.removeItem('gameProgress')
    localStorage.removeItem('totalWinnings')
    localStorage.removeItem('eliminatedPlayers')
    localStorage.removeItem('eliminationUsed')
    localStorage.removeItem('eliminationOrder')
    router.push('/')
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
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full opacity-60 animate-pulse"
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`,
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
              <span className="text-yellow-400 mr-2">🏆</span>
              <span>Статус: <span className="text-yellow-400 font-bold">ПЕРЕМОЖЕЦЬ</span></span>
            </div>
          </div>
          <div className="text-white font-mono text-sm space-y-1">
            <div className="flex items-center">
              <span className="text-green-400 mr-2">💰</span>
              <span>Загальний виграш: <span className="text-green-400 font-bold">${totalWinnings}</span></span>
            </div>
            <div className="flex items-center">
              <span className="text-cyan-400 mr-2">🎯</span>
              <span>Ігри пройдено: <span className="text-cyan-400 font-bold">7/7</span></span>
            </div>
          </div>
        </div>

        {/* Winner Title */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-black bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent tracking-wider mb-4 relative">
            <span className="relative z-10">👑 ПЕРЕМОЖЕЦЬ 👑</span>
            <div className="absolute -inset-4 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 rounded-lg blur opacity-25 animate-pulse"></div>
          </h1>
          <p className="text-cyan-400 text-lg font-mono tracking-wider mb-2">
            ТИ ПРОЙШОВ ВСІ ІГРИ КРИПТО-СКВІД ГЕЙМС!
          </p>
          <p className="text-gray-400 text-sm">
            Ти вижив у всіх випробуваннях та заробив величезні гроші!
          </p>
        </div>

        {/* Winner Card */}
        <div className="flex justify-center mb-8">
          <Card className="w-full max-w-2xl bg-black/90 border-2 border-yellow-500/60 shadow-2xl shadow-yellow-500/30 backdrop-blur-md relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/10 to-transparent animate-pulse"></div>
            
            <CardHeader className="text-center relative z-10">
              <CardTitle className="text-4xl font-black bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent tracking-wider">
                🎉 {nickname} 🎉
              </CardTitle>
            </CardHeader>
            
            <CardContent className="text-center space-y-6 relative z-10">
              <div className="p-6 bg-gradient-to-r from-green-600/30 to-cyan-600/30 rounded-none border border-green-400/40 backdrop-blur-sm">
                <p className="text-white font-bold text-2xl mb-2">
                  ФІНАЛЬНИЙ ВИГРАШ
                </p>
                <p className="text-green-400 font-black text-4xl animate-pulse">
                  ${totalWinnings.toLocaleString()}
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  Ти став крипто-мільйонером!
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-4 bg-gradient-to-br from-purple-600/30 to-pink-600/30 border border-purple-400/40 rounded-none">
                  <p className="text-purple-400 font-bold">Ігри пройдено:</p>
                  <p className="text-white text-xl font-bold">7/7</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-cyan-600/30 to-blue-600/30 border border-cyan-400/40 rounded-none">
                  <p className="text-cyan-400 font-bold">Статус:</p>
                  <p className="text-white text-xl font-bold">ПЕРЕМОЖЕЦЬ</p>
                </div>
              </div>
              
              <div className="p-4 bg-gradient-to-r from-yellow-600/30 to-orange-600/30 border border-yellow-400/40 rounded-none">
                <p className="text-yellow-400 font-bold text-lg">
                  🏆 ТИ СТАВ ЛЕГЕНДОЮ КРИПТО-СКВІД ГЕЙМС! 🏆
                </p>
                <p className="text-gray-300 text-sm mt-2">
                  Всі інші гравці заздрять твоєму успіху!
                </p>
              </div>
              
              <Button
                onClick={goToHome}
                className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white font-bold py-4 px-8 rounded-none border border-yellow-400/60 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-yellow-500/30 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <span className="font-mono tracking-wider relative z-10 text-lg">🏠 ПОВЕРНУТИСЯ ДОДОМУ</span>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Enhanced bottom scan line effect */}
      <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-r from-transparent via-yellow-400 to-transparent animate-pulse"></div>
      
      {/* Corner decorations */}
      <div className="absolute top-4 left-4 w-12 h-12 border-l-4 border-t-4 border-yellow-400 opacity-80 animate-pulse"></div>
      <div className="absolute top-4 right-4 w-12 h-12 border-r-4 border-t-4 border-orange-400 opacity-80 animate-pulse animation-delay-1000"></div>
      <div className="absolute bottom-4 left-4 w-12 h-12 border-l-4 border-b-4 border-red-400 opacity-80 animate-pulse animation-delay-2000"></div>
      <div className="absolute bottom-4 right-4 w-12 h-12 border-r-4 border-b-4 border-yellow-400 opacity-80 animate-pulse animation-delay-3000"></div>
    </div>
  )
} 