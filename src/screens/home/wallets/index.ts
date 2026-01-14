import { createNativeStackNavigator } from '@react-navigation/native-stack';

import WalletScreen from '@/screens/home/wallets/wallet';

const WalletTab = createNativeStackNavigator({
	initialRouteName: 'Wallet',
	screens: {
		Wallet: { screen: WalletScreen, options: { headerShown: false } },
	},
});

export default WalletTab;
