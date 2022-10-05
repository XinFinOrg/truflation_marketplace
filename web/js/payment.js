
const CurrencyTokenAddress = "0x3417dd955d4408638870723B9Ad8Aae81953B478";//Truflation Token
const SubscriptionManagerAddress = "0x22313b0B570E7Fe2C69C34a19d4bd633a06D1c0e";
const PackagePlanPaymentAddress = "0xaC148B7e0aa948064aa893A604ee585dEfbB09D2";
const SubscriptionPaymentAddress = "0x9176C8E0F9f535E0BEfb33fE18F7576C6254ceED";
const subscribeButton = document.getElementById('subscribe-button');
const terminateButton = document.getElementById('terminate-button');
//const transferAddressInput = document.getElementById('transfer-address');

const descBox = document.getElementById('buy-announce');
const enableEthereumButton = document.getElementById('enable-button');
//const DataPackageRadios = document.getElementsByName('data-pack');
const DataPackageRadios = document.querySelectorAll('input[type=radio][name="data-pack"]');
const BuyPackageButton = document.getElementById('buy-package-button');
const UpdateAddressButton = document.getElementById('update-address-button');
const newClientAddressInput = document.getElementById('new-client-address');
const durationInput = document.getElementById('duration');
const packagePrice = document.getElementById('package-price');
let accounts;
let provider;

//let CurrencyContract;

enableEthereumButton.onclick = async () => {
  provider = new ethers.providers.Web3Provider(window.ethereum);
  const accounts = await provider.send("eth_requestAccounts", []);
  console.log(accounts);
  console.log(accounts[0]);

};

DataPackageRadios.forEach(radio => radio.addEventListener('change', async() => {
  //alert('selected price: ' + document.querySelector('input[type=radio][name="data-pack"]:checked')?.value);
  //alert('selected price: ' + radio.id);
  packagePrice.innerHTML = radio.value * durationInput.value;
  packagePrice.value = radio.value * durationInput.value;
}));

durationInput.addEventListener('change', async() =>   {
  packagePrice.innerHTML = ((document.querySelector('input[type=radio][name="data-pack"]:checked')?.value)*durationInput.value).toString();
  packagePrice.value = (document.querySelector('input[type=radio][name="data-pack"]:checked')?.value)*durationInput.value;
});

BuyPackageButton.onclick = async () => {
  const signer = await provider.getSigner();
  let signerAddress = await signer.getAddress();
  const PackagePlanPaymentContract = new ethers.Contract(PackagePlanPaymentAddress, PackagePlanPaymentAbi, signer);
  const CurrencyContract = new ethers.Contract(CurrencyTokenAddress, erc20Abi, signer);

  //TODO only ask approval when allowance amount is not sufficient for payment
  console.log(packagePrice.value);
  let isApproved = await tokenAllowanceCheck(PackagePlanPaymentAddress,packagePrice.value);
  if(!isApproved){
    await CurrencyContract.approve(PackagePlanPaymentAddress, ethers.constants.MaxUint256);
    console.log('Approve');
  }
  console.log(signerAddress);
  console.log(document.querySelector('input[type=radio][name="data-pack"]:checked')?.id);
  let periodId = document.querySelector('input[type=radio][name="data-pack"]:checked')?.id;
  await PackagePlanPaymentContract.purchasePackage(ProductId, periodId, durationInput.value);
  //await PackagePlanPaymentContract.startSubscription(signerAddress, parseInt(periodId), parseInt(durationInput.value));
  BuyPackageButton.disabled = true;
};



subscribeButton.onclick = async () => {
  const signer = await provider.getSigner();
  let signerAddress = await signer.getAddress();
  console.log('signer: ' + signerAddress);

  const SubscriptionPaymentContract = new ethers.Contract(SubscriptionPaymentAddress, SubscriptionPaymentAbi, signer);
  const CurrencyContract = new ethers.Contract(CurrencyTokenAddress, erc20Abi, signer);

  //TODO only ask approval when allowance amount is not sufficient for payment
  console.log('Approve');
  await CurrencyContract.approve(SubscriptionPaymentAddress, ethers.constants.MaxUint256);
  console.log('subscription');
  await SubscriptionPaymentContract["startSubscription(uint256 productId)"](ProductId);
  subscribeButton.disabled = true;
  terminateButton.disabled = false;

};


terminateButton.onclick = async () => {
  const signer = await provider.getSigner();
  let signerAddress = await signer.getAddress();
  console.log('signer: ' + signerAddress);

  const SubscriptionPaymentContract = new ethers.Contract(SubscriptionPaymentAddress, SubscriptionPaymentAbi, signer);
  await SubscriptionPaymentContract.terminateSubscription(ProductId);

  subscribeButton.disabled = false;
  terminateButton.disabled = true;

};

