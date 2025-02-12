import React from 'react';
import { Box, Flex } from '@chakra-ui/layout';

import TextBox from './TextBox';
import AddressAvatar from './addressAvatar';
import { Button } from '@chakra-ui/button';
import SetInitialUberHausDelegate from '../forms/setInitialUberHausDelegate';

const DaoToDaoMemberInfo = ({
  membership,
  delegate,
  needDelegateKeySet,
  openModal,
}) => {
  return (
    <>
      <Flex justify='space-between' py={4}>
        <Box>
          <TextBox size='sm'>Shares</TextBox>
          <TextBox variant='value'>{membership?.shares || 0}</TextBox>
        </Box>
        <Box>
          <TextBox size='sm'>Loot</TextBox>
          <TextBox variant='value'>{membership?.loot || 0}</TextBox>
        </Box>
        <Box>
          <TextBox size='sm'>Join Date</TextBox>
          <TextBox variant='value'>
            {membership ? '1/1/2021' : 'pending'}
          </TextBox>
        </Box>
      </Flex>
      <Box>
        <TextBox mb={2} size='sm'>
          Delegate
        </TextBox>
        <Flex justify='space-between'>
          <Flex>
            <Box>
              {delegate ? (
                <>
                  <AddressAvatar addr={delegate} alwaysShowName={true} />
                </>
              ) : (
                <p>
                  Delegate not appointed. Contact the Daohaus team in Discord
                  support.
                </p>
              )}
            </Box>
          </Flex>
          {delegate && needDelegateKeySet ? (
            <SetInitialUberHausDelegate
              minionAddress={membership.memberAddress}
              delegateAddress={delegate}
              uberHausAddress={membership.moloch.id}
            />
          ) : null}

          {membership && delegate && !needDelegateKeySet ? (
            <Button w='25%' onClick={openModal}>
              Manage
            </Button>
          ) : null}
        </Flex>
      </Box>
    </>
  );
};

export default DaoToDaoMemberInfo;
