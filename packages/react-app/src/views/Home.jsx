import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import {
  Button,
  Table,
  Modal,
  Form,
  Input,
  Divider,
  InputNumber,
  Select,
  Typography,
  Tag,
  Space,
  PageHeader,
} from "antd";
import {
  DeleteRowOutlined,
  MinusCircleOutlined,
  PlusOutlined,
  UserDeleteOutlined,
  LinkOutlined,
  CopyTwoTone,
} from "@ant-design/icons";
import { Address, AddressInput } from "../components";
import dips from "../dips";
import BaseHandler from "../dips/baseHandler";
import { mainnetProvider, blockExplorer } from "../App";
import { CERAMIC_PREFIX } from "../dips/helpers";

export default function Home({ tx, readContracts, writeContracts, mainnetProvider, address }) {
  /***** Routes *****/
  const routeHistory = useHistory();
  const viewElection = record => {
    const isCeramicRecord = record.id.startsWith(CERAMIC_PREFIX);
    const electionId = isCeramicRecord ? record.id.split(CERAMIC_PREFIX)[1] : record.id;
    routeHistory.push("/vote/" + electionId + `?kind=${isCeramicRecord ? "ceramic" : "offChain"}`);
  };

  const createElection = () => {
    routeHistory.push("/create");
  };

  /***** States *****/

  const [selectedQdip, setSelectedQdip] = useState("base");
  const [qdipHandler, setQdipHandler] = useState();
  const [electionsMap, setElectionsMap] = useState();
  const [tableDataLoading, setTableDataLoading] = useState(false);

  /***** Effects *****/

  useEffect(() => {
    if (readContracts) {
      if (readContracts.Diplomat) {
        init();
      }
    }
  }, [readContracts, address]);

  useEffect(() => {
    (async () => {
      if (qdipHandler) {
        let electionsMap = await qdipHandler.getElections();
        setElectionsMap(electionsMap);
      }
    })();
  }, [qdipHandler]);

  /***** Methods *****/
  const init = async () => {
    // TODO: Investigate if this ever needs to be anything other than the baseHandler
    setQdipHandler(BaseHandler(tx, readContracts, writeContracts, mainnetProvider, address));
  };

  /***** Render *****/

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
      render: p => <Typography.Text>{`${p.n_voted} / ${p.outOf}`}</Typography.Text>,
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
      render: (
        tags, //["yeah"],
      ) =>
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

  let table_state = {
    bordered: true,
    loading: tableDataLoading,
  };
  return (
    <>
      <div
        className="elections-view"
        style={{ border: "1px solid #cccccc", padding: 16, width: 1000, margin: "auto", marginTop: 64 }}
      >
        <PageHeader
          ghost={false}
          title="Elections"
          extra={[
            <Button
              icon={<PlusOutlined />}
              type="primary"
              size="large"
              shape="round"
              style={{ margin: 4 }}
              onClick={createElection}
            >
              Create Election
            </Button>,
          ]}
        />
        {electionsMap && (
          <Table
            {...table_state}
            size="middle"
            dataSource={Array.from(electionsMap.values()).reverse()}
            columns={columns}
            pagination={false}
            scroll={{ y: 600 }}
            style={{ padding: 10 }}
          />
        )}
      </div>
    </>
  );
}
