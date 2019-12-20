export let getAgreement = async param => {
  const response = await fetch("/insur/api/getAgreement?id=" + param);
  const body = await response.json();
  if (response.status !== 200) throw Error(body.message);
  return body;
};

export let getAllItems = async(start, end) => {
  const response = await fetch(`/insur/api/getAllItems?start=${start}&end=${end}`);
  const body = await response.json();
  if (response.status !== 200) throw Error(body.message);
  return body;
};

export let enrollAdmin = async () => {
  const response = await fetch("/insur/api/enrollAdmin");
  const body = await response.json();
  if (response.status !== 200) throw Error(body.message);
  return body;
};

export let getInsuranceInfo = async () => {
  const response = await fetch("/insur/api/getInsuranceInfo");
  const body = await response.json();
  if (response.status !== 200) throw Error(body.message);
  return body;
};

export let registerUser = async clientObj => {
  const response = await fetch("/insur/api/createUser", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(clientObj)
  });
  const body = await response.json();
  if (response.status !== 200) throw Error(body.message);
  return body;
};

export let createRefund = async refundData => {
  const response = await fetch("/insur/api/createRefund", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(refundData)
  });
  const body = await response.json();
  if (response.status !== 200) throw Error(body.message);
  return body;
};

export let loginUser = async logItem => {
  const response = await fetch(
    `/insur/api/loginUser?email=${logItem.email}&password=${logItem.password}`
  );
  const body = await response.json();
  if (response.status !== 200) throw Error(body.message);
  return body;
};

export let getClient = async clientId => {
  const response = await fetch("/insur/api/getClient", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({id: clientId})
  });
  const body = await response.json();
  if (response.status !== 200) throw Error(body.message);
  return body;
};

export let setUserProps = async (userId, nameValList, operType) => {
    const response = await fetch("/insur/api/setUserProps", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({id: userId, nameValList: nameValList, operType: operType})
    });
    const body = await response.json();
    if (response.status !== 200) throw Error(body.message);
    return body;
};

export let setRefundProps = async (refundid, clientid, agreementid, propName, propValue) => {
    const response = await fetch("/insur/api/setRefundProps", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({refundid: refundid,
                            clientid: clientid,
                            agreementid: agreementid,
                            propName: propName,
                            propValue: propValue
                          })
    });
    const body = await response.json();
    if (response.status !== 200) throw Error(body.message);
    return body;
};

export let makePurchaise = async (userId, addInfo) => {
  const response = await fetch("/insur/api/makePurchaise", {
    method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({id: userId, addInfo: addInfo})
    });
    const body = await response.json();
    if (response.status !== 200) throw Error(body.message);
    return body;
};

export let makePayment = async (clientid, refundAmount) => {
  const response = await fetch("/insur/api/makePayment", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({clientid: clientid, refundAmount: refundAmount})
  });
  const body = await response.json();
  if (response.status !== 200) throw Error(body.message);
  return body;
};



