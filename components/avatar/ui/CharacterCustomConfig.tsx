import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import Scene from './CharacterCustomScene';

const PhaserGame = () => {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (gameRef.current || !containerRef.current) return;

    const MAP_WIDTH = 100;
    const MAP_HEIGHT = 100;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: MAP_WIDTH,
      height: MAP_HEIGHT,

      parent: containerRef.current,
      backgroundColor: '#D9D9D9',

      pixelArt: true,
      antialias: false,
      roundPixels: true,

      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,

        width: MAP_WIDTH,
        height: MAP_HEIGHT,
      },

      physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0, x: 0 },
            debug: false
        },
      },
      scene: [Scene],
    };

    const game = new Phaser.Game(config);
    gameRef.current = game;

    return () => {
      game.destroy(true);
      gameRef.current = null;
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '250px', height: '250px', margin: '0 auto' }}>
      <div ref={containerRef} id="phaser-container" style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default PhaserGame;
