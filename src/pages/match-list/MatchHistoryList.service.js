import React, {Component} from 'react';
import {message} from 'antd';
import API from '../../common/API';
import moment from 'moment';


export default (WrappedComponent) => {
  class Inner extends Component {
    state = {
      dataSource: []
    };

    componentWillMount() {
      this.loadHistoryData(moment().format('YYYY-MM-DD'));
    }

    dateChangeHandler = (dateStr) => {
      this.loadHistoryData(dateStr);
    };

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

    save = (row, id) => {
      const newData = [...this.state.dataSource];
      const index = newData.findIndex(item => id === item.id);
      if (index < 0) {
        return message.error('无效的记录');
      }
      const item = newData[index];
      console.log(item);

      const newItem = {
        ...item,
        ...row
      };
      newData.splice(index, 1, newItem);
      const getValidFloat = (n) => n ? parseFloat(n) : '';
      const getValidInt = (n) => n ? parseInt(n) : '';
      const datas = [newItem].map(item => ({
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

      console.log(datas);

      return API.post('/match2/batch', datas)
        .then(() => {
          this.setState({
            dataSource: newData
          });
          message.success(`保存成功`);
        })
        .catch(err => {
          message.error(`保存失败`);
        });
    };

    render() {
      return <WrappedComponent
        dataSource={this.state.dataSource}
        onSaveClick={this.save}
        dateChangeHandler={this.dateChangeHandler}/>;
    }
  }

  return Inner;
}
