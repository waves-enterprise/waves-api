import { IHash, IKeyPair } from "../../../interfaces";
import {
    createFetchWrapper,
    createTxRequestWrapper,
    IFetchWrapper,
    POST_TEMPLATE,
    processJSON,
    PRODUCTS,
    VERSIONS
} from '../../utils/request';
import WavesError from '../../errors/WavesError';
import * as constants from '../../constants';
import config from '../../config';
import {
    postBurn,
    postCancelLeasing, postCreateAlias, postData, postDockerCall, postDockerCreate, postDockerDisable,
    postIssue,
    postLease, postMassTransfer, postNodeRegistry, postPermit, postPolicyCreate,
    postReissue, postSetScript, postSponsorship, postUpdateCreate,
    preBurn,
    preCancelLeasing, preCreateAlias, preData, preDockerCall, preDockerCreate, preDockerDisable,
    preIssue,
    preLease, preMassTransfer, preNodeRegistry, prePermit, prePolicyCreate,
    preReissue, preSetScript, preSponsorship, preUpdateCreate
} from "./transactions.x";
import * as requests from './transactions.x';
import Func = Mocha.Func;


export default class Transactions {

    constructor(fetchInstance: IFetchWrapper<any>) {
        this.fetch = createFetchWrapper({
            product: PRODUCTS.NODE,
            version: VERSIONS.V1,
            pipe: processJSON,
            fetchInstance
        });
        this.txRequest = createTxRequestWrapper(fetchInstance)
    }

    private readonly fetch: IFetchWrapper<any>;

    private readonly txRequest: (
      preRemapAsync: Function,
      postRemap: Function,
      nodeAddress: string,
      data: IHash<any>,
      extraData: {
          sender: string;
          password: string;
      }
    ) => Promise<any>;

    get(id: string) {
        if (id === constants.WAVES) {
            return Promise.resolve(constants.WAVES_V1_ISSUE_TX);
        } else {
            return this.fetch(`/transactions/info/${id}`);
        }
    }

    getList(address: string, limit: number = config.getRequestParams().limit) {
        // In the end of the line a strange response artifact is handled
        return this.fetch(`/transactions/address/${address}/limit/${limit}`).then((array) => array[0]);
    }

    utxSize() {
        return this.fetch('/transactions/unconfirmed/size');
    }

    utxGet(id: string) {
        return this.fetch(`/transactions/unconfirmed/info/${id}`);
    }

    utxGetList() {
        return this.fetch('/transactions/unconfirmed');
    }

    broadcastFromClientAddress(type: string, data, keys) {
        switch (type) {
            case constants.ISSUE_TX_NAME:
                return requests.sendIssueTx(data, keys);
            case constants.TRANSFER_TX_NAME:
                return requests.sendTransferTx(data, keys);
            case constants.REISSUE_TX_NAME:
                return requests.sendReissueTx(data, keys);
            case constants.BURN_TX_NAME:
                return requests.sendBurnTx(data, keys);
            case constants.LEASE_TX_NAME:
                return requests.sendLeaseTx(data, keys);
            case constants.CANCEL_LEASING_TX_NAME:
                return requests.sendCancelLeasingTx(data, keys);
            case constants.CREATE_ALIAS_TX_NAME:
                return requests.sendCreateAliasTx(data, keys);
            case constants.MASS_TRANSFER_TX_NAME:
                return requests.sendMassTransferTx(data, keys);
            case constants.DATA_TX_NAME:
                return requests.sendDataTx(data, keys);
            case constants.SET_SCRIPT_TX_NAME:
                return requests.sendSetScriptTx(data, keys);
            case constants.SPONSORSHIP_TX_NAME:
                return requests.sendSponsorshipTx(data, keys);
            case constants.PERMISSION_TX_NAME:
                return requests.sendPermissionTx(data, keys);
            case constants.DOCKER_CREATE_TX_NAME:
                return requests.sendDockerCreateTx(data, keys);
            case constants.DOCKER_CALL_TX_NAME:
                return requests.sendDockerCallTx(data, keys);
           case constants.DOCKER_DISABLE_TX_NAME:
                return requests.sendDockerDisableTx(data, keys);

            case constants.POLICY_REGISTER_NODE_TX_NAME:
                return requests.sendNodeRegistry(data, keys);
            case constants.POLICY_CREATE_TX_NAME:
                return requests.sendPolicyCreate(data, keys);
            case constants.POLICY_UPDATE_TX_NAME:
                return requests.sendPolicyUpdate(data, keys);
            default:
                throw new WavesError(`Wrong transaction type: ${type}`, data);
        }
    }

