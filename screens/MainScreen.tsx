/* eslint-disable global-require */
import * as React from 'react';
import { useState, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ListRenderItem,
  TextInput,
  Image,
} from 'react-native';
import Web3 from 'web3';
import AMIS from '@qubic-js/browser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ERC721Data from '@rsksmart/erc721/ERC721Data.json';
// @ts-ignore
// eslint-disable-next-line import/no-unresolved, camelcase
import { INFURA_API_ENDPOINT, Qubic_API_KEY, Qubic_API_SECRET } from '@env';
// import { Network } from 'web3-net';
import { Text, View } from '../components/Themed';
import { nft, token } from '../types';
import LoadingComponent from '../components/LoadingComponent';
// import erc20Abi from '../erc20Abi.json';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  input: {
    height: 40,
    margin: 12,
    padding: 10,
    fontSize: 20,
    borderWidth: 1,
    width: 300,
  },
  newTokenInput: {
    alignItems: 'center',
    marginBottom: 200,
  },
  address: {
    flex: 0.5,
    height: 40,
    margin: 12,
    padding: 10,
    fontSize: 20,
    textAlign: 'center',
  },
  ETH: {
    flex: 1,
    height: 50,
    fontSize: 30,
    textAlign: 'center',
  },
  listRowContainer: {
    height: 50,
    fontsize: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  listFooter: {
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
  },
  button: {
    width: 70,
    height: 70,
    alignItems: 'center',
    flexDirection: 'row',
    margin: 15,
  },
  infoText: {
    fontSize: 15,
  },
  logo: {
    width: 70,
    height: 70,
    resizeMode: 'stretch',
  },
  buttonText: {
    fontSize: 18,
    textAlign: 'center',
    color: 'white',
    justifyContent: 'center',
    flex: 1,
  },
  erc20Balance: {
    fontSize: 22,
    flex: 1,
    textAlign: 'right',
    marginRight: 20,
    justifyContent: 'center',
  },
  erc20Symbol: {
    fontSize: 22,
    flex: 1,
    marginLeft: 20,
    textAlign: 'left',
    justifyContent: 'center',
  },
  erc20View: {
    flex: 2,
    width: '100%',
    marginTop: 40,
  },
  erc20List: {
    width: '80%',
    borderWidth: 1,
    alignSelf: 'center',
  },
  listHeader: {
    height: 40,
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#3492eb',
    width: '100%',
    justifyContent: 'center',
  },
  headerText: {
    color: '#fff',
  },
  devideLine: { height: 1, backgroundColor: 'skyblue' },
  top: {
    flex: 1,
    marginTop: 20,
    width: '80%',
    borderWidth: 1,
  },
  switch: {
    flexDirection: 'row',
    marginTop: 10,
    borderWidth: 1,
  },
  switchOption: {
    padding: 10,
    width: 120,
    textAlign: 'center',
  },
  image: {
    width: 45,
    height: 45,
    justifyContent: 'center',
    marginLeft: 100,
  },
  nftItem: {
    fontSize: 22,
    flex: 1,
    textAlign: 'center',
    justifyContent: 'center',
  },
});

const erc20Abi = require('erc-20-abi');

declare let window: any;

