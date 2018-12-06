import React, {Component} from 'react';
// import PropType from 'prop-types';
import axios from 'axios';
import {message} from 'antd';

const baseURL = 'http://localhost:8000';
const API = axios.create({
  baseURL
});

const baseData = {
  aicaiBetId: '',
  matchTimeStr: '',
  leagueName: '',
  hostTeamName: '',
  awayTeamName: '',
  // hostScore: '',
  // awayScore: '',
  bet365WinOdds: '',
  bet365DrawOdds: '',
  bet365LoseOdds: '',
  bet365WinRate: '',
  bet365DrawRate: '',
  bet365LoseRate: '',
  hostStrength: '',
  awayStrength: '',
  strengthDiff: '',
  winIndex: '',
  drawIndex: '',
  loseIndex: ''
};

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

    save = (dataList) => {
      // const newData = [...this.state.dataSource];
      // const index = newData.findIndex(item => id === item.id);
      // const item = newData[index];
      // newData.splice(index, 1, {
      //   ...item,
      //   ...row
      // });
      API.post('/match2/batch', dataList)
        .then(() => {
          this.setState({
            isSave: true,
            dataSource: dataList
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
          const promise = Promise.all(res
            .map(item => item.aicaiBetId)
            .map(this.getScoreByMatchId)
          );
          return Promise.all([
            Promise.resolve(res),
            promise
          ]);
        })
        .then(([matchList, oddList]) => {
          return matchList.map(item => {
            const oddInfo = oddList.find(oddItem => oddItem.aicaiBetId === item.aicaiBetId);
            return {
              ...item,
              ...oddInfo
            };
          });
        })
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
        .then(res => res || {})
        .then(res => ({
          aicaiBetId: matchId,
          bet365WinOdds: (res.firstWinOdds / 10000).toFixed(2),
          bet365DrawOdds: (res.firstDrowOdds / 10000).toFixed(2),
          bet365LoseOdds: (res.firstLoseOdds / 10000).toFixed(2),
          bet365WinRate: (res.firstWinRate / 100).toFixed(2),
          bet365DrawRate: (res.firstDrowRate / 100).toFixed(2),
          bet365LoseRate: (res.firstLoseRate / 100).toFixed(2)
        }));
    }

    render() {
      return <WrappedComponent
        dataSource={this.state.dataSource}
        onSaveClick={this.save}
        isSave={this.state.isSave}
        dateChangeHandler={this.dateChangeHandler}/>;
    }
  }

  return Inner;
}
