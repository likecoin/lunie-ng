const lunieMessageTypes = {
  SEND: `SendTx`,
  SEND_MULTIPLE: `SendMultiTx`,
  STAKE: `StakeTx`,
  RESTAKE: `RestakeTx`,
  UNSTAKE: `UnstakeTx`,
  VOTE: `VoteTx`,
  DEPOSIT: `DepositTx`,
  CLAIM_REWARDS: `ClaimRewardsTx`,
  SUBMIT_PROPOSAL: `SubmitProposalTx`,
  CREATE_ISCN_RECORD: `CreateISCNRecord`,
  UPDATE_ISCN_RECORD: `UpdateISCNRecord`,
  CHANGE_ISCN_OWNERSHIP: `ChangeISCNOwnership`,
  CREATE_NFT_CLASS: `CreateNFTClassTx`,
  MINT_NFT: `MintNFTTx`,
  COLLECT_NFT: `CollectNFTTx`,
  TRANSFER_NFT: `TransferNFTTx`,
  UNKNOWN: `UnknownTx`,
}

module.exports = { lunieMessageTypes }
