
import React from 'react';

import deepmindLogo from '../assets/deepmind-icon.png';
import smithsonianLogo from '../assets/smithsonian-icon.png';

// 2. Change the components to return <img> elements
export const DeepmindIcon: React.FC = () => (
    <img 
        src={deepmindLogo} 
        alt="Deepmind logo" 
        width="60" 
        height="60" 
    />
);

export const SmithsonianIcon: React.FC = () => (
    <img 
        src={smithsonianLogo} 
        alt="Smithsonian logo" 
        width="60" 
        height="60" 
    />
);
