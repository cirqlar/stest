import { createNativeStackNavigator } from '@react-navigation/native-stack';

import OrdersScreen from '@/screens/home/orders/orders';
import NewOrderScreen from '@/screens/home/orders/new_order';

const OrdersTab = createNativeStackNavigator({
	initialRouteName: 'Orders',
	screens: {
		Orders: { screen: OrdersScreen, options: { headerShown: false } },
		NewOrder: {
			screen: NewOrderScreen,
			options: { title: 'New Limit Order' },
		},
	},
});

export default OrdersTab;
