import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  createStaticNavigation,
  StaticParamList,
} from '@react-navigation/native';

import MarketsScreen from './screens/market';
import MarketScreen from './screens/markets';
import OrdersScreen from './screens/orders';
import WalletScreen from './screens/wallet';

const RootStack = createNativeStackNavigator({
  initialRouteName: 'Markets',
  screenOptions: {
    headerShown: false,
  },
  screens: {
    Markets: MarketsScreen,
    Market: MarketScreen,
    Orders: OrdersScreen,
    Wallet: WalletScreen,
  },
});

type RootStackParamList = StaticParamList<typeof RootStack>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

const Navigation = createStaticNavigation(RootStack);

function App() {
  return <Navigation />;
}

export default App;
