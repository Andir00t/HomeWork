const FabricCAServices = require('fabric-ca-client');
const { FileSystemWallet, Gateway, X509WalletMixin } = require('fabric-network');
const fs = require('fs');
const path = require('path');

const configJSON = fs.readFileSync(path.join(__dirname, '..', 'config.json'), 'utf8');
const config = JSON.parse(configJSON);

const channel = config.channel_name;
const gatewayDiscovery = config.gatewayDiscovery;
const appAdmin = config.appAdmin;
const appAdminPass = config.appAdminSecret;
const orgMspId = config.orgMSPID;
const caName = config.caName;
const userName = config.userName;
const ccName = config.ccName;

const ccpJSON = fs.readFileSync(path.join(__dirname, '..', 'hw_conn_profile.json'), 'utf8');
let ccp = JSON.parse(ccpJSON);

let getTLSCert = org => fs.readFileSync(path.join(__dirname, '../..', `net/crypto-config/peerOrganizations/${org}.hw.com/tlsca/tlsca.${org}.hw.com-cert.pem`), 'utf8');

for(let [peer, peerVal] of Object.entries(ccp.peers)) {
    if (peer.includes('insorg')){
        peerVal.tlsCACerts.pem = getTLSCert('insorg');
        ccp.certificateAuthorities[caName].tlsCACerts.pem = peerVal.tlsCACerts.pem;
    }
    else if (peer.includes('clientorg')){
        peerVal.tlsCACerts.pem = getTLSCert('clientorg');
    }
    else if (peer.includes('arbitorg')){
        peerVal.tlsCACerts.pem = getTLSCert('arbitorg');
    }
};

let getGW = async () => {
    let result = { gw: undefined, error: ''};
    try {
        const wallet = new FileSystemWallet(path.join(__dirname, '..', 'wallet'));
        const userExists = await wallet.exists(userName);
        if (!userExists) {
            result.error = `Отсутствует криптоматериал для пользователя '${userName}'.`;
        }
        else{
            const gateway = new Gateway();
            await gateway.connect(ccp, { wallet, identity: userName, discovery: gatewayDiscovery });
            result.gw = gateway;
        }
    }
    catch(error) {
        result.error = error.message;
    }
    finally{
        return result;
    }
}

let getIdPrefix = id => {
    return [...id].reduce((i,s) => s.charCodeAt(0) + i ,0);
}

