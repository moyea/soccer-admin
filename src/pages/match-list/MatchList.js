import React, {Component} from 'react';
import {
  Input,
  Table,
  InputNumber,
  Popconfirm,
  Button,
  Form,
  DatePicker
  // Select
} from 'antd';
import './MatchList.css';
import connect from './MatchList.service';
import moment from 'moment';
import locale from 'antd/lib/date-picker/locale/zh_CN';
// import range from 'lodash/range';

moment.locale('zh-cn');

// const Option = Select.Option;
const FormItem = Form.Item;
const EditableContext = React.createContext();

const EditableRow = ({form, index, ...props}) => (
  <EditableContext.Provider value={form}>
    <tr {...props} />
  </EditableContext.Provider>
);

const EditableFormRow = Form.create()(EditableRow);

class EditableCell extends React.Component {
  getInput = () => {
    if (this.props.inputType === 'number') {
      return <InputNumber/>;
    }
    return <Input/>;
  };

  render() {
    const {
      editing,
      dataIndex,
      title,
      inputType,
      record,
      index,
      ...restProps
    } = this.props;
    return (
      <EditableContext.Consumer>
        {(form) => {
          const {getFieldDecorator} = form;
          return (
            <td {...restProps}>
              {editing ? (
                <FormItem style={{margin: 0}}>
                  {getFieldDecorator(dataIndex, {
                    // rules: [{
                    //   required: true,
                    //   message: `请输入${title}!`
                    // }],
                    initialValue: record[dataIndex]
                  })(this.getInput())}
                </FormItem>
              ) : restProps.children}
            </td>
          );
        }}
      </EditableContext.Consumer>
    );
  }
}

class MatchList extends Component {
  constructor(props) {
    super(props);
    this.state = {editingKey: '', forms: []};
    const _self = this;
    this.columns = [
      {
        title: '比赛ID',
        dataIndex: 'aicaiBetId',
        render(text, record) {
          return <EditableContext.Consumer>
            {
              form => {
                _self.state.forms.push(form);
                return <span>{text}</span>;
              }
            }
          </EditableContext.Consumer>;
        },
        editable: false,
        width: '6em'
      },
      {
        title: '比赛时间',
        dataIndex: 'matchTimeStr',
        editable: false,
        width: '11em'
      },
      {
        title: '联赛',
        dataIndex: 'leagueName',
        editable: false,
        width: '10em'
      },
      {
        title: '主队',
        dataIndex: 'hostTeamName',
        editable: false,
        width: '10em'
      },
      {
        title: '客队',
        dataIndex: 'awayTeamName',
        editable: false,
        width: '10em'
      },
      // {
      //   title: '比分',
      //   dataIndex: 'score',
      //   width: '6em',
      //   render(text, record) {
      //     const {hostScore: host, awayScore: away} = record;
      //     const hasScore = (host && away) || host === 0 || away === 0;
      //     return <span>{hasScore ? `${host}:${away}` : '-'}</span>;
      //   }
      // },
      // {
      //   title: '轮次',
      //   dataIndex: 'round',
      //   editable: false,
      //   width: '3.5em'
      // },
      {
        title: '赔率',
        // editable: true,
        children: [
          {title: '胜', width: '4.2em', dataIndex: 'bet365WinOdds', editable: false},
          {title: '平', width: '4.2em', dataIndex: 'bet365DrawOdds', editable: false},
          {title: '负', width: '4.2em', dataIndex: 'bet365LoseOdds', editable: false}
        ]
      },
      {
        title: '胜率',
        // dataIndex: 'winRate',
        // editable: true,
        children: [
          {title: '胜', width: '4.2em', dataIndex: 'bet365WinRate', editable: false},
          {title: '平', width: '4.2em', dataIndex: 'bet365DrawRate', editable: false},
          {title: '负', width: '4.2em', dataIndex: 'bet365LoseRate', editable: false}
        ]
      },

      {title: '主队实力', dataIndex: 'hostStrength', editable: true},
      {title: '客队实力', dataIndex: 'awayStrength', editable: true},
      {title: '实力差值', dataIndex: 'strengthDiff', editable: true},
      {title: '当前表现', dataIndex: 'teamStatus', editable: true},
      {title: '近期表现', dataIndex: 'pastStatus', editable: true}
      // {
      //   title: '操作',
      //   dataIndex: 'oper',
      //   width: '8em',
      //   render: (text, record) => {
      //     const editable = this.isEditing(record);
      //     return (
      //       <div>
      //         {editable ? (
      //           <span>
      //             <EditableContext.Consumer>
      //               {form => (
      //                 <button
      //                   onClick={() => this.save(form, record.id)}
      //                   style={{marginRight: 8}}>保存</button>
      //               )}
      //             </EditableContext.Consumer>
      //             <Popconfirm title="Sure to cancel?" onConfirm={() => this.cancel(record.key)}>
      //               <button>取消</button>
      //             </Popconfirm>
      //           </span>
      //         ) : (
      //           <button onClick={() => this.edit(record.id)}>编辑</button>
      //         )}
      //       </div>
      //     );
      //   }
      // }
    ];
  }

