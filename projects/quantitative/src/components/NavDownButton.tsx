import React, { useState, useEffect } from 'react';

type NavDownButtonProps = {
  onClick: () => void;
  onReverseClick?: () => void;
  forceDown?: boolean; // Force button to always show down arrow
  forceUp?: boolean; // Force button to always show up arrow
};

export const NavDownButton: React.FC<NavDownButtonProps> = ({
  onClick,
  onReverseClick,
  forceDown = false,
  forceUp = false,
}) => {
  const [scrollDirection, setScrollDirection] = useState<'down' | 'up'>('down');
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY) {
        setScrollDirection('down');
      } else if (currentScrollY < lastScrollY) {
        setScrollDirection('up');
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const handleClick = () => {
    if (forceUp && onReverseClick) {
      onReverseClick();
    } else if (!forceDown && scrollDirection === 'up' && onReverseClick) {
      onReverseClick();
    } else {
      onClick();
    }
  };

  const buttonText = forceUp
    ? '↑'
    : forceDown
      ? '↓'
      : scrollDirection === 'up'
        ? '↑'
        : '↓';

  return (
    <button
      onClick={handleClick}
      style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(79, 70, 229, 0.8)',
        color: 'white',
        border: 'none',
        borderRadius: '50%',
        width: '50px',
        height: '50px',
        cursor: 'pointer',
        fontSize: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.3s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'rgba(79, 70, 229, 1)';
        e.currentTarget.style.transform = 'translateX(-50%) scale(1.1)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'rgba(79, 70, 229, 0.8)';
        e.currentTarget.style.transform = 'translateX(-50%) scale(1)';
      }}
    >
      {buttonText}
    </button>
  );
};
