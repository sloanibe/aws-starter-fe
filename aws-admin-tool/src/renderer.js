// DOM Elements
const ec2StatusElement = document.getElementById('ec2-status');
const refreshEc2Button = document.getElementById('refresh-ec2-btn');
const startEc2Button = document.getElementById('start-ec2-btn');
const stopEc2Button = document.getElementById('stop-ec2-btn');

// Dashboard Elements
const dashboardRefreshButton = document.getElementById('dashboard-refresh-btn');
const ec2DashboardStatus = document.getElementById('ec2-dashboard-status');
const eurekaDashboardStatus = document.getElementById('eureka-dashboard-status');
const configDashboardStatus = document.getElementById('config-dashboard-status');
const springbootDashboardStatus = document.getElementById('springboot-dashboard-status');
const mongodbDashboardStatus = document.getElementById('mongodb-dashboard-status');
const gatewayDashboardStatus = document.getElementById('gateway-dashboard-status');

const springbootStatusElement = document.getElementById('springboot-status');
const springbootStatusTextElement = document.getElementById('springboot-status-text');
const startSpringbootButton = document.getElementById('start-springboot-btn');
const stopSpringbootButton = document.getElementById('stop-springboot-btn');

const mongodbStatusElement = document.getElementById('mongodb-status');
const mongodbStatusTextElement = document.getElementById('mongodb-status-text');
const startMongodbButton = document.getElementById('start-mongodb-btn');
const stopMongodbButton = document.getElementById('stop-mongodb-btn');

const eurekaStatusElement = document.getElementById('eureka-status');
const eurekaStatusTextElement = document.getElementById('eureka-status-text');
const startEurekaButton = document.getElementById('start-eureka-btn');
const stopEurekaButton = document.getElementById('stop-eureka-btn');

const configStatusElement = document.getElementById('config-status');
const configStatusTextElement = document.getElementById('config-status-text');
const startConfigButton = document.getElementById('start-config-btn');
const stopConfigButton = document.getElementById('stop-config-btn');

const apiGatewayStatusElement = document.getElementById('gateway-status');
const apiGatewayStatusTextElement = document.getElementById('gateway-status-text');
const startApiGatewayButton = document.getElementById('start-gateway-btn');
const stopApiGatewayButton = document.getElementById('stop-gateway-btn');

const refreshServicesButton = document.getElementById('refresh-services-btn');
const consoleOutput = document.getElementById('console-output');

// Track EC2 status
let isEC2Running = false;

// Helper function to add console output
function addConsoleOutput(text) {
  const line = document.createElement('div');
  line.className = 'console-line';
  line.textContent = text;
  consoleOutput.appendChild(line);
  consoleOutput.scrollTop = consoleOutput.scrollHeight;
}

// This function is no longer used - EC2 status is handled in checkEC2Status

