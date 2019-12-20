/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { ChaincodeStub, ClientIdentity } = require('fabric-shim');
const { HwccContract } = require('..');
const winston = require('winston');

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

chai.should();
chai.use(chaiAsPromised);
chai.use(sinonChai);

class TestContext {

    constructor() {
        this.stub = sinon.createStubInstance(ChaincodeStub);
        this.clientIdentity = sinon.createStubInstance(ClientIdentity);
        this.logging = {
            getLogger: sinon.stub().returns(sinon.createStubInstance(winston.createLogger().constructor)),
            setLevel: sinon.stub(),
        };
    }

}

describe('HwccContract', () => {

    let contract;
    let ctx;

    beforeEach(() => {
        contract = new HwccContract();
        ctx = new TestContext();
        ctx.stub.getState.withArgs('1001').resolves(Buffer.from('{"value":"hwcc 1001 value"}'));
        ctx.stub.getState.withArgs('1002').resolves(Buffer.from('{"value":"hwcc 1002 value"}'));
    });

    describe('#hwccExists', () => {

        it('should return true for a hwcc', async () => {
            await contract.hwccExists(ctx, '1001').should.eventually.be.true;
        });

        it('should return false for a hwcc that does not exist', async () => {
            await contract.hwccExists(ctx, '1003').should.eventually.be.false;
        });

    });

    describe('#createHwcc', () => {

        it('should create a hwcc', async () => {
            await contract.createHwcc(ctx, '1003', 'hwcc 1003 value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1003', Buffer.from('{"value":"hwcc 1003 value"}'));
        });

        it('should throw an error for a hwcc that already exists', async () => {
            await contract.createHwcc(ctx, '1001', 'myvalue').should.be.rejectedWith(/The hwcc 1001 already exists/);
        });

    });

    describe('#readHwcc', () => {

        it('should return a hwcc', async () => {
            await contract.readHwcc(ctx, '1001').should.eventually.deep.equal({ value: 'hwcc 1001 value' });
        });

        it('should throw an error for a hwcc that does not exist', async () => {
            await contract.readHwcc(ctx, '1003').should.be.rejectedWith(/The hwcc 1003 does not exist/);
        });

    });

    describe('#updateHwcc', () => {

        it('should update a hwcc', async () => {
            await contract.updateHwcc(ctx, '1001', 'hwcc 1001 new value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1001', Buffer.from('{"value":"hwcc 1001 new value"}'));
        });

        it('should throw an error for a hwcc that does not exist', async () => {
            await contract.updateHwcc(ctx, '1003', 'hwcc 1003 new value').should.be.rejectedWith(/The hwcc 1003 does not exist/);
        });

    });

    describe('#deleteHwcc', () => {

        it('should delete a hwcc', async () => {
            await contract.deleteHwcc(ctx, '1001');
            ctx.stub.deleteState.should.have.been.calledOnceWithExactly('1001');
        });

        it('should throw an error for a hwcc that does not exist', async () => {
            await contract.deleteHwcc(ctx, '1003').should.be.rejectedWith(/The hwcc 1003 does not exist/);
        });

    });

});