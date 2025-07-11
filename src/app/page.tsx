'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function Home() {
  const [nickname, setNickname] = useState('')
  const [savedNickname, setSavedNickname] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Load nickname from localStorage on component mount
    const saved = localStorage.getItem('nickname')
    if (saved) {
      setSavedNickname(saved)
    }
  }, [])

  const handleSaveNickname = () => {
    if (nickname.trim()) {
      setIsLoading(true)
      // Simulate a brief loading state for better UX
      setTimeout(() => {
        localStorage.setItem('nickname', nickname.trim())
        setSavedNickname(nickname.trim())
        setNickname('')
        setIsLoading(false)
      }, 500)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveNickname()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full opacity-20 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md backdrop-blur-lg bg-white/10 border-white/20 shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="relative">
              <CardTitle className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-pulse">
                🦑 Crypto-Squid 🦑
                Games 
              </CardTitle>
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 rounded-lg blur opacity-25 animate-pulse"></div>
            </div>
            <CardDescription className="text-lg text-center font-bold text-white/80">
              <span className="text-yellow-500">Вітаємо в підводному блокчейні на виживання!</span> <br/>
              Тут тебе чекають неймовірні скарби, але також і підступні небезпеки<br/>
              Щоб вижити, ти повинен бути швидкий, розумний і вміти користуватися технологіями.<br/>
             <span className="text-yellow-500">Удачі!</span>
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {!savedNickname ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nickname" className="text-white font-semibold">
                    Write your nickname:
                  </Label>
                  <Input
                    id="nickname"
                    type="text"
                    placeholder="Enter your squid nickname..."
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-cyan-400 focus:ring-cyan-400"
                  />
                </div>
                <Button
                  onClick={handleSaveNickname}
                  disabled={!nickname.trim() || isLoading}
                  className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </div>
                  ) : (
                    'Join the Adventure! 🚀'
                  )}
                </Button>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="p-4 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-lg border border-green-400/30">
                  <p className="text-white font-semibold">
                    Welcome back, <span className="text-cyan-400 font-bold">{savedNickname}</span>! 🎉
                  </p>
                </div>
                <Button
                  onClick={() => {
                    localStorage.removeItem('nickname')
                    setSavedNickname('')
                  }}
                  variant="outline"
                  className="border-white/20 text-black hover:bg-white/10 cursor-pointer"
                >
                  Change Nickname
                </Button>
                <Button
                  onClick={() => {
                    localStorage.removeItem('nickname')
                    setSavedNickname('')
                  }}
                  variant="default"
                  className="ml-4 border-white/20 text-black hover:bg-white/10 cursor-pointer"
                >
                  🚀
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom wave effect */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          className="w-full h-20"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
            opacity=".25"
            className="fill-current text-white/10"
          ></path>
          <path
            d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
            opacity=".5"
            className="fill-current text-white/20"
          ></path>
          <path
            d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"
            className="fill-current text-white/30"
          ></path>
        </svg>
      </div>
    </div>
  )
}
