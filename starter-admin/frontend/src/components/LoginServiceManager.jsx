import { useRef, useState, useEffect } from 'react';
import { Box, Heading, Text, Button, HStack, VStack, Alert, AlertIcon, Spinner } from '@chakra-ui/react';
import LogViewer from './LogViewer';


export default function LoginServiceManager() {
  const [status, setStatus] = useState('unknown');
  const [ec2Status, setEc2Status] = useState('unknown');
  const [loadingOp, setLoadingOp] = useState('');
  const [feedback, setFeedback] = useState({ message: '', status: '' });
  const [logs, setLogs] = useState([]);
  const [logPolling, setLogPolling] = useState(false);
  const [pollingInterval] = useState(3); // fixed for now, can add UI later
  const [autoScroll] = useState(true); // fixed for now, can add UI later
  const [lastTimestamp, setLastTimestamp] = useState(null);
  const [showLogWindow, setShowLogWindow] = useState(false);
  const API_BASE = '/api/login';
  const LOGS_API_BASE = '/api/logs'; // match EmailServiceManager pattern
  const EC2_API_BASE = '/api/ec2';

  // Check EC2 status
  const checkEc2Status = async () => {
    try {
      const res = await fetch(`${EC2_API_BASE}/status`);
      const text = await res.text();
      if (text.toLowerCase().includes('status: running')) {
        setEc2Status('running');
        return true;
      } else if (text.toLowerCase().includes('status: stopped') || text.toLowerCase().includes('❌') || text.toLowerCase().includes('not running')) {
        setEc2Status('stopped');
        return false;
      } else {
        setEc2Status('unknown');
        return false;
      }
    } catch (err) {
      setEc2Status('unknown');
      return false;
    }
  };

  // Check login service status
  const checkLoginServiceStatus = async () => {
    setLoadingOp('status');
    try {
      const ec2Running = await checkEc2Status();
      if (!ec2Running) {
        setStatus('ec2-stopped');
        setLoadingOp('');
        return;
      }
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
      setStatus('unknown');
    } finally {
      setLoadingOp('');
    }
  };

  // Service control handlers
  const handleStart = async () => {
    setLoadingOp('start');
    setFeedback({ message: '', status: '' });
    try {
      const res = await fetch(`${API_BASE}/start`, { method: 'POST' });
      const text = await res.text();
      if (res.ok) {
        setStatus('running');
        setFeedback({ message: 'Login Service Started', status: 'success' });
        // Automatically start log streaming when service starts
        await startLogStream();
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
        setFeedback({ message: 'Login Service Stopped', status: 'info' });
      } else {
        setFeedback({ message: `Stop failed: ${text}`, status: 'error' });
      }
    } catch (err) {
      setFeedback({ message: `Stop failed: ${err.message}`, status: 'error' });
    } finally {
      setLoadingOp('');
    }
  };

  // Log polling and streaming logic
  const fetchLogs = async () => {
    try {
      let url = `${LOGS_API_BASE}/login-service?limit=100`;
      if (lastTimestamp) {
        url += `&since=${encodeURIComponent(lastTimestamp)}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const newLogs = await res.json();
        if (newLogs.length > 0) {
          setLogs(prevLogs => {
            const combined = [...prevLogs];
            newLogs.forEach(newLog => {
              const exists = combined.some(log => log.timestamp === newLog.timestamp && log.message === newLog.message);
              if (!exists) combined.push(newLog);
            });
            combined.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            return combined.slice(-1000);
          });
          setLastTimestamp(newLogs[newLogs.length - 1].timestamp);
        }
      }
    } catch {}
  };

  useEffect(() => {
    let interval;
    if (logPolling) {
      fetchLogs();
      interval = setInterval(fetchLogs, pollingInterval * 1000);
    }
    return () => interval && clearInterval(interval);
  }, [logPolling, pollingInterval, lastTimestamp]);

  useEffect(() => {
    checkLoginServiceStatus();
    // Optionally poll status every minute
    const intervalId = setInterval(checkLoginServiceStatus, 60000);
    return () => clearInterval(intervalId);
  }, []);

  // Start log streaming (consistent with EmailServiceManager)
  const startLogStream = async () => {
    try {
      // Optionally: check EC2 status if needed
      const res = await fetch(`/api/logs/start/login-service`, { method: 'POST' });
      if (res.ok) {
        setFeedback({ message: 'Log streaming started', status: 'info' });
        setLogPolling(true);
        setShowLogWindow(true);
        setLogs([
          {
            timestamp: new Date().toISOString(),
            message: 'Starting log collection for login-service...'
          }
        ]);
        setLastTimestamp(null);
      } else {
        setFeedback({ message: 'Failed to start log streaming', status: 'error' });
      }
    } catch (err) {
      setFeedback({ message: `Failed to start log streaming: ${err.message}`, status: 'error' });
    }
  };
  const stopLogStream = () => setLogPolling(false);

  return (
    <Box borderWidth="1px" borderRadius="lg" p={4} h="100%" display="flex" flexDirection="column">
      <Heading size="md" mb={2}>Login Service</Heading>
      {/* EC2 Status Warning */}
      {ec2Status === 'stopped' && (
        <Alert status="warning" mb={4} borderRadius="md">
          <AlertIcon />
          EC2 instance is stopped. Login service cannot be accessed.
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
          <Button onClick={checkLoginServiceStatus} isLoading={loadingOp==='status'}>
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
          onClick={() => {
            if (!showLogWindow) {
              startLogStream();
            } else {
              stopLogStream();
            }
            setShowLogWindow(v => !v);
          }}
          width="auto"
          minWidth="180px"
        >
          {showLogWindow ? 'Hide Log Window' : 'Show Log Window'}
        </Button>
      </Box>
      {/* Log Viewer Component */}
      <LogViewer
        logs={logs}
        logPolling={logPolling}
        loading={loadingOp === 'logs'}
        ec2Status={ec2Status}
        onStart={startLogStream}
        onStop={stopLogStream}
        showLogWindow={showLogWindow}
        setShowLogWindow={setShowLogWindow}
        title="Login Service Logs"
      />
    </Box>
  );
};