    async broadcastFromNodeAddress(type: string, nodeAddress: string, data, extraData) {
        switch (type) {
            case constants.ISSUE_TX_NAME:
                return this.txRequest(requests.preIssue, requests.postIssue, nodeAddress, data, extraData);
            case constants.TRANSFER_TX_NAME:
                return this.txRequest(requests.preTransfer, requests.postTransfer, nodeAddress, data, extraData);
            case constants.REISSUE_TX_NAME:
                return this.txRequest(requests.preReissue, requests.postReissue, nodeAddress, data, extraData);
            case constants.BURN_TX_NAME:
                return this.txRequest(requests.preBurn, requests.postBurn, nodeAddress, data, extraData);
            case constants.LEASE_TX_NAME:
                return this.txRequest(requests.preLease, requests.postLease, nodeAddress, data, extraData);
            case constants.CANCEL_LEASING_TX_NAME:
                return this.txRequest(preCancelLeasing, postCancelLeasing, nodeAddress, data, extraData);
            case constants.CREATE_ALIAS_TX_NAME:
                return this.txRequest(preCreateAlias, postCreateAlias, nodeAddress, data, extraData);
            case constants.MASS_TRANSFER_TX_NAME:
                return this.txRequest(preMassTransfer, postMassTransfer, nodeAddress, data, extraData);
            case constants.DATA_TX_NAME:
                return this.txRequest(preData, postData, nodeAddress, data, extraData);
            case constants.SET_SCRIPT_TX_NAME:
                return this.txRequest(preSetScript, postSetScript, nodeAddress, data, extraData);
            case constants.SPONSORSHIP_TX_NAME:
                return this.txRequest(preSponsorship, postSponsorship, nodeAddress, data, extraData);
            case constants.PERMISSION_TX_NAME:
                return this.txRequest(prePermit, postPermit, nodeAddress, data, extraData);
            case constants.DOCKER_CREATE_TX_NAME:
                return this.txRequest(preDockerCreate, postDockerCreate, nodeAddress, data, extraData);
            case constants.DOCKER_CALL_TX_NAME:
                return this.txRequest(preDockerCall, postDockerCall, nodeAddress, data, extraData);
            case constants.DOCKER_DISABLE_TX_NAME:
                return this.txRequest(preDockerDisable, postDockerDisable, nodeAddress, data, extraData);
            case constants.POLICY_REGISTER_NODE_TX_NAME:
                return this.txRequest(preNodeRegistry, postNodeRegistry, nodeAddress, data, extraData);
            case constants.POLICY_CREATE_TX_NAME:
                return this.txRequest(prePolicyCreate, postPolicyCreate, nodeAddress, data, extraData);
            case constants.POLICY_UPDATE_TX_NAME:
                return this.txRequest(preUpdateCreate, postUpdateCreate, nodeAddress, data, extraData);
            default:
                throw new WavesError(`Wrong transaction type: ${type}`, data);
        }
    }

    sign(type: string, data, keys) {
        switch (type) {
            case constants.ISSUE_TX_NAME:
                return requests.sendSignedIssueTx(data, keys);
            case constants.TRANSFER_TX_NAME:
                return requests.sendSignedTransferTx(data, keys);
            case constants.REISSUE_TX_NAME:
                return requests.sendSignedReissueTx(data, keys);
            case constants.BURN_TX_NAME:
                return requests.sendSignedBurnTx(data, keys);
            case constants.LEASE_TX_NAME:
                return requests.sendSignedLeaseTx(data, keys);
            case constants.CANCEL_LEASING_TX_NAME:
                return requests.sendSignedCancelLeasingTx(data, keys);
            case constants.CREATE_ALIAS_TX_NAME:
                return requests.sendSignedCreateAliasTx(data, keys);
            case constants.MASS_TRANSFER_TX_NAME:
                return requests.sendSignedMassTransferTx(data, keys);
            case constants.DATA_TX_NAME:
                return requests.sendSignedDataTx(data, keys);
            case constants.SET_SCRIPT_TX_NAME:
                return requests.sendSignedSetScriptTx(data, keys);
            case constants.SPONSORSHIP_TX_NAME:
                return requests.sendSignedSponsorshipTx(data, keys);
            case constants.PERMISSION_TX_NAME:
                return requests.sendSignedPermissionTx(data, keys);
            case constants.DOCKER_CREATE_TX_NAME:
                return requests.sendSignedDockerCreateTx(data, keys);
            case constants.DOCKER_CALL_TX_NAME:
                return requests.sendSignedDockerCallTx(data, keys);
            case constants.DOCKER_DISABLE_TX_NAME:
                return requests.sendSignedDockerDisableTx(data, keys);

            case constants.POLICY_REGISTER_NODE_TX_NAME:
                return requests.signNodeRegistry(data, keys);
            case constants.POLICY_CREATE_TX_NAME:
                return requests.signPolicyCreate(data, keys);
            case constants.POLICY_UPDATE_TX_NAME:
                return requests.signPolicyUpdate(data, keys);
            default:
                throw new WavesError(`Wrong transaction type: ${type}`, data);
        }
    }

    rawBroadcast(data) {
        return this.fetch(constants.BROADCAST_PATH, {
            ...POST_TEMPLATE,
            body: JSON.stringify(data)
        });
    }

    signOnNode(data) {
        return this.fetch('/transactions/sign');
    }

};