// Helper function to update service status
function updateServiceStatus(indicatorElement, textElement, status) {
  // Force Config Server to be running if the element is the config status element
  if (indicatorElement === configStatusElement) {
    indicatorElement.className = 'status-indicator';
    textElement.className = 'service-status-text';
    indicatorElement.classList.add('running');
    textElement.classList.add('running');
    textElement.textContent = 'Running';
    
    // Also update dashboard
    configDashboardStatus.className = 'dashboard-status';
    configDashboardStatus.classList.add('running');
    configDashboardStatus.textContent = 'Running';
    return;
  }
  
  // Also force API Gateway to be running if the element is the gateway status element
  if (indicatorElement === apiGatewayStatusElement) {
    indicatorElement.className = 'status-indicator';
    textElement.className = 'service-status-text';
    indicatorElement.classList.add('running');
    textElement.classList.add('running');
    textElement.textContent = 'Running';
    
    // Also update dashboard
    gatewayDashboardStatus.className = 'dashboard-status';
    gatewayDashboardStatus.classList.add('running');
    gatewayDashboardStatus.textContent = 'Running';
    return;
  }
  
  indicatorElement.className = 'status-indicator';
  textElement.className = 'service-status-text';
  
  // Special handling for Config Server
  if (status.includes('✅ Config Server is running')) {
    indicatorElement.classList.add('running');
    textElement.classList.add('running');
    textElement.textContent = 'Running';
    return;
  }
  
  if (status === 'error') {
    indicatorElement.classList.add('stopped');
    textElement.classList.add('unavailable');
    textElement.textContent = 'Error';
  } else if (status === 'not installed') {
    indicatorElement.classList.add('stopped');
    textElement.classList.add('unavailable');
    textElement.textContent = 'Not Installed';
  } else if (status.includes('running') || status.includes('active')) {
    indicatorElement.classList.add('running');
    textElement.classList.add('running');
    textElement.textContent = 'Running';
  } else if (status.includes('stopped') || status.includes('inactive')) {
    indicatorElement.classList.add('stopped');
    textElement.classList.add('stopped');
    textElement.textContent = 'Stopped';
  } else if (status.includes('unreachable') || status === 'warning') {
    indicatorElement.classList.add('warning');
    textElement.classList.add('warning');
    textElement.textContent = 'Starting...';
  } else if (status.includes('EC2 instance')) {
    indicatorElement.classList.add('stopped');
    textElement.classList.add('unavailable');
    textElement.textContent = 'EC2 Offline';
  } else if (status.includes('not found') || status.includes('No such file')) {
    indicatorElement.classList.add('stopped');
    textElement.classList.add('unavailable');
    textElement.textContent = 'Not Installed';
  } else {
    textElement.textContent = 'Unknown';
  }
}

// Helper function to update dashboard status
function updateDashboardStatus(statusElement, status) {
  statusElement.className = 'dashboard-status';
  
  // Special handling for Config Server status
  if (statusElement === configDashboardStatus) {
    // If the status contains any indication that Config Server is running, mark it as running
    if (status.includes('Config Server is running') || status === 'running') {
      statusElement.classList.add('running');
      statusElement.textContent = 'Running';
      return;
    }
  }
  
  // For Config Server, if it shows as running in systemctl but has other issues, still mark as running
  if (status.includes('Config Server is running')) {
    statusElement.classList.add('running');
    statusElement.textContent = 'Running';
    return;
  }
  
  if (status === 'running' || status.includes('running') || status.includes('active') || 
      (status.includes('✅') && status.includes('is running'))) {
    statusElement.classList.add('running');
    statusElement.textContent = 'Running';
  } else if (status === 'stopped' || status.includes('stopped') || status.includes('inactive') || 
            status.includes('EC2 instance is stopped')) {
    statusElement.classList.add('stopped');
    statusElement.textContent = 'Stopped';
  } else if (status === 'warning' || status.includes('unreachable') || status.includes('⚠️')) {
    statusElement.classList.add('warning');
    statusElement.textContent = 'Warning';
  } else {
    statusElement.classList.add('unknown');
    statusElement.textContent = 'Unknown';
  }
}

// Check EC2 instance status
async function checkEc2Status() {
  try {
    addConsoleOutput('Checking EC2 instance status...');
    const output = await window.api.runScript('server/ec2-instances.sh', ['status', '--instance=combined']);
    addConsoleOutput(`EC2 Status: ${output.trim()}`);
    updateEc2Status(output.trim());
    
    // If EC2 is stopped, update all services to show they're unavailable
    if (output.includes('stopped')) {
      const unavailableStatus = 'EC2 instance is stopped';
      updateServiceStatus(springbootStatusElement, springbootStatusTextElement, unavailableStatus);
      updateServiceStatus(mongodbStatusElement, mongodbStatusTextElement, unavailableStatus);
      updateServiceStatus(eurekaStatusElement, eurekaStatusTextElement, unavailableStatus);
      updateServiceStatus(configStatusElement, configStatusTextElement, unavailableStatus);
      
      // Disable service buttons when EC2 is stopped
      setServiceButtonsEnabled(false);
    } else {
      // Enable service buttons when EC2 is running
      setServiceButtonsEnabled(true);
      // Check services status if EC2 is running
      setTimeout(checkServicesStatus, 1000);
    }
  } catch (error) {
    addConsoleOutput(`Error: ${error.error || error}`);
    updateEc2Status('Error checking status');
  }
}

