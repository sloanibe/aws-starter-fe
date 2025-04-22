import { useRef, useState, useEffect } from 'react';
import { Box, Heading, Text, Button, HStack, VStack, Alert, AlertIcon, Spinner } from '@chakra-ui/react';
import LogViewer from './LogViewer';

export default function LoginServiceManager() {
  const [status, setStatus] = useState('unknown');
  const [ec2Status, setEc2Status] = useState('unknown');
  const [loadingOp, setLoadingOp] = useState('');
  const [feedback, setFeedback] = useState({ message: '', status: '' });
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState('');
  const [showLogWindow, setShowLogWindow] = useState(false);
  // Fetch logs when log window is open and service/EC2 is running
  const shouldFetchLogs = showLogWindow && status === 'running' && ec2Status === 'running';
  // const [autoScroll] = useState(true); // fixed for now, can add UI later
  // Remove lastTimestamp, not needed for polling
  // const [lastTimestamp, setLastTimestamp] = useState(null);
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

  // Log polling logic: always fetch logs for the last N minutes
  const fetchLogs = async () => {
    try {
      const url = `${LOGS_API_BASE}/login-service?limit=500`;
      const res = await fetch(url);
      if (res.ok) {
        const newLogs = await res.json();
        setLogs(newLogs);
        setError(''); // clear error on success
      } else {
        setError('Failed to fetch logs');
      }
    } catch (err) {
      setError('Error fetching logs: ' + (err.message || err.toString()));
    }
  };




  useEffect(() => {
    if (shouldFetchLogs) {
      fetchLogs();
    }
    // No polling, only fetch when window opens or service/EC2 status changes
    // eslint-disable-next-line
  }, [shouldFetchLogs]);

  useEffect(() => {
    checkLoginServiceStatus();
    // Optionally poll status every minute
    const intervalId = setInterval(checkLoginServiceStatus, 60000);
    return () => clearInterval(intervalId);
  }, []);



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
          onClick={() => setShowLogWindow(v => !v) }
          width="auto"
          minWidth="180px"
        >
          {showLogWindow ? 'Hide Log Window' : 'Show Log Window'}
        </Button>
      </Box>
      {/* Log Viewer Component */}
      <LogViewer
        logs={logs}
        error={error}
        loading={loadingOp === 'logs'}
        ec2Status={ec2Status}
        showLogWindow={showLogWindow}
        setShowLogWindow={setShowLogWindow}
        title="Login Service Logs"
        onReloadLogs={fetchLogs}
      />
    </Box>
  );
}
