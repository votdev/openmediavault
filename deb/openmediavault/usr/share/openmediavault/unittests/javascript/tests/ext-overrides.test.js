require('/usr/share/javascript/extjs6/ext-all-debug.js');
require('../../../../../../var/www/openmediavault/js/ext-overrides.js');

describe('ExtJS', () => {
	it('Should validate UUID', () => {
		expect(Ext.isUUID('2b05be8e-d6f3-11e8-853c-cff6e52b0203')).toBeTruthy();
	});
});
