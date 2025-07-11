export interface Player {
  id: number
  name: string
  avatar: string
  isAlive: boolean
  isEliminated: boolean
  lives: number
}

export const loseLife = (playerId: number, gameType: string, timeLimit?: number): boolean => {
  // Не знімати життя для тестового гравця
  const nickname = localStorage.getItem('nickname')
  if (nickname === 'test') {
    return false
  }

  // Для скляного мосту знімати життя тільки при перевищенні часу
  if (gameType === 'glass-bridge' && timeLimit !== undefined && timeLimit < 60) {
    return false
  }

  // Завантажити поточні життя
  const playerLives = localStorage.getItem('playerLives')
  const livesData = playerLives ? JSON.parse(playerLives) : {}
  
  // Зменшити життя
  const currentLives = livesData[playerId] || 3
  const newLives = Math.max(0, currentLives - 1)
  livesData[playerId] = newLives
  
  // Зберегти оновлені життя
  localStorage.setItem('playerLives', JSON.stringify(livesData))
  
  // Якщо життя закінчились, записати рік наступного року
  if (newLives === 0) {
    const nextYear = new Date().getFullYear() + 1
    localStorage.setItem('gameOverYear', nextYear.toString())
    return true // Повертаємо true якщо гра закінчена
  }
  
  return false
}

export const checkGameOver = (): boolean => {
  const gameOverYear = localStorage.getItem('gameOverYear')
  if (!gameOverYear) return false
  
  const currentYear = new Date().getFullYear()
  const savedYear = parseInt(gameOverYear)
  
  // Якщо збережений рік більший або дорівнює поточному року, гра закінчена
  return savedYear >= currentYear
}

export const resetLives = () => {
  localStorage.removeItem('playerLives')
} 