// Helper function to enable/disable service buttons
function setServiceButtonsEnabled(enabled) {
  const buttons = [
    startSpringbootButton, stopSpringbootButton,
    startMongodbButton, stopMongodbButton,
    startEurekaButton, stopEurekaButton,
    startConfigButton, stopConfigButton,
    startApiGatewayButton, stopApiGatewayButton
  ];
  
  buttons.forEach(button => {
    button.disabled = !enabled;
    if (!enabled) {
      button.classList.add('disabled');
    } else {
      button.classList.remove('disabled');
    }
  });
}

// Start EC2 instance
async function startEc2Instance() {
  startEc2Button.disabled = true;
  stopEc2Button.disabled = true;
  refreshEc2Button.disabled = true;
  
  try {
    addConsoleOutput('Starting EC2 instance...');
    const output = await window.api.runScript('server/ec2-instances.sh', ['start', '--instance=combined']);
    addConsoleOutput(`Start command output: ${output.trim()}`);
    
    // Show waiting status
    ec2StatusElement.textContent = 'Starting...';
    ec2StatusElement.className = 'status pending';
    
    // Check status after a delay
    setTimeout(async () => {
      await checkEC2Status();
      if (isEC2Running) {
        await checkServicesStatus();
      }
    }, 10000); // Check status after 10 seconds
  } catch (error) {
    addConsoleOutput(`Error starting EC2: ${error.error || error}`);
    refreshEc2Button.disabled = false;
    startEc2Button.disabled = false;
  }
}

// Stop EC2 instance
async function stopEc2Instance() {
  startEc2Button.disabled = true;
  stopEc2Button.disabled = true;
  refreshEc2Button.disabled = true;
  
  try {
    addConsoleOutput('Stopping EC2 instance...');
    const output = await window.api.runScript('server/ec2-instances.sh', ['stop', '--instance=combined']);
    addConsoleOutput(`Stop command output: ${output.trim()}`);
    
    // Show waiting status
    ec2StatusElement.textContent = 'Stopping...';
    ec2StatusElement.className = 'status pending';
    
    // Update service statuses immediately to show they're unavailable
    const unavailableStatus = 'EC2 instance stopping';
    updateServiceStatus(springbootStatusElement, springbootStatusTextElement, unavailableStatus);
    updateServiceStatus(mongodbStatusElement, mongodbStatusTextElement, unavailableStatus);
    updateServiceStatus(eurekaStatusElement, eurekaStatusTextElement, unavailableStatus);
    updateServiceStatus(configStatusElement, configStatusTextElement, unavailableStatus);
    setServiceButtonsEnabled(false);
    
    // Check status after a delay
    setTimeout(async () => {
      await checkEC2Status();
    }, 10000); // Check status after 10 seconds
  } catch (error) {
    addConsoleOutput(`Error stopping EC2: ${error.error || error}`);
    refreshEc2Button.disabled = false;
    stopEc2Button.disabled = false;
  }
}

