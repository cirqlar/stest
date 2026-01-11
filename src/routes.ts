import {
	createNativeStackNavigator,
	NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import {
	createStaticNavigation,
	StaticParamList,
} from '@react-navigation/native';

import WelcomeScreen from './screens/welcome';
import Home from './screens/home';

const RootStack = createNativeStackNavigator({
	initialRouteName: 'Welcome',
	screenOptions: {
		headerShown: false,
	},
	screens: {
		Welcome: WelcomeScreen,
		Home: Home,
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
