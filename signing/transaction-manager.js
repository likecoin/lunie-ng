import BigNumber from 'bignumber.js'
import { makeStdTx, makeSignDoc } from '@cosmjs/launchpad'
import { encodeSecp256k1Pubkey } from '@cosmjs/amino'
import {
  AminoTypes,
  defaultRegistryTypes,
  createBankAminoConverters,
  createGovAminoConverters,
  createStakingAminoConverters,
} from '@cosmjs/stargate'
import {
  encodePubkey,
  makeAuthInfoBytes,
  Registry,
} from '@cosmjs/proto-signing'
import { fromBase64, toBase64 } from '@cosmjs/encoding'
import { Int53 } from '@cosmjs/math'
import { SignMode } from 'cosmjs-types/cosmos/tx/signing/v1beta1/signing'
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx'
import { BroadcastMode } from 'cosmjs-types/cosmos/tx/v1beta1/service'
import axios from 'axios'
import { getSigner } from './signer'
import messageCreators from './messages.js'
import fees from '~/common/fees'
import network from '~/common/network'
import { signWithExtension } from '~/common/extension-utils'

const aminoTypes = new AminoTypes({
  ...createBankAminoConverters(network.addressPrefix),
  ...createGovAminoConverters(network.addressPrefix),
  ...createStakingAminoConverters(network.addressPrefix),
})
const registry = new Registry(defaultRegistryTypes)

export function getFees(transactionType, feeDenom, gasEstimateMultiplier) {
  const { gasEstimate, feeOptions } = fees.getFees(transactionType)
  const fee = feeOptions.find(({ denom }) => denom === feeDenom)
  const coinLookup = network.getCoinLookup(fee.denom, 'viewDenom')
  // converting view fee to on chain fee
  const convertedFee = [
    {
      amount: BigNumber(fee.amount)
        .multipliedBy(gasEstimateMultiplier)
        .div(coinLookup.chainToViewConversionFactor)
        .toString(),
      denom: coinLookup.chainDenom,
    },
  ]
  return {
    gasEstimate: String(gasEstimate * gasEstimateMultiplier),
    fee: convertedFee,
  }
}

export async function createSignBroadcast({
  messageType,
  message,
  senderAddress,
  accountInfo,
  network,
  signingType,
  password,
  HDPath,
  feeDenom,
  chainId,
  memo,
  ledgerTransport,
  authcoreCosmosProvider,
  gasEstimateMultiplier,
}) {
  const feeData = getFees(messageType, feeDenom, gasEstimateMultiplier)
  const transactionData = {
    ...feeData,
    memo,
    chainId,
    accountNumber: accountInfo.accountNumber,
    accountSequence: accountInfo.sequence,
  }

  let signedTx

  if (signingType === 'extension') {
    signedTx = await signWithExtension(
      messageType,
      message,
      transactionData,
      senderAddress,
      network
    )
  } else {
    const signer = await getSigner(
      signingType,
      {
        address: senderAddress,
        password,
      },
      chainId,
      ledgerTransport,
      authcoreCosmosProvider
    )

    const messages = messageCreators[messageType](
      senderAddress,
      message,
      network
    )

    const signDoc = makeSignDoc(
      [].concat(messages),
      {
        amount: transactionData.fee,
        gas: transactionData.gasEstimate,
      },
      chainId,
      memo || '',
      accountInfo.accountNumber,
      accountInfo.sequence
    )

    const { signed, signature } = await signer.sign(senderAddress, signDoc)
    signedTx = makeStdTx(signed, signature)
  }

  const signedTxBody = {
    messages: signedTx.msg.map((msg) => aminoTypes.fromAmino(msg)),
    memo: signedTx.memo,
  }
  const signedTxBodyEncodeObject = {
    typeUrl: '/cosmos.tx.v1beta1.TxBody',
    value: signedTxBody,
  }
  const signedTxBodyBytes = registry.encode(signedTxBodyEncodeObject)
  const signedGasLimit = Int53.fromString(signedTx.fee.gas).toNumber()
  const signedSequence = Int53.fromString(accountInfo.sequence).toNumber()
  const pubkey = encodePubkey(
    encodeSecp256k1Pubkey(
      Buffer.from(signedTx.signatures[0].pub_key.value, 'base64')
    )
  )
  const signMode = SignMode.SIGN_MODE_LEGACY_AMINO_JSON
  const signedAuthInfoBytes = makeAuthInfoBytes(
    [{ pubkey, sequence: signedSequence }],
    signedTx.fee.amount,
    signedGasLimit,
    signMode
  )
  const twRaw = TxRaw.fromPartial({
    bodyBytes: signedTxBodyBytes,
    authInfoBytes: signedAuthInfoBytes,
    signatures: [fromBase64(signedTx.signatures[0].signature)],
  })
  const txBytes = toBase64(TxRaw.encode(twRaw).finish())
  const broadcastBody = {
    tx_bytes: txBytes,
    mode: BroadcastMode.BROADCAST_MODE_SYNC, // if we use async we don't wait for checks on the tx to have passed so we don't get errors
  }
  const broadcastResult = await axios
    .post(`${network.apiURL}/cosmos/tx/v1beta1/txs`, broadcastBody)
    .then((res) => res.data)
  assertIsBroadcastTxSuccess(broadcastResult)

  return {
    hash: broadcastResult.tx_response.txhash,
  }
}

export function assertIsBroadcastTxSuccess(res) {
  if (!res) throw new Error(`Error sending transaction`)
  if (Array.isArray(res)) {
    if (res.length === 0) throw new Error(`Error sending transaction`)

    res.forEach(assertIsBroadcastTxSuccess)
  }

  if (res.error) {
    throw new Error(res.error)
  }

  const txRes = res.tx_response
  // Sometimes we get back failed transactions, which shows only by them having a `code` property
  if (txRes.code) {
    const message = txRes.raw_log.message
      ? JSON.parse(txRes.raw_log).message
      : txRes.raw_log
    throw new Error(message)
  }

  if (!txRes.txhash) {
    const message = txRes.message
    throw new Error(message)
  }

  return res
}

export async function pollTxInclusion(txHash, iteration = 0) {
  const MAX_POLL_ITERATIONS = 30
  let txFound = false
  try {
    await fetch(`${network.apiURL}/cosmos/tx/v1beta1/txs/${txHash}`).then(
      (res) => {
        if (res.status === 200) {
          txFound = true
        }
      }
    )
  } catch (err) {
    // ignore error
  }
  if (txFound) {
    return true
  } else if (iteration < MAX_POLL_ITERATIONS) {
    await new Promise((resolve) => setTimeout(resolve, 2000))
    return pollTxInclusion(txHash, iteration + 1)
  } else {
    throw new Error(
      `The transaction wasn't included in time. Check explorers for the transaction hash ${txHash}.`
    )
  }
}
