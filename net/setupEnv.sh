#!/bin/bash

function createChannel(){
	echo "#### Creating channel... ####"
	export ORDERER_CA=/etc/hyperledger/fabric/peer/crypto/ordererOrganizations/hw.com/tlsca/tlsca.hw.com-cert.pem
	set -x
	peer channel create -o orderer0.hw.com:13050 -c bussineschannel -f ./channel-artifacts/bussineschannel.tx --tls --cafile $ORDERER_CA
	set +x
	#peer channel create -o orderer0.hw.com:13050 -c mainchannel -f ./channel-artifacts/mainchannel.tx --tls --cafile $ORDERER_CA	
}

function setVarClientOrgPeer0(){
	CORE_PEER_ADDRESS=peer0.clientorg.hw.com:7051
	CORE_PEER_LOCALMSPID=ClientOrgMSP
	CORE_PEER_TLS_CERT_FILE=/etc/hyperledger/fabric/peer/crypto/peerOrganizations/clientorg.hw.com/peers/peer0.clientorg.hw.com/tls/server.crt
	CORE_PEER_TLS_KEY_FILE=/etc/hyperledger/fabric/peer/crypto/peerOrganizations/clientorg.hw.com/peers/peer0.clientorg.hw.com/tls/server.key
	CORE_PEER_TLS_ROOTCERT_FILE=/etc/hyperledger/fabric/peer/crypto/peerOrganizations/clientorg.hw.com/peers/peer0.clientorg.hw.com/tls/ca.crt
	CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/peer/crypto/peerOrganizations/clientorg.hw.com/users/Admin@clientorg.hw.com/msp
}

function setVarClientOrgPeer1(){
	CORE_PEER_ADDRESS=peer1.clientorg.hw.com:8051
	CORE_PEER_LOCALMSPID=ClientOrgMSP
	CORE_PEER_TLS_CERT_FILE=/etc/hyperledger/fabric/peer/crypto/peerOrganizations/clientorg.hw.com/peers/peer1.clientorg.hw.com/tls/server.crt
	CORE_PEER_TLS_KEY_FILE=/etc/hyperledger/fabric/peer/crypto/peerOrganizations/clientorg.hw.com/peers/peer1.clientorg.hw.com/tls/server.key
	CORE_PEER_TLS_ROOTCERT_FILE=/etc/hyperledger/fabric/peer/crypto/peerOrganizations/clientorg.hw.com/peers/peer1.clientorg.hw.com/tls/ca.crt
	CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/peer/crypto/peerOrganizations/clientorg.hw.com/users/Admin@clientorg.hw.com/msp
}

function setVarInsuranceOrgPeer0(){
	CORE_PEER_ADDRESS=peer0.insorg.hw.com:9051
	CORE_PEER_LOCALMSPID=InsuranceOrgMSP
	CORE_PEER_TLS_CERT_FILE=/etc/hyperledger/fabric/peer/crypto/peerOrganizations/insorg.hw.com/peers/peer0.insorg.hw.com/tls/server.crt
	CORE_PEER_TLS_KEY_FILE=/etc/hyperledger/fabric/peer/crypto/peerOrganizations/insorg.hw.com/peers/peer0.insorg.hw.com/tls/server.key
	CORE_PEER_TLS_ROOTCERT_FILE=/etc/hyperledger/fabric/peer/crypto/peerOrganizations/insorg.hw.com/peers/peer0.insorg.hw.com/tls/ca.crt
	CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/peer/crypto/peerOrganizations/insorg.hw.com/users/Admin@insorg.hw.com/msp
}

function setVarInsuranceOrgPeer1(){
	CORE_PEER_ADDRESS=peer1.insorg.hw.com:10051
	CORE_PEER_LOCALMSPID=InsuranceOrgMSP
	CORE_PEER_TLS_CERT_FILE=/etc/hyperledger/fabric/peer/crypto/peerOrganizations/insorg.hw.com/peers/peer0.insorg.hw.com/tls/server.crt
	CORE_PEER_TLS_KEY_FILE=/etc/hyperledger/fabric/peer/crypto/peerOrganizations/insorg.hw.com/peers/peer0.insorg.hw.com/tls/server.key
	CORE_PEER_TLS_ROOTCERT_FILE=/etc/hyperledger/fabric/peer/crypto/peerOrganizations/insorg.hw.com/peers/peer0.insorg.hw.com/tls/ca.crt
	CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/peer/crypto/peerOrganizations/insorg.hw.com/users/Admin@insorg.hw.com/msp
}