exports.enrollAdmin = async () => {
    try {
        var response = {};
		var msg = '';
        const caInfo = ccp.certificateAuthorities[caName];
        const ca = new FabricCAServices(caInfo.url, { trustedRoots: caInfo.tlsCACerts.pem, verify: false }, caInfo.caName);
        const walletPath = path.join(__dirname, '..', 'wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);
        const adminExists = await wallet.exists(appAdmin);
        if (adminExists) {
			msg = `Криптоматериал для пользователя ${appAdmin} уже есть в кошельке`;
            console.log(walletPath);
            response.error = msg
        }
        else{
            const enrollment = await ca.enroll({ enrollmentID: 'admin', enrollmentSecret: 'adminpw' });
            const identity = X509WalletMixin.createIdentity(orgMspId, enrollment.certificate, enrollment.key.toBytes());
            await wallet.import(appAdmin, identity);
            msg = `Криптоматериал для пользователя ${appAdmin} успешно выпущен и помещен в кошелек`
			response.result = msg;
            console.log(msg);
        }
    } catch (error) {
		msg = `Ошибка выпуска криптоматериала для пользователя '${appAdmin}'": ${error.message}`
        console.error(msg);
        response.error = msg
    }
    finally{
        return response;
    }
}

exports.getAgreement = async (agreementId) => {
    try {
        var response = {};
        const gateway = await getGW();
        if (gateway.error) {
            response.error = gateway.error;
        }
        else {
            const network = await gateway.gw.getNetwork(channel);
            const contract = network.getContract(ccName);
            const result = await contract.evaluateTransaction('getAgreement', agreementId);
            await gateway.gw.disconnect();
            response.result = result.toString();
        }
    } catch (error) {
        response.error = error.message;
    } finally {
        return response;
    }
}

exports.getAllItems = async (start, end) => {
    try {
        var response = {};
        const gateway = await getGW();
        if (gateway.error) {
            response.error = gateway.error;
        }
        else {
            const network = await gateway.gw.getNetwork(channel);
            const contract = network.getContract(ccName);
            const result = await contract.evaluateTransaction('queryAllitems', start, end);
            await gateway.gw.disconnect();
            response.result = result.toString();
        }
    } catch (error) {
        response.error = error.message;
    } finally {
        return response;
    }
}

exports.getClient = async (clientId) => {
    try {
        var response = {};
        const gateway = await getGW();
        if (gateway.error) {
            response.error = gateway.error;
        }
        else {
            const network = await gateway.gw.getNetwork(channel);
            const contract = network.getContract(ccName);
            const result = await contract.evaluateTransaction('getClient',clientId);
            await gateway.gw.disconnect();
            response.result = result.toString();
        }
    } catch (error) {
        response.error = error.message;
    } finally {
        return response;
    }
}

exports.getInsuranceInfo = async () => {
    try {
        var response = {};
        const gateway = await getGW();
        if (gateway.error) {
            response.error = gateway.error;
        }
        else {
            //console.log(gateway.gw);
            const network = await gateway.gw.getNetwork(channel);
            const contract = network.getContract(ccName);
            const result = await contract.evaluateTransaction('getInsuranceInfo');
            await gateway.gw.disconnect();
            response.result = result.toString();
        }
    } catch (error) {
        response.error = error.message;
    } finally {
        return response;
    }
}

exports.createUser = async (...args) => {
    try {
        var response = {};
        const gateway = await getGW();
        if (gateway.error) {
            response.error = gateway.error;
        }
        else {
            const network = await gateway.gw.getNetwork(channel);
            const contract = network.getContract(ccName);

            let firstName = args[0] || '';
            let secondName = args[1] || '';
            let middleName = args[2] || '';
            let balance = args[3] || '';
            let description = args[4] || '';
            let email = args[5] || '';
            let password = args[6] || '';

            const result = await contract.submitTransaction('createClient', firstName, secondName,
                                                middleName, balance, description, email, password);
            //console.log(result.toString());
            await gateway.gw.disconnect();
            response.result = result.toString();
        }
    } catch (error) {
        response.error = JSON.stringify(error).includes('exists') ? 'Пользователь уже существует' : error.message;
    } finally {
        return response;
    }
}

exports.createRefund = async (...args) => {
    try {
        var response = {};
        const gateway = await getGW();
        if (gateway.error) {
            response.error = gateway.error;
        }
        else {
            const network = await gateway.gw.getNetwork(channel);
            const contract = network.getContract(ccName);

            let agreementId = args[0];
            let clientId = args[1];
            let amount = args[2];
            let cause = args[3];
            let insCompany = args[4];
            let productName = args[5];
            let userName = args[6];

            const result = await contract.submitTransaction('createRefund', agreementId, clientId,
                amount, cause, insCompany, productName, userName);
            await gateway.gw.disconnect();
            response.result = result.toString();
        }
    } catch (error) {
        response.error = error.message;
    } finally {
        return response;
    }
}

exports.loginUser = async (clientId) => {
    try {
        var response = {};
        const gateway = await getGW();
        if (gateway.error) {
            response.error = gateway.error;
        }
        else {
            const network = await gateway.gw.getNetwork(channel);
            const contract = network.getContract(ccName);
            const result = await contract.evaluateTransaction('getClient', `CL${getIdPrefix(clientId)}${clientId}`);
            await gateway.gw.disconnect();
            response.result = result.toString();
        }
    } catch (error) {
        response.error = error.message.includes('does not exist')
                    ? 'Логин или пароль не верны !' : error.message;
    } finally {
        return response;
    }
}

exports.setUserProps = async (userId, nameValList, operType) => {
    try {
        var response = {};
        const gateway = await getGW();
        if (gateway.error) {
            response.error = gateway.error;
        }
        else {
            const network = await gateway.gw.getNetwork(channel);
            const contract = network.getContract(ccName);
            const result = await contract.submitTransaction('setClientProperty', userId, JSON.stringify(nameValList), operType);
            //console.log(result.toString());
            await gateway.gw.disconnect();
            response.result = result.toString();
        }
    } catch (error) {
        response.error = JSON.stringify(error).includes('not exist') ? 'Пользователь не существует' : error.message;
    } finally {
        return response;
    }
}

exports.setRefundProps = async (refundid, clientid, agreementId, propName, propValue) => {
    try {
        var response = {};
        const gateway = await getGW();
        if (gateway.error) {
            response.error = gateway.error;
        }
        else {
            const network = await gateway.gw.getNetwork(channel);
            const contract = network.getContract(ccName);
            const result = await contract.submitTransaction('setRefundProperty', refundid, clientid,
                                                                 agreementId, propName, propValue.toString());
            //console.log(result.toString());
            await gateway.gw.disconnect();
            response.result = result.toString();
        }
    } catch (error) {
        response.error = error.message;
    } finally {
        return response;
    }
}

exports.makePayment = async (clientid, refundAmount) => {
    try {
        var response = {};
        const gateway = await getGW();
        if (gateway.error) {
            response.error = gateway.error;
        }
        else {
            const network = await gateway.gw.getNetwork(channel);
            const contract = network.getContract(ccName);
            const result = await contract.submitTransaction('createPayment', clientid, refundAmount.toString());
            //console.log(result.toString());
            await gateway.gw.disconnect();
            response.result = result.toString();
        }
    } catch (error) {
        response.error = error.message;
    } finally {
        return response;
    }
}

exports.makePurchaise = async (...args) => {
    try {
        var response = {};
        const gateway = await getGW();
        if (gateway.error) {
            response.error = gateway.error;
        }
        else {
            const network = await gateway.gw.getNetwork(channel);
            const contract = network.getContract(ccName);

            let clientid = args[0];
            let insCompanyName = args[1];
            let insProductName = args[2];
            let username = args[3];
            let startDate = args[4];
            let endDate = args[5];
            let instAmount = args[6];
            let refundAmount = args[7];

            const result = await contract.submitTransaction('createPurchaise', clientid, insCompanyName,
                                insProductName, username, startDate, endDate, instAmount, refundAmount);
            //console.log(result.toString());
            await gateway.gw.disconnect();
            response.result = result.toString();
        }
    } catch (error) {
        response.error = JSON.stringify(error).includes('agreement allready exists') ? 'Данный продукт уже приобретен' : error.message;
    } finally {
        return response;
    }
}