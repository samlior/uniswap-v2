import type { ethers as HardhatEthers } from "hardhat";
import { task } from "hardhat/config";

task("accounts", "Display accounts").setAction(async function (
  args,
  { ethers }
) {
  console.log(
    (await ethers.getSigners()).map(({ address }) => address).join("\n")
  );
});

function parseFuncArg(value: string, ethers: typeof HardhatEthers) {
  if (value.startsWith("[") && value.endsWith("]")) {
    return value.slice(1, value.length - 2).split(",");
  } else if (value === "true") {
    return true;
  } else if (value === "false") {
    return false;
  } else if (value === "max") {
    return ethers.constants.MaxUint256;
  } else {
    return value;
  }
}

task("call", "Call contract view function")
  .addParam("contract", "Contract name")
  .addParam("address", "Contract address")
  .addParam("func", "Function name")
  .addOptionalParam("arg0", "Function argument")
  .addOptionalParam("arg1", "Function argument")
  .addOptionalParam("arg2", "Function argument")
  .addOptionalParam("arg3", "Function argument")
  .addOptionalParam("arg4", "Function argument")
  .addOptionalParam("arg5", "Function argument")
  .addOptionalParam("arg6", "Function argument")
  .addOptionalParam("tag", "Block tag")
  .setAction(async function (args, { ethers }) {
    const contract: any = await ethers.getContractAt(
      args.contract,
      args.address
    );
    const funcArgs: any[] = [];
    for (let i = 0; i < 7; i++) {
      const value = args[`arg${i}`];
      if (value === undefined) {
        break;
      }
      funcArgs.push(parseFuncArg(value, ethers));
    }
    console.log(await contract[args.func](...funcArgs, { blockTag: args.tag }));
  });

task("sendTx", "Send a transaction to call a contract")
  .addParam("contract", "Contract name")
  .addParam("address", "Contract address")
  .addParam("func", "Function name")
  .addOptionalParam("arg0", "Function argument")
  .addOptionalParam("arg1", "Function argument")
  .addOptionalParam("arg2", "Function argument")
  .addOptionalParam("arg3", "Function argument")
  .addOptionalParam("arg4", "Function argument")
  .addOptionalParam("arg5", "Function argument")
  .addOptionalParam("arg6", "Function argument")
  .setAction(async function (args, { ethers }) {
    const contract: any = await ethers.getContractAt(
      args.contract,
      args.address
    );
    const funcArgs: any[] = [];
    for (let i = 0; i < 7; i++) {
      const value = args[`arg${i}`];
      if (value === undefined) {
        break;
      }
      funcArgs.push(parseFuncArg(value, ethers));
    }
    const tx = await contract[args.func](...funcArgs);
    const receipt = await tx.wait();
    console.log(receipt.events);
  });

task("deploy-weth", "Deploy WETH contract").setAction(async function (
  args,
  { ethers }
) {
  const factory = await ethers.getContractFactory("WETH9");
  const WETH = await factory.deploy();
  console.log("tx sent:", WETH.deployTransaction.hash);
  await WETH.deployed();
  console.log("deploy WETH at:", WETH.address);
});

task("deploy-uniswap-v2", "Deploy UniswapV2 contracts")
  .addParam("weth", "WETH contract address")
  .addOptionalParam("feeTo", "fee address", "0x" + "0".repeat(40))
  .setAction(async function (args, { ethers }) {
    let factoryAddress: string;

    // deploy factory
    {
      const factory = await ethers.getContractFactory("UniswapV2Factory");
      const UniswapV2Factory = await factory.deploy(args.feeTo);
      console.log("tx sent:", UniswapV2Factory.deployTransaction.hash);
      await UniswapV2Factory.deployed();
      console.log("deploy UniswapV2Factory at:", UniswapV2Factory.address);
      factoryAddress = UniswapV2Factory.address;
    }

    // deploy router
    {
      const factory = await ethers.getContractFactory("UniswapV2Router02");
      const UniswapV2Router02 = await factory.deploy(factoryAddress, args.weth);
      console.log("tx sent:", UniswapV2Router02.deployTransaction.hash);
      await UniswapV2Router02.deployed();
      console.log("deploy UniswapV2Router02 at:", UniswapV2Router02.address);
    }
  });
