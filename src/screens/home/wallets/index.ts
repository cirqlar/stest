import { createNativeStackNavigator } from '@react-navigation/native-stack';

import WalletScreen from './wallet';

const WalletTab = createNativeStackNavigator({
	initialRouteName: 'Wallet',
	screens: {
		Wallet: WalletScreen,
	},
});

export default WalletTab;
