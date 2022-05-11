import React, { useContext, useState } from "react";
import { Menu } from "antd";
import { SearchOutlined, BellOutlined, UserOutlined } from "@ant-design/icons";
import AuthContext from "../context/AuthenContext";
import { useHistory } from "react-router";
import { useSimpleUser } from "../context/SimpleUserContext";
// import { Link } from "react-router-dom";
import { useRecentCallList } from "../context/RecentCallListContext";

const ToolBar = () => {
  const { SubMenu } = Menu;
  const [menu, setMenu] = useState();
  const history = useHistory();
  const { simpleUser, setSimpleUser } = useSimpleUser();
  const { removeToken, user } = useContext(AuthContext);
  const { recentCallList, setRecentCallList } = useRecentCallList();
  var indexedDB =
    window.indexedDB ||
    window.mozIndexedDB ||
    window.webkitIndexedDB ||
    window.msIndexedDB ||
    window.shimIndexedDB;
  const LogOut = async (e) => {
    // e.preventdefault()
    //   const open = await indexedDB.open(`MyDatabase${user?.username}`, 2);
    //  await open.onsuccess = async () => {
    //     // Start a new transaction
    //     const db = open.result;
    //     await db.close();
    //   }
    setRecentCallList(null);
    setSimpleUser(null);
    await removeToken();
    // localStorage.setItem("noneUser",true)
    history.push("/");
  };

  const handleClick = (e) => {
    // console.log('click ', e);
    setMenu({ current: e.key });
  };
  return (
    // <PageHeader
    // style={{backgroundColor:'#096DD9', width:'100%', height:'100%', padding: '0.5% 2% '}}
    //   ghost={false}
    //   extra={[
    //     <Button style={{color:'#ffffff'}} type="text" key="3" shape="circle" icon={<SearchOutlined />}/>,
    //     <Button style={{color:'#ffffff'}} type="text" key="2" shape="circle" icon={<BellOutlined />}/>,
    //     <Button key="1" type="text" style={{color:'#ffffff'}} >
    //         <Avatar size="small" icon={<UserOutlined />} />
    //       Username
    //     </Button>,
    //   ]}
    // >

    // </PageHeader>

    <Menu
      triggerSubMenuAction="click"
      inlineIndent={0}
      onClick={handleClick}
      style={{
        backgroundColor: "#096DD9",
        width: "100%",
        height: "100%",
        justifyContent: "end",
      }}
      mode="horizontal"
    >
      {/* <Menu.Item  key="search" style={{color:'#ffffff'}} icon={<SearchOutlined />}>
</Menu.Item>
<Menu.Item key="notification" style={{color:'#ffffff'}} icon={<BellOutlined />}>
</Menu.Item> */}
      <SubMenu
        key="username"
        style={{ color: "#ffffff" }}
        icon={<UserOutlined />}
        title={`${user?.username}`}
      >
        {/* <Link to="/editprofilepage"><Menu.Item key="setting:1">แก้ไขโปรไฟล์</Menu.Item></Link> */}
        <Menu.Item key="setting:1" onClick={LogOut}>
          ออกจากระบบ
        </Menu.Item>
      </SubMenu>
    </Menu>
  );
};

export default ToolBar;
