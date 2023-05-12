import { task } from "hardhat/config";

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
      console.log("deploy UniswapV2Factory at:", UniswapV2Router02.address);
    }
  });
