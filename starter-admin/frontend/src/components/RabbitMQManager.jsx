import { useRef, useState, useEffect } from 'react';
import { Box, Heading, Text, Alert, AlertIcon, Spinner, Button, HStack } from '@chakra-ui/react';
import { Rnd } from 'react-rnd';

export default function RabbitMQManager() {
  const [ec2Status, setEc2Status] = useState('unknown');
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [logPolling, setLogPolling] = useState(false);
  const [logsError, setLogsError] = useState('');
  const [feedback, setFeedback] = useState({ message: '', status: '' });
  const [showLogWindow, setShowLogWindow] = useState(false);
  const logContainerRef = useRef(null);
  const [lastTimestamp, setLastTimestamp] = useState(null);
  const [logsLoading, setLogsLoading] = useState(false);
  const [pollingInterval] = useState(3);
  const [autoScroll] = useState(true);
  const EC2_API_BASE = '/api/ec2-rabbitmq';
  const LOGS_API_BASE = '/api/logs';

  // Only check EC2 instance status (RabbitMQ EC2)
  const checkEc2Status = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${EC2_API_BASE}/aws-status`);
      const text = (await res.text()).toLowerCase();
      if (text === 'running') {
        setEc2Status(prev => prev !== 'running' ? 'running' : prev);
      } else if (text === 'stopped') {
        setEc2Status(prev => prev !== 'stopped' ? 'stopped' : prev);
      } else {
        setEc2Status(prev => prev !== text ? text : prev);
      }
    } catch (err) {
      setEc2Status(prev => prev !== 'unknown' ? 'unknown' : prev);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkEc2Status();
    const interval = setInterval(checkEc2Status, 5000);
    return () => clearInterval(interval);
  }, []);

  // Start/stop instance handlers
  const handleStart = async () => {
    setLoading(true);
    await fetch(`${EC2_API_BASE}/start`, { method: 'POST' });
    await checkEc2Status();
  };
  const handleStop = async () => {
    setLoading(true);
    await fetch(`${EC2_API_BASE}/stop`, { method: 'POST' });
    await checkEc2Status();
  };

  // Log streaming controls
  const startLogStream = async () => {
    try {
      const res = await fetch(`${LOGS_API_BASE}/start/rabbitmq-service`, { method: 'POST' });
      if (res.ok) {
        setFeedback({ message: 'Log streaming started', status: 'info' });
        setLogPolling(true);
        setLogs([
          {
            timestamp: new Date().toISOString(),
            message: 'Starting log collection for rabbitmq-service...'
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
  const stopLogStream = async () => {
    try {
      const res = await fetch(`${LOGS_API_BASE}/stop/rabbitmq-service`, { method: 'POST' });
      if (res.ok) {
        setFeedback({ message: 'Log streaming stopped', status: 'info' });
        setLogPolling(false);
      } else {
        setFeedback({ message: 'Failed to stop log streaming', status: 'error' });
      }
    } catch (err) {
      setFeedback({ message: `Failed to stop log streaming: ${err.message}`, status: 'error' });
    }
  };

  // Poll logs
  useEffect(() => {
    let interval;
    if (logPolling) {
      fetchLogs();
      interval = setInterval(fetchLogs, pollingInterval * 1000);
    }
    return () => interval && clearInterval(interval);
  }, [logPolling, pollingInterval, lastTimestamp]);

  // Fetch logs function
  const fetchLogs = async () => {
    setLogsLoading(true);
    setLogsError('');
    try {
      let url = `${LOGS_API_BASE}/rabbitmq-service?limit=100`;
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
        if (autoScroll && logContainerRef.current) {
          setTimeout(() => {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
          }, 100);
        }
      }
    } catch (err) {
      setLogsError('Could not load logs');
    } finally {
      setLogsLoading(false);
    }
  };

  // Auto-stop log polling if EC2 is stopped
  useEffect(() => {
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
    } catch {
      return 'Invalid time';
    }
  };

  // Check RabbitMQ instance status
  const checkRabbitMQStatus = async () => {
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
      setLoading(false);
    }
  };

  return (
    <Box borderWidth="1px" borderRadius="lg" p={4} h="100%" display="flex" flexDirection="column">
      <Heading size="md" mb={2}>RabbitMQ EC2 Instance</Heading>
      <Box mb={4}>
        <Text fontWeight="bold" mb={2}>Status:</Text>
        {loading ? (
          <Spinner size="sm" />
        ) : ec2Status === 'running' ? (
          <Alert status="success" borderRadius="md"><AlertIcon />EC2 instance is <b>running</b>.</Alert>
        ) : ec2Status === 'stopped' ? (
          <Alert status="warning" borderRadius="md"><AlertIcon />EC2 instance is <b>stopped</b>.</Alert>
        ) : ec2Status === 'unknown' ? (
          <Alert status="error" borderRadius="md"><AlertIcon />Unable to determine EC2 instance status.</Alert>
        ) : (
          <Alert status="info" borderRadius="md"><AlertIcon />EC2 instance state: <b>{ec2Status}</b></Alert>
        )}
      </Box>
      <HStack mb={4} spacing={3}>
        <Button colorScheme="green" onClick={handleStart} isDisabled={ec2Status==='running' || loading}>Start</Button>
        <Button colorScheme="red" onClick={handleStop} isDisabled={ec2Status!=='running' || loading}>Stop</Button>
        <Button colorScheme="blue" onClick={() => setShowLogWindow(true)} isDisabled={ec2Status!=='running'}>Show Logs</Button>
      </HStack>
      {showLogWindow && (
        <Rnd
          default={{
            x: 100,
            y: 100,
            width: 600,
            height: 400
          }}
          minWidth={300}
          minHeight={200}
          enableResizing={{
            top: true,
            right: true,
            bottom: true,
            left: true,
            topRight: true,
            bottomRight: true,
            bottomLeft: true,
            topLeft: true
          }}
          dragHandleClassName="drag-handle"
          className="log-window"
          style={{ display: 'flex', flexDirection: 'column' }}
        >
          <Box p={4} bg="gray.900" color="green.300" borderRadius="md" height="100%" display="flex" flexDirection="column">
            <Box className="drag-handle" bg="gray.800" p={2} borderRadius="md" mb={2} fontSize="sm" fontWeight="bold" cursor="move">
              RabbitMQ Logs
              <Button size="xs" colorScheme="red" onClick={stopLogStream} ml={2}>Stop Logs</Button>
              <Button size="xs" colorScheme="green" onClick={startLogStream} ml={2}>Start Logs</Button>
              <Button size="xs" colorScheme="gray" onClick={() => setShowLogWindow(false)} ml={2}>Close</Button>
            </Box>
            {logsLoading ? <Spinner /> : logsError ? (
              <Alert status="error"><AlertIcon />{logsError}</Alert>
            ) : (
              <Box as="pre" fontSize="sm" p={2} borderRadius="md" height="100%" overflowY="auto" ref={logContainerRef}>
                {logs.length === 0 ? 'No logs available.' : logs.map((log, idx) =>
                  <div key={idx}>{log.timestamp ? `[${log.timestamp}] ` : ''}{log.message || log}</div>
                )}
              </Box>
            )}
          </Box>
        </Rnd>
      )}
    </Box>
  );
}
