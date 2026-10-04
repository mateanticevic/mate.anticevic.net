import React from 'react';
import { createRoot } from 'react-dom/client';

import IndexPage from './index';
import ViewPage from './view';

const root = createRoot(document.getElementById('app'));
const viewRoute = window.location.pathname.match(/^\/view\/([^/]+)\/?$/);
root.render(viewRoute ? <ViewPage viewId={viewRoute[1]} /> : <IndexPage />);
