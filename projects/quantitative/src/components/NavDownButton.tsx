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
    <button className="nav-button" onClick={handleClick}>
      {buttonText}
    </button>
  );
};
