import { Grid, GridItem, Heading, Box, Alert, AlertIcon, Spinner } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import Ec2Manager from './Ec2Manager'
import EmailServiceManager from './EmailServiceManager'
import LoginServiceManager from './LoginServiceManager'
import RabbitMQManager from './RabbitMQManager'

export default function Dashboard() {
  const [billing, setBilling] = useState(null);
  const [billingLoading, setBillingLoading] = useState(true);
  const [billingError, setBillingError] = useState(null);

  useEffect(() => {
    setBillingLoading(true);
    fetch('/api/aws/billing')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch AWS billing info');
        return res.json();
      })
      .then(data => {
        setBilling(data);
        setBillingError(null);
      })
      .catch(err => {
        setBillingError(err.message);
        setBilling(null);
      })
      .finally(() => setBillingLoading(false));
  }, []);

  return (
    <Box p={6}>
      <Heading mb={4}>Starter Admin Dashboard</Heading>
      <Box mb={6}>
        <Alert status="info" borderRadius="md" alignItems="center">
          <AlertIcon />
          {billingLoading ? (
            <Spinner size="sm" mr={2} />
          ) : billingError ? (
            <>AWS Billing: <b>Error:</b> {billingError}</>
          ) : billing ? (
            <>
              <b>AWS Charges This Month:</b> ${parseFloat(billing.amount).toFixed(2)} {billing.unit} <span style={{marginLeft: 12, fontSize: '0.95em', color: '#666'}}>({billing.start} to {billing.end})</span>
            </>
          ) : (
            <>AWS Billing: <b>No data</b></>
          )}
        </Alert>
      </Box>
      <Grid
        templateAreas={`
          'ec2 login'
          'email rabbitmq'
        `}
        gridTemplateColumns={'1fr 1fr'}
        gap={6}
        alignItems="stretch"
      >
        <GridItem area={'ec2'} h="100%">
          <Box bg="blue.100" borderRadius="xl" boxShadow="lg" borderWidth="1.5px" borderColor="blue.100" p={5} h="100%" minHeight="260px">
            <Ec2Manager />
          </Box>
        </GridItem>
        <GridItem area={'login'} h="100%">
          <Box bg="blue.100" borderRadius="xl" boxShadow="lg" borderWidth="1.5px" borderColor="blue.100" p={5} h="100%" minHeight="260px">
            <LoginServiceManager />
          </Box>
        </GridItem>
        <GridItem area={'email'} h="100%">
          <Box bg="blue.100" borderRadius="xl" boxShadow="lg" borderWidth="1.5px" borderColor="blue.100" p={5} h="100%" minHeight="260px">
            <EmailServiceManager />
          </Box>
        </GridItem>
        <GridItem area={'rabbitmq'} h="100%">
          <Box bg="blue.100" borderRadius="xl" boxShadow="lg" borderWidth="1.5px" borderColor="blue.100" p={5} h="100%" minHeight="260px">
            <RabbitMQManager />
          </Box>
        </GridItem>
      </Grid>
    </Box>
  )
}
