'use strict';

const { Contract } = require('fabric-contract-api');
//const shim = require('fabric-shim');
const hash = require('crypto').createHash;

class HwccContract extends Contract {
    async createInsuranse(ctx) {
        try {
            console.log('\n===== create insuranse with products =====\n');
            const insuranceCompany = {
                id: 'INS01',
                companyName: 'HW Insurance Company',
                productList: [
                    {
                        name: 'ЗДОРОВЬЕ',
                        price: 180000,
                        description: 'Первый страховой продукт'
                    },
                    {
                        name: 'АВТО',
                        price: 50000,
                        description: 'Второй страховой продукт'
                    },
                    {
                        name: 'НЕДВИЖИМОСТЬ',
                        price: 120000,
                        description: 'Третий страховой продукт'
                    }
                ],
                balance: 10000000
            };

            await ctx.stub.putState(
                insuranceCompany.id,
                Buffer.from(JSON.stringify(insuranceCompany))
            );
            console.log(
                '\n===== insuranse with products added to state =====\n'
            );
        } catch (err) {
            throw new Error(err);
        }
    }

    async getInsuranceInfo(ctx) {
        try {
            console.log('\n===== get insurance info =====\n');
            const insurBuff = await this.isItemExists(ctx, 'INS01');
            if (!insurBuff.exists) {
                throw new Error('INS01 does not exist');
            }
            console.log('\n===== get insurance info successful =====\n');

            return insurBuff.item;
        } catch (err) {
            throw new Error(err);
        }
    }

    async setInsuranceProperty(ctx, ...args) {
        try {
            let propName = args[0];
            let propValue = args[1];
            let operType = args[2];

            let insurance = await this.getInsuranceInfo(ctx);
            if (propName === 'balance') {
                if (Number(args[0]) < 0) {
                    throw new Error('value must be positive');
                }
                if (operType === 'incr') {
                    propValue = Number(insurance.balance) + Number(args[1]);
                } else if (operType === 'decr') {
                    propValue = Number(insurance.balance) - Number(args[1]);
                    if (propValue < 0) {
                        throw new Error('Not enough money !');
                    }
                }
            }
            console.log(`\n===== set insurance property ${propName}  =====\n`);

            insurance[propName] = propValue;
            await ctx.stub.putState(
                insurance.id,
                Buffer.from(JSON.stringify(insurance))
            );
            console.log(
                `\n===== successful set insurance property ${propName} =====\n`
            );

            return insurance;
        } catch (err) {
            throw new Error(err);
        }
    }

    async createClient(ctx, ...args) {
        try {
            if (args[5].lenth <= 0) {
                throw new Error('email is requared');
            }
            let client = {
                id: '',
                firstName: args[0] || '',
                secondName: args[1] || '',
                middleName: args[2] || '',
                balance: args[3] || 0,
                description: args[4] || '',
                agreements: [],
                email: args[5],
                password: args[6]
            };
            console.log(
                `\n===== creating client ${client.secondName} ${client.firstName} ${client.middleName} =====\n`
            );

            client.password = hash('sha256')
                .update(client.password)
                .digest('base64');
            client.id = hash('sha256')
                .update(client.email + client.password)
                .digest('base64');
            client.id = this.getItemId(client.id, 'CL');
            const clientBuff = await this.isItemExists(ctx, client.id);
            if (clientBuff.exists) {
                throw new Error('client allready exists');
            }

            await ctx.stub.putState(
                client.id,
                Buffer.from(JSON.stringify(client))
            );
            console.log(
                `\n===== client ${client.secondName} ${client.firstName} ${client.middleName} successful created =====\n`
            );

            return client;
        } catch (err) {
            throw new Error(err);
        }
    }

    async getClient(ctx, ...args) {
        try {
            console.log('\n===== get client =====\n');
            const clientId = args[0];
            const clientBuff = await this.isItemExists(ctx, clientId);
            if (!clientBuff.exists) {
                throw new Error(`client with id: ${clientId} does not exist`);
            }
            console.log('\n===== get client successful =====\n');

            return clientBuff.item;
        } catch (err) {
            throw new Error(err);
        }
    }

