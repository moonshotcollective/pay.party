import React, { useState } from "react";
import { Button, Table, Modal, Form, Input, Divider, InputNumber, Select } from "antd";
import { DeleteRowOutlined, MinusCircleOutlined, PlusOutlined, UserDeleteOutlined } from "@ant-design/icons";
import { Address, AddressInput } from "../components";
import dips from "../dips";

export default function Home({ tx, createContracts, mainnetProvider }) {
  const [newElection, setNewElection] = useState(false);
  const [selectedDip, setSelectedDip] = useState(null);

  const dipsKeys = Object.keys(dips);

  const columns = [
    {
      title: "Election Id",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Admin",
      dataIndex: "admin",
      key: "admin",
      render: text => <Address address={text} fontSize={16} ensProvider={mainnetProvider} />,
    },
    {
      title: "Candidates",
      dataIndex: "candidates",
      key: "candidates",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Action",
      key: "action",
      render: (text, record) => <a href={`/vote/${record.id}`}>View</a>,
    },
  ];

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

  const handleNewElection = async data => {
    // send new election data to specified QD handler
    // console.log(dips[selectedDip]);
    dips[selectedDip].handler.createElection(data);
  };

  const renderHeader = () => {
    return (
      <div className="flex flex-1 justify-between items-center mb-4">
        <h1 className="m-0 font-semibold text-lg">Quadratic Elections</h1>
        <Button type="primary" onClick={() => setNewElection(true)}>
          Create Election
        </Button>
      </div>
    );
  };

  return (
    <div style={{ width: 850, margin: "20px auto" }}>
      <div style={{ width: "100%" }}>
        <Table title={renderHeader} columns={columns} dataSource={sampleElectionData} />
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
          <Form.Item label="Election Name" className="flex-1" labelCol={12} name="name" tooltip="Name of new election">
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
              <Select placeholder="Quadratic Diplomacy build..." onChange={setSelectedDip}>
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
