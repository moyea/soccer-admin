import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Menu, Icon} from 'antd';
import {withRouter} from 'react-router';
import {Link} from 'react-router-dom';
import './LeftSlideBar.css';

class LeftSlideBarComp extends Component {

  static props = {
    collapsed: PropTypes.bool,
    subMenuChange: PropTypes.func
  };


  state = {
    menuList: [
      {id: 'dashboard', icon: <Icon type="dashboard"/>, path: '/dashboard', label: '比赛记录', subMenuList: []},
      {id: 'match-list', icon: <Icon type="dashboard"/>, path: '/match-list', label: '当日比赛记录', subMenuList: []}
    ]
  };

  componentWillReceiveProps(nextProps) {
    let selectedKeys = [];
    this.state.menuList.forEach(item => {
      if (item.path === nextProps.location.pathname) {
        selectedKeys.push(item.id);
      }
      (item.subMenuList || []).forEach(subMenuItem => {
        if (subMenuItem.path === nextProps.location.pathname) {
          selectedKeys.push(subMenuItem.id);
        }
      });
    });
    this.setState({
      _defaultSelectedKeys: selectedKeys
    });
  }

  render() {
    const {collapsed, subMenuChange, location} = this.props;
    const currentPath = location.pathname;
    const {menuList} = this.state;
    return (
      <Menu mode="inline" theme="dark" inlineCollapsed={collapsed} inlineIndent={30}
            onOpenChange={(openKeys) => subMenuChange && subMenuChange(openKeys)}>
        {menuList.map(menuItem => {
          if (menuItem.subMenuList && menuItem.subMenuList.length > 0) {
            return (
              <Menu.SubMenu key={menuItem.id} title={
                <span>{menuItem.icon}<span>{menuItem.label}</span></span>}>
                {
                  menuItem.subMenuList.map(subMenuItem => (
                    <Menu.Item key={subMenuItem.id}
                               className={subMenuItem.path === currentPath ? 'ant-menu-item-selected' : ''}>
                      <Link to={subMenuItem.path}>{subMenuItem.icon}<span>{subMenuItem.label}</span></Link>
                    </Menu.Item>
                  ))
                }
              </Menu.SubMenu>
            );
          } else {
            return (
              <Menu.Item key={menuItem.id} className={menuItem.path === currentPath ? 'ant-menu-item-selected' : ''}>
                <Link to={menuItem.path}>{menuItem.icon}<span>{menuItem.label}</span></Link>
              </Menu.Item>
            );
          }
        })}
      </Menu>
    );
  }
}

const LeftSlideBar = withRouter(LeftSlideBarComp);
export default LeftSlideBar;
