import React, { useState, useRef, useEffect } from 'react';
import { Box, Heading, Text, Button } from '@chakra-ui/react';
import { Rnd } from 'react-rnd';

/**
 * LogViewer - a reusable component for displaying and filtering logs.
 * Props:
 *   logs: array of log objects {timestamp, message}
 *   logPolling: boolean (whether logs are being streamed)
 *   loading: boolean (show loading spinner on open)
 *   ec2Status: string (optional, to disable controls if needed)
 *   onStart: function to start log streaming
 *   onStop: function to stop log streaming
 *   showLogWindow: boolean (whether log window is open)
 *   setShowLogWindow: function to toggle log window
 *   title: string (window title)
 */
const LOG_LEVELS = ['DEBUG', 'INFO', 'ERROR'];

export default function LogViewer({
  logs = [],
  logPolling = false,
  loading = false,
  ec2Status = 'running',
  onStart,
  onStop,
  showLogWindow = false,
  setShowLogWindow,
  title = 'Service Logs',
}) {
  const [selectedLogLevel, setSelectedLogLevel] = useState('DEBUG');
  const [sloanOnly, setSloanOnly] = useState(false);
  const [searchText, setSearchText] = useState("");
  const logContainerRef = useRef(null);

  // Auto-scroll to bottom on logs update
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const formatTimestamp = (timestamp) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString();
    } catch {
      return 'Invalid time';
    }
  };

  return (
    showLogWindow && (
      <Rnd
        default={{ x: 120, y: 120, width: 500, height: 380 }}
        minWidth={350}
        minHeight={200}
        bounds="window"
        style={{ zIndex: 2000, boxShadow: '0 4px 24px rgba(0,0,0,0.20)' }}
        dragHandleClassName="log-window-header"
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
            onClick={() => {
              setShowLogWindow(false);
              if (onStop) onStop();
            }}
            size="xs"
            colorScheme="gray"
            variant="ghost"
            position="absolute"
            top="6px"
            right="6px"
            zIndex={100}
            bg="white"
            border="1px solid #ccc"
            borderRadius="full"
            p={0}
            minW="20px"
            minH="20px"
            h="20px"
            w="20px"
            boxShadow="sm"
            _hover={{ bg: 'gray.100', borderColor: 'blue.300' }}
          >
            <span style={{fontSize: '0.9rem', color: '#222', lineHeight: 1}}>✕</span>
          </Button>
          <Heading
            size="md"
            mb={2}
            color="blue.400"
            textAlign="center"
            width="100%"
            className="log-window-header"
            style={{ cursor: "move" }}
          >
            {title}
          </Heading>
          {/* Sloan checkbox and search text filter */}
          <Box mb={2} display="flex" alignItems="center" justifyContent="center" gap={2}>
            <input
              type="checkbox"
              id="sloan-checkbox"
              checked={sloanOnly}
              onChange={e => setSloanOnly(e.target.checked)}
              style={{ marginRight: '0.5em' }}
            />
            <label htmlFor="sloan-checkbox" style={{ color: 'white', fontWeight: 'bold', userSelect: 'none', marginRight: '1em' }}>sloan</label>
            <input
              type="text"
              placeholder="filter text..."
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              style={{ padding: '2px 8px', borderRadius: 4, border: '1px solid #aaa', background: '#222', color: 'white', minWidth: 120 }}
            />
          </Box>
          {/* Log Level Filter Buttons */}
          <Box mb={2} display="flex" justifyContent="center" gap={2}>
            {LOG_LEVELS.map((level) => (
              <Button
                key={level}
                size="sm"
                colorScheme={selectedLogLevel === level ? (level === 'DEBUG' ? 'purple' : level === 'INFO' ? 'blue' : 'red') : 'gray'}
                variant={selectedLogLevel === level ? 'solid' : 'outline'}
                onClick={() => setSelectedLogLevel(level)}
                fontWeight={selectedLogLevel === level ? 'bold' : 'normal'}
                leftIcon={level === 'DEBUG' ? <span>🐛</span> : level === 'INFO' ? <span>ℹ️</span> : <span>❌</span>}
                color={selectedLogLevel === level ? 'white' : (level === 'DEBUG' ? 'purple.700' : level === 'INFO' ? 'blue.700' : 'red.700')}
              >
                {level}
              </Button>
            ))}
          </Box>
          {/* Log List */}
          <Box
            ref={logContainerRef}
            borderWidth="1px"
            borderRadius="md"
            p={2}
            flex={1}
            overflowY="auto"
          >
            {logs.length === 0 ? (
              <Text color="gray.500" p={2}>No logs available. Click 'Start Logs' to begin collecting logs.</Text>
            ) : (
              logs
                .filter(log => (!sloanOnly || (log.message && log.message.toLowerCase().includes('sloan')))
                      && (searchText.trim() === "" || (log.message && log.message.toLowerCase().includes(searchText.toLowerCase()))))
                .map((log, index) => {
                  // Extract log level
                  let logLevel = 'OTHER';
                  if (/\sDEBUG\s|\[DEBUG\]/.test(log.message)) logLevel = 'DEBUG';
                  else if (/\sINFO\s|\[INFO\]/.test(log.message)) logLevel = 'INFO';
                  else if (/\sERROR\s|\[ERROR\]/.test(log.message)) logLevel = 'ERROR';

                  let borderColor, bg, color, icon;
                  if (logLevel === selectedLogLevel) {
                    if (logLevel === 'DEBUG') {
                      borderColor = 'purple.400'; bg = 'purple.50'; color = 'purple.700'; icon = '🐛';
                    } else if (logLevel === 'INFO') {
                      borderColor = 'blue.400'; bg = 'blue.50'; color = 'blue.700'; icon = 'ℹ️';
                    } else if (logLevel === 'ERROR') {
                      borderColor = 'red.400'; bg = 'red.50'; color = 'red.700'; icon = '❌';
                    }
                  } else {
                    borderColor = 'gray.200'; bg = 'transparent'; color = 'gray.100'; icon = '';
                  }

                  return (
                    <Box
                      key={index}
                      py={0.5}
                      px={2}
                      mb={1}
                      border="2px solid"
                      borderColor={borderColor}
                      borderRadius="md"
                      bg={bg}
                      boxShadow={logLevel === selectedLogLevel ? "md" : "none"}
                      display="flex"
                      alignItems="center"
                    >
                      {logLevel === selectedLogLevel && (
                        <Text as="span" fontFamily="mono" color={color} fontWeight="bold" mr={2}>{icon}</Text>
                      )}
                      <Text as="span" color="blue.300" mr={2} fontFamily="mono">[{formatTimestamp(log.timestamp)}]</Text>
                      <Text as="span" color={color} fontWeight={logLevel === selectedLogLevel ? "bold" : "normal"} fontFamily="mono">
                        {(() => {
                          if (logLevel === selectedLogLevel && ['DEBUG','INFO','ERROR'].includes(logLevel)) {
                            const regex = new RegExp(logLevel, 'gi');
                            return log.message.split(regex).reduce((acc, part, i, arr) => {
                              if (i < arr.length - 1) {
                                acc.push(part);
                                acc.push(<span key={i} style={{ color: '#FFD600', fontWeight: 'bold' }}>{logLevel}</span>);
                              } else {
                                acc.push(part);
                              }
                              return acc;
                            }, []);
                          } else {
                            return log.message;
                          }
                        })()}
                      </Text>
                    </Box>
                  );
                })
            )}
          </Box>
        </Box>
      </Rnd>
    )
  );
}
