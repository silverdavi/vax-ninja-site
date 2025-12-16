import { GameComponent } from './game/GameComponent';

// Skip React landing page - go straight to Phaser game
function App() {
  return <GameComponent onBack={() => window.location.reload()} />;
}

export default App;
