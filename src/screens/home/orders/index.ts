import { createNativeStackNavigator } from '@react-navigation/native-stack';

import OrdersScreen from './orders';
import NewOrderScreen from './new_order';

const OrdersTab = createNativeStackNavigator({
	initialRouteName: 'Orders',
	screens: {
		Orders: OrdersScreen,
		NewOrder: NewOrderScreen,
	},
});

export default OrdersTab;
