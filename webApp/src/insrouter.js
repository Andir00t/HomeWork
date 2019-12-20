const express = require('express');
const router = express.Router();
const hash = require('crypto').createHash;
const insApi = require('./insur_api');


router.get('/getAgreement', async (req, res) => {
  try {
    let aggrId = req.query.id;
    let aggrInfo = await insApi.getAgreement(aggrId);
    //console.log(clientInfo);
    res.send(aggrInfo);
  }
  catch(error) {
    res.status(500).send(error);
  }
});

router.get('/getAllItems', async (req, res) => {
  try {
    let itemsInfo = await insApi.getAllItems(req.query.start, req.query.end);
    //console.log(itemsInfo);
    res.send(itemsInfo);
  }
  catch(error) {
    res.status(500).send(error);
  }
});

router.post('/getClient', async (req, res) => {
  try {
    let result = await insApi.getClient(req.body.id);
    //console.log(clientInfo);
    res.send(result);
  }
  catch(error) {
    res.status(500).send(error);
  }
});

router.get('/loginUser', async (req, res) => {
  try {
    let prepPass = hash('sha256').update(req.query.password).digest('base64');
    let clientId = hash('sha256').update(req.query.email + prepPass).digest('base64');
    let clientInfo = await insApi.loginUser(clientId);
    //console.log(clientInfo);
    res.send(clientInfo);
  }
  catch(error) {
    res.status(500).send(error);
  }
});

router.get('/enrollAdmin', async (req, res) => {
  try {
    let entoll = await insApi.enrollAdmin();
    res.send(entoll);
  }
  catch(error) {
    res.status(500).send(error);
  }
});

router.get('/getInsuranceInfo', async (req, res) => {
  try {
    let insInfo = await insApi.getInsuranceInfo();
    res.send(insInfo);
  }
  catch(error) {
    res.status(500).send(error);
  }
});

router.post('/createUser', async (req, res) => {
  try {
    let result = await insApi.createUser(req.body.firstName, req.body.lastName,
      req.body.middleName, req.body.balance, '', req.body.email, req.body.password);
    //console.log(result);
    res.send(result);
  }
  catch(error) {
    res.status(500).send(error);
  }
});

router.post('/createRefund', async (req, res) => {
  try {
    let result = await insApi.createRefund(req.body.id,
      req.body.userId, req.body.refundAmount, req.body.cause, req.body.insCompany,
      req.body.productName, req.body.userName);
    //console.log(result);
    res.send(result);
  }
  catch(error) {
    res.status(500).send(error);
  }
});

router.post('/setUserProps', async (req, res) => {
  try {
    let result = await insApi.setUserProps(req.body.id, req.body.nameValList, req.body.operType);
    //console.log(result);
    res.send(result);
  }
  catch(error) {
    res.status(500).send(error);
  }
});

router.post('/setRefundProps', async (req, res) => {
  try {
    let result = await insApi.setRefundProps(req.body.refundid,
                                             req.body.clientid,
                                             req.body.agreementid,
                                             req.body.propName,
                                             req.body.propValue
                                             );
    //console.log(result);
    res.send(result);
  }
  catch(error) {
    res.status(500).send(error);
  }
});

router.post('/makePayment', async (req, res) => {
  try {
    let result = await insApi.makePayment(req.body.clientid, req.body.refundAmount);
    //console.log(result);
    res.send(result);
  }
  catch(error) {
    res.status(500).send(error);
  }
});

router.post('/makePurchaise', async (req, res) => {
  try {
    let addInfo = req.body.addInfo;
    let result = await insApi.makePurchaise(req.body.id, addInfo.insurer, addInfo.product,
       addInfo.insurant, addInfo.startDt, addInfo.endDt, addInfo.instAmount, addInfo.refundAmount);
    //console.log(result);
    res.send(result);
  }
  catch(error) {
    res.status(500).send(error);
  }
});

module.exports = router;