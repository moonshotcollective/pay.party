import React, { useState, useEffect, useRef } from "react";
import { useHistory } from "react-router-dom";
import { useEventListener } from "../hooks";
import { Address } from "../components";
import { mainnetProvider, blockExplorer } from "../App";
import { fromWei, toWei, toBN } from "web3-utils";
import AddAddress from "../components/AddAddress";
import {
  Button,
  Divider,
  Input,
  InputNumber,
  List,
  Table,
  Modal,
  Form,
  Select,
  Space,
  Tag,
  Descriptions,
  PageHeader,
  Carousel,
  Typography,
  Steps,
  Col,
  Row,
} from "antd";
import {
  LeftOutlined,
  DeleteOutlined,
  CheckOutlined,
  PlusOutlined,
  PlusCircleFilled,
  ExportOutlined,
  DoubleRightOutlined,
} from "@ant-design/icons";
import dips from "../dips";

const CURRENCY = "ETH";
const TOKEN = "UNI";
const DIP_TYPES = Object.keys(dips);

const Step1 = ({ mainnetProvider, election, form }) => {
  const [selectedDip, setSelectedDip] = useState("onChain");
  const selectFunds = (
    <Select
      defaultValue={CURRENCY}
      className="select-funds-type"
      onChange={value => {
        // GTC-MATIC (PoS) TOKEN ADDRESS!
        const adr = "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984"; // GTC: "0xdb95f9188479575F3F718a245EcA1B3BF74567EC";
        election.tokenAdr = adr;
        election.fundAmount = value;
      }}
    >
      <Option value={CURRENCY}>{CURRENCY}</Option>
      {/* <Option value={electionTokenName}>{electionTokenName}</Option> */}
      <Option value={TOKEN}>{TOKEN}</Option>
    </Select>
  );

  return (
    <>
      <Form
        form={form}
        layout="vertical"
        style={{ margin: "1em 12em" }}
        name="createForm"
        autoComplete="off"
        initialValues={{ remember: true }}
      >
        <Form.Item
          name="elec_name"
          label="Election Name"
          rules={[{ required: true, message: "Please input election name!" }]}
        >
          <Input
            size="large"
            placeholder="Enter Name"
            allowClear={true}
            style={{
              width: "100%",
            }}
            onChange={e => {
              election.name = e.target.value ? e.target.value : "";
            }}
          />
        </Form.Item>

        <Form.Item
          name="funds"
          label="Funding Allocation"
          rules={[{ required: true, pattern: new RegExp(/^[.0-9]+$/), message: "Funding is Required!" }]}
        >
          <Input
            addonAfter={selectFunds}
            placeholder="Enter Amount"
            size="large"
            allowClear={true}
            autoComplete="off"
            value={0}
            style={{
              width: "100%",
            }}
            onChange={e => {
              if (!isNaN(Number(e.target.value))) {
                if (election.funds === CURRENCY) {
                  election.fundAmount = toWei(Number(e.target.value).toFixed(18).toString());
                } else {
                  election.fundAmount = toWei(Number(e.target.value).toFixed(18).toString()); //*10^18 for Tokens?? -> toWei does this, but hacky
                }
              }
            }}
          />
        </Form.Item>

        <Form.Item
          name="votes"
          label="Vote Delegation"
          rules={[
            { required: true, message: "Please input number of votes!" },
            { pattern: new RegExp(/^[0-9]+$/), message: "Invalid Vote Allocation!" },
          ]}
        >
          <InputNumber
            size="large"
            placeholder="1"
            style={{
              width: "100%",
            }}
            min="1"
            onChange={value => {
              election.votes = value;
            }}
          />
        </Form.Item>
        <Form.Item name="type" label="Diplomacy Type">
          <Select placeholder="Quadratic Diplomacy build..." defaultValue={["onChain"]}>
            {DIP_TYPES.map(k => (
              <Select.Option key={k} value={k}>
                {dips[k].name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </>
  );
};

const Step2 = ({ mainnetProvider, election, errorMsg }) => {
  const [toAddress, setToAddress] = useState("");
  return (
    <>
      <Form
        style={{ margin: "2em 12em" }}
        layout="vertical"
        name="createForm"
        autoComplete="off"
        initialValues={{ remember: false }}
      >
        <Form.Item
          name="candidates"
          rules={[
            {
              validator: (_, value) =>
                election.candidates.length != 0
                  ? Promise.resolve()
                  : Promise.reject(new Error("Should add atleast one ENS address")),
            },
          ]}
        >
          <Space style={{ margin: "1em 0em" }}>
            <AddAddress
              ensProvider={mainnetProvider}
              placeholder="Enter ENS name"
              value={toAddress}
              onChange={setToAddress}
            />
            <Button
              className="add-button"
              type="link"
              icon={<PlusCircleFilled />}
              size="large"
              onClick={() => {
                if (!election.candidates.includes(toAddress)) {
                  election.candidates.push(toAddress);
                }
                setToAddress("");
              }}
            >
              Add
            </Button>
          </Space>

          <List
            style={{ overflow: "auto", height: "200px" }}
            itemLayout="horizontal"
            bordered
            dataSource={election.candidates}
            renderItem={(item, index) => (
              <List.Item>
                <Address address={item} ensProvider={mainnetProvider} fontSize="14pt" />
                <Button
                  type="link"
                  icon={<DeleteOutlined />}
                  onClick={() => {
                    const updatedAddresses = election.candidates;
                    updatedAddresses.splice(index, 1);
                    election.candidates = updatedAddresses;
                  }}
                  size="medium"
                  style={{ marginLeft: "200px" }}
                >
                  Remove
                </Button>
              </List.Item>
            )}
          />
        </Form.Item>
        <Typography.Text type="danger">{errorMsg}</Typography.Text>
      </Form>
    </>
  );
};

const Step3 = ({ mainnetProvider, election }) => {
  return (
    <>
      <Descriptions bordered style={{ margin: "2em 5em" }} column={1} size="small">
        <Descriptions.Item label="Election Name:">{election.name}</Descriptions.Item>
        <Descriptions.Item label="Allocated Funds:">
          {fromWei(election.fundAmount ? election.fundAmount.toString() : "0") + " " + election.funds}
        </Descriptions.Item>
        <Descriptions.Item label="Delegated Votes:">{election.votes}</Descriptions.Item>
        <Descriptions.Item label="Diplomacy Type:">{election.selectedDip}</Descriptions.Item>
        <Descriptions.Item label="Candidates:">
          Count: {election.candidates.length}
          <br />
          <List
            style={{ overflow: "auto", height: "10em", width: "36em" }}
            itemLayout="horizontal"
            bordered
            dataSource={election.candidates}
            renderItem={(adr, index) => (
              <List.Item>
                <Address address={adr} ensProvider={mainnetProvider} fontSize="12pt" />
              </List.Item>
            )}
          />
        </Descriptions.Item>
      </Descriptions>
    </>
  );
};

export default function Create({
  address,
  mainnetProvider,
  localProvider,
  mainnetContracts,
  userSigner,
  yourLocalBalance,
  price,
  tx,
  readContracts,
  writeContracts,
}) {
  /***** Routes *****/
  const routeHistory = useHistory();

  const viewElection = index => {
    // console.log({ index });
    routeHistory.push("/vote/" + index);
  };

  /***** States *****/
  const [selectedQdip, setSelectedQdip] = useState("onChain");
  const [qdipHandler, setSelectedQDip] = useState();
  const [current, setCurrent] = useState(0);
  const [errorMsg, setErrorMsg] = useState();
  const [isConfirmingElection, setIsConfirmingElection] = useState(false);
  const [isCreatedElection, setIsCreatedElection] = useState(false);
  const [electionId, setElectionId] = useState(-1);
  const [newElection, setNewElection] = useState({
    name: "test",
    funds: "10000",
    fundAmount: "1",
    votes: 5,
    tokenAdr: "0x0000000000000000000000000000000000000000",
    tokenName: "",
    candidates: ["0x7F2FA234AEd9F7FA0D5070Fb325D1c2C983E96b1"],
    selectedDip: "onChain",
  });

  const { Step } = Steps;
  const [formStep1, formStep2] = Form.useForm();

  const steps = [
    {
      title: "Election Details",
      content: <Step1 mainnetProvider={mainnetProvider} election={newElection} form={formStep1} />,
    },
    {
      title: "Add Candidates",
      content: <Step2 mainnetProvider={mainnetProvider} election={newElection} errorMsg={errorMsg} />,
    },
    {
      title: "Review & Confirm",
      content: <Step3 mainnetProvider={mainnetProvider} election={newElection} />,
    },
  ];

  const stepToSecond = () => {
    formStep1
      .validateFields()
      .then(values => {
        setCurrent(current + 1);
      })
      .catch(err => {
        console.log({ err });
      });
  };

  const stepToThird = () => {
    if (newElection.candidates.length == 0) {
      setErrorMsg("Atleast 1 ENS name required!");
    } else {
      setCurrent(current + 1);
      setErrorMsg(null);
    }
  };

  const prev = () => {
    setCurrent(current - 1);
  };

  /***** Effects *****/

  useEffect(() => {
    if (readContracts) {
      if (readContracts.Diplomacy) {
        init();
      }
    }
  }, [readContracts, address]);

  useEffect(async () => {
    if (qdipHandler) {
    }
  }, [qdipHandler]);

  /***** Methods *****/
  const init = async () => {
    setSelectedQDip(dips[selectedQdip].handler(tx, readContracts, writeContracts, mainnetProvider, address));
  };
  //   const addEventListener = async (contractName, eventName, callback) => {
  //     await readContracts[contractName].removeListener(eventName);
  //     readContracts[contractName].on(eventName, (...args) => {
  //       callback(args);
  //     });
  //   };

  //   const onElectionCreated = args => {
  //     console.log(args);
  //     setElectionId(args[1]);
  //   };

  const confirmElection = async () => {
    setIsConfirmingElection(true);
    // Create a new election

    qdipHandler
      .createElection(newElection)
      .then(success => {
        setIsConfirmingElection(false);
        setIsCreatedElection(true);
      })
      .catch(err => {
        console.log(err);
        setIsConfirmingElection(false);
      });
  };

  return (
    <>
      <div
        className="create-view"
        style={{ border: "1px solid #cccccc", padding: 16, width: 1000, margin: "auto", marginTop: 64 }}
      >
        <PageHeader
          ghost={false}
          title="Create New Election"
          onBack={() => routeHistory.push("/")}
          style={{ padding: 5 }}
        />
        <Divider style={{ padding: 5, margin: 5 }} />
        <Steps current={current} style={{ padding: "10px 72px 12px" }}>
          {steps.map(item => (
            <Step key={item.title} title={item.title} />
          ))}
        </Steps>
        <div className="steps-content" style={{ height: "350px" }}>
          {steps[current].content}{" "}
        </div>
        <Divider style={{ padding: 5, margin: 5 }} />
        <div className="steps-action">
          <Row>
            <Col span={4}>
              {current > 0 && !isCreatedElection && (
                <Button type="link" icon={<LeftOutlined />} onClick={() => prev()}>
                  Back
                </Button>
              )}
            </Col>

            <Col span={8} offset={4}>
              {current == 0 && (
                <Button
                  icon={<DoubleRightOutlined />}
                  type="default"
                  size="large"
                  shape="round"
                  onClick={() => {
                    stepToSecond();
                  }}
                >
                  Continue
                </Button>
              )}
              {current == 1 && (
                <Button
                  icon={<DoubleRightOutlined />}
                  type="default"
                  size="large"
                  shape="round"
                  onClick={() => {
                    stepToThird();
                  }}
                >
                  Continue
                </Button>
              )}

              {current === steps.length - 1 && !isCreatedElection && (
                <Button
                  icon={<CheckOutlined />}
                  type="primary"
                  size="large"
                  shape="round"
                  loading={isConfirmingElection}
                  onClick={confirmElection}
                >
                  Confirm Election
                </Button>
              )}

              {current === steps.length - 1 && isCreatedElection && (
                <Button
                  icon={<ExportOutlined />}
                  type="default"
                  size="large"
                  shape="round"
                  onClick={() => {
                    viewElection(electionId);
                  }}
                >
                  View Election
                </Button>
              )}
            </Col>
          </Row>
        </div>
      </div>
    </>
  );
}
