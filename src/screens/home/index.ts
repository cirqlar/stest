import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import MarketsTab from '@/screens/home/markets';
import OrdersTab from '@/screens/home/orders';
import WalletTab from '@/screens/home/wallets';

const Home = createBottomTabNavigator({
	initialRouteName: 'MarketsTab',
	screenOptions: {
		headerShown: false,
		tabBarIconStyle: { opacity: 0 },
	},
	screens: {
		MarketsTab: { screen: MarketsTab, options: { tabBarLabel: 'Markets' } },
		OrdersTab: { screen: OrdersTab, options: { tabBarLabel: 'Orders' } },
		WalletTab: { screen: WalletTab, options: { tabBarLabel: 'Wallets' } },
	},
});

export default Home;
