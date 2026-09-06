import { FC, useEffect } from 'react';
import leaf from '@/assets/pycon/pycon_2026_leaf.svg';
import mtApo from '@/assets/pycon/pycon_2026_mt_apo.svg';
import tealSnake from '@/assets/pycon/pycon_2026_teal_snake.svg';

const PyconBackground: FC = () => {
  useEffect(() => {
    const root = document.getElementById('root');
    if (root) {
      root.classList.add('relative');
      root.classList.add('overflow-x-clip');
    }
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none select-none">
      {/* Mt. Apo - at the very bottom (acts as a footer) */}
      <img
        src={mtApo}
        alt=""
        className="absolute bottom-0 left-0 w-full h-auto max-h-[420px] object-cover object-bottom -z-20 pointer-events-none select-none"
      />

      {/* Teal Snake - at the bottom left expanding to left center */}
      <img
        src={tealSnake}
        alt=""
        className="absolute bottom-0 left-0 w-[240px] sm:w-[320px] md:w-[420px] lg:w-[500px] xl:w-[580px] h-auto object-contain object-left-bottom -z-10 pointer-events-none select-none opacity-40 sm:opacity-50 md:opacity-65 lg:opacity-80"
      />

      {/* Leaf - at the right center */}
      <img
        src={leaf}
        alt=""
        className="absolute right-0 top-1/2 -translate-y-1/2 w-[100px] sm:w-[140px] md:w-[180px] lg:w-[220px] xl:w-[260px] h-auto object-contain object-right -z-10 pointer-events-none select-none opacity-60 md:opacity-90 lg:opacity-100"
      />
    </div>
  );
};

export default PyconBackground;
