
import React, { useState } from 'react';
import { Menu } from 'antd';
// import {
//   PhoneFilled,
//   MessageFilled,
//   BookFilled,
//   EditFilled,
//   PieChartFilled,
//   SettingFilled,
 
// } from '@ant-design/icons';
// import { Link } from 'react-router-dom';


const SiderBar = () => {
  
  const [collapse,setCollapse]=useState({
    collapsed: false,
  })



    return ( 

        <Menu
        style={{ height:'100%'}}
        defaultSelectedKeys={['/']}
        defaultOpenKeys={['sub1']}
        mode="inline"
        inlineCollapsed={collapse.collapsed}
        > 
       
          {/* <Menu.Item  key="1" icon={<PhoneFilled />}>
            Call
          </Menu.Item>
          <Menu.Item  key="2" icon={<MessageFilled />}>
            SMS
          </Menu.Item>
          <Menu.Item  key="3" icon={<BookFilled />}>
            Script
          </Menu.Item>
          <Menu.Item  key="4" icon={<EditFilled />}>
            Wrapup
          </Menu.Item>
          <Menu.Item  key="5" icon={<PieChartFilled />}>
            Report
          </Menu.Item>
          <Menu.Item  key="6" icon={<SettingFilled />}>
            Setting
          </Menu.Item> */}
        </Menu>
    );
  }


export default SiderBar;