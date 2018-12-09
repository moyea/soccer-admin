import React, {Component} from 'react';
// import PropType from 'prop-types';
import axios from 'axios';
import {message} from 'antd';

const baseURL = '/api';
// const baseURL = 'http://localhost:8000';
const API = axios.create({
  baseURL
});

API.interceptors.response.use(res => {
  if (!res) {
    return Promise.reject({msg: '系统错误，请稍后重试'});
  }
  if (res.status >= 200 && res.status < 300) {
    return Promise.resolve(res.data);
  }
  switch (res.status) {
    case 400:
      res.msg = '请求错误';
      break;
    case 401:
      res.msg = '未授权，请登录';
      break;
    case 403:
      res.msg = '拒绝访问';
      break;
    case 404:
      res.msg = `请求地址出错`;
      break;
    case 408:
      res.msg = '请求超时';
      break;
    case 500:
      res.msg = '服务器内部错误';
      break;
    case 501:
      res.msg = '服务未实现';
      break;
    case 502:
      res.msg = '网关错误';
      break;
    case 503:
      res.msg = '服务不可用';
      break;
    case 504:
      res.msg = '网关超时';
      break;
    case 505:
      res.msg = 'HTTP版本不受支持';
      break;
    default:
      res.msg = '未知错误,请稍后重试';
  }
  return Promise.reject(res);
});

const baseData = {
  aicaiBetId: '',
  matchTimeStr: '',
  logicalMatchTime: '',
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
  teamStatus: '',
  pastStatus: '',
  theoreticalWinOdds: '',
  theoreticalDrawOdds: '',
  theoreticalLoseOdds: '',
  theoreticalWinRate: '',
  theoreticalDrawRate: '',
  theoreticalLoseRate: ''
};

export default (WrappedComponent) => {
  class Inner extends Component {
    state = {
      dataSource: [],
      isSave: false,
      selectLeague: '德甲',
      selectRound: 1,
      isHistory: false
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
      const getValidFloat = (n) => n ? parseFloat(n) : '';
      const getValidInt = (n) => n ? parseInt(n) : '';
      const newData = dataList.map(item => ({
        ...item,
        hostScore: getValidInt(item.hostScore),
        awayScore: getValidInt(item.awayScore),
        hostStrength: '',
        awayStrength: '',
        strengthDiff: '',
        theoreticalWinOdds: getValidFloat(item.theoreticalWinOdds),
        theoreticalDrawOdds: getValidFloat(item.theoreticalDrawOdds),
        theoreticalLoseOdds: getValidFloat(item.theoreticalLoseOdds),
        theoreticalWinRate: getValidFloat(item.theoreticalWinRate),
        theoreticalDrawRate: getValidFloat(item.theoreticalDrawRate),
        theoreticalLoseRate: getValidFloat(item.theoreticalLoseRate)
      }));
      API.post('/match2/batch', newData)
        .then(() => {
          this.setState({
            isSave: true,
            dataSource: newData
          });
          message.success(`保存成功`);
        })
        .catch(err => {
          message.error(`保存失败`);
        });
    };

    dateChangeHandler = (date, dateStr) => {
      this.loadHistoryData(dateStr);
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

    loadHistoryData(dateStr) {
      API.get('/match2', {
        params: {
          pageNum: 1,
          pageSize: 100,
          logicalMatchDate: dateStr
        }
      })
        .then(res => res.data)
        .then(res => res.pageData)
        .then(res => {
          this.setState({
            dataSource: res,
            isHistory: true
          });
        });
    }

    loadData() {
      API.get('/data')
        .then(res => res.data)
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
          this.setState({
            dataSource: res,
            isHistory: false
          });
        });
    }

    getScoreByMatchId(matchId) {
      return API.get(`/data/bet365/${matchId}`)
        .then(res => res.data)
        .then(res => res || {})
        .then(res => ({
          aicaiBetId: matchId,
          bet365WinOdds: parseFloat((res.firstWinOdds / 10000).toFixed(2)),
          bet365DrawOdds: parseFloat((res.firstDrowOdds / 10000).toFixed(2)),
          bet365LoseOdds: parseFloat((res.firstLoseOdds / 10000).toFixed(2)),
          bet365WinRate: parseFloat((res.firstWinRate / 100).toFixed(2)),
          bet365DrawRate: parseFloat((res.firstDrowRate / 100).toFixed(2)),
          bet365LoseRate: parseFloat((res.firstLoseRate / 100).toFixed(2))
        }));
    }

    render() {
      return <WrappedComponent
        dataSource={this.state.dataSource}
        onSaveClick={this.save}
        isSave={this.state.isSave}
        isHistory={this.state.isHistory}
        dateChangeHandler={this.dateChangeHandler}/>;
    }
  }

  return Inner;
}
