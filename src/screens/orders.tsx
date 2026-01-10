import { StyleSheet, Text, View } from 'react-native';

function OrdersScreen() {
  return (
    <View style={styles.container}>
      <Text>Orders</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});

export default OrdersScreen;
