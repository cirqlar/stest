import { StaticScreenProps } from '@react-navigation/native';
import { StyleSheet, Text, View } from 'react-native';

type Props = StaticScreenProps<{
  id: string;
}>;

function MarketScreen({ route }: Props) {
  return (
    <View style={styles.container}>
      <Text>{route.params.id} Market</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});

export default MarketScreen;
