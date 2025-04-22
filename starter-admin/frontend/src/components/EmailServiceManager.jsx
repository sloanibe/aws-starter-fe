import { useRef, useState, useEffect } from 'react';
import { Box, Heading, Text, Button, HStack, VStack, Alert, AlertIcon, Spinner, Code, Flex, Switch, FormControl, FormLabel, NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper } from '@chakra-ui/react';
import LogViewer from './LogViewer';
// Removed all DraggableBox and manual drag/resize logic
// (No stray JSX or return outside function remains)

export default function EmailServiceManager() {
  const [status, setStatus] = useState('unknown');
  const [ec2Status, setEc2Status] = useState('unknown');
  const [loadingOp, setLoadingOp] = useState(''); // '', 'start', 'stop', 'status'
  const [feedback, setFeedback] = useState({ message: '', status: '' });
  // Log viewer state
  const [logs, setLogs] = useState([]);
  const [pollingInterval] = useState(3); // unused, for future use if needed
  const [autoScroll, setAutoScroll] = useState(true);
  const [lastTimestamp, setLastTimestamp] = useState(null);
  const [showLogWindow, setShowLogWindow] = useState(false);
  const logContainerRef = useRef(null);

  const API_BASE = '/api/email';
  const LOGS_API_BASE = '/api/logs';
  const EC2_API_BASE = '/api/ec2';

  // Function to check EC2 instance status
  const checkEc2Status = async () => {
    try {
      const res = await fetch(`${EC2_API_BASE}/status`);
      const text = await res.text();
      
      if (text.toLowerCase().includes('status: running')) {
        setEc2Status('running');
        return true;
      } else if (text.toLowerCase().includes('status: stopped') || 
                text.toLowerCase().includes('❌') || 
                text.toLowerCase().includes('not running')) {
        setEc2Status('stopped');
        return false;
      } else {
        setEc2Status('unknown');
        return false;
      }
    } catch (err) {
      console.error('Error checking EC2 status:', err);
      setEc2Status('unknown');
      return false;
    }
  };

  // Function to check email service status
  const checkEmailServiceStatus = async () => {
    setLoadingOp('status');
    try {
      // First check if EC2 is running
      const ec2Running = await checkEc2Status();
      
      if (!ec2Running) {
        setStatus('ec2-stopped');
        setLoadingOp('');
        return;
      }
      
      // If EC2 is running, check email service status
      const res = await fetch(`${API_BASE}/status`);
      const text = await res.text();
      
      if (text.toLowerCase().includes('running')) {
        setStatus('running');
      } else if (text.toLowerCase().includes('stopped') || text.toLowerCase().includes('not running')) {
        setStatus('stopped');
      } else {
        setStatus('unknown');
      }
    } catch (err) {
      console.error('Error checking email service status:', err);
      setStatus('unknown');
    } finally {
      setLoadingOp('');
    }
  };
  
  // Fetch status on mount
  useEffect(() => {
    checkEmailServiceStatus();
    
    // Set up a refresh interval (every 60 seconds)
    const intervalId = setInterval(checkEmailServiceStatus, 60000);
    
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
        setFeedback({ message: 'Email Service Started', status: 'success' });
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
        setFeedback({ message: 'Email Service Stopped', status: 'info' });
      } else {
        setFeedback({ message: `Stop failed: ${text}`, status: 'error' });
      }
    } catch (err) {
      setFeedback({ message: `Stop failed: ${err.message}`, status: 'error' });
    } finally {
      setLoadingOp('');
    }
  };

  const handleStatus = async () => {
    setLoadingOp('status');
    setFeedback({ message: '', status: '' });
    try {
      await checkEmailServiceStatus();
      
      if (ec2Status === 'stopped') {
        setFeedback({ message: 'EC2 instance is stopped. Email service cannot be running.', status: 'warning' });
      } else if (status === 'running') {
        setFeedback({ message: 'Email Service is running', status: 'success' });
      } else if (status === 'stopped') {
        setFeedback({ message: 'Email Service is stopped', status: 'info' });
      } else {
        setFeedback({ message: 'Email Service status is unknown', status: 'warning' });
      }
    } catch (err) {
      setFeedback({ message: `Status check failed: ${err.message}`, status: 'error' });
    } finally {
      setLoadingOp('');
    }
  };

  // Start log streaming
  const startLogStream = async () => {
    try {
      // First check if EC2 is running
      const ec2Running = await checkEc2Status();
      
      if (!ec2Running) {
        setFeedback({ 
          message: 'Cannot start log streaming: EC2 instance is stopped', 
          status: 'warning' 
        });
        return;
      }
      
      const res = await fetch(`${LOGS_API_BASE}/start/email-service`, { method: 'POST' });
      if (res.ok) {
        setFeedback({ message: 'Log streaming started', status: 'info' });
        // Start polling
        setShowLogWindow(true);
        // Clear previous logs when starting a new stream
        setLogs([{
          timestamp: new Date().toISOString(),
          message: 'Starting log collection for email-service...'
        }]);
      } else {
        setFeedback({ message: 'Failed to start log streaming', status: 'error' });
      }
    } catch (err) {
      setFeedback({ message: `Error: ${err.message}`, status: 'error' });
    }
  };

  // Stop log streaming
  const stopLogStream = async () => {
    try {
      const res = await fetch(`${LOGS_API_BASE}/stop/email-service`, { method: 'POST' });
      if (res.ok) {
        setFeedback({ message: 'Log streaming stopped', status: 'info' });
      } else {
        setFeedback({ message: 'Failed to stop log streaming', status: 'error' });
      }
    } catch (err) {
      setFeedback({ message: `Error: ${err.message}`, status: 'error' });
    }
  };

  const fetchLogs = async () => {
    try {
      let url = `${LOGS_API_BASE}/email-service?limit=100`;
      if (lastTimestamp) {
        url += `&since=${encodeURIComponent(lastTimestamp)}`;
      }
      
      const res = await fetch(url);
      if (res.ok) {
        const newLogs = await res.json();
        if (newLogs.length > 0) {
          setLogs(prevLogs => {
            // Combine logs, ensuring no duplicates
            const combined = [...prevLogs];
            
            newLogs.forEach(newLog => {
              // Check if this log is already in our list
              const exists = combined.some(log => 
                log.timestamp === newLog.timestamp && log.message === newLog.message
              );
              
              if (!exists) {
                combined.push(newLog);
              }
            });
            
            // Sort by timestamp (newest last)
            combined.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            
            // Limit to last 1000 entries to prevent memory issues
            return combined.slice(-1000);
          });
          
          // Update last timestamp for incremental fetching
          if (newLogs.length > 0) {
            setLastTimestamp(newLogs[newLogs.length - 1].timestamp);
          }
          
          // Auto-scroll to bottom if enabled
          if (autoScroll && logContainerRef.current) {
            setTimeout(() => {
              logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
            }, 100);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching logs:', err);
    }
  };

  // Polling effect (like LoginServiceManager)
  useEffect(() => {
    const shouldFetchLogs = showLogWindow && status === 'running' && ec2Status === 'running';
    if (shouldFetchLogs) {
      fetchLogs();
    }
    // No polling, only fetch when window opens or service/EC2 status changes
    // eslint-disable-next-line
  }, [showLogWindow, status, ec2Status]);



  // Format timestamp for display
  const formatTimestamp = (timestamp) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString();
    } catch (e) {
      return 'Invalid time';
    }
  };

  return (
    <Box borderWidth="1px" borderRadius="lg" p={4} h="100%" display="flex" flexDirection="column">
      <Heading size="md" mb={2}>Email Service</Heading>
      
      {/* EC2 Status Warning */}
      {ec2Status === 'stopped' && (
        <Alert status="warning" mb={4} borderRadius="md">
          <AlertIcon />
          EC2 instance is stopped. Email service cannot be accessed.
        </Alert>
      )}
      
      {/* Service Controls */}
      <Box mb={4}>
        <HStack mb={4} spacing={2} align="center">
          <Text m={0}>Status:</Text>
          {loadingOp === 'status' ? (
            <Spinner size="xs" />
          ) : (
            <Text m={0}>
              {status === 'ec2-stopped' ? 'EC2 Stopped' : status}
              {ec2Status !== 'unknown' && ` (EC2: ${ec2Status})`}
            </Text>
          )}
        </HStack>
        <HStack spacing={4}>
          <Button 
            colorScheme="green" 
            onClick={handleStart} 
            isLoading={loadingOp==='start'} 
            isDisabled={status==='running' || ec2Status==='stopped'}
            title={ec2Status==='stopped' ? 'EC2 instance must be running first' : undefined}
          >
            Start
          </Button>
          <Button 
            colorScheme="red" 
            onClick={handleStop} 
            isLoading={loadingOp==='stop'} 
            isDisabled={status==='stopped' || ec2Status==='stopped'}
            title={ec2Status==='stopped' ? 'EC2 instance must be running first' : undefined}
          >
            Stop
          </Button>
          <Button onClick={handleStatus} isLoading={loadingOp==='status'}>
            Status
          </Button>
        </HStack>
      </Box>
      
      {/* Feedback Alert */}
      {feedback.message && (
        <Alert status={feedback.status} mb={4}>
          {feedback.message}
        </Alert>
      )}
      
      {/* Log Controls - Show/Hide Log Window */}
      <Box mb={4} display="flex" justifyContent="center">
        <Button
          leftIcon={<span style={{fontSize: '1.1em'}}>🪟</span>}
          size="md"
          colorScheme="blue"
          variant={showLogWindow ? "outline" : "solid"}
          onClick={() => setShowLogWindow(v => !v)}
        >
          {showLogWindow ? 'Hide Log Window' : 'Show Log Window'}
        </Button>
      </Box>

      <LogViewer
        logs={logs}
        loading={loadingOp === 'logs'}
        ec2Status={ec2Status}
        showLogWindow={showLogWindow}
        setShowLogWindow={setShowLogWindow}
        title="Email Service Logs"
        error={feedback.status === 'error' ? feedback.message : ''}
      />
    </Box>
  );
}
