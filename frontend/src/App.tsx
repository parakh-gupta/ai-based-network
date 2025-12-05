import { Box, Container } from '@mui/material';
import Canvas from './components/Canvas';
import ChatBot from './components/ChatBot';
import { useState } from 'react';
import './App.css';

function App() {
  const [topologyData, setTopologyData] = useState<{
    topology?: string;
    devices?: number;
  }>({});

  const handleTopologyCreate = (topology: string, devices: number) => {
    setTopologyData({ topology, devices });
  };

  return (
    <Container
      maxWidth={false}
      disableGutters
      sx={{
        display: 'flex',
        height: '100vh',
        width: '100vw',
        bgcolor: '#ffffff',
      }}
    >
      {/* Canvas Section */}
      <Box
        sx={{
          flex: '3',
          height: '100%',
          borderRight: '1px solid #e0e0e0',
        }}
      >
        <Canvas topology={topologyData.topology as any} deviceCount={topologyData.devices} />
      </Box>

      {/* ChatBot Section */}
      <Box
        sx={{
          flex: '1',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <ChatBot onCreateTopology={handleTopologyCreate} />
      </Box>
    </Container>
  );
}

export default App;