  isEditing = (record) => {
    return !this.props.isSave;
    // return record.id === this.state.editingKey;
  };

  edit(id) {
    this.setState({editingKey: id});
  }

  save() {
    const {dataSource, onSaveClick} = this.props;
    const promises = this.state.forms.map(form => {
      return new Promise((resolve, reject) => {
        form.validateFields((error, row) => {
          if (error) {
            return reject(error);
          }
          return resolve(row);
        });
      });
    });
    Promise.all(promises)
      .then(formData => {
        return dataSource.map((item, idx) => ({
          ...item,
          ...formData[idx]
        }));
      })
      .then(res => {
        onSaveClick(res);
      });

  }

  cancel = () => {
    this.setState({editingKey: ''});
  };

  render() {
    const components = {
      body: {
        row: EditableFormRow,
        cell: EditableCell
      }
    };

    const {dataSource} = this.props;

    const columns = this.columns.map((col) => {
      if (col.children) {
        let children = col.children.map(childCol => {
          if (!childCol.editable) {
            return childCol;
          }
          return {
            ...childCol,
            onCell: record => ({
              record,
              inputType: childCol.dataIndex === 'age' ? 'number' : 'text',
              dataIndex: childCol.dataIndex,
              title: childCol.title,
              editing: this.isEditing(record)
            })
          };
        });
        return {
          ...col,
          children
        };
      }
      if (!col.editable) {
        return col;
      }
      return {
        ...col,
        onCell: record => ({
          record,
          inputType: col.dataIndex === 'age' ? 'number' : 'text',
          dataIndex: col.dataIndex,
          title: col.title,
          editing: this.isEditing(record)
        })
      };
    });

    return (
      <div className="dashboard">
        <div className="dashboard-body">
          <div className="d-header">
            {/*<span>选择联赛:</span>*/}
            {/*<Select defaultValue="德甲" style={{width: 120, marginRight: '2em', marginLeft: '.5em'}}*/}
            {/*onChange={this.props.selectLeague}>*/}
            {/*<Option value="德甲">德甲</Option>*/}
            {/*<Option value="意甲">意甲</Option>*/}
            {/*<Option value="法甲">法甲</Option>*/}
            {/*<Option value="英超">英超</Option>*/}
            {/*<Option value="西甲">西甲</Option>*/}
            {/*</Select>*/}
            {/*<span>选择轮次:</span>*/}
            {/*<Select defaultValue={1} style={{width: 100, marginRight: '2em', marginLeft: '.5em'}}*/}
            {/*onChange={this.props.selectRound}>*/}
            {/*{range(1, 38).map(*/}
            {/*round => <Option value={round} key={round}>第{round}轮</Option>*/}
            {/*)}*/}
            {/*</Select>*/}
            <span>选择比赛日期：</span>
            <DatePicker locale={locale}
                        defaultValue={moment()}
                        onChange={this.props.dateChangeHandler}/>
          </div>
          <Table
            components={components}
            bordered
            dataSource={dataSource}
            columns={columns}
            scroll={{x: 1400}}
            size="small"
            pagination={false}
            rowClassName="editable-row"
            rowKey="id"
          />
          <Button type="primary" onClick={() => this.save()}>保存</Button>
        </div>
      </div>
    );
  }
}

export default connect(MatchList);