    async setClientProperty(ctx, ...args) {
        try {
            let clientid = args[0];
            let nameValList =
                typeof args[1] === 'string' ? JSON.parse(args[1]) : args[1];
            let balOperType = args[2];

            const clientBuff = await this.isItemExists(ctx, clientid);
            if (!clientBuff.exists) {
                throw new Error(`client with id: ${clientid} does not exist`);
            }

            let client = clientBuff.item;
            Object.entries(nameValList).forEach(([propName, propValue]) => {
                console.log(`\n===== set client property ${propName}  =====\n`);
                if (propName === 'balance') {
                    if (balOperType === 'decr') {
                        propValue = Number(client.balance) - Number(propValue);
                    } else if (balOperType === 'incr') {
                        propValue = Number(client.balance) + Number(propValue);
                    }
                }
                if (propName === 'agreements') {
                    client.agreements.some(agr => agr.id === propValue.id)
                        ? client.agreements.forEach((agr, idx) => {
                            if (agr.id === propValue.id) {
                                client.agreements[idx] = propValue;
                            }
                        })
                        : client.agreements.push(propValue);
                } else {
                    client[propName] = propValue;
                }
                console.log(
                    `\n===== successful set client property ${propName} =====\n`
                );
            });

            await ctx.stub.putState(
                client.id,
                Buffer.from(JSON.stringify(client))
            );
            return client;
        } catch (err) {
            throw new Error(err);
        }
    }

    async createAgreement(ctx, ...args) {
        try {
            let agreement = {
                id: '',
                insCompanyName: args[0],
                insProductName: args[1],
                username: args[2],
                startDate: args[3],
                endDate: args[4],
                instAmount: args[5], // сумма взноса
                refundAmount: args[6], // сумма возмещения
                refunds: []
            };

            agreement.id = hash('sha256')
                .update(agreement.username + agreement.insProductName)
                .digest('base64');
            agreement.id = this.getItemId(agreement.id, 'AG');
            console.log(
                `\n===== creating agreement for client ${agreement.username} =====\n`
            );
            const aggrBuff = await this.isItemExists(ctx, agreement.id);
            if (aggrBuff.exists) {
                throw new Error('agreement allready exists');
            }

            await ctx.stub.putState(
                agreement.id,
                Buffer.from(JSON.stringify(agreement))
            );
            console.log(
                `\n===== agreement ${agreement.id} successfully created =====\n`
            );

            return agreement;
        } catch (err) {
            throw new Error(err);
        }
    }

    async getAgreement(ctx, ...args) {
        try {
            console.log('\n===== get agreement =====\n');
            const aggrId = args[0];
            const aggrBuff = await this.isItemExists(ctx, aggrId);
            if (!aggrBuff.exists) {
                throw new Error(`agreement with id: ${aggrId} does not exist`);
            }
            console.log('\n===== get agreement successful =====\n');
            return aggrBuff.item;
        } catch (err) {
            throw new Error(err);
        }
    }

    async setAgreementProperty(ctx, ...args) {
        try {
            let clientid = args[0];
            let agreementid = args[1];
            let nameValList =
                typeof args[2] === 'string' ? JSON.parse(args[2]) : args[2];

            const agreeBuff = await this.isItemExists(ctx, agreementid);
            if (!agreeBuff.exists) {
                throw new Error(
                    `agreement with id: ${agreementid} does not exist`
                );
            }

            let agreement = agreeBuff.item;
            Object.entries(nameValList).forEach(([propName, propValue]) => {
                console.log(
                    `\n===== set agreement property ${propName}  =====\n`
                );
                if (propName === 'refunds') {
                    agreement.refunds.some(refund => refund.id === propValue.id)
                        ? agreement.refunds.forEach((refund, idx) => {
                            if (refund.id === propValue.id) {
                                agreement.refunds[idx] = propValue;
                            }
                        })
                        : agreement.refunds.push(propValue);
                } else {
                    agreement[propName] = propValue;
                }
                console.log(
                    `\n===== successful set agreement property ${propName} =====\n`
                );
            });

            await ctx.stub.putState(
                agreement.id,
                Buffer.from(JSON.stringify(agreement))
            );
            let clientChngProps = {
                agreements: agreement
            };
            await this.setClientProperty(ctx, clientid, clientChngProps, '');

            return agreement;
        } catch (err) {
            throw new Error(err);
        }
    }

    async createRefund(ctx, ...args) {
        try {
            let refund = {
                id: '',
                agreementid: args[0],
                clientid: args[1],
                amount: args[2],
                cause: args[3],
                insCompany: args[4],
                productName: args[5],
                userName: args[6],
                state: 1, //статус 1 -на рассмотрении, 2-одобрено, 3-отклонено, 4-выплачено
                rejectDesc: '',
                createDate: new Date().toLocaleDateString()
            };
            console.log(
                `\n===== creating refund by agreement ${args[0]}} =====\n`
            );
            refund.id = hash('sha256')
                .update(refund.agreementid + refund.cause)
                .digest('base64');
            refund.id = this.getItemId(refund.id, 'RF');
            const refundBuff = await this.isItemExists(ctx, refund.id);
            if (refundBuff.exists) {
                throw new Error('refund allready exists');
            }
            await ctx.stub.putState(
                refund.id,
                Buffer.from(JSON.stringify(refund))
            );
            console.log(
                `\n===== refund ${refund.id} successfully created =====\n`
            );

            let agreeChngProps = {
                refunds: refund
            };
            await this.setAgreementProperty(
                ctx,
                refund.clientid,
                refund.agreementid,
                agreeChngProps
            );

            return refund;
        } catch (err) {
            throw new Error(err);
        }
    }

