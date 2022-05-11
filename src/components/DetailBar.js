import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Card,
  Col,
  Row,
  Avatar,
  Typography,
  Input,
  Button,
  Tooltip,
} from "antd";
// import { UserOutlined } from "@ant-design/icons";

import Recents from "./Recents";
// import Contacts from "./Contacts";
import { Link } from "react-router-dom";
import { useRecentCallList } from "../context/RecentCallListContext";
import AuthContext from "../context/AuthenContext";

const DetailBar = () => {
  const data = [
    {
      value: "Smart Phone",
    },
  ];
  const { Title } = Typography;
  // const { Search } = Input;
  const [result, setResult] = useState("");
  const [checkSearch, setCheckSearch] = useState("");
  const [recents, setRecents] = useState(null);
  const { user } = useContext(AuthContext);
  const { recentCallList, fetch, setFetch } = useRecentCallList();
  useEffect(() => {
    try {
      let arr = [];

      if ((recents === null && recentCallList !== null) || fetch) {
        var tx = recentCallList.transaction("RecentLists", "readwrite");
        var store = tx.objectStore("RecentLists");
        var index = store.index("NameIndex");
        var getAll = store.getAll();
        // const getCursor = store.openCursor()

        // getCursor.onsuccess = function (e) {
        //   var result = e.target.result;
        //   if (result) {
        //     arr.push(result.value);
        //     result.continue();
        //   }

        // };
        // setRecents(arr)
        getAll.onsuccess = function () {
          // console.log("getjonh", getAll.result);  // => "John"
          setRecents(
            getAll.result?.sort((rowa, rowb) => {
              const a = new Date(`${rowa?.name?.date}`);
              const b = new Date(`${rowb?.name?.date}`);
              return b?.getTime() - a?.getTime();
            })
          );
        };
      }
    } catch (e) {
      console.log("Error", e);
    } finally {
      setFetch(false);
    }
  }, [recents, recentCallList, fetch, setFetch]);

  // console.log("recents", recents);
  // console.log("recents", (recents === null && recentCallList !== null && recentCallList?.keyPath === 'id'));

  // console.log(checkSearch);
  // console.log(result);

  const tabList = [
    {
      key: "tab1",
      tab: "All",
    },
    {
      key: "tab2",
      tab: "Recents",
    },
    {
      key: "tab3",
      tab: "Contacts",
    },
  ];

  const contentList = useMemo(() => {
    return {
      tab1: [
        <Recents
          result={recents}
          recentCallList={recentCallList}
          setFetch={setFetch}
          data={data}
        />,
      ],
      // tab2: <Contacts />,
      tab2: (
        <Recents
          result={recents}
          setFetch={setFetch}
          recentCallList={recentCallList}
          data={data}
        />
      ),
    };
  }, [data, recentCallList, recents, setFetch]);

  const [activeTabKey1, setActiveTabKey1] = useState("tab1");

  // const onSearch = useCallback(
  //   (value) => {
  //     // console.log(...data)
  //     setCheckSearch(value);
  //     data.map((item, i) => {
  //       if (checkSearch === item.value) {
  //         setResult(item.value);
  //       }
  //     });
  //     // console.log(result)
  //     // if (result){
  //     //   console.log('success:',result);
  //     // }else{
  //     //   console.log('fail');
  //     // }
  //   },
  //   [checkSearch]
  // );
  const onTab1Change = (key) => {
    setActiveTabKey1(key);
  };
  function stringToColor(string) {
    let hash = 0;
    let i;

    /* eslint-disable no-bitwise */
    for (i = 0; i < string.length; i += 1) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }

    let color = "#";

    for (i = 0; i < 3; i += 1) {
      const value = (hash >> (i * 8)) & 0xff;
      color += `00${value.toString(16)}`.substr(-2);
    }
    /* eslint-enable no-bitwise */

    return color;
  }
  function stringAvatar(name) {
    return {
      style: {
        backgroundColor: stringToColor(name),
      },
      children: `${name?.split(" ")[0][0]}`,
    };
  }
  return (
    <Row style={{ height: "100%", width: "100%" }}>
      <Col span={24}>
        <Card
          bodyStyle={{ padding: "2%" }}
          style={{ padding: "0%", width: "100%" }}
        >
          <Link to="/taball">
            {" "}
            <Row className="List-hov" justify="center" align="middle">
              <Col span={6}>
                <Avatar
                  style={{ backgroundColor: "#096DD9" }}
                  size={{ xs: 40, md: 40, lg: 64, xl: 80, xxl: 100 }}
                  // icon={<UserOutlined />}
                  {...stringAvatar(`${user?.username}`)}
                />
              </Col>
              <Col span={14}>
                <div style={{ width: "100%" }}>
                  <Title level={3}>{user?.username}</Title>
                  {/* <Text type="secondary">097-456-7894</Text> */}
                </div>
              </Col>

              <Col span={4} style={{ marginTop: "5%" }}>
                <Tooltip title="NumPad">
                  <Link to="/numpad">
                    <Button renderAs="button" type="primary" shape="circle">
                      <img
                        style={{ height: 14, width: 14, objectFit: "cover" }}
                        src="/images/keypad.png"
                      />
                    </Button>
                  </Link>
                </Tooltip>
              </Col>
            </Row>
          </Link>
          {/* <AutoComplete
    style={{
      width: '100%',
    }}
    options={data}
   
    filterOption={(inputValue, option) =>
      option.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
    }
  >
            <Search
              style={{ marginTop: "10px" }}
              placeholder="Search"
              allowClear
              enterButton="Search"
              size="large"
              onSearch={onSearch}
             
            />
          </AutoComplete> */}
        </Card>
        <Card
          bodyStyle={{ padding: "0%" }}
          style={{ width: "100%" }}
          bordered={false}
          tabList={tabList}
          activeTabKey={activeTabKey1}
          onTabChange={(key) => {
            if (key !== "tab3") {
              onTab1Change(key);
            }
          }}
        />

        {contentList[activeTabKey1]}
      </Col>
    </Row>
  );
};
export default DetailBar;