export default function MainScreen() {
  const [address, setAddress] = useState('');
  const [ethBalance, setEthBalance] = useState(0);
  const [erc20List, setErc20List] = useState<token[]>([]);
  const [erc721List, setErc721List] = useState<nft[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [inputAddr, setInputAddr] = useState('');
  const [web3, setWeb3] = useState<Web3>(new Web3(INFURA_API_ENDPOINT));
  const [isInfura, setInfura] = useState(true);
  const [newToken, setNewToken] = useState('');
  const [isLoadingNewToken, setLoadingNewToken] = useState(false);
  const [tokenType, setTokenType] = useState(20);
  const [new721Contract, setNew721Contract] = useState('');
  const [new721id, setNew721id] = useState('');
  const [isLoadingNewNft, setLoadingNewNft] = useState(false);

  const amis = new AMIS(Qubic_API_KEY, Qubic_API_SECRET, '4');

  const contractAddresses = [
    '0x4dbcdf9b62e891a7cec5a2568c3f4faf9e8abe2b',
    '0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea',
    '0xddea378a6ddc8afec82c36e9b0078826bf9e68b6',
    '0xd92e713d051c37ebb2561803a3b5fbabc4962431',
  ];

  const ethEnabled = async () => {
    if (window.ethereum) {
      await window.ethereum.send('eth_requestAccounts');
      console.log('here!');
      setInfura(false);
      setWeb3(new Web3(window.ethereum));
      window.web3 = new Web3(window.ethereum);
      return true;
    }
    return false;
  };

  const qubicConnect = async () => {
    await amis.signIn();
    setInfura(false);
    setWeb3(new Web3(amis.getProvider()));
  };

  const getAddress = async () => {
    await web3.eth.getAccounts((error, accounts) => {
      if (error) console.log('error getting accouts');
      else setAddress(accounts[0]);
    });
  };

  const getERC21List = async () => {
    const value = await AsyncStorage.getItem('erc721');
    if (value !== null) {
      const list: nft[] = JSON.parse(value);
      const updatedList: nft[] = [];
      for (let i = 0; i < list.length; i += 1) {
        console.log(`check ${list[i].contract}`);
        // @ts-ignore
        const erc721 = new web3.eth.Contract(ERC721Data.abi, list[i].contract);
        const owner = await erc721.methods.ownerOf(list[i].id).call();
        if (owner === address) updatedList.push(list[i]);
      }
      setErc721List(updatedList);
      const jsonValue = JSON.stringify(updatedList);
      await AsyncStorage.setItem('erc721', jsonValue);
    }
  };

  useEffect(() => {
    if (address) {
      web3.eth.getBalance(address, (err, balance) => {
        let number = 0;
        if (balance) number = Math.round(+web3.utils.fromWei(balance, 'ether') * 100) / 100;
        setEthBalance(number);
      });
    }
  }, [address]);

  const getErc20balance = async () => {
    if (address) {
      const tokenList: token[] = [];
      for (const contractAddress of contractAddresses) {
        const contract = new web3.eth.Contract(erc20Abi, contractAddress);
        const tokenBalance = await contract.methods.balanceOf(address).call();
        const tokenName = await contract.methods.name().call();
        const tokenSymbol = await contract.methods.symbol().call();
        const tokenDecimals = await contract.methods.decimals().call();
        console.log(`${tokenName} ${tokenBalance / 10 ** tokenDecimals}${tokenSymbol}`);
        tokenList.push({
          name: tokenName,
          balance: tokenBalance,
          symbol: tokenSymbol,
          decimals: tokenDecimals,
        });
      }
      // const erc721 = new web3.eth.Contract(
      //   // @ts-ignore
      //   ERC721Data.abi,
      //   '0x64544006cAf4F1A41C58d78c591e79C250656eBf',
      // );
      // const name = await erc721.methods.name().call();
      // const owner = await erc721.methods.ownerOf(0).call();
      // const uri = await erc721.methods.tokenURI(0).call();
      // console.log(`erc721: ${name} owner: ${owner}`);
      // console.log(uri);
      // const image = await fetch(uri)
      //   .then((response) => response.json())
      //   .then((json) => {
      //     console.log(json.image);
      //     return json.image;
      //   });
      // const nftList: nft[] = [];
      // nftList.push({
      //   name,
      //   id: 0,
      //   image,
      //   contract: '0x64544006cAf4F1A41C58d78c591e79C250656eBf',
      // });
      // setErc721List(nftList);
      await getERC21List();
      setErc20List(tokenList);
      setLoading(false);
    }
  };

  useEffect(() => {
    getErc20balance();
  }, [address]);

  useEffect(() => {
    if (!isInfura) {
      getAddress();
    }
  }, [web3]);

  const renderItem: ListRenderItem<token> = useCallback(
    ({ item, index }) => (
      <View
        style={[
          styles.listRowContainer,
          { backgroundColor: index % 2 === 0 ? '#f5f3da' : '#f5e2d7' },
        ]}
      >
        <Text style={styles.erc20Balance}>
          {item.balance / 10 ** item.decimals}
          {' '}
        </Text>
        <Text style={styles.erc20Symbol}>{item.symbol}</Text>
      </View>
    ),
    [erc20List],
  );

  const render721Item: ListRenderItem<nft> = useCallback(
    ({ item, index }) => (
      <View
        style={[
          styles.listRowContainer,
          { backgroundColor: index % 2 === 0 ? '#f5f3da' : '#f5e2d7' },
        ]}
      >
        <Image style={styles.image} source={{ uri: item.image }} />
        <Text style={styles.nftItem}>
          {item.name}
          #
          {item.id}
        </Text>
      </View>
    ),
    [erc721List],
  );

  const ERC20Header = useCallback(
    () => (
      <View style={styles.listHeader}>
        <Text style={styles.headerText}>ERC20 Token List</Text>
      </View>
    ),
    [],
  );

  const ERC721Header = useCallback(
    () => (
      <View style={styles.listHeader}>
        <Text style={styles.headerText}>ERC721 Token List</Text>
      </View>
    ),
    [],
  );

  const getNewToken = async () => {
    const list: token[] = [];
    const contract = new web3.eth.Contract(erc20Abi, newToken);
    const tokenBalance = await contract.methods.balanceOf(address).call();
    const tokenName = await contract.methods.name().call();
    const tokenSymbol = await contract.methods.symbol().call();
    const tokenDecimals = await contract.methods.decimals().call();
    console.log(`${tokenName} ${tokenBalance / 10 ** tokenDecimals}${tokenSymbol}`);
    list.push({
      name: tokenName,
      balance: tokenBalance,
      symbol: tokenSymbol,
      decimals: tokenDecimals,
    });
    setErc20List(erc20List.concat(list));
    setNewToken('');
    setLoadingNewToken(false);
  };

  const getNewNFT = async () => {
    const list: nft[] = [];
    // @ts-ignore
    const erc721 = new web3.eth.Contract(ERC721Data.abi, new721Contract);
    const name = await erc721.methods.name().call();
    const owner = await erc721.methods.ownerOf(parseInt(new721id, 10)).call();
    const uri = await erc721.methods.tokenURI(parseInt(new721id, 10)).call();
    const image = await fetch(uri)
      .then((response) => response.json())
      .then((json) => {
        console.log(json.image);
        return json.image;
      })
      .catch(() => 'https://drukasia.com/images/stripes/drukair.jpg');
    console.log(`erc721: ${name} owner: ${owner}`);
    list.push({
      name,
      id: parseInt(new721id, 10),
      image,
      contract: new721Contract,
    });
    if (owner === address) {
      const jsonValue = JSON.stringify(erc721List.concat(list));
      await AsyncStorage.setItem('erc721', jsonValue);
      setErc721List(erc721List.concat(list));
    } else alert('Not own by this address!');
    setNew721Contract('');
    setNew721id('');
    setLoadingNewNft(false);
  };

  const keyExtractor = useCallback((item, index) => index.toString(), []);

  const addToken = useCallback(() => {
    setLoadingNewToken(true);
    getNewToken();
  }, [erc20List, newToken]);

  const addNft = useCallback(() => {
    setLoadingNewNft(true);
    getNewNFT();
  }, [erc721List, new721Contract, new721id]);

  const submitAddress = useCallback(() => {
    setAddress(inputAddr);
  }, [inputAddr]);

  const ERC20Footer = useCallback(
    () => (isLoadingNewToken ? <LoadingComponent /> : <View />),

    [isLoadingNewToken],
  );

  const ERC721Footer = useCallback(
    () => (isLoadingNewNft ? <LoadingComponent /> : <View />),

    [isLoadingNewNft],
  );

  const handleSwitch = useCallback((type) => () => setTokenType(type), []);

  const ERC20View = useCallback(
    () => (isLoading ? (
      <LoadingComponent />
    ) : (
      <View>
        <FlatList
          style={styles.erc20List}
          data={erc20List}
          renderItem={renderItem}
          ListHeaderComponent={ERC20Header}
          keyExtractor={keyExtractor}
          ListFooterComponent={ERC20Footer}
        />
        <View style={styles.newTokenInput}>
          <TextInput
            style={styles.input}
            placeholder="Add ERC20 token address"
            value={newToken}
            onChangeText={setNewToken}
            onSubmitEditing={addToken}
          />
        </View>
      </View>
    )),
    [isLoading, erc20List, newToken, isLoadingNewToken],
  );

  const ERC721View = () => (isLoading ? (
    <LoadingComponent />
  ) : (
    <View>
      <FlatList
        style={styles.erc20List}
        data={erc721List}
        renderItem={render721Item}
        ListHeaderComponent={ERC721Header}
        keyExtractor={keyExtractor}
        ListFooterComponent={ERC721Footer}
      />
      <View style={styles.newTokenInput}>
        <TextInput
          style={styles.input}
          placeholder="Add ERC721 contract"
          value={new721Contract}
          onChangeText={setNew721Contract}
          onSubmitEditing={addNft}
        />
        <TextInput
          style={styles.input}
          placeholder="Add ERC721 id"
          value={new721id}
          onChangeText={setNew721id}
          onSubmitEditing={addNft}
        />
      </View>
    </View>
  ));

  const TokenListView = useCallback(
    () => (tokenType === 20 ? <ERC20View /> : <ERC721View />),
    [
      tokenType,
      isLoading,
      erc20List,
      newToken,
      isLoadingNewToken,
      new721id,
      new721Contract,
      isLoadingNewNft,
    ],
  );

  return address ? (
    <View style={styles.container}>
      <View style={styles.top}>
        <Text style={styles.address}>
          address:
          {address}
        </Text>
        <Text style={styles.ETH}>
          {ethBalance}
          {' '}
          ETH
        </Text>
      </View>
      <View style={styles.switch}>
        <TouchableOpacity
          style={[styles.switchOption, { backgroundColor: tokenType === 20 ? '#3492eb' : '#fff' }]}
          onPress={handleSwitch(20)}
        >
          <Text style={{ color: tokenType === 20 ? '#fff' : '#000' }}>ERC20</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.switchOption, { backgroundColor: tokenType === 721 ? '#3492eb' : '#fff' }]}
          onPress={handleSwitch(721)}
        >
          <Text style={{ color: tokenType === 721 ? '#fff' : '#000' }}>ERC721</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.erc20View}>
        <TokenListView />
      </View>
    </View>
  ) : (
    <View style={styles.container}>
      <Text style={styles.infoText}>Choose your wallet to connect!</Text>
      <View style={styles.logoContainer}>
        <TouchableOpacity onPress={ethEnabled} style={styles.button}>
          <Image source={{ uri: require('../assets/images/metamask.png') }} style={styles.logo} />
        </TouchableOpacity>
        <TouchableOpacity onPress={qubicConnect} style={styles.button}>
          <Image source={{ uri: require('../assets/images/qubic.jpeg') }} style={styles.logo} />
        </TouchableOpacity>
      </View>
      <Text>or</Text>
      <TextInput
        style={styles.input}
        placeholder="type in your address"
        value={inputAddr}
        onChangeText={setInputAddr}
        onSubmitEditing={submitAddress}
      />
    </View>
  );
}