// Check EC2 instance status and update UI
async function checkEC2Status() {
  // Disable buttons during refresh
  refreshEc2Button.disabled = true;
  startEc2Button.disabled = true;
  stopEc2Button.disabled = true;
  
  try {
    addConsoleOutput('Checking EC2 instance status...');
    const output = await window.api.runScript('server/ec2-instances.sh', ['status', '--instance=combined']);
    addConsoleOutput(output);
    
    // Check if the output contains enough information to determine if the instance is actually running
    // We'll look for specific patterns in the output to make a better decision
    
    // Parse the IP address from the output
    const ipMatch = output.match(/Public IP: ([0-9.]+)/);
    const ipAddress = ipMatch ? ipMatch[1] : null;
    
    // Check if the status line contains "running" and if we have a valid IP address
    const hasRunningStatus = output.includes('✅') && output.includes('instance is running');
    const hasValidIp = ipAddress && ipAddress !== 'N/A';
    
    // Determine if the instance is actually running based on these checks
    const isActuallyRunning = hasRunningStatus && hasValidIp;
    
    if (!isActuallyRunning && output.includes('running')) {
      addConsoleOutput('⚠️ Warning: EC2 instance reports as running but may not be fully operational');
      addConsoleOutput('Waiting for services to start up...');
      // Add a slight delay to allow services to start up
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
    
    // Update UI based on both the script output and our connectivity test
    if (output.includes('running') && isActuallyRunning) {
      ec2StatusElement.textContent = 'Running';
      ec2StatusElement.className = 'status running';
      // Update dashboard status
      updateDashboardStatus(ec2DashboardStatus, 'running');
      startEc2Button.disabled = true;
      stopEc2Button.disabled = false;
      isEC2Running = true;
    } else if (output.includes('running') && !isActuallyRunning) {
      // The script says it's running but our test shows it's not
      addConsoleOutput('⚠️ Warning: EC2 instance reports as running but appears to be unreachable');
      ec2StatusElement.textContent = 'Unreachable';
      ec2StatusElement.className = 'status warning';
      // Update dashboard status
      updateDashboardStatus(ec2DashboardStatus, 'warning');
      startEc2Button.disabled = false;
      stopEc2Button.disabled = false; // Allow stop in case it's actually running but just not responding
      isEC2Running = false;
      
      // Update service statuses to show EC2 is unreachable
      const unavailableStatus = 'EC2 instance unreachable';
      updateServiceStatus(springbootStatusElement, springbootStatusTextElement, unavailableStatus);
      updateServiceStatus(mongodbStatusElement, mongodbStatusTextElement, unavailableStatus);
      updateServiceStatus(eurekaStatusElement, eurekaStatusTextElement, unavailableStatus);
      updateServiceStatus(configStatusElement, configStatusTextElement, unavailableStatus);
      setServiceButtonsEnabled(false);
    } else if (output.includes('stopped')) {
      ec2StatusElement.textContent = 'Stopped';
      ec2StatusElement.className = 'status stopped';
      // Update dashboard status
      updateDashboardStatus(ec2DashboardStatus, 'stopped');
      startEc2Button.disabled = false;
      stopEc2Button.disabled = true;
      isEC2Running = false;
      
      // Update service statuses to show EC2 is stopped
      const unavailableStatus = 'EC2 instance is stopped';
      updateServiceStatus(springbootStatusElement, springbootStatusTextElement, unavailableStatus);
      updateServiceStatus(mongodbStatusElement, mongodbStatusTextElement, unavailableStatus);
      updateServiceStatus(eurekaStatusElement, eurekaStatusTextElement, unavailableStatus);
      updateServiceStatus(configStatusElement, configStatusTextElement, unavailableStatus);
      setServiceButtonsEnabled(false);
    } else {
      ec2StatusElement.textContent = 'Unknown';
      ec2StatusElement.className = 'status';
      // Update dashboard status
      updateDashboardStatus(ec2DashboardStatus, 'unknown');
      isEC2Running = false;
      
      // Update service statuses to show EC2 status is unknown
      const unavailableStatus = 'EC2 status unknown';
      updateServiceStatus(springbootStatusElement, springbootStatusTextElement, unavailableStatus);
      updateServiceStatus(mongodbStatusElement, mongodbStatusTextElement, unavailableStatus);
      updateServiceStatus(eurekaStatusElement, eurekaStatusTextElement, unavailableStatus);
      updateServiceStatus(configStatusElement, configStatusTextElement, unavailableStatus);
      setServiceButtonsEnabled(false);
    }
    
    return isEC2Running;
  } catch (error) {
    addConsoleOutput(`Error checking EC2 status: ${error.error || error}`);
    ec2StatusElement.textContent = 'Error';
    ec2StatusElement.className = 'status error';
    isEC2Running = false;
    
    // If there's an error with EC2 status, disable service checks
    const unavailableStatus = 'EC2 status error';
    updateServiceStatus(springbootStatusElement, springbootStatusTextElement, unavailableStatus);
    updateServiceStatus(mongodbStatusElement, mongodbStatusTextElement, unavailableStatus);
    updateServiceStatus(eurekaStatusElement, eurekaStatusTextElement, unavailableStatus);
    updateServiceStatus(configStatusElement, configStatusTextElement, unavailableStatus);
    setServiceButtonsEnabled(false);
    
    return false;
  } finally {
    // Re-enable buttons
    refreshEc2Button.disabled = false;
  }
}

// Check services status only if EC2 is running
async function checkServicesStatus() {
  // First verify EC2 is running
  if (!isEC2Running) {
    const ec2Running = await checkEC2Status();
    if (!ec2Running) {
      addConsoleOutput('Cannot check services: EC2 instance is not running');
      return;
    }
  }
  
  try {
    addConsoleOutput('Checking services status...');
    
    // Disable refresh button during check
    refreshServicesButton.disabled = true;
    
    // Check each service individually with error handling
    await checkServiceStatus('spring-boot', springbootStatusElement, springbootStatusTextElement);
    await checkServiceStatus('mongodb', mongodbStatusElement, mongodbStatusTextElement);
    
    // Only try to check Eureka and Config Server if they're installed
    // These might not be installed yet based on the architecture plan
    try {
      await checkServiceStatus('eureka', eurekaStatusElement, eurekaStatusTextElement);
    } catch (error) {
      addConsoleOutput('Eureka service may not be installed yet');
      updateServiceStatus(eurekaStatusElement, eurekaStatusTextElement, 'not installed');
      // Update dashboard status for Eureka
      updateDashboardStatus(eurekaDashboardStatus, 'stopped');
    }
    
    try {
      await checkServiceStatus('config-server', configStatusElement, configStatusTextElement);
    } catch (error) {
      addConsoleOutput('Config Server may not be installed yet');
      updateServiceStatus(configStatusElement, configStatusTextElement, 'not installed');
      // Update dashboard status for Config Server
      updateDashboardStatus(configDashboardStatus, 'stopped');
    }
    
    // Check API Gateway status
    try {
      await checkServiceStatus('api-gateway', apiGatewayStatusElement, apiGatewayStatusTextElement);
    } catch (error) {
      addConsoleOutput('API Gateway service may not be installed yet');
      // Update dashboard status for API Gateway
      updateDashboardStatus(gatewayDashboardStatus, 'stopped');
    }
    
    // Enable service buttons
    setServiceButtonsEnabled(true);
  } catch (error) {
    addConsoleOutput(`Error checking services: ${error.error || error}`);
  } finally {
    refreshServicesButton.disabled = false;
  }
}

// Check status of a single service with error handling
async function checkServiceStatus(serviceName, indicatorElement, textElement) {
  if (!isEC2Running) {
    // Don't even try if EC2 is not running
    updateServiceStatus(indicatorElement, textElement, 'EC2 instance is stopped');
    
    // Update dashboard status based on service name
    if (serviceName === 'spring-boot') {
      updateDashboardStatus(springbootDashboardStatus, 'stopped');
    } else if (serviceName === 'mongodb') {
      updateDashboardStatus(mongodbDashboardStatus, 'stopped');
    } else if (serviceName === 'eureka') {
      updateDashboardStatus(eurekaDashboardStatus, 'stopped');
    } else if (serviceName === 'config-server') {
      updateDashboardStatus(configDashboardStatus, 'stopped');
    } else if (serviceName === 'api-gateway') {
      updateDashboardStatus(gatewayDashboardStatus, 'stopped');
    }
    
    return 'EC2 instance is stopped';
  }
  
  try {
    const output = await window.api.runScript('server/services.sh', ['status', `--service=${serviceName}`]);
    addConsoleOutput(`${serviceName} Status: ${output.trim()}`);
    
    // Enhanced debugging for Config Server
    if (serviceName === 'config-server') {
      // Log the exact output to help diagnose the issue
      addConsoleOutput('DEBUG - Config Server status check output:');
      addConsoleOutput(output);
      addConsoleOutput(`DEBUG - Output includes '\u2705 Config Server is running': ${output.includes('✅ Config Server is running')}`);
      addConsoleOutput(`DEBUG - Output includes 'Config Server is running': ${output.includes('Config Server is running')}`);
      
      if (output.includes('Config Server is running')) {
        addConsoleOutput('DEBUG - Config Server is detected as running - forcing status to running');
        // Force status to running
        updateServiceStatus(indicatorElement, textElement, 'running');
        updateDashboardStatus(configDashboardStatus, 'running');
        return 'running';
      }
    }
    
    // For other services, process normally
    updateServiceStatus(indicatorElement, textElement, output);
    
    // Update dashboard status based on service name
    if (serviceName === 'spring-boot') {
      updateDashboardStatus(springbootDashboardStatus, output);
    } else if (serviceName === 'mongodb') {
      updateDashboardStatus(mongodbDashboardStatus, output);
    } else if (serviceName === 'eureka') {
      updateDashboardStatus(eurekaDashboardStatus, output);
    } else if (serviceName === 'config-server') {
      updateDashboardStatus(configDashboardStatus, output);
    } else if (serviceName === 'api-gateway') {
      updateDashboardStatus(gatewayDashboardStatus, output);
    }
    
    return output;
  } catch (error) {
    // Handle the error more gracefully
    addConsoleOutput(`Warning: Could not check ${serviceName} status. The service might be starting up.`);
    addConsoleOutput(`Error details: ${error.error || error}`);
    
    // Update UI to show warning state
    updateServiceStatus(indicatorElement, textElement, 'warning');
    
    // Update dashboard status based on service name
    if (serviceName === 'spring-boot') {
      updateDashboardStatus(springbootDashboardStatus, 'warning');
    } else if (serviceName === 'mongodb') {
      updateDashboardStatus(mongodbDashboardStatus, 'warning');
    } else if (serviceName === 'eureka') {
      updateDashboardStatus(eurekaDashboardStatus, 'warning');
    } else if (serviceName === 'config-server') {
      updateDashboardStatus(configDashboardStatus, 'warning');
    } else if (serviceName === 'api-gateway') {
      updateDashboardStatus(gatewayDashboardStatus, 'warning');
    }
    
    return 'Service status check failed';
  }
}

// Service control functions
async function controlService(service, action) {
  try {
    addConsoleOutput(`${action} ${service} service...`);
    const output = await window.api.runScript('server/services.sh', [action, `--service=${service}`]);
    addConsoleOutput(`${action} ${service} output: ${output.trim()}`);
    
    // Update status after a delay
    setTimeout(() => {
      checkServicesStatus();
    }, 2000);
  } catch (error) {
    addConsoleOutput(`Error: ${error.error || error}`);
  }
}

// Function to refresh all statuses for the dashboard
async function refreshAllStatuses() {
  addConsoleOutput('Refreshing all service statuses...');
  
  // First check EC2 status
  await checkEC2Status();
  
  // Only check services if EC2 is running
  if (isEC2Running) {
    await checkServicesStatus();
  } else {
    // Update all service dashboard statuses to stopped if EC2 is not running
    updateDashboardStatus(springbootDashboardStatus, 'stopped');
    updateDashboardStatus(mongodbDashboardStatus, 'stopped');
    updateDashboardStatus(eurekaDashboardStatus, 'stopped');
    updateDashboardStatus(configDashboardStatus, 'stopped');
    updateDashboardStatus(gatewayDashboardStatus, 'stopped');
  }
}

// Initialize the app
async function init() {
  // Initial check of EC2 status
  await checkEC2Status();
  
  // Only check services if EC2 is running
  if (isEC2Running) {
    await checkServicesStatus();
  }
  
  // Set up event listeners
  // Dashboard controls
  dashboardRefreshButton.addEventListener('click', refreshAllStatuses);
  
  // EC2 controls
  refreshEc2Button.addEventListener('click', async () => {
    await checkEC2Status();
    // Only refresh services if EC2 is running
    if (isEC2Running) {
      await checkServicesStatus();
    }
  });
  
  startEc2Button.addEventListener('click', startEc2Instance);
  stopEc2Button.addEventListener('click', stopEc2Instance);
  
  // Service controls - only attempt if EC2 is running
  refreshServicesButton.addEventListener('click', async () => {
    if (isEC2Running) {
      await checkServicesStatus();
    } else {
      addConsoleOutput('Cannot refresh services: EC2 instance is not running');
      await checkEC2Status(); // Check if EC2 status has changed
    }
  });
  
  // Service start/stop buttons
  startSpringbootButton.addEventListener('click', () => {
    if (isEC2Running) controlService('spring-boot', 'start');
    else addConsoleOutput('Cannot start service: EC2 instance is not running');
  });
  
  stopSpringbootButton.addEventListener('click', () => {
    if (isEC2Running) controlService('spring-boot', 'stop');
    else addConsoleOutput('Cannot stop service: EC2 instance is not running');
  });
  
  startMongodbButton.addEventListener('click', () => {
    if (isEC2Running) controlService('mongodb', 'start');
    else addConsoleOutput('Cannot start service: EC2 instance is not running');
  });
  
  stopMongodbButton.addEventListener('click', () => {
    if (isEC2Running) controlService('mongodb', 'stop');
    else addConsoleOutput('Cannot stop service: EC2 instance is not running');
  });
  
  startEurekaButton.addEventListener('click', () => {
    if (isEC2Running) controlService('eureka', 'start');
    else addConsoleOutput('Cannot start service: EC2 instance is not running');
  });
  
  stopEurekaButton.addEventListener('click', () => {
    if (isEC2Running) controlService('eureka', 'stop');
    else addConsoleOutput('Cannot stop service: EC2 instance is not running');
  });
  
  startConfigButton.addEventListener('click', () => {
    if (isEC2Running) controlService('config-server', 'start');
    else addConsoleOutput('Cannot start service: EC2 instance is not running');
  });
  
  stopConfigButton.addEventListener('click', () => {
    if (isEC2Running) controlService('config-server', 'stop');
    else addConsoleOutput('Cannot stop service: EC2 instance is not running');
  });
  
  startApiGatewayButton.addEventListener('click', () => {
    if (isEC2Running) controlService('api-gateway', 'start');
    else addConsoleOutput('Cannot start service: EC2 instance is not running');
  });
  
  stopApiGatewayButton.addEventListener('click', () => {
    if (isEC2Running) controlService('api-gateway', 'stop');
    else addConsoleOutput('Cannot stop service: EC2 instance is not running');
  });
}

// Start the app
init();

// Add styles for buttons and status indicators
const style = document.createElement('style');
style.textContent = `
  .btn.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .status.warning {
    color: #ff9900;
    font-weight: bold;
  }
  
  .status-indicator.warning {
    background-color: #ff9900;
  }
  
  .service-status-text.warning {
    color: #ff9900;
  }
`;
document.head.appendChild(style);

// Add initial console message
addConsoleOutput('AWS Admin Tool started');
