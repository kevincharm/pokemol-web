import React from 'react';
import { Box, Flex, Button } from '@chakra-ui/react';
import ComingSoonOverlay from '../Shared/ComingSoonOverlay';
import TextBox from '../Shared/TextBox';
import ContentBox from '../Shared/ContentBox';

const BoostStatus = () => {
  return (
    <ContentBox
      as={Flex}
      p={6}
      mt={2}
      mb={6}
      w='100%'
      h='175px'
      direction='column'
      justify='space-between'
      position='relative'
    >
      <ComingSoonOverlay />
      <Flex>
        <Box>
          <Box
            fontWeight={700}
            fontFamily='heading'
            fontSize='xs'
            textTransform='uppercase'
          >
            Runway
          </Box>
          <Box fontWeight={700} fontFamily='mono' fontSize='md'>
            0 Months
          </Box>
        </Box>
      </Flex>
      <Flex justify='space-between'>
        <Box>
          <TextBox>Boosts</TextBox>
          <TextBox variant='value' fontSize='md'>
            0 Boosts
          </TextBox>
        </Box>
        <Box>
          <TextBox fontSize='xs'>Monthly Cost</TextBox>
          <TextBox variant='value' fontSize='md'>
            0 Boosts
          </TextBox>
        </Box>
        <Button>Get Boosts </Button>
      </Flex>
    </ContentBox>
  );
};

export default BoostStatus;
