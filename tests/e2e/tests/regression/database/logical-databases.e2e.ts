import { rte } from '../../../helpers/constants';
import { acceptLicenseTerms } from '../../../helpers/database';
import { MyRedisDatabasePage, AddRedisDatabasePage, BrowserPage } from '../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../helpers/conf';
import { deleteStandaloneDatabaseApi } from '../../../helpers/api/api-database';

const addRedisDatabasePage = new AddRedisDatabasePage();
const browserPage = new BrowserPage();
const myRedisDatabasePage = new MyRedisDatabasePage();

fixture `Logical databases`
    .meta({ type: 'regression', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await acceptLicenseTerms();
    })
    .afterEach(async() => {
        // Delete database
        await deleteStandaloneDatabaseApi(ossStandaloneConfig);
    });
test('Verify that if user enters any index of the logical database that does not exist in the database, he can see Redis error "ERR DB index is out of range" and cannot proceed', async t => {
    const index = '0';

    // Add database with logical index
    await addRedisDatabasePage.addRedisDataBase(ossStandaloneConfig);
    await t.click(addRedisDatabasePage.databaseIndexCheckbox);
    await t.typeText(addRedisDatabasePage.databaseIndexInput, index, { paste: true });
    await t.click(addRedisDatabasePage.addRedisDatabaseButton);
    // Open database and run command with non-existing index
    await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
    await t.click(browserPage.Cli.cliExpandButton);
    await t.typeText(browserPage.Cli.cliCommandInput, 'Select 19', { paste: true });
    await t.pressKey('enter');
    // Verify the error
    await t.expect(browserPage.Cli.cliOutputResponseFail.textContent).eql('"ERR DB index is out of range"', 'Error is not dispalyed in CLI');
});
