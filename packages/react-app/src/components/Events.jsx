import { List } from "antd";
import { useEventListener } from "eth-hooks/events/useEventListener";
import Address from "./Address";
import { utils } from "ethers";

/**
  ~ What it does? ~

  Displays a lists of events

  ~ How can I use? ~

  <Events
    contracts={readContracts}
    contractName="YourContract"
    eventName="SetPurpose"
    localProvider={localProvider}
    mainnetProvider={mainnetProvider}
    startBlock={1}
  />
**/

export default function Events({ contracts, contractName, eventName, localProvider, mainnetProvider, startBlock, partyData }) {
  // 📟 Listen for broadcast events
  const events = useEventListener(contracts, contractName, eventName, localProvider, startBlock);

  return (
    <div style={{ width: 600, margin: "auto", marginTop: 32, paddingBottom: 32 }}>
      <h2>Events:</h2>
      <List
        bordered
        dataSource={events}
        renderItem={item => {
          return (
              <List.Item key={item.blockNumber + "_" + item.args.sender + "_" + item.args.id}>
              {/*<Address address={item.args[0]} ensProvider={mainnetProvider} fontSize={16} />
              {item.transactionHash}
              { item.args.id.hash.toLowerCase() === idHash.toLowerCase() ? item.transactionHash : console.log('fail')}
              { item.args.id.hash }
              */}
            
              {item.transactionHash}

              </List.Item>  
          );
        }}
      />
    </div>
  );
}
