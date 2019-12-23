import React, { Component } from "react";
import "../App.css";
import * as call from "./Common";

import {
  EuiPage,
  EuiPageBody,
  EuiPageHeader,
  EuiPageHeaderSection,
  EuiPageContent,
  EuiPageContentHeader,
  EuiPageContentHeaderSection,
  EuiTitle,
  EuiForm,
  EuiFlexGroup,
  EuiFlexItem,
  EuiText,
  EuiInMemoryTable,
  EuiButton,
  EuiLoadingSpinner,
  EuiGlobalToastList,
  EuiPanel
} from "@elastic/eui/lib";

class Arbitrar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isEnrollModalVisible: false,
      isToastVisible: false,
      isLoaded: false,
      modalHeader: null,
      modalText: null,
      refundItems: [],
      toasts: []
    };
  }

  componentDidCatch(error, info) {
    alert(error);
  };
  componentDidMount() {
    this.getRefunds();
  };
  checkErrMsg = errMsg => {
    if (errMsg.includes("Отсутствует криптоматериал")) {
      this.showEnrollModal(errMsg, "Выпустить криптоматериал ?");
    } else this.showToast(errMsg, "danger", "alert");
  };
  showEnrollModal = (header, text) => {
    this.setState({
      isEnrollModalVisible: true,
      modalHeader: header,
      modalText: text
    });
  };
  closeModal = () => {
    this.setState({
      isEnrollModalVisible: false
    });
  };
  showToast = (text, type, iconType) => {
    let toasts = [
      {
        id: Math.random().toString(),
        title:
          type === "danger" ? (
            <EuiText>
              <b>Error</b>
            </EuiText>
          ) : (
            <EuiText>
              <b>Info</b>
            </EuiText>
          ),
        color: type,
        iconType: iconType,
        text: <EuiText>{text}</EuiText>
      }
    ];
    this.setState({
      toasts: toasts,
      isToastVisible: true,
      isLoaded: true
    });
  };
  closeToast = () => {
    this.setState({
      isToastVisible: false,
      toasts: []
    });
  };
  getRefunds = () => {
    this.setState({ isLoaded: false });
    call.getAllItems("RF0", "RF99999999")
      .then(res => {
        if (res.error) {
          this.checkErrMsg(res.error);
        } else {
          //alert(res.result);
          let refundItems = JSON.parse(res.result);
          let needApprove = refundItems.filter(ref => ref.state === 1);
          this.setState({ refundItems: needApprove, isLoaded: true });
        }
      })
      .catch(err => {
        this.showToast(err.toString(), "danger", "alert");
        console.log(err);
      });
  };
  setRefundState = (refItem, state) => {
    this.setState({
      isLoaded: false
    });
    call.setRefundProps(
        refItem.id,
        refItem.clientid,
        refItem.agreementid,
        "state",
        state
      )
      .then(res => {
        if (res.error) {
          this.checkErrMsg(res.error);
        } else {
          //let refund = JSON.parse(res.result);
          this.componentDidMount();
          this.showToast(
            `Запрос на возмещение ${state === 2 ? "одобрен" : "отклонен"}`,
            "success"
          );
        }
      })
      .catch(err => {
        this.showToast(err.toString(), "danger", "alert");
        console.log(err);
      });
  };

  render() {
    let msgToast;

    if (this.state.isToastVisible) {
      msgToast = (
        <EuiGlobalToastList
          toasts={this.state.toasts}
          dismissToast={this.closeToast}
          toastLifeTimeMs={5000}
        />
      );
    }
    const pagination = {
      initialPageSize: 5,
      pageSizeOptions: [3, 5, 8]
    };
    let actions = [
      {
        render: item => {
          return (
            <EuiButton
              color="secondary"
              size="s"
              onClick={() => this.setRefundState(item, 2)}
            >
              Согласовать
            </EuiButton>
          );
        }
      },
      {
        render: item => {
          return (
            <EuiButton
              color="danger"
              size="s"
              onClick={() => this.setRefundState(item, 3)}
            >
              Отклонить
            </EuiButton>
          );
        }
      }
    ];
    const columns = [
      {
        field: "createDate",
        name: "Дата",
        sortable: false,
        truncateText: false
      },
      {
        field: "id",
        name: "Запрос на выплату",
        sortable: false,
        truncateText: false
      },
      {
        field: "insCompany",
        name: "Страховщик",
        sortable: false,
        truncateText: false
      },
      {
        field: "userName",
        name: "Страхователь",
        sortable: false,
        truncateText: false
      },
      {
        field: "productName",
        name: "Продукт",
        sortable: false,
        truncateText: false
      },
      {
        field: "cause",
        name: "Причина",
        sortable: false,
        truncateText: false
      },
      {
        field: "amount",
        name: "Выплата",
        sortable: false,
        truncateText: false
      },
      // {
      //   field: "state",
      //   name: "Статус",
      //   render: state => {
      //     let color, desc;
      //     switch(state) {
      //       case 1:
      //         color = 'warning';
      //         desc = 'На рассмотрении';
      //         break;
      //       case 2:
      //         color = 'success';
      //         desc = 'Одобрено';
      //         break;
      //       case 3:
      //         color = 'danger';
      //         desc = 'Отклонено';
      //         break;
      //       default:
      //         color = 'subdued';
      //          desc = 'Неизвестно';
      //     }
      //     return <EuiHealth color={color}>{desc}</EuiHealth>;
      //   }
      // },
      {
        name: "Действия",
        actions,
        width: "20%"
      }
    ];
    let search = {
      toolsRight: [
        <EuiButton onClick={() => this.getRefunds()}>Обновить</EuiButton>
      ],
      box: {
        incremental: true
      },
      filters: []
    };

    return (
      <div
        style={{
          marginTop: "40px"
        }}
      >
        <EuiPage className="euiNavDrawerPage">
          <EuiPageBody className="euiNavDrawerPage__pageBody">
            <EuiPageHeader>
              <EuiPageHeaderSection>
                <EuiTitle size="l">
                  <h1>Приложение арбитра</h1>
                </EuiTitle>
              </EuiPageHeaderSection>
            </EuiPageHeader>
            <EuiPageContent>
              <EuiPageContentHeader>
                <EuiPageContentHeaderSection>
                  <EuiForm>
                    <EuiFlexGroup direction="column">
                      <EuiFlexItem>
                        <EuiText>
                          <h3>Сценарий:</h3>
                          <ol>
                            <li>Арбитр на свой стороне обраруживает запрос на выплату. Согласует или отклоняет</li>
                            <li>Если согласовано, то в профиле клиента активируется кнопка "Получить выплату" и статус "Одобрено" иначе кнопка неактивна, статус "Отклонено"</li>
                            <li>В случае статуса "Одобрено" после нажатия кнопки "Получить выплату" с баланса страховой списывается сумма возмещения (указанная в договоре)</li>
                            <li>Баланс клиента увеличивается на сумму возмещения</li>
                          </ol>
                        </EuiText>
                      </EuiFlexItem>
                      <EuiPanel hasShadow>
                      <EuiText style={{ margin: "10px" }} textAlign="center">
                        <h3>Запросы на выплату
                          {this.state.refundItems.length === 0 ? ' отсутствуют' : ` (ожидают согласования: ${this.state.refundItems.length})`}
                          &nbsp;&nbsp;{this.state.isLoaded ? '' : <EuiLoadingSpinner size="m" />}</h3>
                      </EuiText>
                      <EuiFlexItem>
                        <EuiInMemoryTable
                          items={this.state.refundItems}
                          itemId="id"
                          columns={columns}
                          search={search}
                          pagination={pagination}
                          sorting={true}
                          isSelectable={true}
                        />
                      </EuiFlexItem>
                      </EuiPanel>
                    </EuiFlexGroup>
                  </EuiForm>
                </EuiPageContentHeaderSection>
              </EuiPageContentHeader>
            </EuiPageContent>
          </EuiPageBody>
        </EuiPage>
        {msgToast}
      </div>
    );
  }
}

export default Arbitrar;
