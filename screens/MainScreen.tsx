import * as React from 'react';
import { useState, useCallback, useEffect } from 'react';
import {
  StyleSheet, TouchableOpacity, FlatList, ListRenderItem, TextInput,
} from 'react-native';
import Web3 from 'web3';
// @ts-ignore
// eslint-disable-next-line import/no-unresolved
import { INFURA_API_ENDPOINT } from '@env';
import { Text, View } from '../components/Themed';
import { token } from '../types';
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
  address: {
    flex: 0.5,
    height: 40,
    margin: 12,
    padding: 10,
    fontSize: 20,
  },
  ETH: {
    flex: 1,
    height: 50,
    fontSize: 30,
  },
  listRowContainer: {
    height: 50,
    fontsize: 14,
    flexDirection: 'row',
  },
  button: {
    width: 300,
    height: 40,
    backgroundColor: 'blue',
    alignItems: 'center',
    flexDirection: 'row',
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
  },
  erc20Symbol: {
    fontSize: 22,
    flex: 1,
    marginLeft: 20,
    textAlign: 'left',
  },
  erc20List: {
    flex: 2,
  },
});

const erc20Abi = require('erc-20-abi');

declare let window: any;

export default function MainScreen() {
  const [address, setAddress] = useState('');
  const [ethBalance, setEthBalance] = useState(0);
  const [erc20List, setErc20List] = useState<token[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [inputAddr, setInputAddr] = useState('');
  const [web3, setWeb3] = useState<Web3>(new Web3(INFURA_API_ENDPOINT));
  const [isInfura, setInfura] = useState(true);
  const [newToken, setNewToken] = useState('');
  // const web3 = new Web3(INFURA_API_ENDPOINT)

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

  const getAddress = async () => {
    await web3.eth.getAccounts((error, accounts) => {
      if (error) console.log('error getting accouts');
      else setAddress(accounts[0]);
    });
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
    ({ item }) => (
      <View style={styles.listRowContainer}>
        <Text style={styles.erc20Balance}>
          {item.balance / 10 ** item.decimals}
          {' '}
        </Text>
        <Text style={styles.erc20Symbol}>{item.symbol}</Text>
      </View>
    ),
    [erc20List],
  );

  const ERC20View = useCallback(
    () => (isLoading ? (
      <LoadingComponent />
    ) : (
      <View>
        <FlatList data={erc20List} renderItem={renderItem} />
      </View>
    )),
    [isLoading, erc20List],
  );

  const getNewToken = async () => {
    const list = erc20List;
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
    setErc20List(list);
  };

  const addToken = useCallback(() => {
    getNewToken();
  }, [erc20List, newToken]);

  const submitAddress = useCallback(() => {
    setAddress(inputAddr);
  }, [inputAddr]);

  return address ? (
    <View style={styles.container}>
      <Text style={styles.address}>
        address:
        {address}
      </Text>
      <Text style={styles.ETH}>
        {ethBalance}
        {' '}
        ETH
      </Text>
      <View style={styles.erc20List}>
        <ERC20View />
      </View>
      <TextInput
        style={styles.input}
        placeholder="Add ERC20 token address"
        value={newToken}
        onChangeText={setNewToken}
        onSubmitEditing={addToken}
      />
    </View>
  ) : (
    <View style={styles.container}>
      <TouchableOpacity onPress={ethEnabled} style={styles.button}>
        <Text style={styles.buttonText}>link to metamask</Text>
      </TouchableOpacity>
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
