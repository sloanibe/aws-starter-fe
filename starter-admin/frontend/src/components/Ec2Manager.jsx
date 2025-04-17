import { Box, Heading, Button, Text, HStack, Alert, Spinner } from '@chakra-ui/react'
import { useState, useEffect } from 'react'

export default function Ec2Manager() {
  const [status, setStatus] = useState('unknown')
  const [loadingOp, setLoadingOp] = useState('') // '', 'start', 'stop', 'status'
  const [feedback, setFeedback] = useState({ message: '', status: '' });

  const API_BASE = '/api/ec2';

  // Function to fetch EC2 instance status
  const fetchStatus = async () => {
    setLoadingOp('status');
    try {
      const res = await fetch(`${API_BASE}/status`);
      const text = await res.text();
      
      // More precise status detection
      if (text.toLowerCase().includes('status: running')) {
        setStatus('running');
      } else if (text.toLowerCase().includes('status: stopped')) {
        setStatus('stopped');
      } else if (text.toLowerCase().includes('❌') || text.toLowerCase().includes('not running')) {
        setStatus('stopped');
      } else {
        setStatus('unknown');
      }
      
      console.log('EC2 Status Response:', text);
    } catch (err) {
      console.error('Error fetching EC2 status:', err);
      setStatus('unknown');
    } finally {
      setLoadingOp('');
    }
  };
  
  // Fetch status on mount
  useEffect(() => {
    fetchStatus();
    
    // Set up a refresh interval (every 60 seconds)
    const intervalId = setInterval(fetchStatus, 60000);
    
    return () => clearInterval(intervalId);
  }, []);


  const handleStart = async () => {
    setLoadingOp('start');
    setFeedback({ message: '', status: '' });
    try {
      const res = await fetch(`${API_BASE}/start`, { method: 'POST' });
      const text = await res.text();
      if (res.ok) {
        setStatus('running');
        setFeedback({ message: 'EC2 Instance Started', status: 'success' });
      } else {
        setFeedback({ message: `Start failed: ${text}`, status: 'error' });
      }
    } catch (err) {
      setFeedback({ message: `Start failed: ${err.message}`, status: 'error' });
    } finally {
      setLoadingOp('');
    }
  };


  const handleStop = async () => {
    setLoadingOp('stop');
    setFeedback({ message: '', status: '' });
    try {
      const res = await fetch(`${API_BASE}/stop`, { method: 'POST' });
      const text = await res.text();
      if (res.ok) {
        setStatus('stopped');
        setFeedback({ message: 'EC2 Instance Stopped', status: 'info' });
      } else {
        setFeedback({ message: `Stop failed: ${text}`, status: 'error' });
      }
    } catch (err) {
      setFeedback({ message: `Stop failed: ${err.message}`, status: 'error' });
    } finally {
      setLoadingOp('');
    }
  };


  return (
    <Box borderWidth="1px" borderRadius="lg" p={4} h="100%">
      <Heading size="md" mb={2}>EC2 Instance</Heading>
      <HStack mb={4} spacing={2} align="center">
        <Text m={0}>Status:</Text>
        {loadingOp === 'status' ? <Spinner size="xs" /> : <Text m={0}>{status}</Text>}
      </HStack>
      <HStack spacing={4}>
        <Button colorScheme="green" onClick={handleStart} isLoading={loadingOp==='start'} isDisabled={status==='running'}>
          Start
        </Button>
        <Button colorScheme="red" onClick={handleStop} isLoading={loadingOp==='stop'} isDisabled={status==='stopped'}>
          Stop
        </Button>
        <Button onClick={fetchStatus} isLoading={loadingOp==='status'}>
          Refresh
        </Button>
      </HStack>
      {feedback.message && (
        <Alert status={feedback.status} mt={4} borderRadius="md">
          {feedback.message}
        </Alert>
      )}
    </Box>
  );
}

