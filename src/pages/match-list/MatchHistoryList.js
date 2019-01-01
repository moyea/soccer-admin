import React, {Component} from 'react';
import {
  Input,
  Table,
  InputNumber,
  Popconfirm,
  Button,
  Form,
  DatePicker,
  message
  // Select
} from 'antd';
import './MatchList.css';
import connect from './MatchHistoryList.service';
import moment from 'moment';
import locale from 'antd/lib/date-picker/locale/zh_CN';

const ExcelJS = require('exceljs/dist/es5/exceljs.browser');
const FileSaver = require('file-saver');
const workbook = new ExcelJS.Workbook();
const sheet = workbook.addWorksheet('Sheet1');
const cellIndexs = 'ABCDEFXYZ';
const alignment = {vertical: 'middle', horizontal: 'center'};
cellIndexs.split('').concat(['AA', 'AB']).forEach((value, idx) => {
  sheet.mergeCells(`${value}1:${value}2`);
  // sheet.getCell(`${value}2`).alignment = alignment;
});

const columnMapping = {
  'A2': '比赛ID',
  'B2': '比赛时间',
  'C2': '逻辑比赛时间',
  'D2': '联赛',
  'E2': '主队',
  'F2': '客队',
  'X2': '主队实力',
  'Y2': '客队实力',
  'Z2': '实力差值',
  'AA2': '本场表现',
  'AB2': '近期表现'
};

Object.keys(columnMapping).forEach(k => {
  const cell = sheet.getCell(k);
  cell.value = columnMapping[k];
  // cell.alignment = alignment;
});
//
// sheet.getCell('A2').value = '比赛ID';
// sheet.getCell('B2').value = '比赛时间';
// sheet.getCell('C2').value = '逻辑比赛时间';
// sheet.getCell('D2').value = '联赛';
// sheet.getCell('E2').value = '主队';
// sheet.getCell('F2').value = '客队';
// sheet.getCell('U2').value = '主队实力';
// sheet.getCell('V2').value = '客队实力';
// sheet.getCell('W2').value = '实力差值';
// sheet.getCell('X2').value = '本场表现';
// sheet.getCell('Y2').value = '近期表现';


sheet.mergeCells('G1:H1');
sheet.getCell('H1').value = '比分';
sheet.getCell('G2').value = '主';
sheet.getCell('H2').value = '客';
sheet.mergeCells('I1:K1');
sheet.getCell('K1').value = '欧洲赔率';
sheet.getCell('I2').value = '胜';
sheet.getCell('J2').value = '平';
sheet.getCell('K2').value = '负';
sheet.mergeCells('L1:N1');
sheet.getCell('N1').value = '欧洲胜率';
sheet.getCell('L2').value = '胜';
sheet.getCell('M2').value = '平';
sheet.getCell('N2').value = '负';
sheet.mergeCells('O1:Q1');
sheet.getCell('Q1').value = '理论赔率';
sheet.getCell('O2').value = '胜';
sheet.getCell('P2').value = '平';
sheet.getCell('Q2').value = '负';
sheet.mergeCells('R1:T1');
sheet.getCell('T1').value = '理论胜率';
sheet.getCell('R2').value = '胜';
sheet.getCell('S2').value = '平';
sheet.getCell('T2').value = '负';
sheet.mergeCells('U1:W1');
sheet.getCell('W1').value = '胜率差';
sheet.getCell('U2').value = '胜';
sheet.getCell('V2').value = '平';
sheet.getCell('W2').value = '负';


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

