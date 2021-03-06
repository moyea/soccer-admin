import React, {Component} from 'react';
import {
  Input,
  Table,
  InputNumber,
  Popconfirm,
  Form,
  // DatePicker,
  Select
} from 'antd';
import './dashboard.css';
import connect from './Dashboard.service';
// import moment from 'moment';
// import locale from 'antd/lib/date-picker/locale/zh_CN';
import range from 'lodash/range';

// moment.locale('zh-cn');

const Option = Select.Option;
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
                    rules: [{
                      required: true,
                      message: `请输入${title}!`
                    }],
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

class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {editingKey: ''};
    this.columns = [
      {
        title: 'ID',
        dataIndex: 'id',
        editable: false,
        width: '4em'
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
      {
        title: '比分',
        dataIndex: 'score',
        width: '6em',
        render(text, record) {
          const {hostScore: host, awayScore: away} = record;
          const hasScore = (host && away) || host === 0 || away === 0;
          return <span>{hasScore ? `${host}:${away}` : '-'}</span>;
        }
      },
      {
        title: '联赛',
        dataIndex: 'leagueName',
        editable: false,
        width: '10em'
      },
      {
        title: '比赛时间',
        dataIndex: 'matchTimeStr',
        editable: false,
        width: '11em'
      },
      {
        title: '轮次',
        dataIndex: 'round',
        editable: false,
        width: '3.5em'
      },
      {
        title: '胜率',
        children: [
          {title: '胜', dataIndex: 'winRate', editable: true},
          {title: '平', dataIndex: 'drawRate', editable: true},
          {title: '负', dataIndex: 'loseRate', editable: true}
        ]
      },
      {
        title: '赔率',
        children: [
          {title: '胜', dataIndex: 'winOdds', editable: true},
          {title: '平', dataIndex: 'drawOdds', editable: true},
          {title: '负', dataIndex: 'loseOdds', editable: true}
        ]
      },
      {
        title: '操作',
        dataIndex: 'oper',
        width: '8em',
        render: (text, record) => {
          const editable = this.isEditing(record);
          return (
            <div>
              {editable ? (
                <span>
                  <EditableContext.Consumer>
                    {form => (
                      <button
                        onClick={() => this.save(form, record.id)}
                        style={{marginRight: 8}}>保存</button>
                    )}
                  </EditableContext.Consumer>
                  <Popconfirm title="Sure to cancel?" onConfirm={() => this.cancel(record.key)}>
                    <button>取消</button>
                  </Popconfirm>
                </span>
              ) : (
                <button onClick={() => this.edit(record.id)}>编辑</button>
              )}
            </div>
          );
        }
      }
    ];
  }

  isEditing = (record) => {
    return record.id === this.state.editingKey;
  };

  edit(id) {
    this.setState({editingKey: id});
  }

  save(form, id) {
    form.validateFields((error, row) => {
      if (error) {
        return;
      }
      this.props.onRowChange(row, id);
      this.setState({editingKey: ''});
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
            <span>选择联赛:</span>
            <Select defaultValue="德甲" style={{width: 120, marginRight: '2em', marginLeft: '.5em'}}
                    onChange={this.props.selectLeague}>
              <Option value="德甲">德甲</Option>
              <Option value="意甲">意甲</Option>
              <Option value="法甲">法甲</Option>
              <Option value="英超">英超</Option>
              <Option value="西甲">西甲</Option>
            </Select>
            <span>选择轮次:</span>
            <Select defaultValue={1} style={{width: 100, marginRight: '2em', marginLeft: '.5em'}}
                    onChange={this.props.selectRound}>
              {range(1, 38).map(
                round => <Option value={round} key={round}>第{round}轮</Option>
              )}
            </Select>
            {/*<span>选择比赛日期：</span>*/}
            {/*<DatePicker locale={locale}*/}
            {/*defaultValue={moment()}*/}
            {/*onChange={this.props.dateChangeHandler}/>*/}

          </div>
          <Table
            components={components}
            bordered
            dataSource={dataSource}
            columns={columns}
            scroll={{x: 1200}}
            size="small"
            rowClassName="editable-row"
            rowKey="id"
          />
        </div>
      </div>
    );
  }
}

export default connect(Dashboard);
