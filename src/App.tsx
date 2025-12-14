import { useState } from 'react';
import styles from './App.module.css';
import { GameComponent } from './game/GameComponent';

const LEVELS = [
  { name: 'COVID-19', emoji: '🦠', debuff: 'Need O₂!' },
  { name: 'Measles', emoji: '🔴', debuff: 'Blur!' },
  { name: 'Polio', emoji: '🦽', debuff: 'Slow!' },
  { name: 'Smallpox', emoji: '💀', debuff: '1-hit KO!' },
  { name: 'Tetanus', emoji: '🔒', debuff: 'Freeze!' },
  { name: 'Whooping', emoji: '😮‍💨', debuff: "Can't stop!" },
];

function App() {
  const [isPlaying, setIsPlaying] = useState(false);

  if (isPlaying) {
    return <GameComponent onBack={() => setIsPlaying(false)} />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.emojis}>💉 🏃 🦠</div>
      
      <h1 className={styles.title}>VAX NINJA</h1>
      <p className={styles.subtitle}>The Anti-Vaxxer Simulator</p>
      
      <p className={styles.tagline}>
        Run from the doctor. Catch diseases!
        <br />
        Each disease = permanent debuff!
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

      <button className={styles.playButton} onClick={() => setIsPlaying(true)}>
        🎮 PLAY NOW 🎮
      </button>

      <p className={styles.disclaimer}>
        <strong>⚠️ SATIRE:</strong> Vaccines are safe & save lives!
      </p>

      <footer className={styles.footer}>
        <a href="https://dhsilver.me" target="_blank" rel="noopener noreferrer">David Silver</a>
      </footer>
    </div>
  );
}

export default App;
