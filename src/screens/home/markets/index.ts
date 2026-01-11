import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MarketsScreen from './markets';
import MarketScreen from './market';

const MarketsTab = createNativeStackNavigator({
	initialRouteName: 'Markets',
	screens: {
		Markets: MarketsScreen,
		Market: MarketScreen,
	},
});

export default MarketsTab;
