import React, {Component} from 'react';
// import PropType from 'prop-types';
import axios from 'axios';
import {message} from 'antd';

const baseURL = 'http://localhost:8000';
const API = axios.create({
  baseURL
});

// const data = [];
// for (let i = 0; i < 100; i++) {
//   data.push({
//     id: i.toString(),
//     hostTeamName: `主 ${i}`,
//     awayTeamName: `客 ${i}`,
//     hostScore: i * 2,
//     awayScore: i,
//     leagueName: '德甲',
//     matchTimeStr: '2018-11-05 12:30',
//     round: 14,
//     winRate: 1.2,
//     drawRate: 2.4,
//     loseRate: 3.1,
//     winOdds: 2,
//     drawOdds: 3,
//     loseOdds: 4
//   });
// }

export default (WrappedComponent) => {
  class DashboardService extends Component {
    state = {
      dataSource: [],
      isSave: false,
      selectLeague: '德甲',
      selectRound: 1
    };


    componentWillMount() {
      const {selectLeague, selectRound} = this.state;
      this.loadData(selectLeague, selectRound);
    }

    save = (row, id) => {
      const newData = [...this.state.dataSource];
      const index = newData.findIndex(item => id === item.id);
      const item = newData[index];
      newData.splice(index, 1, {
        ...item,
        ...row
      });
      this.setState({
        dataSource: newData
      }, () => {

      });
      API.put('/match', newData[index])
        .then(() => {
          this.setState({
            isSave: true
          });
          message.success(`保存成功`);
        })
        .catch(err => {
          message.error(`保存失败`);
        });
    };

    dateChangeHandler = (date, dateStr) => {
      console.log(date, dateStr);
      // this.loadData()
    };

    roundChange = (value) => {
      this.setState({
        selectRound: value
      });
      this.loadData(this.state.selectLeague, value);
    };

    leagueChange = (value) => {
      this.setState({
        selectLeague: value
      });
      this.loadData(value, this.state.selectRound);
    };

    loadData(leagueName, round, pageNum = 1, pageSize = 10) {
      const params = {pageNum: 1, pageSize: 10, leagueName, round};
      API.get('/match', {params})
        .then(res => res.data.data)
        .then(res => res.pageData)
        .then(res => {
          this.setState({
            dataSource: res
          });
        });
    }

    render() {
      return <WrappedComponent
        dataSource={this.state.dataSource}
        onRowChange={this.save}
        selectLeague={this.leagueChange}
        selectRound={this.roundChange}
        dateChangeHandler={this.dateChangeHandler}/>;
    }
  }

  return DashboardService;
}
