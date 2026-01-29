import { useState } from 'react';
import { Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from './Text';
import { colors } from '../styles/colors';

type FloatingButtonProps = {
  onNewTransaction: () => void;
  onPaymentReminder: () => void;
  onSetBudget: () => void;
};

export const FloatingButton = ({
  onNewTransaction,
  onPaymentReminder,
  onSetBudget,
}: FloatingButtonProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleMenu = () => {
    setIsExpanded(!isExpanded);
  };

  const handleMenuPress = (action: () => void) => {
    setIsExpanded(false);
    // Small delay to let menu close first
    setTimeout(() => {
      action();
    }, 100);
  };

  return (
    <>
      {/* Full screen overlay - outside the container */}
      {isExpanded && (
        <Pressable
          style={styles.overlay}
          onPress={() => setIsExpanded(false)}
        />
      )}

      <View style={styles.container}>
        {/* Menu Options */}
        {isExpanded && (
          <View style={styles.menu}>
            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={() => handleMenuPress(onNewTransaction)}
            >
              <Text style={styles.menuIcon}>💰</Text>
              <Text style={styles.menuText}>New Transaction</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={() => handleMenuPress(onSetBudget)}
            >
              <Text style={styles.menuIcon}>⚙️</Text>
              <Text style={styles.menuText}>Set Budget</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={() => handleMenuPress(onPaymentReminder)}
            >
              <Text style={styles.menuIcon}>🔔</Text>
              <Text style={styles.menuText}>Payment Reminder</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Main Button */}
        <TouchableOpacity style={styles.fab} onPress={toggleMenu}>
          <Text style={styles.fabText}>{isExpanded ? '✕' : '✎'}</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    zIndex: 99,
  },
  container: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    alignItems: 'flex-end',
    zIndex: 100,
  },
  menu: {
    marginBottom: 16,
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingVertical: 8,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  menuText: {
    fontSize: 15,
    color: colors.gray800,
    fontWeight: '500',
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.black,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  fabText: {
    fontSize: 24,
    color: colors.white,
  },
});