    async createPurchaise(ctx, ...args) {
        try {
            let clientid = args[0];
            let insCompanyName = args[1];
            let insProductName = args[2];
            let username = args[3];
            let startDate = args[4];
            let endDate = args[5];
            let instAmount = args[6]; //сумма взноса
            let refundAmount = args[7]; //сумма возмещения

            const clientBuff = await this.isItemExists(ctx, clientid);
            if (!clientBuff.exists) {
                throw new Error(`client with id: ${clientid} does not exist`);
            }
            //создание договора
            let agreement = await this.createAgreement(
                ctx,
                insCompanyName,
                insProductName,
                username,
                startDate,
                endDate,
                instAmount,
                refundAmount
            );
            let clientChngProps = {
                agreements: agreement,
                balance: instAmount
            };
            await this.setClientProperty(
                ctx,
                clientid,
                clientChngProps,
                'decr'
            ); //баланс пользователя уменьшается
            await this.setInsuranceProperty(ctx, 'balance', instAmount, 'incr'); //баланс страховой пополняется

            console.log('\n===== purchaise successfully created =====\n');

            return agreement;
        } catch (err) {
            throw new Error(err);
        }
    }

    async createPayment(ctx, ...args) {
        try {
            let clientid = args[0];
            let refundAmount = args[1]; //сумма возмещения

            let clientChngProps = {
                balance: refundAmount
            };
            await this.setClientProperty(
                ctx,
                clientid,
                clientChngProps,
                'incr'
            ); //баланс пользователя пополняется
            await this.setInsuranceProperty(
                ctx,
                'balance',
                refundAmount,
                'decr'
            ); //баланс страховой уменьшается

            console.log('\n===== payment successfully created =====\n');
        } catch (err) {
            throw new Error(err);
        }
    }

    async getRefund(ctx, ...args) {
        try {
            console.log('\n===== get agreement =====\n');
            let refundId = args[0];
            const refundBuff = await this.isItemExists(ctx, refundId);
            if (!refundBuff.exists) {
                throw new Error(
                    `agreement with id: ${refundId} does not exist`
                );
            }
            console.log('\n===== get agreement successful =====\n');
            return refundBuff.item;
        } catch (err) {
            throw new Error(err);
        }
    }

    async setRefundProperty(ctx, ...args) {
        try {
            let refundid = args[0];
            let clientid = args[1];
            let agreementid = args[2];
            let propName = args[3];
            let propValue = args[4];

            const refundBuff = await this.isItemExists(ctx, refundid);
            if (!refundBuff.exists) {
                throw new Error(`refund with id: ${refundid} does not exist`);
            }

            let refund = refundBuff.item;
            refund[propName] =
                propName === 'state' ? Number(propValue) : propValue;
            await ctx.stub.putState(
                refundid,
                Buffer.from(JSON.stringify(refund))
            );
            console.log(
                `\n===== successful set refund property ${propName} =====\n`
            );
            let agreeChngProps = {
                refunds: refund
            };
            await this.setAgreementProperty(
                ctx,
                clientid,
                agreementid,
                agreeChngProps
            );

            return refund;
        } catch (err) {
            throw new Error(err);
        }
    }

    async queryAllitems(ctx, start, end) {
        const startKey = start;
        const endKey = end;
        const iterator = await ctx.stub.getStateByRange(startKey, endKey);
        const allResults = [];
        // eslint-disable-next-line no-constant-condition
        while (true) {
            const res = await iterator.next();
            if (res.value && res.value.value.toString()) {
                const key = res.value.key;
                let value;
                try {
                    value = JSON.parse(res.value.value.toString('utf8'));
                } catch (err) {
                    console.log(err);
                    value = res.value.value.toString('utf8');
                }
                value.key = key;
                allResults.push(value);
            }
            if (res.done) {
                await iterator.close();
                console.info(allResults);
                return allResults;
            }
        }
    }

    async isItemExists(ctx, id) {
        try {
            const buffer = await ctx.stub.getState(id);
            let result = [
                {
                    exists: false
                },
                {
                    item: null
                }
            ];
            if (!!buffer && buffer.length > 0) {
                result.exists = true;
                result.item = JSON.parse(buffer.toString());
            }
            return result;
        } catch (err) {
            throw new Error(err);
        }
    }

    getItemId(id, itemType) {
        try {
            let prefix = [...id].reduce((i, s) => s.charCodeAt(0) + i, 0);
            return `${itemType}${prefix}${id}`;
        } catch (err) {
            throw new Error(err);
        }
    }
}

module.exports = HwccContract;