UpdateAddressButton.onclick = async () => {
  const signer = await provider.getSigner();
  let signerAddress = await signer.getAddress();
  console.log('signer: ' + signerAddress);

  const SubscriptionManagerContract = new ethers.Contract(SubscriptionManagerAddress, SubscriptionManagerAbi, signer);
  console.log(newClientAddressInput.value);
  await SubscriptionPaymentContract.updateClientAddressBySubscriber(ProductId, newClientAddressInput.value);


};


async function setupSubscriberStatus() {
  const SubscriptionPaymentContract = new ethers.Contract(SubscriptionPaymentAddress, SubscriptionPaymentAbi, provider);
  const SubscriptionManagerContract = new ethers.Contract(SubscriptionManagerAddress, SubscriptionManagerAbi, provider);

  let isSubscriber = await SubscriptionManagerContract.isSubscriber(ProductId, window.ethereum.selectedAddress);
  let isAutoRenew = await SubscriptionPaymentContract.isAutoRenew(ProductId, window.ethereum.selectedAddress);
  let expiryDate = await SubscriptionManagerContract.getSubscriptionExpiryDate(ProductId, window.ethereum.selectedAddress);;
  console.log(window.ethereum.selectedAddress + ": " + isSubscriber);
  document.getElementById('isSubscriber').innerHTML = isSubscriber;
  if(expiryDate >= Date.now() / 1000){
    document.getElementById('expire_date').innerHTML = (new Date(expiryDate*1000)).toLocaleDateString();
    BuyPackageButton.disabled = true;
    document.getElementById('client-address').innerHTML = await SubscriptionManagerContract.getClientAddressOfSubscriber(ProductId, window.ethereum.selectedAddress);
    UpdateAddressButton.disabled = false;
  } else {
    document.getElementById('expire_date').innerHTML = "N/A";
  }
  document.getElementById('isAutoRenew').innerHTML = isAutoRenew;
  if(isAutoRenew){
    document.getElementById('bill_notice').style.display = "block";
    subscribeButton.disabled = true;
    terminateButton.disabled = false;
  } else {
    subscribeButton.disabled = false;
    terminateButton.disabled = true;
  }
  packagePrice.innerHTML = (document.querySelector('input[type=radio][name="data-pack"]:checked')?.value*durationInput.value).toString();
  packagePrice.value = document.querySelector('input[type=radio][name="data-pack"]:checked')?.value*durationInput.value;

}

async function isMetaMaskConnected()  {
  accounts = await provider.listAccounts();
  console.log('account[0]: ' + accounts[0]);
  console.log('account length: ' + accounts.length);
  return accounts.length > 0;
}

async function getTokenBalance(tokenAddress, accountAddress) {
  const erc20Contract = new ethers.Contract(tokenAddress, erc20Abi, provider);
  let bal = await erc20Contract.balanceOf(accountAddress);
  let decimals = await erc20Contract.decimals();
  console.log('balance of token: ', ethers.utils.formatUnits(bal, decimals));
  return ethers.utils.formatUnits(bal, decimals);

  // let tokenBal = (balance/Math.pow(10, unit)).toFixed(3);

}


async function tokenHoldCheck()  {
  let balance = await getTokenBalance(CurrencyTokenAddress, window.ethereum.selectedAddress);
  console.log('balance: ', balance)
  return balance >= 1200;
}

async function tokenAllowanceCheck(spender, amount)  {
  const CurrencyContract = new ethers.Contract(CurrencyTokenAddress, erc20Abi, provider);
  let allowance = await CurrencyContract.allowance(window.ethereum.selectedAddress, spender);
  console.log('allowance: ', allowance.toString());
  console.log('amount: ', amount);
  console.log(allowance >= amount);
  return allowance >= amount;
}



window.addEventListener('load', async (event) => {

  provider = new ethers.providers.Web3Provider(window.ethereum);

  let connected = await isMetaMaskConnected();
  if (connected){
    // metamask is connected
    console.log('metamask is connected to ' + window.ethereum.selectedAddress);
    enableEthereumButton.disabled = true;
    enableEthereumButton.innerHTML = window.ethereum.selectedAddress;

    await setupSubscriberStatus();
    let isTokenHolder = await tokenHoldCheck();
    if(!isTokenHolder){
      descBox.style.display = "block";
      console.log('user do not hold token');
      document.getElementById('token_address').innerHTML = CurrencyTokenAddress;
    }

    //TODO check token is approved for transfer


    console.log('Loading');

  } else{
    // metamask is not connected
    console.log('metamask is not connected');
    document.getElementById('metamask-announce').style.display = "block";
  }

  console.log('Completed');




});

