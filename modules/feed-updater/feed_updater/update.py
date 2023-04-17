#!/usr/bin/env python3

import os
import json
import datetime
import requests
from web3 import Web3
from dotenv import load_dotenv
from Crypto.Util.Padding import pad
load_dotenv()

print(f"getting {os.environ['REQUEST_URL']}")
response = requests.get(os.environ['REQUEST_URL']).text
print(f'got result')

obj = json.loads(response)

caller = os.environ['CALLER']
private_key = os.environ['PRIVATE_KEY']
address = os.environ['FEED_REGISTRY_ADDRESS']
node_url = os.environ['NODE_URL']

v = int(obj[os.environ['REQUEST_JSON']]* 10**18)
s = obj[os.environ['REQUEST_DATE']]
#v = 0
#s = '2023-01-01'
dts = int(datetime.datetime.strptime(s, '%Y-%m-%d').timestamp())
nts = int(datetime.datetime.utcnow().timestamp())
roundId = dts

web3 = Web3(Web3.HTTPProvider(node_url))
with open('TfiFeedRegistry.json', encoding='utf-8') as f:
    abi = json.load(f)
    contract = web3.eth.contract(
        address=address, abi=abi['abi'])
    Chain_id = web3.eth.chain_id
    nonce = web3.eth.get_transaction_count(caller)
    web3.strict_bytes_type_checking = False
    call_function = contract.functions.setRoundData(
        bytes("truflation.cpi.us", 'utf-8'),
        roundId,
        v,
        dts,
        nts
    ).build_transaction({"chainId": Chain_id,
                         "gasPrice": web3.eth.gas_price,
                         "from": caller, "nonce": nonce})
    print (call_function);
    signed_tx = web3.eth.account.sign_transaction(
        call_function, private_key=private_key
    )
    send_tx = web3.eth.send_raw_transaction(
        signed_tx.rawTransaction
    )
    tx_receipt = web3.eth.wait_for_transaction_receipt(send_tx)
