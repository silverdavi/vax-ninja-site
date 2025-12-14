import { useEffect, useRef, useCallback } from 'react';
import { createGame } from './index';
import type Phaser from 'phaser';

interface GameComponentProps {
  onBack: () => void;
}

export function GameComponent({ onBack }: GameComponentProps) {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const focusGame = useCallback(() => {
    const canvas = containerRef.current?.querySelector('canvas');
    if (canvas) {
      canvas.focus();
    }
  }, []);

  useEffect(() => {
    if (containerRef.current && !gameRef.current) {
      gameRef.current = createGame(containerRef.current);
      setTimeout(focusGame, 100);
    }

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [focusGame]);

  return (
    <div 
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: '#1a0a2e',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
      onClick={focusGame}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onBack();
        }}
        style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          zIndex: 1000,
          fontFamily: '"Press Start 2P"',
          fontSize: '10px',
          padding: '8px 12px',
          background: 'rgba(61, 43, 94, 0.9)',
          color: '#9A8AB0',
          border: '2px solid #9A8AB0',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        ✕ EXIT
      </button>
      
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '100%',
          maxWidth: '100vw',
          maxHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      />
    </div>
  );
}
