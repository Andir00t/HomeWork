import React, { Component } from "react";
import "../App.css";
import * as call from "./Common";

import {
    EuiButtonEmpty,
    EuiModal,
    EuiModalBody,
    EuiModalFooter,
    EuiModalHeader,
    EuiModalHeaderTitle,
    EuiOverlayMask,
    EuiPage,
    EuiPageBody,
    EuiPageHeader,
    EuiPageHeaderSection,
    EuiPageContent,
    EuiPageContentHeader,
    EuiPageContentHeaderSection,
    EuiTitle,
    EuiButton,
    EuiForm,
    EuiFormRow,
    EuiFieldText,
    EuiGlobalToastList,
    EuiText,
    EuiFlexItem,
    EuiFlexGroup,
    EuiPanel,
    EuiCard,
    EuiLoadingSpinner,
    EuiIcon,
    EuiConfirmModal,
    EuiFieldPassword,
    EuiFlyout,
    EuiFlyoutHeader,
    EuiFlyoutBody,
    EuiFieldNumber,
    EuiDescriptionList,
    EuiDescriptionListTitle,
    EuiDescriptionListDescription,
    EuiAccordion,
    EuiHorizontalRule,
    EuiHealth
  } from "@elastic/eui/lib";



  class Insurance extends Component {
    constructor(props) {
      super(props);

      let initialState = {
        isToastVisible: false,
        isRegisterModalVisible: false,
        isPurchaiseModalVisible: false,
        isLoginModalVisible: false,
        isProfileVisible: false,
        isBalanceModalVisible: false,
        isRefundModalVisible: false,
        isEnrollModalVisible: false,
        isUserLoaded: true,
        isInsurLoaded: false,
        isProfileLoading: false,
        modalHeader: null,
        modalText: null,
        regItem: {},
        logItem: {},
        refundItem: {},
        setItem: {},
        insInfo: {},
        userInfo: {
          isAuthtorized: false
        },
        productInfo: {},
        purchaiseInfo: {},
        agreeInfo: {},
        toasts: []
      }

      this.state = initialState;
      this.state.userInfo = JSON.parse(localStorage.getItem('userInfo'))
        ? JSON.parse(localStorage.getItem('userInfo'))
        : initialState.userInfo;

  }

    componentDidCatch(error, info) {
      alert(error)
    };
    componentDidMount() {
      call.getInsuranceInfo()
        .then(res => {
          if (res.error) {
            this.checkErrMsg(res.error)
          } else {
            let insInfo = JSON.parse(res.result);
            this.setState({
              insInfo: insInfo,
              isInsurLoaded: true})
            }
        })
        .catch(err => {
          this.showToast(err.toString(), "danger", "alert")
          console.log(err);
        });
    };
    checkErrMsg = errMsg => {
      if(errMsg.includes("Отсутствует криптоматериал")){
        this.showEnrollModal(errMsg, "Выпустить криптоматериал ?");
      }
      else this.showToast(errMsg, "danger", "alert")
    };
    showPurchaiseModal = productInfo => {
      if (this.state.userInfo.isAuthtorized){
        this.setState({
            isPurchaiseModalVisible: true,
            productInfo: productInfo,
            isProfileLoading: true
          }, () => {
            this.getClient();
          });
      }
      else this.showToast("Необходимо зарегистрироваться или авторизоваться !")
    };
    showEnrollModal = (header, text) => {
        this.setState({
          isEnrollModalVisible: true,
          modalHeader: header,
          modalText: text
        });
    };
    showRegisterModal = () => {
        this.setState({
          isRegisterModalVisible: true
        });
    };
    showLoginModal = () => {
       this.setState({
         isLoginModalVisible: true
       });
    };
    showProfileModal = () => {
      this.setState({
         isProfileVisible: true,
         isProfileLoading: true
      }, () => {
        this.getClient();
      });
    };
    showBalanceModal = () => {
      this.setState({
        isBalanceModalVisible: true,
        isProfileLoading: true
      }, () => {
        this.getClient();
      })
    };
    showRefundModal = agreeItem => {
      this.setState({
        isRefundModalVisible: true,
        isProfileVisible: false,
        agreeInfo: agreeItem
      }
      );
    }
    closeModal = () => {
        this.setState({
          isEnrollModalVisible: false,
          isRegisterModalVisible: false,
          isPurchaiseModalVisible: false,
          isLoginModalVisible: false,
          isProfileVisible: false,
          isBalanceModalVisible: false,
          isRefundModalVisible: false,
          regItem: {},
          logItem: {},
          setItem: {},
          refundItem: {}
        });
    };
    showToast = (text, type, iconType) => {
      let toasts = [
        {
          id: (Math.random()).toString(),
          title: type === 'danger' ? <EuiText><b>Error</b></EuiText>
                                   : <EuiText><b>Info</b></EuiText>,
          color: type,
          iconType: iconType,
          text: <EuiText>{text}</EuiText>
        }
      ];

      this.setState({
        toasts: toasts,
        isToastVisible: true,
        isInsurLoaded: true,
        isUserLoaded: true,
        purchaiseInfo: {}
      });
    };
    closeToast = () => {
      this.setState({
        isToastVisible: false,
        toasts: []
       });
    };
    onChangeReg = (fieldName, itemVal) => {
      let currentItem = this.state.regItem;
      currentItem[fieldName] = itemVal.trim();
      this.setState({ regItem: currentItem });
    };
    onChangeLog = (fieldName, itemVal) => {
      let currentItem = this.state.logItem;
      currentItem[fieldName] = itemVal.trim();
      this.setState({ logItem: currentItem });
    };
    onChangeBalance = (fieldName, itemVal) => {
      let currentItem = this.state.setItem;
      currentItem.name = fieldName;
      currentItem.value = Number(itemVal) >= 0 ? itemVal.trim() : 
        this.showToast('значение должно быть положительным числом', 'danger');
      this.setState({ setItem: currentItem });
    };
    onChangeRefund = (fieldName, itemVal) => {
      let currentItem = this.state.logItem;
      currentItem[fieldName] = itemVal.trim();
      this.setState({ refundItem: currentItem });
    };
    onConfirmRegister = () => {
      this.setState({
        isUserLoaded: false
      });
      call.registerUser(this.state.regItem)
          .then(res => {
              if (res.error) {
                this.checkErrMsg(res.error)
              } else {
                  //alert(JSON.stringify(res.result));
                  this.showToast("Пользователь успешно зарегистрирован", "success");
               }
          })
          .catch(err => {
            this.showToast(err.toString(), "danger", "alert")
            console.log(err);
          });
      this.closeModal();
    };
    onConfirmPurchaise = () => {
      this.state.userInfo.balance >= this.state.purchaiseInfo.instAmount ?
      call.makePurchaise(this.state.userInfo.id, this.state.purchaiseInfo)
          .then(res => {
              if (res.error) {
                this.checkErrMsg(res.error)
              } else {
                  //alert(JSON.stringify(res.result));
                  this.getClient();
                  this.componentDidMount();
                  this.showToast("Операция выполнена успешно", "success");
               }
          })
          .catch(err => {
            this.showToast(err.toString(), "danger", "alert")
            console.log(err);
          }) : this.showToast('Недостаточно средств', "danger")
      this.closeModal();
    };
    enrollAccount = () => {
      call.enrollAdmin()
          .then(res => {
              if (res.error) {
                this.showToast(res.error, "danger", "alert")
              } else
                  this.showToast(res.result, "success")
                  setTimeout(() => window.location.reload(), 3000);
          })
         .catch(err => {
           this.showToast(err, "danger", "alert")
           console.log(err);
         });
      this.closeModal();
    };
    getClient = () => {
      call.getClient(this.state.userInfo.id)
          .then(res => {
              if (res.error) {
                this.checkErrMsg(res.error)
              } else {
                  let userInfo = JSON.parse(res.result);
                  userInfo.isAuthtorized = true;
                  this.setState({userInfo: userInfo, isProfileLoading: false}, () => {
                    localStorage.setItem('userInfo', JSON.stringify(this.state.userInfo))
                  })
               }
          })
          .catch(err => {
            this.showToast(err.toString(), "danger", "alert")
            console.log(err);
          });
    };
    onConfirmLogin = () => {
      this.setState({
        isUserLoaded: false
      });
      call.loginUser(this.state.logItem)
          .then(res => {
              if (res.error) {
                this.checkErrMsg(res.error)
              } else {
                  let userInfo = JSON.parse(res.result);
                  userInfo.isAuthtorized = true;
                  this.setState({userInfo: userInfo}, () => {
                    localStorage.setItem('userInfo', JSON.stringify(this.state.userInfo))
                  })
                  //alert(JSON.stringify(this.state.userInfo));
                  this.showToast("Авторизация выполнена успешно", "success");
               }
          })
          .catch(err => {
            this.showToast(err.toString(), "danger", "alert")
            console.log(err);
          });
      this.closeModal();
    };
    onConfirmCreateRefund = () => {
      this.setState({
        isUserLoaded: false
      });
      let refundData = {
        insCompany: this.state.agreeInfo.insCompanyName,
        id: this.state.agreeInfo.id,
        productName: this.state.agreeInfo.insProductName,
        userId: this.state.userInfo.id,
        userName: this.state.agreeInfo.username,
        refundAmount: this.state.agreeInfo.refundAmount,
        cause: this.state.refundItem.cause
      }
      call.createRefund(refundData)
          .then(res => {
              if (res.error) {
                this.checkErrMsg(res.error)
              } else {
                  //let refund = JSON.parse(res.result);
                  this.showToast("Запрос на возмещение успешно создан", "success");
               }
          })
          .catch(err => {
            this.showToast(err.toString(), "danger", "alert")
            console.log(err);
          });
      this.closeModal();
    };
    logOff = () => {
      let userInfo = {isAuthtorized: false};
      this.setState({userInfo: userInfo}, () =>{
        localStorage.removeItem('userInfo')
      })
      this.showToast("Выход выполнен успешно", "success");
    };
    setUserProps = () => {
      this.setState({
        isUserLoaded: false
      });
      call.setUserProps(this.state.userInfo.id, {[this.state.setItem.name]: this.state.setItem.value}, 'incr')
          .then(res => {
              if (res.error) {
                this.checkErrMsg(res.error)
              } else {
                  let userInfo = JSON.parse(res.result);
                  userInfo.isAuthtorized = this.state.userInfo.isAuthtorized;
                  this.setState({userInfo: userInfo}, () => {
                    localStorage.setItem('userInfo', JSON.stringify(this.state.userInfo))
                  })
                  //alert(JSON.stringify(this.state.userInfo));
                  this.showToast("Операция выполнена успешно", "success");
               }
          })
          .catch(err => {
            this.showToast(err.toString(), "danger", "alert")
            console.log(err);
          });
      this.closeModal();
    };
    getArbitrarState = (intState, isDesc) => {
      let color, desc;
      switch(intState) {
        case 1:
          color = 'warning';
          desc = 'На рассмотрении';
          break;
        case 2:
          color = 'success';
          desc = 'Одобрено';
          break;
        case 3:
          color = 'danger';
          desc = 'Отклонено';
          break;
        default:
          color = 'subdued';
           desc = 'Выплачно';
      }
      return isDesc? desc : <EuiHealth color={color}>{desc}</EuiHealth>
    }
    setRefundState = (refItem, state) => {
      call.setRefundProps(refItem.id, refItem.clientid, refItem.agreementid, 'state', state)
          .then(res => {
              if (res.error) {
                this.checkErrMsg(res.error)
              } else {
                      this.getClient();
                      this.componentDidMount();
                      this.showToast("Выплата успешна произведена", "success");
               }
          })
          .catch(err => {
            this.showToast(err.toString(), "danger", "alert")
            console.log(err);
          });
    };
    makePayment = refItem => {
      this.setState({
        isUserLoaded: false,
      });
      this.closeModal();
      call.makePayment(refItem.clientid, refItem.amount)
      .then(res => {
          if (res.error) {
            this.checkErrMsg(res.error)
          } else {
              this.setRefundState(refItem, 4);
           }
      })
      .catch(err => {
        this.showToast(err.toString(), "danger", "alert")
        console.log(err);
      });

    }

    render() {
        let msgToast, enrollModal, registerModal, purchaiseModal, loginModal, profileModal, balanceModal, refundModal;
        let productImg = ['logoSketch', 'logoOsquery', 'logoGCP'];

        if (this.state.isToastVisible) {
          msgToast = (
            <EuiGlobalToastList
            toasts={this.state.toasts}
            dismissToast={this.closeToast}
            toastLifeTimeMs={5000}
          />
           );
        }
        if (this.state.isEnrollModalVisible) {
          enrollModal = (
              <EuiOverlayMask>
              <EuiModal onClose={this.closeModal}>
                <EuiModalHeader>
                  <EuiModalHeaderTitle>
                    {this.state.modalHeader}
                  </EuiModalHeaderTitle>
                </EuiModalHeader>
                <EuiModalBody>
                  <EuiText>
                    <p>{this.state.modalText}</p>
                  </EuiText>
                </EuiModalBody>
                <EuiModalFooter>
                  <EuiButtonEmpty onClick={this.closeModal}>Отмена</EuiButtonEmpty>
                  <EuiButton onClick={this.enrollAccount} fill>Ок
                    </EuiButton>
                </EuiModalFooter>
              </EuiModal>
            </EuiOverlayMask>
          );
        }
        if (this.state.isRegisterModalVisible) {
          registerModal = (
            <EuiOverlayMask>
              <EuiConfirmModal
                title="Регистрация"
                onCancel={this.closeModal}
                onConfirm={this.onConfirmRegister}
                cancelButtonText="Отмена"
                confirmButtonText="Ок"
                defaultFocusedButton="confirm" >
                <EuiModalBody>
                  <EuiForm>
                        <EuiFormRow label="Имя">
                        <EuiFieldText
                            value={this.state.regItem.firstName || ''}
                            onChange={e => this.onChangeReg('firstName', e.target.value)} />
                        </EuiFormRow>
                        <EuiFormRow label="Фамилия">
                        <EuiFieldText
                            value={this.state.regItem.lastName || ''}
                            onChange={e => this.onChangeReg('lastName', e.target.value)} />
                        </EuiFormRow>
                        <EuiFormRow label="Отчество">
                        <EuiFieldText
                            value={this.state.regItem.middleName || ''}
                            onChange={e => this.onChangeReg('middleName', e.target.value)} />
                        </EuiFormRow>
                        <EuiFormRow label="Сумма на счете">
                        <EuiFieldNumber
                            min={0}
                            value={Number(this.state.regItem.balance) || ''}
                            onChange={e => this.onChangeReg('balance', e.target.value)} />
                        </EuiFormRow>
                        <EuiFormRow label="Email">
                        <EuiFieldText
                            value={this.state.regItem.email || ''}
                            onChange={e => this.onChangeReg('email', e.target.value)} />
                        </EuiFormRow>
                        <EuiFormRow label="Password">
                        <EuiFieldPassword
                            value={this.state.regItem.password || ''}
                            onChange={e => this.onChangeReg('password', e.target.value)} />
                        </EuiFormRow>
                  </EuiForm>
                </EuiModalBody>
              </EuiConfirmModal>
            </EuiOverlayMask>
          );
        }
        if (this.state.isLoginModalVisible) {
          loginModal = (
            <EuiOverlayMask>
              <EuiConfirmModal
                title="Авторизация"
                onCancel={this.closeModal}
                onConfirm={this.onConfirmLogin}
                cancelButtonText="Отмена"
                confirmButtonText="Ок"
                defaultFocusedButton="confirm" >
                <EuiModalBody>
                  <EuiForm>
                    <EuiFormRow label="Email">
                      <EuiFieldText
                        value={this.state.logItem.email || ''}
                        onChange={e => this.onChangeLog('email', e.target.value)} />
                      </EuiFormRow>
                    <EuiFormRow label="Password">
                      <EuiFieldPassword
                        value={this.state.logItem.password || ''}
                        onChange={e => this.onChangeLog('password', e.target.value)} />
                      </EuiFormRow>
                  </EuiForm>
                </EuiModalBody>
              </EuiConfirmModal>
            </EuiOverlayMask>
          );
        }
        if (this.state.isProfileVisible) {
          profileModal = (
            <EuiFlyout
              ownFocus
              onClose={this.closeModal}
              maxWidth="40%"
              aria-labelledby="flyoutSmallTitle">
              <EuiFlyoutHeader hasBorder>
                <EuiTitle size="s">
                  <h2>{`${this.state.userInfo.firstName} ${this.state.userInfo.secondName}
                    (баланс: ${!this.state.isProfileLoading ? this.state.userInfo.balance : <EuiLoadingSpinner size="m" />})`}
                  </h2>
                </EuiTitle>
              </EuiFlyoutHeader>
              <EuiFlyoutBody style={{marginLeft:"5%"}}>
                <EuiDescriptionList>
                  <EuiDescriptionListTitle>Email:</EuiDescriptionListTitle>
                  <EuiDescriptionListDescription>
                    {this.state.userInfo.email}
                  </EuiDescriptionListDescription>
                  <EuiDescriptionListTitle>Id:</EuiDescriptionListTitle>
                  <EuiDescriptionListDescription>
                    {this.state.userInfo.id}
                  </EuiDescriptionListDescription>
                  <EuiDescriptionListTitle>Продукты:</EuiDescriptionListTitle>
                    {!this.state.isProfileLoading ?
                     this.state.userInfo.agreements.map((item, key) =>
                      <EuiAccordion key={`id${key.toString()}`}
                            id={`id${key.toString()}`}
                            buttonContent={<b style={{color:"royalblue"}}>{item.insProductName}</b>}
                            paddingSize="m">
                            <EuiDescriptionListTitle>Договор:</EuiDescriptionListTitle>
                            <EuiDescriptionListDescription>
                              {item.id}
                            </EuiDescriptionListDescription>
                            <EuiDescriptionListTitle>Дата начала дейставия:</EuiDescriptionListTitle>
                            <EuiDescriptionListDescription>
                              {item.startDate}
                            </EuiDescriptionListDescription>
                            <EuiDescriptionListTitle>Дата окончания дейставия:</EuiDescriptionListTitle>
                            <EuiDescriptionListDescription>
                              {item.endDate}
                            </EuiDescriptionListDescription>
                            <EuiDescriptionListTitle>Сумма взноса:</EuiDescriptionListTitle>
                            <EuiDescriptionListDescription>
                              {item.instAmount}
                            </EuiDescriptionListDescription>
                            <EuiDescriptionListTitle>Сумма возмещения:</EuiDescriptionListTitle>
                            <EuiDescriptionListDescription>
                              {item.refundAmount}
                            </EuiDescriptionListDescription>
                            <EuiDescriptionListTitle>Страховые случаи:</EuiDescriptionListTitle>
                              {!this.state.isProfileLoading ?
                                item.refunds.map((refund, key) =>
                                <EuiAccordion key={`id${key.toString()}`}
                                id={`id${key.toString()}`}
                                buttonContent={<b style={{color:"royalblue"}}>{`${refund.cause} (${refund.createDate}) - ${this.getArbitrarState(refund.state, true)}`}</b>}
                                paddingSize="m">
                                  <EuiDescriptionListTitle>Заявление навыплату:</EuiDescriptionListTitle>
                                  <EuiDescriptionListDescription>
                                    {refund.id}
                                  </EuiDescriptionListDescription>
                                  <EuiDescriptionListTitle>Дата создания:</EuiDescriptionListTitle>
                                  <EuiDescriptionListDescription>
                                    {refund.createDate}
                                  </EuiDescriptionListDescription>
                                  <EuiDescriptionListTitle>Сумма к выплате:</EuiDescriptionListTitle>
                                  <EuiDescriptionListDescription>
                                    {refund.amount}
                                  </EuiDescriptionListDescription>
                                  <EuiHorizontalRule  margin="s"/>
                                  <EuiDescriptionListTitle>Статус:</EuiDescriptionListTitle>
                                  <EuiFlexGroup style={{margin:"10px"}} gutterSize="s" alignItems="center">
                                    <EuiFlexItem grow={true}>
                                      {this.getArbitrarState(refund.state, false)}
                                    </EuiFlexItem>
                                    <EuiFlexItem grow={true}>
                                      <EuiButton isDisabled={refund.state !== 2} size="s" onClick={() => {this.makePayment(refund)}}>Получить выплату</EuiButton>
                                    </EuiFlexItem>
                                  </EuiFlexGroup>
                                </EuiAccordion>
                                ):
                                <EuiLoadingSpinner size="m" />
                              }
                            <EuiHorizontalRule  margin="s"/>
                            <EuiFlexGroup style={{margin:"10px"}} gutterSize="s" alignItems="center">
                              <EuiFlexItem grow={true} >
                                <EuiButton  color="danger" size="s" onClick={() => {this.showRefundModal(item)}}>Страховой случай</EuiButton>
                              </EuiFlexItem>
                            </EuiFlexGroup>
                      </EuiAccordion>) :
                      <EuiLoadingSpinner size="m" />}
                    <EuiHorizontalRule />
                </EuiDescriptionList>
              </EuiFlyoutBody>
            </EuiFlyout>);
        }
        if (this.state.isBalanceModalVisible) {
          balanceModal = (
            <EuiOverlayMask>
              <EuiConfirmModal
                title="Пополнение баланса"
                onCancel={this.closeModal}
                onConfirm={this.setUserProps}
                cancelButtonText="Отмена"
                confirmButtonText="Пополнить"
                defaultFocusedButton="confirm" >
                <EuiModalBody>
                  <EuiForm>
                    <EuiFormRow label="Сумма пополнения">
                      <EuiFieldNumber
                        min={0}
                        value={Number(this.state.setItem.value) || ''}
                        onChange={e => this.onChangeBalance('balance', e.target.value)} />
                      </EuiFormRow>
                  </EuiForm>
                </EuiModalBody>
              </EuiConfirmModal>
            </EuiOverlayMask>
          );
        }
        if (this.state.isPurchaiseModalVisible) {
          let startDt = new Date();
          let endDt = new Date();
          endDt.setDate(startDt.getDate() + 365);
          startDt = `${startDt.getFullYear()}/${startDt.getMonth()}/${startDt.getDate()}`;
          endDt = `${endDt.getFullYear()}/${endDt.getMonth()}/${endDt.getDate()}`;
          const purchaiseInfo = {
            insurer: this.state.insInfo.companyName,
            product: this.state.productInfo.name,
            insurant: `${this.state.userInfo.secondName} ${this.state.userInfo.firstName} ${this.state.userInfo.middleName}`,
            startDt: startDt,
            endDt: endDt,
            instAmount: this.state.productInfo.price.toString(),
            refundAmount: (Number(this.state.productInfo.price) + 500000).toString()
          }
          purchaiseModal = (
            <EuiOverlayMask>
              <EuiConfirmModal
                title={<h3>Покупка продукта <b>{purchaiseInfo.product}</b></h3>}
                onCancel={this.closeModal}
                onConfirm={() => {
                  this.setState({purchaiseInfo: purchaiseInfo}, () => {
                    this.onConfirmPurchaise();
                  })

                }}
                cancelButtonText="Отмена"
                confirmButtonText="Купить"
                defaultFocusedButton="confirm">
                <EuiModalBody>
                  <EuiForm>
                        <EuiFormRow label="Страховщик">
                          <EuiFieldText
                              readOnly
                              value={purchaiseInfo.insurer || ''}/>
                        </EuiFormRow>
                        <EuiFormRow label="Страхователь">
                          <EuiFieldText
                              readOnly
                              value={purchaiseInfo.insurant || ''}/>
                        </EuiFormRow>
                        <EuiFormRow label="Дата начала дейставия">
                          <EuiFieldText
                              readOnly
                              value={purchaiseInfo.startDt || ''}/>
                        </EuiFormRow>
                        <EuiFormRow label="Дата окончания дейставия">
                          <EuiFieldText
                              readOnly
                              value={purchaiseInfo.endDt || ''}/>
                        </EuiFormRow>
                        <EuiFormRow label="Сумма страхового взноса">
                          <EuiFieldText
                           readOnly
                           defaultValue={purchaiseInfo.instAmount || 0} />
                        </EuiFormRow>
                        <EuiFormRow label="Сумма возмещения">
                          <EuiFieldText
                            readOnly
                            defaultValue={purchaiseInfo.refundAmount || 0}/>
                        </EuiFormRow>
                  </EuiForm>
                </EuiModalBody>
              </EuiConfirmModal>
            </EuiOverlayMask>
          );
        }
        if (this.state.isRefundModalVisible) {
          refundModal = (
            <EuiOverlayMask>
              <EuiConfirmModal
                title="Запрос на возмещение"
                onCancel={this.closeModal}
                onConfirm={() => this.cause.value === '' ? this.cause.focus() : this.onConfirmCreateRefund()}
                cancelButtonText="Отмена"
                confirmButtonText="Сформировать"
                defaultFocusedButton="confirm" >
                <EuiModalBody>
                  <EuiForm>
                    <EuiFormRow label="Договор">
                      <EuiFieldText
                        readOnly
                        value={this.state.agreeInfo.id || ''}
                      />
                    </EuiFormRow>
                    <EuiFormRow label="Продукт">
                      <EuiFieldText
                        readOnly
                        value={this.state.agreeInfo.insProductName || ''}
                      />
                    </EuiFormRow>
                    <EuiFormRow label="Страхователь">
                      <EuiFieldText
                        readOnly
                        value={this.state.agreeInfo.username || ''}
                      />
                    </EuiFormRow>
                    <EuiFormRow label="Сумма возмещения">
                      <EuiFieldText
                        readOnly
                        value={this.state.agreeInfo.refundAmount || ''}
                      />
                    </EuiFormRow>
                    <EuiFormRow label="Причина">
                      <EuiFieldText
                        inputRef={el => this.cause = el}
                        value={this.state.refundItem.cause || ''}
                        onChange={e => this.onChangeRefund('cause', e.target.value)}
                      />
                    </EuiFormRow>
                  </EuiForm>
                </EuiModalBody>
              </EuiConfirmModal>
            </EuiOverlayMask>
          );
        }

        return (
            <div style={{
              marginTop: '40px'
            }}>
            <EuiPage className="euiNavDrawerPage">
              <EuiPageBody className="euiNavDrawerPage__pageBody">
                <EuiPageHeader>
                  <EuiPageHeaderSection>
                    <EuiTitle size="l">
                      <h1>Приложение страховой {this.state.isInsurLoaded
                        ? `${this.state.insInfo.companyName} (баланс: ${this.state.insInfo.balance})`
                        : <EuiLoadingSpinner size="l" />}</h1>
                    </EuiTitle>
                  </EuiPageHeaderSection>
                </EuiPageHeader>
                <EuiPageContent>
                  <EuiPageContentHeader>
                    <EuiPageContentHeaderSection>
                    <EuiForm>
                      <EuiFlexGroup>
                        <EuiFlexItem>
                          <EuiText>
                            <h3>Сценарий:</h3>
                            <ol>
                              <li>Клиент заходит в приложение страховой (авторизация или регистрация)</li>
                              <li>Выбирает для покупки страховой продукт</li>
                              <li>При покупке продукта происходит создание договора (предзаполнены поля "Сумма страхового взноса", "Сумма возмещения")</li>
                              <li>Цена ("Сумма страхового взноса") списывается с баланса клиента и зачисляется на баланс страховой</li>
                              <li>У клиента возникает страховой случай, он заходит в свой профиль, приобретенный продукт, кнопка "Страховой случай"</li>
                              <li>Происходит создание сущности запроса на возмещение, которую необходимо подтвердить арбитру (закладка "Приложение арбитра")</li>
                              <li>Арбитр на свой стороне обраруживает запрос на выплату. Согласует или отклоняет</li>
                              <li>Если согласовано, то в профиле клиента активируется кнопка "Получить выплату" и статус "Одобрено" иначе кнопка неактивна, статус "Отклонено"</li>
                              <li>В случае статуса "Одобрено" после нажатия кнопки "Получить выплату" с баланса страховой списывается сумма возмещения (указанная в договоре)</li>
                              <li>Баланс клиента увеличивается на сумму возмещения</li>
                            </ol>
                          </EuiText>
                        </EuiFlexItem>
                        <EuiFlexItem >
                              <EuiPanel hasShadow  grow={false}>
                                <EuiText textAlign="center"><h3>Cтраховые продукты:</h3></EuiText>
                                <EuiFlexGroup>
                                  {Object.entries(this.state.insInfo).length ? this.state.insInfo.productList.map((product, key) =>
                                    <EuiFlexItem key={key.toString()}>
                                      <EuiCard
                                        icon={this.state.purchaiseInfo.product === product.name ? <EuiLoadingSpinner size="l" /> : <EuiIcon size="xl" type={productImg[key]} />}
                                        textAlign="center"
                                        layout="vertical"
                                        title={product.name}
                                        description={`"${product.description}"
                                         Стоимость: ${product.price}`}
                                        onClick={() => {this.showPurchaiseModal(product)}} />
                                    </EuiFlexItem>
                                ) : !Object.entries(this.state.insInfo).length ? '' : <EuiLoadingSpinner size="m" />}
                                </EuiFlexGroup>
                                <EuiText style={{margin:"10px"}}  textAlign="center"><h3>Действия:</h3></EuiText>
                                <EuiFlexGroup>
                                  <EuiFlexItem>
                                    <EuiButton isDisabled={this.state.userInfo.isAuthtorized} size="s" onClick={this.showRegisterModal}>Зарегистрироваться</EuiButton>
                                  </EuiFlexItem>
                                    <EuiFlexItem>
                                      <EuiButton isDisabled={this.state.userInfo.isAuthtorized} size="s" onClick={this.showLoginModal}>Авторизоваться</EuiButton>
                                    </EuiFlexItem>
                                    <EuiFlexItem>
                                      <EuiButton isDisabled={!this.state.userInfo.isAuthtorized} size="s" onClick={this.logOff}>Выход</EuiButton>
                                    </EuiFlexItem>
                                  </EuiFlexGroup>
                                <EuiText style={{margin:"10px"}} textAlign="center"><h3>Пользователь:
                                    <span style={{fontWeight:"normal"}}> {this.state.userInfo.isAuthtorized ?
                                      `${this.state.userInfo.email} (баланс: ${this.state.userInfo.balance})`:''}
                                      </span> {this.state.isUserLoaded ? '' : <EuiLoadingSpinner size="m" /> }</h3>
                                </EuiText>
                                <EuiFlexGroup style={{margin:"10px"}} gutterSize="s" alignItems="center">
                                  <EuiFlexItem grow={true}>
                                    <EuiButton  isDisabled={!this.state.userInfo.isAuthtorized} size="s" onClick={this.showProfileModal}>Профиль</EuiButton>
                                  </EuiFlexItem>
                                  <EuiFlexItem grow={true}>
                                    <EuiButton  isDisabled={!this.state.userInfo.isAuthtorized} size="s" onClick={this.showBalanceModal}>Пополнить баланс</EuiButton>
                                  </EuiFlexItem>
                                </EuiFlexGroup>
                          </EuiPanel>
                        </EuiFlexItem>
                      </EuiFlexGroup>
                    </EuiForm>
                    </EuiPageContentHeaderSection>
                  </EuiPageContentHeader>
                </EuiPageContent>
              </EuiPageBody>
            </EuiPage>
            {enrollModal}
            {msgToast}
            {registerModal}
            {purchaiseModal}
            {loginModal}
            {profileModal}
            {balanceModal}
            {refundModal}
          </div>
        );
      }
    }

export default Insurance