export interface Player {
  id: number
  name: string
  number: string
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
  
  // Записати невдачу в localStorage (бонус буде застосований в наступній грі)
  const failedGames = localStorage.getItem('failedGames')
  const failedGamesData = failedGames ? JSON.parse(failedGames) : {}
  failedGamesData[playerId] = (failedGamesData[playerId] || 0) + 1
  localStorage.setItem('failedGames', JSON.stringify(failedGamesData))
  
  // Перевірити чи закінчились базові життя (без бонусу)
  if (newLives <= 0) {
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
  console.log(savedYear, currentYear)
  // Якщо збережений рік більший або дорівнює поточному року, гра закінчена
  return false
}

export const resetLives = () => {
  localStorage.removeItem('playerLives')
}

export const getCurrentLives = (playerId: number): number => {
  // Завантажити базові життя
  const playerLives = localStorage.getItem('playerLives')
  const livesData = playerLives ? JSON.parse(playerLives) : {}
  const baseLives = livesData[playerId] || 3
  
  // Завантажити кількість невдач
  const failedGames = localStorage.getItem('failedGames')
  const failedGamesData = failedGames ? JSON.parse(failedGames) : {}
  const failedCount = failedGamesData[playerId] || 0
  
  // Повернути базові життя + бонус за невдачі (+1 HP за кожну невдачу)
  return Math.min(10, baseLives + failedCount) // Максимум 10 HP
}

export const getDisplayLives = (playerId: number): number => {
  // Завантажити базові життя
  const playerLives = localStorage.getItem('playerLives')
  const livesData = playerLives ? JSON.parse(playerLives) : {}
  const baseLives = livesData[playerId] || 3
  
  // Завантажити кількість невдач
  const failedGames = localStorage.getItem('failedGames')
  const failedGamesData = failedGames ? JSON.parse(failedGames) : {}
  const failedCount = failedGamesData[playerId] || 0
  
  // Повернути базові життя + бонус за невдачі
  return Math.min(10, baseLives + failedCount) // Максимум 10 HP
}

export const getBaseLives = (playerId: number): number => {
  // Завантажити тільки базові життя (без бонусу)
  const playerLives = localStorage.getItem('playerLives')
  const livesData = playerLives ? JSON.parse(playerLives) : {}
  return livesData[playerId] || 3
} 