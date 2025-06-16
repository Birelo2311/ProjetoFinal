import React from 'react';
import { TouchableOpacity, View, Text, Image, GestureResponderEvent, StyleSheet } from 'react-native';

type TabBarButtonProps = {
  onPress?: (event: GestureResponderEvent) => void;
  accessibilityState?: { selected?: boolean };
  icon: any;
  label: string;
  color: string;
  size: number;
  focused: boolean;
};

const TabBarButton = ({ onPress, icon, label, color, size, focused }: TabBarButtonProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.buttonContainer}
      activeOpacity={0.7}
    >
      <View style={styles.iconLabelContainer}>
        <Image
          source={icon}
          style={{ width: size, height: size, tintColor: focused ? color : '#8e8e93' }}
          resizeMode="contain"
        />
        <Text style={[styles.label, { color: focused ? color : '#8e8e93' }]}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  iconLabelContainer: {
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    marginTop: 2,
  },
});

export default TabBarButton;
