import React from 'react';
import { SiGithub } from 'react-icons/si';
import { FaLinkedin } from 'react-icons/fa6';
import { Mail } from 'lucide-react';
import { PERSONAL_INFO } from '../../data/portfolioData';
import { Magnetic } from '../common/Magnetic';

export const SocialRail: React.FC = () => {
  const socials = [
    {
      name: 'GitHub',
      url: PERSONAL_INFO.github,
      icon: <SiGithub className="w-4 h-4" />,
    },
    {
      name: 'LinkedIn',
      url: PERSONAL_INFO.linkedin,
      icon: <FaLinkedin className="w-4 h-4" />,
    },
    {
      name: 'Email',
      url: `mailto:${PERSONAL_INFO.email}`,
      icon: <Mail className="w-4 h-4" />,
    },
  ];

  return (
    <aside
      aria-label="Social links"
      className="fixed left-6 top-1/2 -translate-y-1/2 z-40 hidden min-[1100px]:flex flex-col items-center gap-6"
    >
      <div className="flex flex-col items-center gap-5">
        {socials.map((item) => (
          <Magnetic key={item.name} maxDistance={8}>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={item.name}
              className="p-2.5 rounded-full text-secondary hover:text-primary transition-colors duration-200 border border-transparent hover:border-border hover:bg-surface/50 block"
            >
              {item.icon}
            </a>
          </Magnetic>
        ))}
      </div>

      {/* Decorative vertical line */}
      <div className="w-[1px] h-16 bg-border" />
    </aside>
  );
};
