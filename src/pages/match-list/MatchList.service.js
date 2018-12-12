import React, {Component} from 'react';
// import PropType from 'prop-types';
import {message} from 'antd';
import API from '../../common/API';

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
  theoreticalLoseRate: '',
  hostScore: '',
  awayScore: ''
};

export default (WrappedComponent) => {
  class Inner extends Component {
    state = {
      dataSource: [],
      isSave: false
      // selectLeague: '德甲',
      // selectRound: 1
      // isHistory: false
    };


    componentWillMount() {
      this.loadData();
    }

    save = (dataList) => {
      const getValidFloat = (n) => n ? parseFloat(n) : '';
      const getValidInt = (n) => n ? parseInt(n) : '';
      const newData = dataList.map(item => ({
        ...item,
        hostScore: getValidInt(item.hostScore),
        awayScore: getValidInt(item.awayScore),
        hostStrength: getValidInt(item.hostStrength),
        awayStrength: getValidInt(item.awayStrength),
        strengthDiff: getValidInt(item.strengthDiff),
        teamStatus: getValidInt(item.teamStatus),
        pastStatus: getValidInt(item.pastStatus),
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
      return <WrappedComponent dataSource={this.state.dataSource} onSaveClick={this.save}/>;
    }
  }

  return Inner;
}
