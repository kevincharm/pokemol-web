import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  Button,
  FormLabel,
  FormControl,
  Flex,
  Input,
  Icon,
  Box,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react';
import { RiAddFill, RiErrorWarningLine } from 'react-icons/ri';

import TextBox from '../components/TextBox';

import PaymentInput from './paymentInput';
import TributeInput from './tributeInput';
import AddressInput from './addressInput';
import DetailsFields from './detailFields';
import { useInjectedProvider } from '../contexts/InjectedProviderContext';
import { useOverlay } from '../contexts/OverlayContext';
import { useTX } from '../contexts/TXContext';
import { useUser } from '../contexts/UserContext';
import { useParams } from 'react-router-dom';
import {
  createHash,
  detailsToJSON,
  daoConnectedAndSameChain,
} from '../utils/general';
import { createPoll } from '../services/pollService';
import { MolochService } from '../services/molochService';
import { useDao } from '../contexts/DaoContext';
import { valToDecimalString } from '../utils/tokenValue';
import { chainByID } from '../utils/chain';
import { useMetaData } from '../contexts/MetaDataContext';
import { createForumTopic } from '../utils/discourse';

const TradeProposalForm = () => {
  const {
    injectedProvider,
    address,
    requestWallet,
    injectedChain,
  } = useInjectedProvider();
  const {
    errorToast,
    successToast,
    setProposalModal,
    setTxInfoModal,
  } = useOverlay();
  const { daoOverview } = useDao();
  const { refreshDao } = useTX();
  const { cachePoll, resolvePoll } = useUser();
  const { daoid, daochain } = useParams();
  const { daoMetaData } = useMetaData();

  const [loading, setLoading] = useState(false);
  const [showShares, setShowShares] = useState(false);
  const [showLoot, setShowLoot] = useState(false);
  const [showApplicant, setShowApplicant] = useState(false);
  const [currentError, setCurrentError] = useState(null);

  // console.log(dao);

  const {
    handleSubmit,
    errors,
    register,
    setValue,
    getValues,
    setError,
    watch,
  } = useForm();

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      const newE = Object.keys(errors)[0];
      setCurrentError({
        field: newE,
        ...errors[newE],
      });
    } else {
      setCurrentError(null);
    }

    // eslint-disable-next-line
  }, [errors]);

  const onSubmit = async (values) => {
    setLoading(true);
    const now = (new Date().getTime() / 1000).toFixed();
    const hash = createHash();
    const details = detailsToJSON({ ...values, hash });
    const { tokenBalances, depositToken } = daoOverview;
    const tributeToken = values.tributeToken || depositToken.tokenAddress;
    const paymentToken = values.paymentToken || depositToken.tokenAddress;
    const tributeOffered = values.tributeOffered
      ? valToDecimalString(values.tributeOffered, tributeToken, tokenBalances)
      : '0';
    const paymentRequested = values.paymentRequested
      ? valToDecimalString(values.paymentRequested, paymentToken, tokenBalances)
      : '0';
    const applicant = values?.applicantHidden?.startsWith('0x')
      ? values.applicantHidden
      : values?.applicant
      ? values.applicant
      : values?.memberApplicant
      ? values.memberApplicant
      : address;
    const args = [
      applicant,
      values.sharesRequested || '0',
      values.lootRequested || '0',
      tributeOffered,
      tributeToken,
      paymentRequested,
      paymentToken,
      details,
    ];

    try {
      const poll = createPoll({ action: 'submitProposal', cachePoll })({
        daoID: daoid,
        chainID: daochain,
        hash,
        actions: {
          onError: (error, txHash) => {
            errorToast({
              title: `There was an error.`,
            });
            resolvePoll(txHash);
            console.error(`Could not find a matching proposal: ${error}`);
          },
          onSuccess: (txHash) => {
            successToast({
              title: 'Trade Proposal Submitted to the Dao!',
            });
            refreshDao();
            resolvePoll(txHash);
            createForumTopic({
              chainID: daochain,
              daoID: daoid,
              afterTime: now,
              proposalType: 'Trade Proposal',
              values,
              applicant,
              daoMetaData,
            });
          },
        },
      });
      const onTxHash = () => {
        setProposalModal(false);
        setTxInfoModal(true);
      };
      MolochService({
        web3: injectedProvider,
        daoAddress: daoid,
        chainID: daochain,
        version: daoOverview.version,
      })('submitProposal')({ args, address, poll, onTxHash });
    } catch (err) {
      setLoading(false);
      console.error('error: ', err);
      errorToast({
        title: `There was an error.`,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormControl
        isInvalid={errors.name}
        display='flex'
        flexDirection='row'
        justifyContent='space-between'
        mb={5}
        flexWrap='wrap'
      >
        <Box w={['100%', null, '50%']} pr={[0, null, 5]}>
          <DetailsFields register={register} />
        </Box>
        <Box w={['100%', null, '50%']}>
          <TributeInput
            register={register}
            setValue={setValue}
            getValues={getValues}
            setError={setError}
          />
          <TextBox size='xs'>Trade For</TextBox>
          <PaymentInput
            register={register}
            setValue={setValue}
            getValues={getValues}
            errors={errors}
          />

          {showShares && (
            <>
              <TextBox as={FormLabel} size='xs' htmlFor='sharesRequested'>
                Shares Requested
              </TextBox>
              <Input
                name='sharesRequested'
                placeholder='0'
                mb={5}
                ref={register({
                  required: {
                    value: true,
                    message:
                      'Requested shares are required for Member Proposals',
                  },
                  pattern: {
                    value: /^[0-9]+$/,
                    message: 'Requested shares must be a whole number',
                  },
                })}
                color='white'
                focusBorderColor='secondary.500'
              />
            </>
          )}

          {showLoot && (
            <>
              <TextBox as={FormLabel} size='xs' htmlFor='lootRequested' mb={2}>
                Loot Requested
              </TextBox>
              <Input
                name='lootRequested'
                placeholder='0'
                mb={5}
                ref={register({
                  pattern: {
                    value: /[0-9]/,
                    message: 'Loot must be a number',
                  },
                })}
                color='white'
                focusBorderColor='secondary.500'
              />
            </>
          )}

          {showApplicant && (
            <AddressInput
              name='applicant'
              register={register}
              setValue={setValue}
              watch={watch}
            />
          )}
          {(!showApplicant || !showLoot || !showShares) && (
            <Menu color='white' textTransform='uppercase'>
              <MenuButton
                as={Button}
                variant='outline'
                rightIcon={<Icon as={RiAddFill} color='primary.500' />}
              >
                Additional Options
              </MenuButton>
              <MenuList>
                {!showApplicant && (
                  <MenuItem onClick={() => setShowApplicant(true)}>
                    Applicant
                  </MenuItem>
                )}
                {!showLoot && (
                  <MenuItem onClick={() => setShowLoot(true)}>
                    Request Loot
                  </MenuItem>
                )}
                {!showShares && (
                  <MenuItem onClick={() => setShowShares(true)}>
                    Request Shares
                  </MenuItem>
                )}
              </MenuList>
            </Menu>
          )}
        </Box>
      </FormControl>
      <Flex justify='flex-end' align='center' h='60px'>
        {currentError && (
          <Box color='secondary.300' fontSize='m' mr={5}>
            <Icon as={RiErrorWarningLine} color='secondary.300' mr={2} />
            {currentError.message}
          </Box>
        )}
        <Box>
          {daoConnectedAndSameChain(
            address,
            daochain,
            injectedChain?.chainId,
          ) ? (
            <Button
              type='submit'
              loadingText='Submitting'
              isLoading={loading}
              disabled={loading}
            >
              Submit
            </Button>
          ) : (
            <Button
              onClick={requestWallet}
              isDisabled={injectedChain && daochain !== injectedChain?.chainId}
            >
              Connect{' '}
              {injectedChain && daochain !== injectedChain?.chainId
                ? `to ${chainByID(daochain).name}`
                : 'Wallet'}
            </Button>
          )}
        </Box>
      </Flex>
    </form>
  );
};

export default TradeProposalForm;
