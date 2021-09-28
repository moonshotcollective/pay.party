import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { Button, Table, Modal, Form, Input, Divider, InputNumber, Select, Typography, Tag, Space } from "antd";
import {
  DeleteRowOutlined,
  MinusCircleOutlined,
  PlusOutlined,
  UserDeleteOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import { Address, AddressInput } from "../components";
import dips from "../dips";
import { mainnetProvider, blockExplorer } from "../App";

export default function Home({ tx, readContracts, writeContracts, mainnetProvider, address }) {
  const routeHistory = useHistory();

  const viewElection = record => {
    // console.log({ record });
    routeHistory.push("/vote/" + record.id);
  };

  const createElection = () => {
    routeHistory.push("/create");
  };

  const [newElection, setNewElection] = useState(false);
  const [selectedDip, setSelectedDip] = useState("onChain");
  const [electionsMap, setElectionsMap] = useState();

  useEffect(() => {
    if (readContracts) {
      if (readContracts.Diplomacy) {
        init();
      }
    }
  }, [readContracts, address]);

  const dipsKeys = Object.keys(dips);

  const dateCol = () => {
    return {
      title: "Created",
      dataIndex: "created_date",
      key: "created_date",
      align: "center",
      width: 112,
    };
  };
  const nameCol = () => {
    return {
      title: "Name",
      dataIndex: "name",
      key: "name",
      align: "center",
      render: name => <Typography.Text>{name}</Typography.Text>,
    };
  };
  const creatorCol = () => {
    return {
      title: "Creator",
      dataIndex: "creator",
      key: "creator",
      align: "center",
      render: creator => (
        <>
          <Address address={creator} fontSize="14pt" ensProvider={mainnetProvider} blockExplorer={blockExplorer} />
        </>
      ),
    };
  };
  const votedCol = () => {
    return {
      title: "№ Voted",
      dataIndex: "n_voted",
      key: "n_voted",
      align: "center",
      width: 100,
      render: p => (
        <Typography.Text>
          {p.n_voted} / {p.outOf}
        </Typography.Text>
      ),
    };
  };
  const statusCol = () => {
    return {
      title: "Status",
      dataIndex: "status",
      key: "status",
      align: "center",
      width: 100,
      render: status => (status ? <Tag color={"lime"}>open</Tag> : <Tag>closed</Tag>),
    };
  };
  const tagsCol = () => {
    return {
      title: "Tags",
      dataIndex: "tags",
      key: "tags",
      align: "center",
      render: tags =>
        tags.map(r => {
          let color = "orange";
          if (r == "candidate") {
            color = "blue";
          }
          if (r === "voted") {
            color = "green";
          }
          return (
            <Tag color={color} key={r}>
              {r.toLowerCase()}
            </Tag>
          );
        }),
    };
  };
  const actionCol = () => {
    return {
      title: "Action",
      key: "action",
      align: "center",
      width: 100,
      render: (text, record, index) => (
        <>
          <Space size="middle">
            <Button type="link" icon={<LinkOutlined />} size="small" shape="round" onClick={() => viewElection(record)}>
              View
            </Button>
          </Space>
        </>
      ),
    };
  };
  const columns = [dateCol(), nameCol(), creatorCol(), votedCol(), tagsCol(), statusCol(), actionCol()];

  const formItemLayout = {
    labelCol: {
      xs: { span: 24 },
      sm: { span: 4 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 20 },
    },
  };
  const formItemLayoutWithOutLabel = {
    wrapperCol: {
      xs: { span: 24, offset: 0 },
      sm: { span: 20, offset: 4 },
    },
  };

  const sampleElectionData = [
    {
      id: 1,
      name: "Sample Election",
      admin: "0xbF7877303B90297E7489AA1C067106331DfF7288",
      candidates: 7,
      status: 1,
    },
  ];

  const init = async () => {
    let electionsMap = await dips[selectedDip].handler.getElections(readContracts.Diplomacy, address);
    console.log({ electionsMap });
    setElectionsMap(electionsMap);
  };

  const handleNewElection = async data => {
    // send new election data to specified QD handler
    // data.name = "Test";
    // data.fundAmount = 1;
    // data.tokenAdr = "0x0000000000000000000000000000000000000000";
    // data.votes = 4;
    // data.candidates = ["0x7F2FA234AEd9F7FA0D5070Fb325D1c2C983E96b1"];
    // const result = dips[selectedDip].handler.createElection(data, tx, writeContracts.Diplomacy);
    console.log({ data });
  };

  const renderHeader = () => {
    return (
      <div className="flex flex-1 justify-between items-center mb-4">
        <h1 className="m-0 font-semibold text-lg">Quadratic Elections</h1>
        <Button type="primary" onClick={() => createElection()}>
          Create Election
        </Button>
      </div>
    );
  };

  return (
    <div style={{ width: 850, margin: "20px auto" }}>
      <div style={{ width: "100%" }}>
        {electionsMap && (
          <Table title={renderHeader} columns={columns} dataSource={Array.from(electionsMap.values()).reverse()} />
        )}
      </div>
      <Modal
        title="Create New Quadratic Election"
        centered
        visible={newElection}
        onOk={() => setNewElection(false)}
        onCancel={() => setNewElection(false)}
        width={800}
        footer={null}
      >
        <Form name="basic" onFinish={handleNewElection} layout="horizontal">
          <Form.Item
            label="Election Name"
            className="flex-1"
            labelCol={12}
            name="name"
            tooltip="Name of new election"
            defaultValue="test"
          >
            <Input type="text" placeholder="Sample Election name..." className="w-full" />
          </Form.Item>
          <div className="flex flex-1 flex-row">
            {/* Election Name */}
            <Form.Item
              label="Diplomacy Type"
              className="flex-1"
              labelCol={12}
              name="type"
              tooltip="Quadratic diplomacy of choice"
            >
              <Select placeholder="Quadratic Diplomacy build..." onChange={setSelectedDip} defaultValue={["onChain"]}>
                {dipsKeys.map(k => (
                  <Select.Option key={k} value={k}>
                    {dips[k].name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <div className="mx-2" />
            {/* Election Votes Allocation */}
            <Form.Item
              label="Vote Allocation"
              labelCol={16}
              name="voteCredit"
              tooltip="Number of votes each voter will have"
            >
              <InputNumber placeholder="100" />
            </Form.Item>
          </div>

          {selectedDip && <div className="italic">{dips[selectedDip].description}</div>}
          <Divider />

          {/* Add voters here */}
          <Form.List name="users" className="w-full">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, ...restField }, index) => (
                  <div key={key} className="flex flex-row">
                    <Form.Item
                      {...(index === 0 ? formItemLayout : formItemLayoutWithOutLabel)}
                      label={index === 0 ? "Voters" : ""}
                      className="w-full"
                      {...restField}
                      rules={[{ required: true, message: "Missing Address" }]}
                    >
                      <AddressInput style={{ width: "100%" }} ensProvider={mainnetProvider} />
                    </Form.Item>
                    <div className="ml-3">
                      <UserDeleteOutlined onClick={() => remove(restField.name)} />
                    </div>
                  </div>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    Add field
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <Divider />
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
