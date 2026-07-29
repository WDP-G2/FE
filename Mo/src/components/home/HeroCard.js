import { ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../constants/theme';

const heroImage =
  'https://images.unsplash.com/photo-1534476478160-85aa710fd642?auto=format&fit=crop&w=900&q=80';

export default function HeroCard() {
  return (
    <ImageBackground imageStyle={styles.image} source={{ uri: heroImage }} style={styles.container}>
      <View style={styles.overlay}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{'N\u1ec1n t\u1ea3ng chuy\u00ean nghi\u1ec7p'}</Text>
        </View>
        <Text style={styles.title}>{'Tr\u1ea3i nghi\u1ec7m gi\u1ea3i\n\u0111ua ng\u1ef1a chuy\u00ean\nnghi\u1ec7p'}</Text>
        <View style={styles.actions}>
          <Pressable style={styles.primaryAction}>
            <Text style={styles.primaryActionText}>{'Xem gi\u1ea3i \u0111\u1ea5u'}</Text>
          </Pressable>
          <Pressable style={styles.secondaryAction}>
            <Text style={styles.secondaryActionText}>{'\u0110\u0103ng k\u00fd'}</Text>
          </Pressable>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 185,
    overflow: 'hidden',
    borderRadius: 14,
    backgroundColor: colors.darkSurfaceSoft,
  },
  image: {
    borderRadius: 14,
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: 'rgba(4, 12, 24, 0.42)',
    padding: 16,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 20,
    backgroundColor: 'rgba(245, 183, 23, 0.88)',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeText: {
    color: '#241B02',
    fontSize: 10,
    fontWeight: '900',
  },
  title: {
    color: colors.white,
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 29,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  primaryAction: {
    borderRadius: 20,
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  primaryActionText: {
    color: '#1D1705',
    fontSize: 11,
    fontWeight: '900',
  },
  secondaryAction: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  secondaryActionText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '900',
  },
});
