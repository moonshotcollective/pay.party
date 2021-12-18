# Contribute to pay.party

The directories that you'll use are:

```bash
packages/react-app/
packages/hardhat/
packages/backend/
```

The project was created by members of the moonshot collective using the [scaffold-eth]() template repository.

## Quick Start

Running the app requires setting up proper enviroment variables, and node (<=v16.13.0). See the `.sample.env` in the directories for more information on creating `.env`'s. You will need access to a mongodb connection string, an etherscan-like block explore api key, and RPC key.

0. Navigate to the root directory after cloning the repository.

   ```bash
   git clone https://github.com/moonshotcollective/pay.party.git
   cd pay.party
   ```

1. install your dependencies

   ```bash
   yarn install
   ```

2. start a hardhat node

   ```bash
   yarn chain
   ```

3. deploy the contract to the hardhat node

   ```bash
   yarn deploy
   ```

4. run the api

   ```bash
   yarn api
   ```

5. run the app

   ```bash
   yarn start
   ```

## Making a pull request

Each time you begin a set of changes, ensure that you are working on a new branch that you have created as opposed to the main of your local repository. By keeping your changes segregated in this branch, merging your changes into the main repository later will be much simpler. 

# 💬 Support Chat

🙏 Please check out our [Moonshot Collective](https://t.me/joinchat/BHPBtqODJGo0NDdh) telegram!

Join the telegram [support chat 💬](https://t.me/joinchat/KByvmRe5wkR-8F_zz6AjpA) to ask questions and find others building with 🏗 scaffold-eth!

---
