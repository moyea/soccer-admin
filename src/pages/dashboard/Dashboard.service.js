import React, {Component} from 'react';
import PropType from 'prop-types';
import axios from 'axios';
import {message} from 'antd';

const getMatchListAPI = '';
const saveMatchListAPI = '';

const data = [];
for (let i = 0; i < 100; i++) {
  data.push({
    id: i.toString(),
    hostTeamName: `主 ${i}`,
    awayTeamName: `客 ${i}`,
    hostScore: i * 2,
    awayScore: i,
    leagueName: '德甲',
    matchTimeStr: '2018-11-05 12:30',
    round: 14,
    winRate: 1.2,
    drawRate: 2.4,
    loseRate: 3.1,
    winOdds: 2,
    drawOdds: 3,
    loseOdds: 4
  });
}

export default (WrappedComponent) => {
  class DashboardService extends Component {

    state = {
      dataSource: [],
      isSave: false
    };


    componentWillMount() {
      axios.get(getMatchListAPI)
        .then(res => {
          this.setState({
            dataSource: data
          });
        });
    }

    save = (row, id) => {
      const newData = [...this.state.dataSource];
      const index = newData.findIndex(item => id === item.id);
      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, {
          ...item,
          ...row
        });
      } else {
        newData.push(row);
      }
      this.setState({
        dataSource: newData
      });
      axios.post(saveMatchListAPI, row)
        .then(() => {
          this.setState({
            isSave: true
          });
          message.success(`保存成功`);
        })
        .catch(err => {
          console.log(err);
          message.error(`保存失败`);
        });
    };

    dateChangeHandler = (date, dateStr) => {
      console.log(date, dateStr);
    };

    render() {
      return <WrappedComponent
        dataSource={this.state.dataSource}
        onRowChange={this.save}
        dateChangeHandler={this.dateChangeHandler}/>;
    }
  }

  return DashboardService;
}
