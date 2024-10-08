import { AddElementInList, rte } from '../../../../helpers/constants';
import { DatabaseHelper } from '../../../../helpers/database';
import { BrowserPage } from '../../../../pageObjects';
import { commonUrl, ossStandaloneConfig, redisEnterpriseClusterConfig } from '../../../../helpers/conf';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';
import { populateListWithElements } from '../../../../helpers/keys';
import { Common } from '../../../../helpers/common';
import { APIKeyRequests } from '../../../../helpers/api/api-keys';

const browserPage = new BrowserPage();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();
const apiKeyRequests = new APIKeyRequests();

const dbParameters = { host: ossStandaloneConfig.host, port: ossStandaloneConfig.port };
const keyName = `TestListKey-${ Common.generateWord(10) }`;
const elementForSearch = `SearchField-${ Common.generateWord(5) }`;
const keyToAddParameters = { elementsCount: 500000, keyName, elementStartWith: 'listElement' };

fixture `List Key verification`
    .meta({ type: 'regression' })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTermsAndAddREClusterDatabase(redisEnterpriseClusterConfig);
        await browserPage.addListKey(keyName, '2147476121', ['testElement']);
    })
    .afterEach(async() => {
        await apiKeyRequests.deleteKeyByNameApi(keyName, redisEnterpriseClusterConfig.databaseName);
        await databaseHelper.deleteDatabase(redisEnterpriseClusterConfig.databaseName);
    });
test
    .meta({ rte: rte.standalone })('Verify that user can search per exact element index in List key in DB with 1 million of fields', async t => {
        // Add 1000000 elements to the list key
        await populateListWithElements(dbParameters.host, dbParameters.port, keyToAddParameters);
        await populateListWithElements(dbParameters.host, dbParameters.port, keyToAddParameters);
        // Add custom element to the list key
        await browserPage.openKeyDetails(keyName);
        await browserPage.addElementToList([elementForSearch]);
        // Search by element index
        await browserPage.searchByTheValueInKeyDetails('1000001');
        // Check the search result
        const result = await browserPage.listElementsList.nth(0).textContent;
        await t.expect(result).eql(elementForSearch, 'List element not found');
    });

// TODO unskip when the bug is fixed https://redislabs.atlassian.net/browse/RI-6188
test.skip
    .before(async() => {
        await databaseHelper.acceptLicenseTermsAndAddREClusterDatabase(redisEnterpriseClusterConfig);

    })
    .after(async() => {
        await browserPage.Cli.sendCommandInCli('flushdb');
        await databaseHelper.deleteDatabase(redisEnterpriseClusterConfig.databaseName);
    })
    ('Verify that user can add a multiple fields', async t => {

        const tailKeyName  = 'tailListKey';
        const headKeyName = 'headKeyName';

        const elementsValue = [
            'element1',
            'element2',
            'element3',
            'element4'
        ]

        await browserPage.addListKey(tailKeyName, '2147476121', [elementsValue[0],elementsValue[1], elementsValue[2]]);
        await browserPage.openKeyDetails(tailKeyName);

        await t.expect(browserPage.listElementsList.nth(0).textContent).eql(elementsValue[0], 'the first element is not corrected for add in tail');
        let count = await browserPage.listElementsList.count;
        await t.expect(browserPage.listElementsList.nth(count - 1).textContent).eql(elementsValue[2], 'the last element is not corrected for add in tail');

        await browserPage.addListKey(headKeyName, '2147476121', [elementsValue[0],elementsValue[1], elementsValue[2]], AddElementInList.Head);
        await browserPage.openKeyDetails(headKeyName);

        await t.expect(browserPage.listElementsList.nth(0).textContent).eql(elementsValue[2], 'the first element is not corrected for add in tail');
        count = await browserPage.listElementsList.count;
        await t.expect(browserPage.listElementsList.nth(count - 1).textContent).eql(elementsValue[0], 'the last element is not corrected for add in tail');

    });
test
    .meta({ rte: rte.reCluster })('Verify that user can edit a multiple fields', async t => {
        const elementsValue = [
            'element1',
            'element2',
            'element3',
            'element4'
        ]
        await browserPage.openKeyDetails(keyName);

        await browserPage.addElementToList([elementsValue[0], elementsValue[1]]);
        await t.expect(browserPage.listElementsList.nth(0).textContent).eql('testElement', 'the first element is not corrected for add in tail');
        let count = await browserPage.listElementsList.count;
        await t.expect(browserPage.listElementsList.nth(count - 1).textContent).eql(elementsValue[1], 'the last element is not corrected for add in tail');

        await browserPage.addElementToList([elementsValue[2], elementsValue[3]], AddElementInList.Head);
        await t.expect(browserPage.listElementsList.nth(0).textContent).eql(elementsValue[3], 'the first element is not corrected for add in head');
        count = await browserPage.listElementsList.count;
        await t.expect(browserPage.listElementsList.nth(count - 1).textContent).eql(elementsValue[1], 'the last element is not corrected for add in head');
    });
