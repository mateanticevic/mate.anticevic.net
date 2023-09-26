import React from 'react';
import { createRoot } from 'react-dom/client';

import IndexPage from './index';

const root = createRoot(document.getElementById('app'));
root.render(<IndexPage />);