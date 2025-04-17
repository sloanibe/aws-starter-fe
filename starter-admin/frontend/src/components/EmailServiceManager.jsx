import { useRef, useState, useEffect } from 'react';
import { Box, Heading, Text, Button, HStack, VStack, Alert, AlertIcon, Spinner, Code, Flex, Switch, FormControl, FormLabel, NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper } from '@chakra-ui/react';
import { Rnd } from 'react-rnd';
// Removed all DraggableBox and manual drag/resize logic
// (No stray JSX or return outside function remains)

export default function EmailServiceManager() {
  const [status, setStatus] = useState('unknown');
  const [ec2Status, setEc2Status] = useState('unknown');
  const [loadingOp, setLoadingOp] = useState(''); // '', 'start', 'stop', 'status'
  const [feedback, setFeedback] = useState({ message: '', status: '' });
  // Log viewer state
  const [logs, setLogs] = useState([]);
  const [logStreamActive, setLogStreamActive] = useState(false);
  const [logPolling, setLogPolling] = useState(false);
  const [pollingInterval, setPollingInterval] = useState(3);
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
        setLogStreamActive(true);
        setFeedback({ message: 'Log streaming started', status: 'info' });
        // Start polling
        setLogPolling(true);
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
        setLogStreamActive(false);
        setFeedback({ message: 'Log streaming stopped', status: 'info' });
      } else {
        setFeedback({ message: 'Failed to stop log streaming', status: 'error' });
      }
    } catch (err) {
      setFeedback({ message: `Error: ${err.message}`, status: 'error' });
    }
  };

  // Check log stream status
  const checkLogStreamStatus = async () => {
    try {
      const res = await fetch(`${LOGS_API_BASE}/email-service/status`);
      if (res.ok) {
        const data = await res.json();
        setLogStreamActive(data.active);
      }
    } catch (err) {
      console.error('Error checking log stream status:', err);
    }
  };

  // Fetch logs with polling
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

  // Polling effect
  useEffect(() => {
    let interval;
    
    if (logPolling) {
      // Initial fetch
      fetchLogs();
      
      // Set up polling interval
      interval = setInterval(async () => {
        // Check EC2 status before fetching logs
        const ec2Running = await checkEc2Status();
        if (!ec2Running) {
          // If EC2 is stopped, add a log entry about it and stop polling
          setLogs(prevLogs => [
            ...prevLogs,
            {
              timestamp: new Date().toISOString(),
              message: 'EC2 instance is stopped. Log streaming interrupted.'
            }
          ]);
          stopLogStream();
          return;
        }
        
        fetchLogs();
      }, pollingInterval * 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [logPolling, pollingInterval, lastTimestamp]);

  // Check log stream status on mount and when EC2 status changes
  useEffect(() => {
    checkLogStreamStatus();
    
    // If EC2 is stopped, make sure log streaming is also stopped
    if (ec2Status === 'stopped' && logPolling) {
      stopLogStream();
      setLogs(prevLogs => [
        ...prevLogs,
        {
          timestamp: new Date().toISOString(),
          message: 'EC2 instance is stopped. Log streaming interrupted.'
        }
      ]);
    }
  }, [ec2Status]);

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
      <HStack mb={4}>
        <Button
          colorScheme={logPolling ? "red" : "blue"}
          size="sm"
          onClick={logPolling ? stopLogStream : startLogStream}
          isLoading={loadingOp === 'logs'}
          isDisabled={ec2Status === 'stopped'}
          title={ec2Status === 'stopped' ? 'EC2 instance must be running to view logs' : undefined}
        >
          {logPolling ? 'Stop Logs' : 'Start Logs'}
        </Button>
        <Button
          size="sm"
          onClick={() => setShowLogWindow(v => !v)}
          variant={showLogWindow ? "outline" : "solid"}
          colorScheme="gray"
        >
          {showLogWindow ? 'Hide Log Window' : 'Show Log Window'}
        </Button>
      </HStack>

      {/* Floating Log Window */}
      {showLogWindow && (
        <Rnd
          default={{ x: 120, y: 120, width: 500, height: 380 }}
          minWidth={350}
          minHeight={200}
          bounds="window"
          style={{ zIndex: 2000, boxShadow: '0 4px 24px rgba(0,0,0,0.20)' }}
        >
          <Box
            bg="gray.800"
            borderWidth="2px"
            borderColor="blue.300"
            borderRadius="md"
            width="100%"
            height="100%"
            display="flex"
            flexDirection="column"
            position="relative"
          >
            <Button
              aria-label="Close log window"
              onClick={() => setShowLogWindow(false)}
              size="sm"
              colorScheme="gray"
              variant="ghost"
              position="absolute"
              top="8px"
              right="8px"
              zIndex={100}
              bg="white"
              border="1px solid #ccc"
              borderRadius="full"
              p={0}
              minW="32px"
              minH="32px"
              boxShadow="md"
              _hover={{ bg: 'gray.100', borderColor: 'blue.300' }}
            >
              <span style={{fontSize: '1.25rem', color: '#222'}}>✕</span>
            </Button>
            <Heading size="md" mb={2} color="blue.400" textAlign="center" width="100%">Email Service Logs</Heading>
            <Box
              ref={logContainerRef}
              borderWidth="1px"
              borderRadius="md"
              p={2}
              bg="black"
              color="green.300"
              fontFamily="mono"
              fontSize="sm"
              overflowY="auto"
              minHeight="200px"
              flex={1}
              width="100%"
            >
              {logs.length === 0 ? (
                <Text color="gray.500" p={2}>No logs available. Click 'Start Logs' to begin collecting logs.</Text>
              ) : (
                logs.map((log, index) => (
                  <Box key={index} _hover={{ bg: 'whiteAlpha.100' }} py={0.5}>
                    <Text as="span" color="blue.300" mr={2}>[{formatTimestamp(log.timestamp)}]</Text>
                    <Text as="span">{log.message}</Text>
                  </Box>
                ))
              )}
            </Box>
          </Box>
        </Rnd>
      )}
    </Box>
  );
}
