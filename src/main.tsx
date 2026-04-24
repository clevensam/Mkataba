import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ConfigProvider, message } from 'antd';
import App from './App.tsx';
import './index.css';

message.config({
  top: 80,
  duration: 3,
  maxCount: 3,
});

const theme = {
  token: {
    colorPrimary: '#0284c7',
    colorLink: '#0284c7',
    colorSuccess: '#10b981',
    colorWarning: '#f59e0b',
    colorError: '#ef4444',
    colorInfo: '#0284c7',
    borderRadius: 8,
    fontFamily: '"Inter", ui-sans-serif, system-ui, sans-serif',
  },
  components: {
    Button: {
      controlHeight: 40,
      paddingContentHorizontal: 16,
    },
    Input: {
      controlHeight: 40,
    },
    Card: {
      borderRadiusLG: 16,
    },
  },
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider theme={theme}>
      <App />
    </ConfigProvider>
  </StrictMode>,
);