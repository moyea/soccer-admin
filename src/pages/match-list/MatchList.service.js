import React, {Component} from 'react';
// import PropType from 'prop-types';
import axios from 'axios';
import {message} from 'antd';

const baseURL = 'http://localhost:8000';
const API = axios.create({
  baseURL
});

const baseData = {
  matchId: '',
  matchTime: '',
  leagueName: '',
  hostName: '',
  awayName: '',
  hostScore: '',
  awayScore: '',
  winOdds: '',
  drawOdds: '',
  loseOdds: '',
  winRate: '',
  drawRate: '',
  loseRate: '',
  winStrength: '',
  drawStrength: '',
  loseStrength: '',
  winIndex: '',
  drawIndex: '',
  loseIndex: ''
};

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
  class Inner extends Component {
    state = {
      dataSource: [],
      isSave: false,
      selectLeague: '德甲',
      selectRound: 1
    };


    componentWillMount() {
      // const {selectLeague, selectRound} = this.state;
      this.loadData();
    }

    save = (row, id) => {
      const newData = [...this.state.dataSource];
      const index = newData.findIndex(item => id === item.id);
      const item = newData[index];
      newData.splice(index, 1, {
        ...item,
        ...row
      });
      API.put('/data', newData[index])
        .then(() => {
          this.setState({
            // isSave: true,
            dataSource: newData
          });
          message.success(`保存成功`);
        })
        .catch(err => {
          message.error(`保存失败`);
        });
    };

    dateChangeHandler = (date, dateStr) => {
      console.log(date, dateStr);
      this.loadData();
    };

    // roundChange = (value) => {
    //   this.setState({
    //     selectRound: value
    //   });
    //   this.loadData(this.state.selectLeague, value);
    // };
    //
    // leagueChange = (value) => {
    //   this.setState({
    //     selectLeague: value
    //   });
    //   this.loadData();
    // };

    loadData() {
      API.get('/data')
        .then(res => res.data.data)
        .then(res => Object.keys(res).reduce((acc, cur) => acc.concat(res[cur]), []))
        .then(res => res.map(item => Object.assign({}, baseData, item)))
        .then(res => {
          console.log(res);
          this.setState({
            dataSource: res
          });
        });
    }

    getScoreByMatchId(matchId) {
      return API.get(`/data/bet365/${matchId}`)
        .then(res => res.data.data)
        .then(res => ({
          matchId,
          ...res
        }));
    }

    render() {
      return <WrappedComponent
        dataSource={this.state.dataSource}
        onRowChange={this.save}
        dateChangeHandler={this.dateChangeHandler}/>;
    }
  }

  return Inner;
}
