import { createNativeStackNavigator } from '@react-navigation/native-stack';

import MarketsScreen from './markets';
import MarketScreen, { Props as MarketScreenProps } from './market';

const MarketsTab = createNativeStackNavigator({
	initialRouteName: 'Markets',
	screens: {
		Markets: { screen: MarketsScreen, options: { headerShown: false } },
		Market: {
			screen: MarketScreen,
			options: ({ route }) => {
				const params = route.params as MarketScreenProps;

				return {
					title: params.market
						? `${params.market.base} / ${params.market.quote} Market`
						: 'Market',
				};
			},
		},
	},
});

export default MarketsTab;
