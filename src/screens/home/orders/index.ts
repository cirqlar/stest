import { createNativeStackNavigator } from '@react-navigation/native-stack';

import OrdersScreen from './orders';
import NewOrderScreen from './new_order';

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
