import styles from './App.module.css'

const LEVELS = [
  { name: 'COVID-19', emoji: '🦠', debuff: 'Need O₂ packs!' },
  { name: 'Measles', emoji: '🔴', debuff: 'Vision blur!' },
  { name: 'Polio', emoji: '🦽', debuff: 'Speed -50%!' },
  { name: 'Smallpox', emoji: '💀', debuff: 'One-hit KO!' },
  { name: 'Tetanus', emoji: '🔒', debuff: 'Random freeze!' },
  { name: 'Whooping Cough', emoji: '😮‍💨', debuff: 'Can\'t stop moving!' },
]

function App() {
  return (
    <div className={styles.container}>
      <div className={styles.emojis}>💉 🏃 🦠</div>
      
      <h1 className={styles.title}>VAX NINJA</h1>
      <p className={styles.subtitle}>The Anti-Vaxxer Simulator</p>
      
      <p className={styles.tagline}>
        Run from the doctor. Catch the disease. 
        <br />
        Experience the "freedom" of preventable illness!
      </p>

      <div className={styles.gamePreview}>
        <h3>// DISEASE LEVELS //</h3>
        <div className={styles.levels}>
          {LEVELS.map((level) => (
            <div key={level.name} className={styles.level}>
              {level.emoji} {level.name}
            </div>
          ))}
        </div>
      </div>

      <button className={styles.comingSoon}>
        🎮 COMING SOON 🎮
      </button>

      <p className={styles.disclaimer}>
        <strong>⚠️ SATIRE ALERT:</strong> This game is a parody. 
        Vaccines are safe, effective, and save millions of lives. 
        Get vaccinated. Don't be a disease ninja.
      </p>

      <footer className={styles.footer}>
        A satirical project by <a href="https://dhsilver.me" target="_blank" rel="noopener noreferrer">David Silver</a>
      </footer>
    </div>
  )
}

export default App