class MatchHistoryList extends Component {
  constructor(props) {
    super(props);
    this.state = {editingKey: '', forms: [], dateStr: moment().format('YYYY-MM-DD')};
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
        width: '4.3em'
      },
      {
        title: '比赛时间',
        dataIndex: 'matchTimeStr',
        editable: false,
        width: '5.6em'
      },
      {
        title: '逻辑比赛时间',
        dataIndex: 'logicalMatchTime',
        editable: false,
        width: '5.8em'
      },
      {
        title: '联赛',
        dataIndex: 'leagueName',
        editable: false,
        width: '3em'
      },
      {
        title: '主队',
        dataIndex: 'hostTeamName',
        editable: false,
        width: '6em'
      },
      {
        title: '客队',
        dataIndex: 'awayTeamName',
        editable: false,
        width: '6em'
      },
      {
        title: '比分',
        // editable: true,
        children: [
          {title: '主', width: '3.2em', dataIndex: 'hostScore', editable: true},
          {title: '客', width: '3.2em', dataIndex: 'awayScore', editable: true}
        ]
      },
      {
        title: '欧洲赔率',
        children: [
          {title: '胜', width: '3.2em', dataIndex: 'bet365WinOdds', editable: false},
          {title: '平', width: '3.2em', dataIndex: 'bet365DrawOdds', editable: false},
          {title: '负', width: '3.2em', dataIndex: 'bet365LoseOdds', editable: false}
        ]
      },
      {
        title: '欧洲胜率',
        children: [
          {title: '胜', width: '3.2em', dataIndex: 'bet365WinRate', editable: false},
          {title: '平', width: '3.2em', dataIndex: 'bet365DrawRate', editable: false},
          {title: '负', width: '3.2em', dataIndex: 'bet365LoseRate', editable: false}
        ]
      },
      {
        title: '理论赔率',
        children: [
          {title: '胜', width: '3.2em', dataIndex: 'theoreticalWinOdds', editable: true},
          {title: '平', width: '3.2em', dataIndex: 'theoreticalDrawOdds', editable: true},
          {title: '负', width: '3.2em', dataIndex: 'theoreticalLoseOdds', editable: true}
        ]
      },
      {
        title: '理论胜率',
        children: [
          {title: '胜', width: '3.2em', dataIndex: 'theoreticalWinRate', editable: true},
          {title: '平', width: '3.2em', dataIndex: 'theoreticalDrawRate', editable: true},
          {title: '负', width: '3.2em', dataIndex: 'theoreticalLoseRate', editable: true}
        ]
      },
      {
        title: '胜率差',
        children: [
          {title: '胜', width: '3.2em', dataIndex: 'winRateDiff', editable: true},
          {title: '平', width: '3.2em', dataIndex: 'drawRateDiff', editable: true},
          {title: '负', width: '3.2em', dataIndex: 'loseRateDiff', editable: true}
        ]
      },
      {title: '主队实力', width: '4.5em', dataIndex: 'hostStrength', editable: true},
      {title: '客队实力', width: '4.5em', dataIndex: 'awayStrength', editable: true},
      {title: '实力差值', width: '4.5em', dataIndex: 'strengthDiff', editable: true},
      {title: '本场表现', width: '4.5em', dataIndex: 'teamStatus', editable: true},
      {title: '近期表现', width: '4.5em', dataIndex: 'pastStatus', editable: true},
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
                  <Popconfirm title="确定取消?" cancelText="否" okText="是"
                              onConfirm={() => this.cancel(record.key)}>
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
    const {onSaveClick} = this.props;
    form.validateFields((error, row) => {
      if (error) {
        message.error(error.message);
      }
      onSaveClick(row, id)
        .then(() => {
          this.setState({
            editingKey: ''
          });
        });
    });
  }

  exportToExcel = () => {
    this.setState({
      isExporting: true
    });
    const {dataSource} = this.props;
    dataSource.forEach(item => {
      const row = sheet.addRow([
        item.aicaiBetId,
        item.matchTimeStr,
        item.logicalMatchTime,
        item.leagueName,
        item.hostTeamName,
        item.awayTeamName,
        item.hostScore,
        item.awayScore,
        item.bet365WinOdds,
        item.bet365DrawOdds,
        item.bet365LoseOdds,
        item.bet365WinRate,
        item.bet365DrawRate,
        item.bet365LoseRate,
        item.theoreticalWinOdds,
        item.theoreticalDrawOdds,
        item.theoreticalLoseOdds,
        item.theoreticalWinRate,
        item.theoreticalDrawRate,
        item.theoreticalLoseRate,
        item.winRateDiff,
        item.drawRateDiff,
        item.loseRateDiff,
        item.hostStrength,
        item.awayStrength,
        item.strengthDiff,
        item.teamStatus,
        item.pastStatus
      ]);
      row.commit();
    });
    sheet.eachRow(row => {
      row.eachCell(cell => {
        cell.alignment = alignment;
      });
    });
    const filename = `${this.state.dateStr}比赛记录.xlsx`;

    workbook.xlsx
      .writeBuffer()
      .then(buffer => new File([buffer], filename, {type: 'application/octet-stream'}))
      .then(file => {
        message.success(`导出成功`);
        this.setState({
          // isExportSuccess: true,
          isExporting: false
        });
        FileSaver.saveAs(file);
      })
      .catch(err => {
        message.error(`导出失败`);
        this.setState({
          // isExportSuccess: false,
          isExporting: false
        });
      })
    ;
  };

  cancel = () => {
    this.setState({editingKey: ''});
  };

  dateChangeHandler = (date, dateStr) => {
    this.setState({dateStr});
    this.props.dateChangeHandler(dateStr);
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
                        onChange={this.dateChangeHandler}/>
          </div>
          <Table
            components={components}
            bordered
            dataSource={dataSource}
            columns={columns}
            scroll={{x: 1800}}
            size="small"
            pagination={false}
            rowClassName="editable-row"
            rowKey="id"
          />
          {/*<Button className="btn-save" type="primary" onClick={() => this.save()}>保存</Button>*/}
          <Button className="btn-export" type="primary" onClick={() => this.exportToExcel()}>导出到excel</Button>
        </div>
      </div>
    );
  }
}

export default connect(MatchHistoryList);
