'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from 'next/navigation'

export default function Intro() {
  const [nickname, setNickname] = useState('')
  const router = useRouter()

  useEffect(() => {
    const saved = localStorage.getItem('nickname')
    if (saved) {
      setNickname(saved)
    }
  }, [])

  const handleStartGame = () => {
    router.push('/game/green-light')
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Enhanced crypto grid background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(0, 255, 255, 0.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 255, 0.15) 1px, transparent 1px)
          `,
          backgroundSize: '30px 30px'
        }}></div>
      </div>

      {/* Squid Game symbols background */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Triangle symbols */}
        {[...Array(6)].map((_, i) => (
          <div
            key={`triangle-${i}`}
            className="absolute text-cyan-400 opacity-10 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${10 + Math.random() * 5}s`
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L22 20H2L12 2Z"/>
            </svg>
          </div>
        ))}
        
        {/* Circle symbols */}
        {[...Array(4)].map((_, i) => (
          <div
            key={`circle-${i}`}
            className="absolute text-purple-400 opacity-10 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${8 + Math.random() * 4}s`
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="10"/>
            </svg>
          </div>
        ))}
        
        {/* Square symbols */}
        {[...Array(3)].map((_, i) => (
          <div
            key={`square-${i}`}
            className="absolute text-pink-400 opacity-10 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${12 + Math.random() * 3}s`
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <rect x="2" y="2" width="20" height="20"/>
            </svg>
          </div>
        ))}
      </div>

      {/* Enhanced animated neon lines */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse"></div>
        <div className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent animate-pulse animation-delay-1000"></div>
        <div className="absolute top-1/2 left-0 w-px h-full bg-gradient-to-b from-transparent via-pink-400 to-transparent animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 right-0 w-px h-full bg-gradient-to-b from-transparent via-yellow-400 to-transparent animate-pulse animation-delay-3000"></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-lg backdrop-blur-md bg-black/90 border border-cyan-500/40 shadow-2xl shadow-cyan-500/30 relative overflow-hidden">
          {/* Card background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `
                linear-gradient(45deg, transparent 40%, rgba(0, 255, 255, 0.1) 50%, transparent 60%),
                linear-gradient(-45deg, transparent 40%, rgba(255, 0, 255, 0.1) 50%, transparent 60%)
              `,
              backgroundSize: '20px 20px'
            }}></div>
          </div>

          <CardHeader className="text-center space-y-4 pb-6 relative z-10">
            <div className="relative">
              <CardTitle className="text-2xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent tracking-wider">
                🦑 ВІТАЄМО, <span className="text-yellow-400 uppercase">{nickname}</span>, У ГРІ 🦑
              </CardTitle>
              <div className="absolute -inset-2 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 rounded-lg blur opacity-25 animate-pulse"></div>
            </div>
            
            {/* Squid Game symbols around title */}
            <div className="flex justify-center items-center space-x-4 mt-4">
              <div className="text-cyan-400 animate-pulse">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L22 20H2L12 2Z"/>
                </svg>
              </div>
              <div className="text-purple-400 animate-pulse animation-delay-1000">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="12" r="10"/>
                </svg>
              </div>
              <div className="text-pink-400 animate-pulse animation-delay-2000">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="2" y="2" width="20" height="20"/>
                </svg>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6 relative z-10">
            <div className="space-y-4 text-sm text-gray-300 leading-relaxed">
              <p className="text-center font-bold text-yellow-400">
                Ви були обрані серед тисяч анонімів.
              </p>
              
              <p className="text-center">
                На кону — <span className="text-cyan-400 font-bold">головний криптоприз</span>.
              </p>
              
              <p className="text-center">
                Але щоб вижити — потрібно пройти <span className="text-red-400 font-bold">12 раундів випробувань</span>.
              </p>
              
              <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 p-4 rounded-none border border-purple-400/30">
                <p className="text-center mb-3">
                  🎭 Кожна гра — це перевірка не лише інтелекту, але й рішучості.
                </p>
                <div className="space-y-2 text-xs">
                  <p className="flex items-center justify-center">
                    <span className="text-red-400 mr-2">❌</span>
                    <span>Програв — вилітаєш. Дані знищуються.</span>
                  </p>
                  <p className="flex items-center justify-center">
                    <span className="text-green-400 mr-2">✅</span>
                    <span>Виграв — переходиш далі. Ближче до правди... і до нагороди.</span>
                  </p>
                </div>
              </div>
              
              <p className="text-center font-bold text-cyan-400">
                🦑 Гра починається. Не озирайся.
              </p>
            </div>

            <Button
              onClick={handleStartGame}
              className="w-full bg-gradient-to-r from-green-600 to-cyan-600 hover:from-green-500 hover:to-cyan-500 text-white font-bold py-4 px-6 rounded-none border border-green-400/60 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-green-500/30 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <span className="font-mono tracking-wider relative z-10 text-lg">ПОЧАТИ ПЕРШУ ГРУ 🚀</span>
            </Button>
          </CardContent>
        </Card>
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