function setVarArbitratorOrgPeer0(){
	CORE_PEER_ADDRESS=peer0.arbitorg.hw.com:11051
	CORE_PEER_LOCALMSPID=ArbitratorOrgMSP
	CORE_PEER_TLS_CERT_FILE=/etc/hyperledger/fabric/peer/crypto/peerOrganizations/arbitorg.hw.com/peers/peer0.arbitorg.hw.com/tls/server.crt
	CORE_PEER_TLS_KEY_FILE=/etc/hyperledger/fabric/peer/crypto/peerOrganizations/arbitorg.hw.com/peers/peer0.arbitorg.hw.com/tls/server.key
	CORE_PEER_TLS_ROOTCERT_FILE=/etc/hyperledger/fabric/peer/crypto/peerOrganizations/arbitorg.hw.com/peers/peer0.arbitorg.hw.com/tls/ca.crt
	CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/peer/crypto/peerOrganizations/arbitorg.hw.com/users/Admin@arbitorg.hw.com/msp
}

function setVarArbitratorOrgPeer1(){
	CORE_PEER_ADDRESS=peer1.arbitorg.hw.com:12051
	CORE_PEER_LOCALMSPID=ArbitratorOrgMSP
	CORE_PEER_TLS_CERT_FILE=/etc/hyperledger/fabric/peer/crypto/peerOrganizations/arbitorg.hw.com/peers/peer0.arbitorg.hw.com/tls/server.crt
	CORE_PEER_TLS_KEY_FILE=/etc/hyperledger/fabric/peer/crypto/peerOrganizations/arbitorg.hw.com/peers/peer0.arbitorg.hw.com/tls/server.key
	CORE_PEER_TLS_ROOTCERT_FILE=/etc/hyperledger/fabric/peer/crypto/peerOrganizations/arbitorg.hw.com/peers/peer0.arbitorg.hw.com/tls/ca.crt
	CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/peer/crypto/peerOrganizations/arbitorg.hw.com/users/Admin@arbitorg.hw.com/msp
}

function joinChannel () {	
	echo "#### Joining channel... ####"
	for org in ClientOrg InsuranceOrg ArbitratorOrg; do
		for peer in 0 1; do
			setVar${org}Peer${peer}
			#if [ "$org" == "InsuranceOrg" ]; then
			#	peer channel join -b mainchannel.block
			#	sleep 3
			#	echo "####  ${org}Peer${peer} joined to mainchannel ####"
			#fi
			set -x
			peer channel join -b bussineschannel.block			
			set +x
			echo "####  ${org}Peer${peer} joined to bussineschannel ####"
			sleep 3
			echo
		done
	done
}

function setAnchors () {	
	echo "#### Seting anchors... ####"
	for org in ClientOrg InsuranceOrg ArbitratorOrg; do
		for peer in 0 1; do
			setVar${org}Peer${peer}
			if [ "$peer" = 0 ]; then
				set -x
				peer channel update -o orderer0.hw.com:13050 -c bussineschannel -f ./channel-artifacts/${org}MSPanchors.tx --tls --cafile $ORDERER_CA
				set +x
				sleep 3
				echo "####  ${org}Peer${peer} set as anchor ####"
			fi
		done
	done
}

function installChaincode () {	
	echo "#### Installing chaincode... ####"
	for org in ClientOrg InsuranceOrg ArbitratorOrg; do
		for peer in 0 1; do
			setVar${org}Peer${peer}
			set -x
			peer chaincode install -l node "/etc/chaincode/hwcc_vs@0.0.1.cds"
			set +x
			sleep 3
			echo
		done
	done
}

function instantiateChaincode(){	
	echo "#### Instantiating chaincode... ####"
	setVarClientOrgPeer0
	set -x
	peer chaincode instantiate -o orderer0.hw.com:13050 --tls --cafile $ORDERER_CA -C bussineschannel -n hwcc_vs -v 0.0.1 -l node -c '{"Args":["createInsuranse"]}' -P "OR ('ClientOrgMSP.member','InsuranceOrgMSP.member','ArbitratorOrgMSP.member')"		
	set +x
	sleep 30
	for org in ClientOrg InsuranceOrg ArbitratorOrg; do
		for peer in 0 1; do
			setVar${org}Peer${peer}
			set -x
			peer chaincode query -C bussineschannel -n hwcc_vs -c '{"Args":["getInsuranceInfo"]}'
			set +x
			sleep 3
			echo
		done
	done
}

function getChannelConfig(){
	peer channel fetch config config_block.pb -o orderer0.hw.com:13050 -c bussineschannel --tls --cafile $ORDERER_CA
	configtxlator proto_decode --input config_block.pb --type common.Block | jq .data.data[0].payload.data.config > config.json
}


createChannel
sleep 3
joinChannel
sleep 3
setAnchors
sleep 3
installChaincode
sleep 3
instantiateChaincode
