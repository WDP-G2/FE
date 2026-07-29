import { ImageBackground, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../../constants/theme';

export default function RaceCard({ image, name, date, location, prize, status }) {
  return (
    <View style={styles.card}>
      <ImageBackground imageStyle={styles.image} source={{ uri: image }} style={styles.imageWrap}>
        <View style={styles.status}>
          <Text style={styles.statusText}>{status}</Text>
        </View>
      </ImageBackground>
      <View style={styles.content}>
        <Text style={styles.name}>{name}</Text>
        <View style={styles.metaRow}>
          <Ionicons name="calendar-outline" size={12} color={colors.darkTextMuted} />
          <Text style={styles.meta}>{date}</Text>
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={12} color={colors.darkTextMuted} />
          <Text style={styles.meta}>{location}</Text>
        </View>
        <View style={styles.prizeRow}>
          <Text style={styles.prizeLabel}>{'Gi\u1ea3i th\u01b0\u1edfng'}</Text>
          <Text style={styles.prize}>{prize}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 225,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.darkBorder,
    borderRadius: 13,
    backgroundColor: colors.darkSurface,
  },
  imageWrap: {
    height: 105,
  },
  image: {
    borderTopLeftRadius: 13,
    borderTopRightRadius: 13,
  },
  status: {
    alignSelf: 'flex-end',
    margin: 9,
    borderRadius: 16,
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusText: {
    color: '#1E1704',
    fontSize: 9,
    fontWeight: '900',
  },
  content: {
    padding: 12,
  },
  name: {
    color: colors.darkText,
    fontSize: 13,
    fontWeight: '900',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 7,
  },
  meta: {
    color: colors.darkTextMuted,
    fontSize: 10,
    fontWeight: '600',
  },
  prizeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 11,
  },
  prizeLabel: {
    color: colors.darkTextMuted,
    fontSize: 10,
    fontWeight: '600',
  },
  prize: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '900',
  },
});
