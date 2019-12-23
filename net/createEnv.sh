function createEnv() {	
	echo "#### Generate certificates using cryptogen tool ####"
	cryptogen generate --config=./crypto-config.yaml
	wait
	
	echo "#### Set CA Variables ####"
	export CA_CLIENTORG_PRIVATE_KEY=$(cd ./crypto-config/peerOrganizations/clientorg.hw.com/ca && ls *_sk)
	export CA_ARBITORG_PRIVATE_KEY=$(cd ./crypto-config/peerOrganizations/arbitorg.hw.com/ca && ls *_sk)
	export CA_INSORG_PRIVATE_KEY=$(cd ./crypto-config/peerOrganizations/insorg.hw.com/ca && ls *_sk)

	echo "####  Generating Orderer Genesis block #### https://jira.hyperledger.org/browse/FAB-12248 ####"
	configtxgen -profile TreeOrgsChannelRaftGenesis -channelID syschannel -outputBlock ./channel-artifacts/genesis.block

	echo "#### Generating channel configuration transaction ####"
	configtxgen -profile TreeOrgsChannel -outputCreateChannelTx ./channel-artifacts/bussineschannel.tx -channelID bussineschannel
	configtxgen -profile OneOrgsChannel -outputCreateChannelTx ./channel-artifacts/mainchannel.tx -channelID mainchannel

	echo "#### Generating anchor peer update for bussineschannel orgs ####"
	configtxgen -profile TreeOrgsChannel -outputAnchorPeersUpdate ./channel-artifacts/ClientOrgMSPanchors.tx -channelID bussineschannel -asOrg ClientOrgMSP

	configtxgen -profile TreeOrgsChannel -outputAnchorPeersUpdate ./channel-artifacts/InsuranceOrgMSPanchors.tx -channelID bussineschannel -asOrg InsuranceOrgMSP
	configtxgen -profile TreeOrgsChannel -outputAnchorPeersUpdate ./channel-artifacts/ArbitratorOrgMSPanchors.tx -channelID bussineschannel -asOrg ArbitratorOrgMSP

	echo "#### Generating anchor peer update for mainchannel orgs ####"
	configtxgen -profile OneOrgsChannel -outputAnchorPeersUpdate ./channel-artifacts/InsuranceOrgMSPanchors_mainchnl.tx -channelID mainchannel -asOrg InsuranceOrgMSP

	echo "#### Create/Starting HW environment ####"
	docker-compose -f docker-compose-hw.yaml up -d
}

function deleteEnv() {
	echo "#### Deleting Environment... ####"
	docker stop $(docker ps -f "name=hw.com" -aq)
	wait
	docker rm $(docker ps -f "name=hw.com" -aq)
	wait
	docker volume rm $(docker volume ls -f "name=hw.com" -q)
	wait
	rm -R ./crypto-config ./channel-artifacts/* ./crypto bussineschannel.block ../webApp/wallet
}

function on(){
	createEnv
	echo "#### Start net setup ####"
	sleep 5
	docker exec cli.hw.com bash ./setupEnv.sh
	echo "to start front app, execute 'node ../webApp/server.js'"
}

function off(){
	deleteEnv
}

MODE=$1
shift
if [ "$MODE" == "on" ]; then
  on
elif [ "$MODE" == "off" ]; then
  off
else
  echo set mode '"on"' or '"off"'
  exit 1
fi


