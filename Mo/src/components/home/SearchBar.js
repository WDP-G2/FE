import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../constants/theme';

export default function SearchBar({ placeholder }) {
  return (
    <View style={styles.container}>
      <Ionicons name="search-outline" size={18} color={colors.darkTextMuted} />
      <Text style={styles.placeholder}>{placeholder}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.darkBorder,
    borderRadius: 12,
    backgroundColor: colors.darkSurface,
    paddingHorizontal: 13,
  },
  placeholder: {
    marginLeft: 8,
    color: colors.darkTextMuted,
    fontSize: 12,
    fontWeight: '600',
  },
});
