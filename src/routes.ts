import {
	createNativeStackNavigator,
	NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import {
	createStaticNavigation,
	StaticParamList,
} from '@react-navigation/native';

import MarketsScreen from './screens/market';
import MarketScreen from './screens/markets';
import OrdersScreen from './screens/orders';
import WalletScreen from './screens/wallet';
import WelcomeScreen from './screens/welcome';

const RootStack = createNativeStackNavigator({
	initialRouteName: 'Welcome',
	screenOptions: {
		headerShown: false,
	},
	screens: {
		Welcome: WelcomeScreen,
		Markets: MarketsScreen,
		Market: MarketScreen,
		Orders: OrdersScreen,
		Wallet: WalletScreen,
	},
});

type RootStackParamList = StaticParamList<typeof RootStack>;
export type AppNavigationProp = NativeStackNavigationProp<RootStackParamList>;

declare global {
	namespace ReactNavigation {
		interface RootParamList extends RootStackParamList {}
	}
}

export const Navigation = createStaticNavigation(RootStack);
